"""Database repository layer for interview sessions and attempts."""

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.db.base import utc_now
from src.modules.interviews.models import (
    InterviewAttempt,
    InterviewMessage,
    InterviewSession,
)


class InterviewRepository:
    """Encapsulates all database operations for interview entities."""

    async def create_session(
        self,
        db: AsyncSession,
        question_id: str,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> InterviewSession:
        """Create and persist a new interview session."""
        session = InterviewSession(
            user_id=user_id,
            question_id=question_id,
            status="in_progress",
            session_metadata=metadata or {},
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    async def get_session(
        self,
        db: AsyncSession,
        session_id: str,
        include_attempts: bool = False,
        include_messages: bool = False,
    ) -> InterviewSession | None:
        """Retrieve an interview session by ID, optionally eager-loading attempts and messages."""
        stmt = select(InterviewSession).where(InterviewSession.id == session_id)
        if include_attempts:
            stmt = stmt.options(selectinload(InterviewSession.attempts))
        if include_messages:
            stmt = stmt.options(selectinload(InterviewSession.messages))

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_sessions(
        self,
        db: AsyncSession,
        user_id: str | None = None,
        question_id: str | None = None,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[int, list[InterviewSession]]:
        """Return total count and paginated list of sessions ordered by creation date."""
        base_query = select(InterviewSession)
        count_query = select(func.count(InterviewSession.id))

        if user_id:
            base_query = base_query.where(InterviewSession.user_id == user_id)
            count_query = count_query.where(InterviewSession.user_id == user_id)

        if question_id:
            base_query = base_query.where(InterviewSession.question_id == question_id)
            count_query = count_query.where(InterviewSession.question_id == question_id)

        if status:
            base_query = base_query.where(InterviewSession.status == status)
            count_query = count_query.where(InterviewSession.status == status)

        total = await db.scalar(count_query) or 0

        paged_query = (
            base_query.options(selectinload(InterviewSession.attempts))
            .order_by(InterviewSession.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await db.execute(paged_query)
        sessions = list(result.scalars().all())
        return total, sessions

    async def create_attempt(
        self,
        db: AsyncSession,
        session_id: str,
        user_answer: str,
        feedback_snapshot: dict[str, Any],
        overall_score: float | None = None,
    ) -> InterviewAttempt:
        """Persist a new evaluation attempt belonging to a session."""
        attempt = InterviewAttempt(
            session_id=session_id,
            user_answer=user_answer,
            feedback_snapshot=feedback_snapshot,
            overall_score=overall_score,
        )
        db.add(attempt)

        # Update parent session's updated_at timestamp
        session = await self.get_session(db, session_id)
        if session:
            session.updated_at = utc_now()

        await db.flush()
        await db.refresh(attempt)
        return attempt

    async def create_message(
        self,
        db: AsyncSession,
        session_id: str,
        role: str,
        content: str,
        turn_index: int,
        feedback_snapshot: dict[str, Any] | None = None,
    ) -> InterviewMessage:
        """Persist a conversational turn message within an interview session."""
        message = InterviewMessage(
            session_id=session_id,
            role=role,
            content=content,
            turn_index=turn_index,
            feedback_snapshot=feedback_snapshot,
        )
        db.add(message)

        session = await self.get_session(db, session_id)
        if session:
            session.updated_at = utc_now()

        await db.flush()
        await db.refresh(message)
        return message

    async def list_messages(
        self,
        db: AsyncSession,
        session_id: str,
    ) -> list[InterviewMessage]:
        """Retrieve all chronological messages for an interview session."""
        stmt = (
            select(InterviewMessage)
            .where(InterviewMessage.session_id == session_id)
            .order_by(InterviewMessage.turn_index.asc(), InterviewMessage.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
