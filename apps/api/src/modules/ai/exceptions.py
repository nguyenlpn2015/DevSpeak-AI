"""Exceptions raised by AI Provider implementations and adapters."""


class AIProviderError(Exception):
    """Base exception for all AI provider failures."""

    def __init__(self, message: str, provider: str = "unknown", status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code


class AIConfigurationError(AIProviderError):
    """Raised when an AI provider is enabled without required credentials or configuration."""

    def __init__(self, message: str, provider: str = "unknown") -> None:
        super().__init__(message=message, provider=provider, status_code=503)


class AIRateLimitError(AIProviderError):
    """Raised when an external provider returns rate limit or quota exceeded (HTTP 429)."""

    def __init__(self, message: str, provider: str = "unknown") -> None:
        super().__init__(message=message, provider=provider, status_code=429)


class AITimeoutError(AIProviderError):
    """Raised when a request to an external AI provider times out."""

    def __init__(self, message: str, provider: str = "unknown") -> None:
        super().__init__(message=message, provider=provider, status_code=504)


class AIResponseValidationError(AIProviderError):
    """Raised when an AI provider returns malformed, incomplete, or schema-violating output."""

    def __init__(self, message: str, provider: str = "unknown") -> None:
        super().__init__(message=message, provider=provider, status_code=502)
