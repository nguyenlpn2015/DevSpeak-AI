"""Pydantic schemas for candidate progress analytics and activity tracking."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryScore(BaseModel):
    """Aggregate performance in a specific technical or behavioral domain."""

    topic: str = Field(description="Domain topic (e.g. kubernetes, cicd, docker)")
    average_score: float = Field(description="Mean overall score (1.0 - 10.0)")
    attempts_count: int = Field(description="Number of completed attempts in this topic")


class RecentActivityItem(BaseModel):
    """Recent interview practice event."""

    session_id: str
    question_id: str
    question_title: str
    score: float | None = None
    timestamp: datetime
    status: str


class ProgressSummaryResponse(BaseModel):
    """Holistic candidate performance and learning journey metrics."""

    model_config = ConfigDict(from_attributes=True)

    total_completed_sessions: int
    total_attempts: int
    average_overall_score: float
    xp_earned: int
    streak_days: int
    category_scores: list[CategoryScore] = Field(default_factory=list)
    recent_activity: list[RecentActivityItem] = Field(default_factory=list)
