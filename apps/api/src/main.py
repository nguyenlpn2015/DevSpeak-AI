"""Main FastAPI Application for DevSpeak AI."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import Settings, get_settings
from src.db.session import get_db_session, get_engine
from src.modules.ai.exceptions import (
    AIConfigurationError,
    AIProviderError,
    AIRateLimitError,
    AITimeoutError,
)
from src.modules.ai.factory import get_ai_provider
from src.modules.ai.interface import AIProviderInterface
from src.modules.ai.schemas import EvaluationRequest, FeedbackReport
from src.modules.auth.models import User
from src.modules.auth.schemas import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from src.modules.auth.service import (
    AuthService,
    get_auth_service,
    get_current_user,
    get_optional_user,
)
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
from src.modules.interviews.service import InterviewService, get_interview_service
from src.modules.progress.schemas import ProgressSummaryResponse
from src.modules.progress.service import ProgressService, get_progress_service
from src.modules.questions.catalog import QuestionCatalog, get_question_catalog
from src.modules.questions.schemas import (
    Difficulty,
    Question,
    QuestionListResponse,
    RoleCategory,
    Topic,
)

logger = logging.getLogger("devspeak.api")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle management."""
    # Pre-initialize catalog and provider singletons
    get_question_catalog()
    get_ai_provider()
    # Eagerly initialize DB engine connection pool
    engine = get_engine()
    yield
    # Dispose database engine gracefully on shutdown
    await engine.dispose()


def create_application() -> FastAPI:
    """Build and configure the FastAPI application instance."""
    settings = get_settings()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        description="DevSpeak AI REST API - AI English Interview Coach for IT Professionals",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    # AI Provider Exception Handlers (Graceful failure without leaking internals)
    @app.exception_handler(AIRateLimitError)
    async def ai_rate_limit_handler(request: Request, exc: AIRateLimitError) -> JSONResponse:
        logger.warning("AI rate limit exceeded on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": exc.message},
        )

    @app.exception_handler(AITimeoutError)
    async def ai_timeout_handler(request: Request, exc: AITimeoutError) -> JSONResponse:
        logger.warning("AI provider timeout on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "detail": "The AI evaluation service timed out. Please try resubmitting your answer."
            },
        )

    @app.exception_handler(AIConfigurationError)
    async def ai_config_handler(request: Request, exc: AIConfigurationError) -> JSONResponse:
        logger.error("AI configuration error on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "detail": "AI evaluation is temporarily unavailable due to a configuration issue."
            },
        )

    @app.exception_handler(AIProviderError)
    async def ai_provider_error_handler(request: Request, exc: AIProviderError) -> JSONResponse:
        logger.error(
            "AI provider error on %s: %s (status=%d)", request.url.path, exc, exc.status_code
        )
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "detail": "Failed to generate evaluation from AI provider. Please try again later."
            },
        )

    # Global Exception Handler (Prevents stack trace leaks to clients)
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "Unhandled server error on %s %s: %s",
            request.method,
            request.url.path,
            type(exc).__name__,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please try again later."},
        )

    return app


app = create_application()


# ==========================================
# Health and Readiness Probes
# ==========================================


@app.get(
    "/healthz",
    tags=["Operations"],
    summary="Liveness Probe",
    response_model=dict[str, str],
)
async def health_check(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    """Basic health probe verifying process responsiveness."""
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }


@app.get(
    "/readyz",
    tags=["Operations"],
    summary="Readiness Probe",
    response_model=dict[str, str | int],
)
async def readiness_check(
    settings: Settings = Depends(get_settings),
    ai_provider: AIProviderInterface = Depends(get_ai_provider),
    catalog: QuestionCatalog = Depends(get_question_catalog),
) -> dict[str, str | int]:
    """Readiness probe confirming AI provider and question catalog are active."""
    return {
        "status": "ready",
        "ai_provider": settings.AI_PROVIDER,
        "questions_loaded": catalog.count(),
    }


# ==========================================
# Question Bank Endpoints
# ==========================================


@app.get(
    "/api/v1/questions",
    response_model=QuestionListResponse,
    tags=["Questions"],
    summary="List and filter interview questions",
)
async def list_questions(
    role: RoleCategory | None = None,
    topic: Topic | None = None,
    difficulty: Difficulty | None = None,
    catalog: QuestionCatalog = Depends(get_question_catalog),
) -> QuestionListResponse:
    """Browse questions filtered by role, topic, or difficulty level."""
    return catalog.list_questions(role=role, topic=topic, difficulty=difficulty)


@app.get(
    "/api/v1/questions/{question_id}",
    response_model=Question,
    tags=["Questions"],
    summary="Get question detail with rubric and sample answer",
)
async def get_question(
    question_id: str,
    catalog: QuestionCatalog = Depends(get_question_catalog),
) -> Question:
    """Retrieve complete question specifications by ID."""
    question = catalog.get_question(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{question_id}' not found in catalog.",
        )
    return question


# ==========================================
# Authentication & User Management Endpoints
# ==========================================


@app.post(
    "/api/v1/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
    summary="Register a new candidate account",
)
async def register(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db_session),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Register a new candidate, hash password with Argon2id, and issue a JWT access token."""
    return await auth_service.register(db=db, payload=payload)


@app.post(
    "/api/v1/auth/login",
    response_model=TokenResponse,
    tags=["Authentication"],
    summary="Authenticate candidate credentials",
)
async def login(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db_session),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Validate credentials and return JWT bearer access token."""
    return await auth_service.login(db=db, payload=payload)


@app.get(
    "/api/v1/auth/me",
    response_model=UserResponse,
    tags=["Authentication"],
    summary="Get current candidate profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the profile of the currently authenticated candidate."""
    return UserResponse.model_validate(current_user)


@app.post(
    "/api/v1/auth/logout",
    tags=["Authentication"],
    summary="Candidate logout",
)
async def logout(
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Stateless logout confirmation for candidate clients."""
    return {"status": "logged_out", "message": "Successfully logged out."}


# ==========================================
# Interview Sessions & History Endpoints
# ==========================================


@app.post(
    "/api/v1/interviews/sessions",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Sessions"],
    summary="Initialize a new persistent interview session",
)
async def create_session(
    payload: SessionCreateRequest,
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
    current_user: User | None = Depends(get_optional_user),
) -> SessionResponse:
    """Create a persistent candidate practice session for a specified question."""
    user_id = current_user.id if current_user else None
    return await service.create_session(db=db, payload=payload, user_id=user_id)


@app.get(
    "/api/v1/interviews/sessions",
    response_model=SessionListResponse,
    tags=["Sessions"],
    summary="List and paginate interview sessions",
)
async def list_sessions(
    question_id: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100, description="Page limit (1 - 100)"),
    offset: int = Query(default=0, ge=0, description="Page offset"),
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
    current_user: User | None = Depends(get_optional_user),
) -> SessionListResponse:
    """Retrieve paginated session history with optional question and status filtering."""
    user_id = current_user.id if current_user else None
    return await service.list_sessions(
        db=db,
        user_id=user_id,
        question_id=question_id,
        status_filter=status_filter,
        limit=limit,
        offset=offset,
    )


@app.get(
    "/api/v1/interviews/sessions/{session_id}",
    response_model=SessionDetailResponse,
    tags=["Sessions"],
    summary="Get interview session details and attempt history",
)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
    current_user: User | None = Depends(get_optional_user),
) -> SessionDetailResponse:
    """Retrieve complete session record with all chronological evaluation attempts."""
    user_id = current_user.id if current_user else None
    return await service.get_session(db=db, session_id=session_id, user_id=user_id)


@app.post(
    "/api/v1/interviews/sessions/{session_id}/attempts",
    response_model=AttemptResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Sessions"],
    summary="Submit answer attempt against an active session",
)
async def submit_session_attempt(
    session_id: str,
    payload: AttemptCreateRequest,
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
    current_user: User | None = Depends(get_optional_user),
) -> AttemptResponse:
    """Evaluate candidate response with AIProvider and record attempt in session history."""
    logger.info(
        "Evaluating session attempt for session_id=%s, length=%d",
        session_id,
        len(payload.user_answer),
    )
    user_id = current_user.id if current_user else None
    return await service.submit_attempt(
        db=db, session_id=session_id, payload=payload, user_id=user_id
    )


@app.get(
    "/api/v1/interviews/sessions/{session_id}/messages",
    response_model=list[InterviewMessageResponse],
    tags=["Sessions"],
    summary="Get or initialize interactive interview dialogue messages",
)
async def get_session_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
    current_user: User | None = Depends(get_optional_user),
) -> list[InterviewMessageResponse]:
    """Retrieve dialogue messages for the session, seeding the initial greeting and prompt if empty."""
    user_id = current_user.id if current_user else None
    return await service.get_messages(db=db, session_id=session_id, user_id=user_id)


@app.post(
    "/api/v1/interviews/sessions/{session_id}/chat",
    response_model=ChatTurnResponse,
    tags=["Sessions"],
    summary="Submit interactive conversation turn to AI interviewer",
)
async def chat_interview_turn(
    session_id: str,
    payload: ChatTurnRequest,
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
    current_user: User | None = Depends(get_optional_user),
) -> ChatTurnResponse:
    """Submit a conversational answer or question to the AI interviewer and receive the next turn."""
    user_id = current_user.id if current_user else None
    return await service.chat_turn(
        db=db, session_id=session_id, payload=payload, user_id=user_id
    )


# ==========================================
# Progress & Candidate Analytics Endpoints
# ==========================================


@app.get(
    "/api/v1/progress/summary",
    response_model=ProgressSummaryResponse,
    tags=["Progress"],
    summary="Get candidate progress metrics, topic mastery, and practice streak",
)
async def get_progress_summary(
    db: AsyncSession = Depends(get_db_session),
    progress_service: ProgressService = Depends(get_progress_service),
    current_user: User | None = Depends(get_optional_user),
) -> ProgressSummaryResponse:
    """Retrieve holistic progress summary including completed sessions, XP, streak, and topic scores."""
    user_id = current_user.id if current_user else None
    return await progress_service.get_progress_summary(db=db, user_id=user_id)


# ==========================================
# Legacy / Standalone Evaluation Endpoint
# ==========================================


@app.post(
    "/api/v1/interviews/evaluate",
    response_model=FeedbackReport,
    tags=["Interviews"],
    summary="Evaluate candidate answer and generate structured feedback",
)
async def evaluate_answer(
    payload: EvaluationRequest,
    catalog: QuestionCatalog = Depends(get_question_catalog),
    ai_provider: AIProviderInterface = Depends(get_ai_provider),
    db: AsyncSession = Depends(get_db_session),
    service: InterviewService = Depends(get_interview_service),
) -> FeedbackReport:
    """Submit candidate response to receive grammar, technical, and clarity feedback.

    If optional session_id is provided, the evaluation attempt is also persisted to session history.
    """
    question = catalog.get_question(payload.question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{payload.question_id}' not found.",
        )

    logger.info(
        "Evaluating answer for question_id=%s, length=%d (session_id=%s)",
        payload.question_id,
        len(payload.user_answer),
        payload.session_id,
    )

    feedback = await ai_provider.evaluate_answer(
        question=question,
        user_answer=payload.user_answer,
    )

    # If session_id provided, persist attempt
    if payload.session_id:
        session = await service.repository.get_session(db=db, session_id=payload.session_id)
        if session:
            await service.repository.create_attempt(
                db=db,
                session_id=payload.session_id,
                user_answer=payload.user_answer,
                feedback_snapshot=feedback.model_dump(),
                overall_score=feedback.scores.overall_score,
            )
            await db.commit()

    return feedback
