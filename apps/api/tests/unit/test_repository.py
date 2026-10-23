"""Unit tests for InterviewRepository data operations, transactions, and cascades."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.interviews.models import InterviewAttempt
from src.modules.interviews.repository import InterviewRepository


@pytest.mark.asyncio
async def test_create_session(db_session: AsyncSession) -> None:
    repo = InterviewRepository()
    session = await repo.create_session(
        db=db_session,
        question_id="k8s-pod-crashloopbackoff",
        metadata={"role_target": "DevOps Engineer", "level": "Mid"},
    )
    await db_session.commit()

    assert session.id is not None
    assert len(session.id) == 36
    assert session.question_id == "k8s-pod-crashloopbackoff"
    assert session.status == "in_progress"
    assert session.session_metadata == {"role_target": "DevOps Engineer", "level": "Mid"}
    assert session.created_at is not None
    assert session.updated_at is not None


@pytest.mark.asyncio
async def test_get_session_with_and_without_attempts(db_session: AsyncSession) -> None:
    repo = InterviewRepository()
    session = await repo.create_session(db=db_session, question_id="cicd-canary-rollback")
    await db_session.commit()

    # Add attempt
    attempt = await repo.create_attempt(
        db=db_session,
        session_id=session.id,
        user_answer="When the error rate exceeds 1 percent, automated rollback triggers instantly.",
        feedback_snapshot={"scores": {"overall_score": 8.5}},
        overall_score=8.5,
    )
    await db_session.commit()

    # Get without attempts
    fetched_simple = await repo.get_session(
        db=db_session, session_id=session.id, include_attempts=False
    )
    assert fetched_simple is not None
    assert fetched_simple.id == session.id

    # Get with attempts
    fetched_full = await repo.get_session(
        db=db_session, session_id=session.id, include_attempts=True
    )
    assert fetched_full is not None
    assert len(fetched_full.attempts) == 1
    assert fetched_full.attempts[0].id == attempt.id
    assert fetched_full.attempts[0].overall_score == 8.5


@pytest.mark.asyncio
async def test_list_sessions_pagination_and_ordering(db_session: AsyncSession) -> None:
    repo = InterviewRepository()
    # Create 5 sessions
    for i in range(5):
        await repo.create_session(
            db=db_session,
            question_id="k8s-pod-crashloopbackoff",
            metadata={"index": i},
        )
    await db_session.commit()

    # Query page 1 (limit 2)
    total, page1 = await repo.list_sessions(db=db_session, limit=2, offset=0)
    assert total == 5
    assert len(page1) == 2

    # Query page 2 (limit 2, offset 2)
    total, page2 = await repo.list_sessions(db=db_session, limit=2, offset=2)
    assert total == 5
    assert len(page2) == 2
    assert page1[0].id != page2[0].id

    # Verify descending ordering by created_at
    assert page1[0].created_at >= page1[1].created_at


@pytest.mark.asyncio
async def test_list_sessions_filtering(db_session: AsyncSession) -> None:
    repo = InterviewRepository()
    s1 = await repo.create_session(db=db_session, question_id="k8s-pod-crashloopbackoff")
    s2 = await repo.create_session(db=db_session, question_id="cicd-canary-rollback")
    s2.status = "completed"
    await db_session.commit()

    # Filter by question_id
    total, items = await repo.list_sessions(db=db_session, question_id="k8s-pod-crashloopbackoff")
    assert total == 1
    assert items[0].id == s1.id

    # Filter by status
    total, items = await repo.list_sessions(db=db_session, status="completed")
    assert total == 1
    assert items[0].id == s2.id


@pytest.mark.asyncio
async def test_transaction_rollback_on_failure(db_session: AsyncSession) -> None:
    repo = InterviewRepository()

    # Start transaction, add session, then deliberately rollback
    session = await repo.create_session(db=db_session, question_id="k8s-pod-crashloopbackoff")
    session_id = session.id
    await db_session.rollback()

    # Verify session was NOT persisted
    fetched = await repo.get_session(db=db_session, session_id=session_id)
    assert fetched is None


@pytest.mark.asyncio
async def test_cascade_deletion(db_session: AsyncSession) -> None:
    repo = InterviewRepository()
    session = await repo.create_session(db=db_session, question_id="k8s-pod-crashloopbackoff")
    await db_session.commit()

    attempt = await repo.create_attempt(
        db=db_session,
        session_id=session.id,
        user_answer="Valid test answer that satisfies minimum length requirement.",
        feedback_snapshot={"test": True},
        overall_score=7.0,
    )
    await db_session.commit()

    # Delete session
    await db_session.delete(session)
    await db_session.commit()

    # Verify attempt was cascade-deleted
    attempt_check = await db_session.execute(
        select(InterviewAttempt).where(InterviewAttempt.id == attempt.id)
    )
    assert attempt_check.scalar_one_or_none() is None
