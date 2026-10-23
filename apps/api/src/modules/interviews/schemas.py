"""Pydantic schemas for interview sessions and evaluation attempts."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from src.modules.ai.schemas import FeedbackReport


class SessionCreateRequest(BaseModel):
    """Payload to initialize a new candidate interview practice session."""

    model_config = ConfigDict(extra="forbid")

    question_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="ID of question from catalog to practice",
        examples=["k8s-pod-crashloopbackoff"],
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Arbitrary non-secret session metadata (e.g. target role, prep goals)",
    )


class SessionResponse(BaseModel):
    """Summary of an interview session."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    question_id: str
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict, validation_alias="session_metadata")
    created_at: datetime
    updated_at: datetime
    attempts_count: int = 0


class AttemptCreateRequest(BaseModel):
    """Payload to submit an answer attempt against an active session."""

    model_config = ConfigDict(extra="forbid")

    user_answer: str = Field(
        ...,
        min_length=10,
        max_length=4000,
        description="Candidate's technical English response",
        examples=[
            "When troubleshooting CrashLoopBackOff, I first run kubectl describe pod to inspect the termination exit code."
        ],
    )


class AttemptResponse(BaseModel):
    """Detailed response for a persisted interview attempt."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    session_id: str
    user_answer: str
    feedback: FeedbackReport = Field(validation_alias="feedback_snapshot")
    overall_score: float | None = None
    created_at: datetime


class InterviewMessageResponse(BaseModel):
    """Dialogue turn message within an interview session."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    session_id: str
    role: str
    content: str
    turn_index: int
    feedback: FeedbackReport | None = Field(default=None, validation_alias="feedback_snapshot")
    created_at: datetime


class ChatTurnRequest(BaseModel):
    """Candidate utterance for an interactive chat turn."""

    model_config = ConfigDict(extra="forbid")

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Candidate's technical answer or conversational response",
    )


class ChatTurnResponse(BaseModel):
    """AI interviewer response to a chat turn."""

    model_config = ConfigDict(from_attributes=True)

    session_id: str
    interviewer_reply: str
    is_concluding: bool = False
    turn_index: int
    feedback: FeedbackReport | None = None
    messages: list[InterviewMessageResponse] = Field(default_factory=list)


class SessionDetailResponse(BaseModel):
    """Full detail of a session including historical attempts and dialogue messages."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    question_id: str
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict, validation_alias="session_metadata")
    created_at: datetime
    updated_at: datetime
    attempts: list[AttemptResponse] = Field(default_factory=list)
    messages: list[InterviewMessageResponse] = Field(default_factory=list)


class SessionListResponse(BaseModel):
    """Paginated list of interview sessions."""

    total: int
    items: list[SessionResponse]
