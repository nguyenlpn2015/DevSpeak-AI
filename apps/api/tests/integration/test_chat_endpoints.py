"""Integration tests for stateful multi-turn interview chatbot endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_session_messages_seeds_prompt(async_client: AsyncClient) -> None:
    """Retrieving messages for a new session automatically initializes the interviewer prompt."""
    sess_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
    )
    assert sess_res.status_code == 201
    session_id = sess_res.json()["id"]

    msg_res = await async_client.get(
        f"/api/v1/interviews/sessions/{session_id}/messages"
    )
    assert msg_res.status_code == 200
    messages = msg_res.json()
    assert len(messages) == 1
    assert messages[0]["role"] == "interviewer"
    assert messages[0]["turn_index"] == 0
    assert "CrashLoopBackOff" in messages[0]["content"]


@pytest.mark.asyncio
async def test_multi_turn_interview_dialogue_to_completion(
    async_client: AsyncClient,
) -> None:
    """Full 3-turn interactive interview dialogue culminates in structured evaluation."""
    sess_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
    )
    session_id = sess_res.json()["id"]

    # Turn 1: Candidate answers initial question
    turn1_res = await async_client.post(
        f"/api/v1/interviews/sessions/{session_id}/chat",
        json={
            "message": (
                "When troubleshooting CrashLoopBackOff, I inspect the pod status with kubectl get pods "
                "and run kubectl describe pod to see the exit code and termination reason."
            )
        },
    )
    assert turn1_res.status_code == 200
    turn1_data = turn1_res.json()
    assert turn1_data["is_concluding"] is False
    assert turn1_data["feedback"] is None
    assert len(turn1_data["messages"]) == 3  # Turn 0 (prompt), Turn 1 (cand), Turn 2 (interviewer)

    # Turn 2: Candidate responds to first probing follow-up
    turn2_res = await async_client.post(
        f"/api/v1/interviews/sessions/{session_id}/chat",
        json={
            "message": (
                "If the exit code is 137, indicating an Out of Memory error, I would check the pod memory limits "
                "and container metrics with kubectl top pod or inspect node events."
            )
        },
    )
    assert turn2_res.status_code == 200
    turn2_data = turn2_res.json()
    assert turn2_data["is_concluding"] is False
    assert turn2_data["feedback"] is None
    assert len(turn2_data["messages"]) == 5

    # Turn 3: Candidate answers second follow-up (concluding turn)
    turn3_res = await async_client.post(
        f"/api/v1/interviews/sessions/{session_id}/chat",
        json={
            "message": (
                "To prevent this cascading failure, I would configure resource requests and limits in the deployment spec, "
                "set up Horizontal Pod Autoscalers, and implement Prometheus alerts on memory saturation."
            )
        },
    )
    assert turn3_res.status_code == 200
    turn3_data = turn3_res.json()
    assert turn3_data["is_concluding"] is True
    assert turn3_data["feedback"] is not None
    assert turn3_data["feedback"]["scores"]["overall_score"] >= 1.0
    assert len(turn3_data["messages"]) == 7

    # Verify session detail reflects completed status, attempts, and messages
    detail_res = await async_client.get(f"/api/v1/interviews/sessions/{session_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["status"] == "completed"
    assert len(detail["attempts"]) == 1
    assert detail["attempts"][0]["overall_score"] is not None
    assert len(detail["messages"]) == 7


@pytest.mark.asyncio
async def test_chat_permissions_and_isolation(async_client: AsyncClient) -> None:
    """User B cannot access or chat in User A's interview session."""
    # Register Candidate A
    reg_a = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "chat_user_a@example.com", "password": "Password123!"},
    )
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Candidate B
    reg_b = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "chat_user_b@example.com", "password": "Password123!"},
    )
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Candidate A creates session
    sess_res = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "docker-multistage-caching"},
        headers=headers_a,
    )
    sess_id = sess_res.json()["id"]

    # Candidate B tries to get messages -> 403
    get_res = await async_client.get(
        f"/api/v1/interviews/sessions/{sess_id}/messages",
        headers=headers_b,
    )
    assert get_res.status_code == 403

    # Candidate B tries to send chat message -> 403
    post_res = await async_client.post(
        f"/api/v1/interviews/sessions/{sess_id}/chat",
        json={"message": "Unauthorized attempt to answer User A's question"},
        headers=headers_b,
    )
    assert post_res.status_code == 403
