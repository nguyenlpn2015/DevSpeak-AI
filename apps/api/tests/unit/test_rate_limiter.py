"""Unit tests for in-memory rate limiting defense."""

from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException, status

from src.core.rate_limit import InMemoryRateLimiter


def test_rate_limiter_allows_requests_within_quota() -> None:
    """Requests under limit pass without exception."""
    limiter = InMemoryRateLimiter(requests_limit=3, window_seconds=60, name="TestQuota")
    request = MagicMock()
    request.headers = {}
    request.client.host = "192.168.1.10"

    # 3 requests should pass
    limiter.check(request)
    limiter.check(request)
    limiter.check(request)


def test_rate_limiter_rejects_excessive_requests() -> None:
    """Requests exceeding limit trigger HTTP 429 with Retry-After header."""
    limiter = InMemoryRateLimiter(requests_limit=2, window_seconds=60, name="Registration")
    request = MagicMock()
    request.headers = {}
    request.client.host = "192.168.1.20"

    limiter.check(request)
    limiter.check(request)

    # 3rd request must trigger 429
    with pytest.raises(HTTPException) as exc_info:
        limiter.check(request)

    assert exc_info.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert "Too many registration attempts" in exc_info.value.detail
    assert "Retry-After" in exc_info.value.headers


def test_rate_limiter_extracts_forwarded_ip() -> None:
    """Client IP is parsed correctly from X-Forwarded-For."""
    limiter = InMemoryRateLimiter(requests_limit=1, window_seconds=60)
    request = MagicMock()
    request.headers = {"x-forwarded-for": "203.0.113.195, 70.41.3.18"}

    limiter.check(request)

    # Same forwarded IP exceeds quota
    with pytest.raises(HTTPException):
        limiter.check(request)

    # Different forwarded IP succeeds
    request2 = MagicMock()
    request2.headers = {"x-forwarded-for": "198.51.100.4"}
    limiter.check(request2)
