"""Service calculating real performance progress, domain mastery, and XP streaks."""

from datetime import UTC, datetime, timedelta

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.interviews.models import InterviewAttempt, InterviewSession
from src.modules.progress.schemas import (
    CategoryScore,
    ProgressSummaryResponse,
    RecentActivityItem,
)
from src.modules.questions.catalog import QuestionCatalog, get_question_catalog


class ProgressService:
    """Calculates candidate learning statistics, domain scores, streaks, and XP."""

    def __init__(self, catalog: QuestionCatalog | None = None) -> None:
        self.catalog = catalog

    def _get_catalog(self) -> QuestionCatalog:
        if self.catalog is None:
            self.catalog = get_question_catalog()
        return self.catalog

    async def get_progress_summary(
        self,
        db: AsyncSession,
        user_id: str | None = None,
    ) -> ProgressSummaryResponse:
        """Aggregate candidate session attempts into actionable progress metrics."""
        catalog = self._get_catalog()

        # Query sessions with attempts eager-loaded
        sess_stmt = select(InterviewSession).options(
            selectinload(InterviewSession.attempts)
        )
        if user_id:
            sess_stmt = sess_stmt.where(InterviewSession.user_id == user_id)
        else:
            sess_stmt = sess_stmt.where(InterviewSession.user_id.is_(None))

        sess_result = await db.execute(sess_stmt)
        sessions = list(sess_result.scalars().all())

        # Collect metrics
        completed_sessions = [s for s in sessions if s.status == "completed"]
        total_completed = len(completed_sessions)

        # Collect all attempts across these sessions
        attempts_stmt = (
            select(InterviewAttempt, InterviewSession.question_id)
            .join(InterviewSession, InterviewAttempt.session_id == InterviewSession.id)
            .order_by(desc(InterviewAttempt.created_at))
        )
        if user_id:
            attempts_stmt = attempts_stmt.where(InterviewSession.user_id == user_id)
        else:
            attempts_stmt = attempts_stmt.where(InterviewSession.user_id.is_(None))

        att_result = await db.execute(attempts_stmt)
        attempt_rows = att_result.all()  # [(InterviewAttempt, question_id), ...]

        total_attempts = len(attempt_rows)
        scores: list[float] = [
            row[0].overall_score for row in attempt_rows if row[0].overall_score is not None
        ]
        avg_overall = round(sum(scores) / len(scores), 1) if scores else 0.0

        # Topic breakdown
        topic_scores: dict[str, list[float]] = {}
        for att, q_id in attempt_rows:
            q = catalog.get_question(q_id)
            topic = q.topic if q else "general"
            if att.overall_score is not None:
                topic_scores.setdefault(topic, []).append(att.overall_score)

        category_scores: list[CategoryScore] = []
        for topic, topic_vals in topic_scores.items():
            mean_topic = round(sum(topic_vals) / len(topic_vals), 1)
            category_scores.append(
                CategoryScore(
                    topic=topic,
                    average_score=mean_topic,
                    attempts_count=len(topic_vals),
                )
            )
        category_scores.sort(key=lambda c: c.topic)

        # XP Calculation (50 XP per completed session + 10 XP per score point)
        xp = total_completed * 50 + int(sum(scores) * 10)

        # Streak Days Calculation (Distinct calendar dates with activity)
        active_dates = set()
        for att, _ in attempt_rows:
            active_dates.add(att.created_at.date())
        for s in completed_sessions:
            active_dates.add(s.created_at.date())

        streak_days = 0
        today = datetime.now(UTC).date()
        # Check backward from today or yesterday
        check_date = today
        if check_date not in active_dates:
            check_date = today - timedelta(days=1)

        while check_date in active_dates:
            streak_days += 1
            check_date -= timedelta(days=1)

        # Recent Activity (Latest 10 attempts or sessions)
        recent_activity: list[RecentActivityItem] = []
        for att, q_id in attempt_rows[:10]:
            q = catalog.get_question(q_id)
            title = q.title if q else q_id
            recent_activity.append(
                RecentActivityItem(
                    session_id=att.session_id,
                    question_id=q_id,
                    question_title=title,
                    score=att.overall_score,
                    timestamp=att.created_at,
                    status="completed" if att.overall_score is not None else "in_progress",
                )
            )

        return ProgressSummaryResponse(
            total_completed_sessions=total_completed,
            total_attempts=total_attempts,
            average_overall_score=avg_overall,
            xp_earned=xp,
            streak_days=streak_days,
            category_scores=category_scores,
            recent_activity=recent_activity,
        )


_progress_service_instance = ProgressService()


def get_progress_service() -> ProgressService:
    """Dependency provider returning singleton ProgressService instance."""
    return _progress_service_instance
