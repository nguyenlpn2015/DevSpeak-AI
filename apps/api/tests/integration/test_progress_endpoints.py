"""Integration tests for progress analytics and streak tracking endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_progress_summary_empty(async_client: AsyncClient) -> None:
    """Empty state returns zero counters and empty lists."""
    res = await async_client.get("/api/v1/progress/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_completed_sessions"] == 0
    assert data["total_attempts"] == 0
    assert data["average_overall_score"] == 0.0
    assert data["xp_earned"] == 0
    assert data["streak_days"] == 0
    assert data["category_scores"] == []
    assert data["recent_activity"] == []


@pytest.mark.asyncio
async def test_progress_summary_with_activity_and_isolation(
    async_client: AsyncClient,
) -> None:
    """Progress metrics accurately compute completed sessions, XP, category mastery, and user isolation."""
    # Register Candidate A
    reg_a = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "progress_a@example.com", "password": "Password123!"},
    )
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Candidate A creates session and submits attempt
    sess_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
        headers=headers_a,
    )
    sess_id = sess_res.json()["id"]

    att_res = await async_client.post(
        f"/api/v1/interviews/sessions/{sess_id}/attempts",
        json={
            "user_answer": (
                "When troubleshooting CrashLoopBackOff, I inspect the pod status with kubectl get pods "
                "and run kubectl describe pod to see the exit code and termination reason."
            )
        },
        headers=headers_a,
    )
    assert att_res.status_code == 201

    # Candidate A progress summary
    prog_a = await async_client.get("/api/v1/progress/summary", headers=headers_a)
    assert prog_a.status_code == 200
    data_a = prog_a.json()
    assert data_a["total_attempts"] == 1
    assert data_a["average_overall_score"] >= 1.0
    assert data_a["xp_earned"] > 0
    assert len(data_a["category_scores"]) == 1
    assert data_a["category_scores"][0]["topic"] == "kubernetes"
    assert len(data_a["recent_activity"]) == 1
    assert data_a["recent_activity"][0]["question_id"] == "k8s-pod-crashloopbackoff"

    # Register Candidate B
    reg_b = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "progress_b@example.com", "password": "Password123!"},
    )
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Candidate B has 0 activity
    prog_b = await async_client.get("/api/v1/progress/summary", headers=headers_b)
    assert prog_b.status_code == 200
    data_b = prog_b.json()
    assert data_b["total_attempts"] == 0
    assert data_b["xp_earned"] == 0
