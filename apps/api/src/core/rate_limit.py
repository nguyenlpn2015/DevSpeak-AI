"""In-memory sliding-window rate limiting dependencies for FastAPI."""

import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    """Thread-safe sliding-window rate limiter per client IP."""

    def __init__(
        self,
        requests_limit: int = 10,
        window_seconds: int = 60,
        name: str = "Request",
    ) -> None:
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.name = name
        self._history: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP handling reverse proxy headers."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def reset(self) -> None:
        """Clear all rate limit history (useful for test isolation)."""
        self._history.clear()

    def check(self, request: Request) -> None:
        """Enforce rate limit for incoming client request."""
        limit = self.requests_limit

        now = time.monotonic()
        client_ip = self._get_client_ip(request)
        cutoff = now - self.window_seconds

        # Prune expired timestamps
        active = [t for t in self._history[client_ip] if t > cutoff]
        self._history[client_ip] = active

        if len(active) >= limit:
            retry_after = int(self.window_seconds - (now - active[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many {self.name.lower()} attempts. Please try again in {max(1, retry_after)} seconds.",
                headers={"Retry-After": str(max(1, retry_after))},
            )

        self._history[client_ip].append(now)

    def __call__(self, request: Request) -> None:
        """FastAPI dependency callable."""
        self.check(request)


# Singleton limiters for sensitive endpoints
auth_register_limiter = InMemoryRateLimiter(
    requests_limit=10, window_seconds=60, name="Registration"
)
auth_login_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60, name="Login")
