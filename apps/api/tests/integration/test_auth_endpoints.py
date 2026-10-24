"""Integration tests for authentication endpoints and user session isolation."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient) -> None:
    """Registering a new candidate account returns 201 Created with a signed JWT token."""
    payload = {
        "email": "candidate@example.com",
        "password": "SecurePassword123!",
        "full_name": "Nguyen DevOps",
        "target_role": "devops",
        "target_level": "B2",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "candidate@example.com"
    assert data["user"]["full_name"] == "Nguyen DevOps"
    assert data["user"]["target_role"] == "devops"
    assert data["user"]["target_level"] == "B2"
    assert data["user"]["is_active"] is True
    assert "id" in data["user"]
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient) -> None:
    """Duplicate email registration returns 409 Conflict."""
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "full_name": "First User",
    }
    res1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_validation_errors(async_client: AsyncClient) -> None:
    """Password under 8 chars or invalid email format returns 422."""
    short_pw = {
        "email": "valid@example.com",
        "password": "short",
    }
    res1 = await async_client.post("/api/v1/auth/register", json=short_pw)
    assert res1.status_code == 422

    bad_email = {
        "email": "not-an-email",
        "password": "SecurePassword123!",
    }
    res2 = await async_client.post("/api/v1/auth/register", json=bad_email)
    assert res2.status_code == 422


@pytest.mark.asyncio
async def test_login_success_and_failure(async_client: AsyncClient) -> None:
    """Login succeeds with valid credentials and fails on wrong password/email."""
    reg_payload = {
        "email": "login_user@example.com",
        "password": "CorrectPassword123!",
        "full_name": "Login Tester",
    }
    await async_client.post("/api/v1/auth/register", json=reg_payload)

    # Valid credentials
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "login_user@example.com", "password": "CorrectPassword123!"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == "login_user@example.com"

    # Wrong password
    fail_res1 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "login_user@example.com", "password": "WrongPassword999!"},
    )
    assert fail_res1.status_code == 401
    assert "invalid email or password" in fail_res1.json()["detail"].lower()

    # Unknown user
    fail_res2 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "unknown@example.com", "password": "AnyPassword123!"},
    )
    assert fail_res2.status_code == 401


@pytest.mark.asyncio
async def test_me_and_logout_endpoints(async_client: AsyncClient) -> None:
    """Candidate profile /me requires valid token and returns candidate details."""
    # Unauthenticated
    res_unauth = await async_client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401

    # Invalid token
    res_bad = await async_client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.payload"}
    )
    assert res_bad.status_code == 401

    # Register and get token
    reg_res = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "profile@example.com", "password": "ProfilePassword123!"},
    )
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Authenticated /me
    me_res = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "profile@example.com"

    # Logout
    logout_res = await async_client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert logout_res.json()["status"] == "logged_out"


@pytest.mark.asyncio
async def test_authenticated_session_isolation(async_client: AsyncClient) -> None:
    """Sessions created by Candidate A are isolated from Candidate B."""
    # Candidate A
    res_a = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "candidate_a@example.com", "password": "Password1234!"},
    )
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Candidate B
    res_b = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "candidate_b@example.com", "password": "Password1234!"},
    )
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Candidate A creates session
    sess_a = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "k8s-pod-crashloopbackoff"},
        headers=headers_a,
    )
    assert sess_a.status_code == 201
    sess_a_id = sess_a.json()["id"]

    # Candidate B creates session
    sess_b = await async_client.post(
        "/api/v1/interviews/sessions",
        json={"question_id": "cicd-canary-rollback"},
        headers=headers_b,
    )
    assert sess_b.status_code == 201
    sess_b_id = sess_b.json()["id"]

    # Candidate A can access own session
    get_a = await async_client.get(f"/api/v1/interviews/sessions/{sess_a_id}", headers=headers_a)
    assert get_a.status_code == 200

    # Candidate B cannot access Candidate A's session (403)
    get_b_cross = await async_client.get(
        f"/api/v1/interviews/sessions/{sess_a_id}", headers=headers_b
    )
    assert get_b_cross.status_code == 403

    # Candidate B cannot submit attempt to Candidate A's session (403)
    attempt_cross = await async_client.post(
        f"/api/v1/interviews/sessions/{sess_a_id}/attempts",
        json={"user_answer": "This is an unauthorized attempt from candidate B."},
        headers=headers_b,
    )
    assert attempt_cross.status_code == 403

    # Unauthenticated caller cannot access Candidate A's session (403 BOLA defense)
    get_anon_cross = await async_client.get(f"/api/v1/interviews/sessions/{sess_a_id}")
    assert get_anon_cross.status_code == 403

    # Unauthenticated caller cannot submit attempt to Candidate A's session (403 BOLA defense)
    attempt_anon_cross = await async_client.post(
        f"/api/v1/interviews/sessions/{sess_a_id}/attempts",
        json={"user_answer": "This is an unauthorized attempt from an anonymous caller."},
    )
    assert attempt_anon_cross.status_code == 403

    # Unauthenticated caller cannot access messages of Candidate A's session (403)
    messages_anon_cross = await async_client.get(
        f"/api/v1/interviews/sessions/{sess_a_id}/messages"
    )
    assert messages_anon_cross.status_code == 403

    # Unauthenticated caller cannot send chat turn to Candidate A's session (403)
    chat_anon_cross = await async_client.post(
        f"/api/v1/interviews/sessions/{sess_a_id}/chat",
        json={"message": "Anonymous attempt to hijack dialogue."},
    )
    assert chat_anon_cross.status_code == 403

    # Candidate A listing only sees Candidate A's session
    list_a = await async_client.get("/api/v1/interviews/sessions", headers=headers_a)
    assert list_a.status_code == 200
    ids_a = [s["id"] for s in list_a.json()["items"]]
    assert sess_a_id in ids_a
    assert sess_b_id not in ids_a

    # Candidate B listing only sees Candidate B's session
    list_b = await async_client.get("/api/v1/interviews/sessions", headers=headers_b)
    assert list_b.status_code == 200
    ids_b = [s["id"] for s in list_b.json()["items"]]
    assert sess_b_id in ids_b
    assert sess_a_id not in ids_b
