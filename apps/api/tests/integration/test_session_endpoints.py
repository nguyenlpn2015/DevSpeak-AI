"""Integration tests for interview session endpoints, evaluation persistence, and history."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_session_success(async_client: AsyncClient) -> None:
    payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "metadata": {"target_role": "Platform Engineer"},
    }
    response = await async_client.post("/api/v1/interviews/sessions", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["id"] is not None
    assert len(data["id"]) == 36
    assert data["question_id"] == "k8s-pod-crashloopbackoff"
    assert data["status"] == "in_progress"
    assert data["metadata"] == {"target_role": "Platform Engineer"}
    assert data["attempts_count"] == 0


@pytest.mark.asyncio
async def test_create_session_unknown_question_returns_404(async_client: AsyncClient) -> None:
    payload = {"question_id": "non-existent-question-id"}
    response = await async_client.post("/api/v1/interviews/sessions", json=payload)
    assert response.status_code == 404
    assert "not found in catalog" in response.json()["detail"]


@pytest.mark.asyncio
async def test_list_sessions_and_bounded_pagination(async_client: AsyncClient) -> None:
    # Create 3 sessions
    for _ in range(3):
        await async_client.post(
            "/api/v1/interviews/sessions",
            json={"question_id": "k8s-pod-crashloopbackoff"},
        )

    # List with pagination
    res = await async_client.get("/api/v1/interviews/sessions?limit=2&offset=0")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2

    # Verify bound enforcement (limit > 100 must be rejected with 422)
    res_bounded = await async_client.get("/api/v1/interviews/sessions?limit=150")
    assert res_bounded.status_code == 422


@pytest.mark.asyncio
async def test_get_session_by_id_success_and_404(async_client: AsyncClient) -> None:
    # Create session
    create_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "cicd-canary-rollback"},
    )
    session_id = create_res.json()["id"]

    # Fetch existing
    get_res = await async_client.get(f"/api/v1/interviews/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == session_id
    assert get_res.json()["question_id"] == "cicd-canary-rollback"
    assert get_res.json()["attempts"] == []

    # Fetch unknown
    unknown_res = await async_client.get("/api/v1/interviews/sessions/non-existent-uuid")
    assert unknown_res.status_code == 404


@pytest.mark.asyncio
async def test_submit_session_attempt_and_accumulate_history(async_client: AsyncClient) -> None:
    # 1. Create session
    create_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
    )
    session_id = create_res.json()["id"]

    # 2. Submit Attempt 1
    answer1 = (
        "When troubleshooting a CrashLoopBackOff pod in production, my first step is running "
        "kubectl describe pod to inspect events and check for an OOMKilled exit code 137."
    )
    att1_res = await async_client.post(
        f"/api/v1/interviews/sessions/{session_id}/attempts",
        json={"user_answer": answer1},
    )
    assert att1_res.status_code == 201
    att1_data = att1_res.json()
    assert att1_data["session_id"] == session_id
    assert att1_data["overall_score"] is not None
    assert att1_data["feedback"]["scores"]["overall_score"] == att1_data["overall_score"]
    assert len(att1_data["feedback"]["feedback"]["technical_feedback"]) > 0

    # 3. Submit Attempt 2 (Polished answer)
    answer2 = (
        "To systematically triage this, I first inspect events using kubectl describe pod. "
        "Next, I check historical crash logs using kubectl logs --previous to locate unhandled "
        "runtime exceptions before verifying ConfigMaps and Secrets."
    )
    att2_res = await async_client.post(
        f"/api/v1/interviews/sessions/{session_id}/attempts",
        json={"user_answer": answer2},
    )
    assert att2_res.status_code == 201

    # 4. Verify session history contains both chronological attempts
    history_res = await async_client.get(f"/api/v1/interviews/sessions/{session_id}")
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert len(history_data["attempts"]) == 2
    assert history_data["attempts"][0]["id"] == att1_data["id"]
    assert history_data["attempts"][1]["id"] == att2_res.json()["id"]


@pytest.mark.asyncio
async def test_submit_attempt_validation_error(async_client: AsyncClient) -> None:
    create_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
    )
    session_id = create_res.json()["id"]

    # Too short (< 10 chars)
    short_res = await async_client.post(
        f"/api/v1/interviews/sessions/{session_id}/attempts",
        json={"user_answer": "Too short"},
    )
    assert short_res.status_code == 422


@pytest.mark.asyncio
async def test_legacy_evaluate_endpoint_backward_compatibility(async_client: AsyncClient) -> None:
    # 1. Standalone evaluate without session_id (Legacy mode)
    legacy_payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "user_answer": "When troubleshooting CrashLoopBackOff, I inspect kubectl describe pod for exit code 137.",
    }
    legacy_res = await async_client.post("/api/v1/interviews/evaluate", json=legacy_payload)
    assert legacy_res.status_code == 200
    assert "scores" in legacy_res.json()

    # 2. Evaluate with optional session_id (Saves attempt in background)
    session_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
    )
    session_id = session_res.json()["id"]

    linked_payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "session_id": session_id,
        "user_answer": "Checking kubectl logs --previous provides the fatal stack trace before container termination.",
    }
    linked_res = await async_client.post("/api/v1/interviews/evaluate", json=linked_payload)
    assert linked_res.status_code == 200

    # Verify attempt was persisted into that session
    session_check = await async_client.get(f"/api/v1/interviews/sessions/{session_id}")
    assert len(session_check.json()["attempts"]) == 1
