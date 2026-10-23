"""Service layer coordinating interview persistence, catalog checks, and AI evaluation."""

import logging

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.ai.interface import AIProviderInterface
from src.modules.interviews.repository import InterviewRepository
from src.modules.interviews.schemas import (
    AttemptCreateRequest,
    AttemptResponse,
    ChatTurnRequest,
    ChatTurnResponse,
    InterviewMessageResponse,
    SessionCreateRequest,
    SessionDetailResponse,
    SessionListResponse,
    SessionResponse,
)
from src.modules.questions.catalog import QuestionCatalog

logger = logging.getLogger("devspeak.interviews")


class InterviewService:
    """Orchestrates interview sessions, persistence, and evaluation workflows."""

    def __init__(
        self,
        repository: InterviewRepository | None = None,
        catalog: QuestionCatalog | None = None,
        ai_provider: AIProviderInterface | None = None,
    ) -> None:
        self.repository = repository or InterviewRepository()
        self.catalog = catalog
        self.ai_provider = ai_provider

    def _get_catalog(self) -> QuestionCatalog:
        if self.catalog is None:
            from src.modules.questions.catalog import get_question_catalog

            self.catalog = get_question_catalog()
        return self.catalog

    def _get_ai_provider(self) -> AIProviderInterface:
        if self.ai_provider is None:
            from src.modules.ai.factory import get_ai_provider

            self.ai_provider = get_ai_provider()
        return self.ai_provider

    async def create_session(
        self,
        db: AsyncSession,
        payload: SessionCreateRequest,
        user_id: str | None = None,
    ) -> SessionResponse:
        """Validate question ID and initialize a persistent interview session."""
        catalog = self._get_catalog()
        question = catalog.get_question(payload.question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question '{payload.question_id}' not found in catalog.",
            )

        session = await self.repository.create_session(
            db=db,
            question_id=payload.question_id,
            user_id=user_id,
            metadata=payload.metadata,
        )
        await db.commit()
        await db.refresh(session)

        return SessionResponse(
            id=session.id,
            question_id=session.question_id,
            status=session.status,
            metadata=session.session_metadata,
            created_at=session.created_at,
            updated_at=session.updated_at,
            attempts_count=0,
        )

    async def get_session(
        self,
        db: AsyncSession,
        session_id: str,
        user_id: str | None = None,
    ) -> SessionDetailResponse:
        """Retrieve full details of an interview session with all attempts."""
        session = await self.repository.get_session(
            db=db, session_id=session_id, include_attempts=True, include_messages=True
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview session '{session_id}' not found.",
            )

        if session.user_id is not None and user_id is not None and session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this interview session.",
            )

        attempts_data = [
            AttemptResponse(
                id=att.id,
                session_id=att.session_id,
                user_answer=att.user_answer,
                feedback=att.feedback_snapshot,  # pydantic validates against FeedbackReport
                overall_score=att.overall_score,
                created_at=att.created_at,
            )
            for att in session.attempts
        ]

        messages_data = [
            InterviewMessageResponse(
                id=msg.id,
                session_id=msg.session_id,
                role=msg.role,
                content=msg.content,
                turn_index=msg.turn_index,
                feedback=msg.feedback_snapshot,
                created_at=msg.created_at,
            )
            for msg in session.messages
        ]

        return SessionDetailResponse(
            id=session.id,
            question_id=session.question_id,
            status=session.status,
            metadata=session.session_metadata,
            created_at=session.created_at,
            updated_at=session.updated_at,
            attempts=attempts_data,
            messages=messages_data,
        )

    async def list_sessions(
        self,
        db: AsyncSession,
        user_id: str | None = None,
        question_id: str | None = None,
        status_filter: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> SessionListResponse:
        """List paginated interview sessions."""
        total, sessions = await self.repository.list_sessions(
            db=db,
            user_id=user_id,
            question_id=question_id,
            status=status_filter,
            limit=limit,
            offset=offset,
        )

        items = [
            SessionResponse(
                id=s.id,
                question_id=s.question_id,
                status=s.status,
                metadata=s.session_metadata,
                created_at=s.created_at,
                updated_at=s.updated_at,
                attempts_count=len(s.attempts),
            )
            for s in sessions
        ]

        return SessionListResponse(total=total, items=items)

    async def submit_attempt(
        self,
        db: AsyncSession,
        session_id: str,
        payload: AttemptCreateRequest,
        user_id: str | None = None,
    ) -> AttemptResponse:
        """Evaluate candidate response with AIProvider and persist evaluation attempt."""
        session = await self.repository.get_session(db=db, session_id=session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview session '{session_id}' not found.",
            )

        if session.user_id is not None and user_id is not None and session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to submit an attempt for this interview session.",
            )

        catalog = self._get_catalog()
        question = catalog.get_question(session.question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question '{session.question_id}' associated with session '{session_id}' not found in catalog.",
            )

        ai_provider = self._get_ai_provider()
        feedback = await ai_provider.evaluate_answer(
            question=question,
            user_answer=payload.user_answer,
        )

        attempt = await self.repository.create_attempt(
            db=db,
            session_id=session_id,
            user_answer=payload.user_answer,
            feedback_snapshot=feedback.model_dump(),
            overall_score=feedback.scores.overall_score,
        )

        await db.commit()
        await db.refresh(attempt)

        return AttemptResponse(
            id=attempt.id,
            session_id=attempt.session_id,
            user_answer=attempt.user_answer,
            feedback=feedback,
            overall_score=attempt.overall_score,
            created_at=attempt.created_at,
        )

    async def get_messages(
        self,
        db: AsyncSession,
        session_id: str,
        user_id: str | None = None,
    ) -> list[InterviewMessageResponse]:
        """Retrieve all messages for a session, auto-initializing prompt if empty."""
        session = await self.repository.get_session(
            db=db, session_id=session_id, include_messages=True
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview session '{session_id}' not found.",
            )

        if session.user_id is not None and user_id is not None and session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access messages for this interview session.",
            )

        if not session.messages:
            catalog = self._get_catalog()
            question = catalog.get_question(session.question_id)
            if question:
                initial_prompt = (
                    f"Welcome to your technical interview! We will focus on: {question.title}.\n\n"
                    f"{question.prompt}"
                )
                msg = await self.repository.create_message(
                    db=db,
                    session_id=session_id,
                    role="interviewer",
                    content=initial_prompt,
                    turn_index=0,
                )
                await db.commit()
                await db.refresh(msg)
                return [
                    InterviewMessageResponse(
                        id=msg.id,
                        session_id=msg.session_id,
                        role=msg.role,
                        content=msg.content,
                        turn_index=msg.turn_index,
                        feedback=None,
                        created_at=msg.created_at,
                    )
                ]

        return [
            InterviewMessageResponse(
                id=msg.id,
                session_id=msg.session_id,
                role=msg.role,
                content=msg.content,
                turn_index=msg.turn_index,
                feedback=msg.feedback_snapshot,
                created_at=msg.created_at,
            )
            for msg in session.messages
        ]

    async def chat_turn(
        self,
        db: AsyncSession,
        session_id: str,
        payload: ChatTurnRequest,
        user_id: str | None = None,
    ) -> ChatTurnResponse:
        """Handle a multi-turn conversational interview step."""
        session = await self.repository.get_session(
            db=db, session_id=session_id, include_messages=True
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview session '{session_id}' not found.",
            )

        if session.user_id is not None and user_id is not None and session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to participate in this interview session.",
            )

        catalog = self._get_catalog()
        question = catalog.get_question(session.question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question '{session.question_id}' associated with session '{session_id}' not found in catalog.",
            )

        if not session.messages:
            initial_prompt = (
                f"Welcome to your technical interview! We will focus on: {question.title}.\n\n"
                f"{question.prompt}"
            )
            await self.repository.create_message(
                db=db,
                session_id=session_id,
                role="interviewer",
                content=initial_prompt,
                turn_index=0,
            )
            session = await self.repository.get_session(
                db=db, session_id=session_id, include_messages=True
            )

        existing_messages = session.messages if session else []
        next_turn_index = len(existing_messages)

        prior_candidate_answers = len([m for m in existing_messages if m.role == "candidate"])
        turn_count = prior_candidate_answers + 1

        # 1. Persist candidate message
        await self.repository.create_message(
            db=db,
            session_id=session_id,
            role="candidate",
            content=payload.message,
            turn_index=next_turn_index,
        )

        # 2. Prepare conversation history for AI provider
        history = [{"role": m.role, "content": m.content} for m in existing_messages]

        # 3. Request next turn from AI provider
        ai_provider = self._get_ai_provider()
        interviewer_reply, is_concluding, feedback_report = await ai_provider.conduct_chat_turn(
            question=question,
            conversation_history=history,
            candidate_message=payload.message,
            turn_count=turn_count,
        )

        # 4. Persist interviewer message
        feedback_snapshot = feedback_report.model_dump() if feedback_report else None
        interviewer_msg = await self.repository.create_message(
            db=db,
            session_id=session_id,
            role="interviewer",
            content=interviewer_reply,
            turn_index=next_turn_index + 1,
            feedback_snapshot=feedback_snapshot,
        )

        # 5. If concluding, mark session completed and persist attempt
        if is_concluding and feedback_report:
            session.status = "completed"
            all_candidate_answers = [
                m.content for m in existing_messages if m.role == "candidate"
            ]
            all_candidate_answers.append(payload.message)
            combined_user_answer = "\n\n---\n\n".join(all_candidate_answers)

            await self.repository.create_attempt(
                db=db,
                session_id=session_id,
                user_answer=combined_user_answer,
                feedback_snapshot=feedback_snapshot,
                overall_score=feedback_report.scores.overall_score,
            )

        await db.commit()

        # 6. Retrieve all chronological messages
        all_messages_db = await self.repository.list_messages(db=db, session_id=session_id)
        messages_response = [
            InterviewMessageResponse(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                turn_index=m.turn_index,
                feedback=m.feedback_snapshot,
                created_at=m.created_at,
            )
            for m in all_messages_db
        ]

        return ChatTurnResponse(
            session_id=session_id,
            interviewer_reply=interviewer_reply,
            is_concluding=is_concluding,
            turn_index=interviewer_msg.turn_index,
            feedback=feedback_report,
            messages=messages_response,
        )


def get_interview_service() -> InterviewService:
    """Dependency provider returning an InterviewService instance."""
    return InterviewService()
