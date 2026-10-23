"""API integration tests using HTTPX AsyncClient."""

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_endpoint_returns_200(client: AsyncClient):
    """GET /healthz returns 200 and documented schema."""
    response = await client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["environment"] == "development"


@pytest.mark.asyncio
async def test_readiness_endpoint_returns_200(client: AsyncClient):
    """GET /readyz returns 200 and verifies provider and questions."""
    response = await client.get("/readyz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["ai_provider"] == "mock"
    assert data["questions_loaded"] >= 5


@pytest.mark.asyncio
async def test_list_questions(client: AsyncClient):
    """GET /api/v1/questions returns list with expected attributes."""
    response = await client.get("/api/v1/questions")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 5
    assert len(data["items"]) == data["total"]

    first = data["items"][0]
    assert "id" in first
    assert "title" in first
    assert "prompt" in first
    assert "role" in first
    assert "topic" in first
    assert "difficulty" in first
    assert "competencies" in first


@pytest.mark.asyncio
async def test_list_questions_with_filters(client: AsyncClient):
    """GET /api/v1/questions filters by role, topic, and difficulty."""
    # Filter by topic: kubernetes
    response = await client.get("/api/v1/questions?topic=kubernetes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(item["topic"] == "kubernetes" for item in data["items"])

    # Filter by role: cloud
    response_cloud = await client.get("/api/v1/questions?role=cloud")
    assert response_cloud.status_code == 200
    assert response_cloud.json()["total"] >= 1

    # Filter by difficulty: senior
    response_senior = await client.get("/api/v1/questions?difficulty=senior")
    assert response_senior.status_code == 200
    assert response_senior.json()["total"] >= 2


@pytest.mark.asyncio
async def test_get_question_detail_success(client: AsyncClient):
    """GET /api/v1/questions/{id} returns question with rubric and sample answer."""
    response = await client.get("/api/v1/questions/k8s-pod-crashloopbackoff")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "k8s-pod-crashloopbackoff"
    assert "rubric" in data
    assert "key_concepts" in data["rubric"]
    assert "sample_answer" in data
    assert "follow_up_questions" in data
    assert len(data["follow_up_questions"]) >= 1


@pytest.mark.asyncio
async def test_get_question_unknown_id_returns_404(client: AsyncClient):
    """GET /api/v1/questions/{id} returns 404 for unknown IDs."""
    response = await client.get("/api/v1/questions/unknown-uuid-or-slug")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


@pytest.mark.asyncio
async def test_evaluate_answer_success(client: AsyncClient):
    """POST /api/v1/interviews/evaluate returns valid FeedbackReport."""
    payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "user_answer": (
            "First, I run kubectl describe pod to inspect events and exit codes. "
            "If exit code 137 appears, it indicates an OOMKilled error. Next, I check "
            "kubectl logs --previous to find the unhandled crash trace."
        ),
    }
    response = await client.post("/api/v1/interviews/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["question_id"] == "k8s-pod-crashloopbackoff"
    assert "scores" in data
    assert 1 <= data["scores"]["grammar_score"] <= 10
    assert 1 <= data["scores"]["technical_score"] <= 10
    assert 1 <= data["scores"]["clarity_score"] <= 10
    assert 1.0 <= data["scores"]["overall_score"] <= 10.0
    assert "feedback" in data
    assert "model_answer" in data
    assert "suggested_followups" in data
    assert "disclaimer" in data


@pytest.mark.asyncio
async def test_evaluate_answer_unknown_question_returns_404(client: AsyncClient):
    """POST /api/v1/interviews/evaluate returns 404 when question_id does not exist."""
    payload = {
        "question_id": "nonexistent-question",
        "user_answer": "Valid length answer for an unknown question identifier.",
    }
    response = await client.post("/api/v1/interviews/evaluate", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_evaluate_answer_too_short_returns_422(client: AsyncClient):
    """POST /api/v1/interviews/evaluate rejects answers under 10 characters."""
    payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "user_answer": "Short",
    }
    response = await client.post("/api/v1/interviews/evaluate", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_evaluate_answer_too_long_returns_422(client: AsyncClient):
    """POST /api/v1/interviews/evaluate rejects answers exceeding 4000 characters."""
    payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "user_answer": "x" * 4001,
    }
    response = await client.post("/api/v1/interviews/evaluate", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_evaluate_answer_missing_fields_returns_422(client: AsyncClient):
    """POST /api/v1/interviews/evaluate rejects payload with missing fields."""
    response = await client.post("/api/v1/interviews/evaluate", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_error_responses_do_not_leak_stack_traces(client: AsyncClient):
    """Ensure error responses return clean JSON details without Python stack traces."""
    response = await client.get("/api/v1/questions/does-not-exist")
    assert response.status_code == 404
    content = response.text
    assert "Traceback" not in content
    assert "File " not in content


@pytest.mark.asyncio
async def test_ai_provider_error_status_mappings(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
):
    """Ensure AI Provider exceptions map to correct HTTP status codes without leaking stack traces."""
    from unittest.mock import AsyncMock

    from src.modules.ai.exceptions import (
        AIConfigurationError,
        AIProviderError,
        AIRateLimitError,
        AITimeoutError,
    )
    from src.modules.ai.factory import get_ai_provider

    provider = get_ai_provider()

    # 1. Rate Limit Error -> HTTP 429
    monkeypatch.setattr(
        provider,
        "evaluate_answer",
        AsyncMock(side_effect=AIRateLimitError("Rate limit exceeded", provider="gemini")),
    )
    res_429 = await client.post(
        "/api/v1/interviews/evaluate",
        json={
            "question_id": "k8s-pod-crashloopbackoff",
            "user_answer": "Valid sample response text.",
        },
    )
    assert res_429.status_code == 429
    assert "Rate limit exceeded" in res_429.json()["detail"]
    assert "Traceback" not in res_429.text

    # 2. Timeout Error -> HTTP 504
    monkeypatch.setattr(
        provider,
        "evaluate_answer",
        AsyncMock(side_effect=AITimeoutError("Request timed out", provider="gemini")),
    )
    res_504 = await client.post(
        "/api/v1/interviews/evaluate",
        json={
            "question_id": "k8s-pod-crashloopbackoff",
            "user_answer": "Valid sample response text.",
        },
    )
    assert res_504.status_code == 504
    assert "timed out" in res_504.json()["detail"]
    assert "Traceback" not in res_504.text

    # 3. Configuration Error -> HTTP 503
    monkeypatch.setattr(
        provider,
        "evaluate_answer",
        AsyncMock(side_effect=AIConfigurationError("Key invalid", provider="gemini")),
    )
    res_503 = await client.post(
        "/api/v1/interviews/evaluate",
        json={
            "question_id": "k8s-pod-crashloopbackoff",
            "user_answer": "Valid sample response text.",
        },
    )
    assert res_503.status_code == 503
    assert "temporarily unavailable" in res_503.json()["detail"]
    assert "Traceback" not in res_503.text

    # 4. Generic AI Provider Error -> HTTP 502
    monkeypatch.setattr(
        provider,
        "evaluate_answer",
        AsyncMock(side_effect=AIProviderError("Upstream failure", provider="gemini")),
    )
    res_502 = await client.post(
        "/api/v1/interviews/evaluate",
        json={
            "question_id": "k8s-pod-crashloopbackoff",
            "user_answer": "Valid sample response text.",
        },
    )
    assert res_502.status_code == 502
    assert "Failed to generate evaluation" in res_502.json()["detail"]
    assert "Traceback" not in res_502.text


@pytest.mark.asyncio
async def test_list_questions_invalid_enum_filters_return_422(client: AsyncClient):
    """Passing invalid query parameters returns HTTP 422 Unprocessable Entity."""
    # Invalid difficulty
    res = await client.get("/api/v1/questions?difficulty=super_expert")
    assert res.status_code == 422

    # Invalid topic
    res_topic = await client.get("/api/v1/questions?topic=non_existent_topic")
    assert res_topic.status_code == 422


@pytest.mark.asyncio
async def test_get_question_path_traversal_or_malformed_id_returns_404(client: AsyncClient):
    """Unmatched or path traversal question IDs return clean HTTP 404."""
    res = await client.get("/api/v1/questions/..%2F..%2Fetc%2Fpasswd")
    assert res.status_code == 404

    res_sql = await client.get("/api/v1/questions/'%20OR%201=1--")
    assert res_sql.status_code == 404


@pytest.mark.asyncio
async def test_evaluate_answer_exceeding_max_characters_returns_422(client: AsyncClient):
    """Submissions exceeding 4000 characters are rejected with HTTP 422."""
    payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "user_answer": "A" * 4001,
    }
    res = await client.post("/api/v1/interviews/evaluate", json=payload)
    assert res.status_code == 422
    assert "at most 4000 characters" in res.text or "cannot exceed 4000 characters" in res.text


@pytest.mark.asyncio
async def test_evaluate_answer_empty_or_whitespace_returns_422(client: AsyncClient):
    """Submissions with fewer than 10 non-whitespace characters are rejected with HTTP 422."""
    payload = {
        "question_id": "k8s-pod-crashloopbackoff",
        "user_answer": "          \n\t   ",
    }
    res = await client.post("/api/v1/interviews/evaluate", json=payload)
    assert res.status_code == 422
    assert "at least 10 non-whitespace characters" in res.text
