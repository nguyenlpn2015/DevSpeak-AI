"""Factory for obtaining configured AI provider instance."""

from src.core.config import get_settings
from src.modules.ai.exceptions import AIConfigurationError
from src.modules.ai.gemini_provider import GeminiAIProvider
from src.modules.ai.interface import AIProviderInterface
from src.modules.ai.mock_provider import DeterministicMockAIProvider

_provider_instance: AIProviderInterface | None = None


def get_ai_provider() -> AIProviderInterface:
    """Return the active AI provider singleton according to configuration."""
    global _provider_instance
    if _provider_instance is None:
        settings = get_settings()
        provider_name = settings.AI_PROVIDER.lower().strip()
        if provider_name == "mock":
            _provider_instance = DeterministicMockAIProvider()
        elif provider_name == "gemini":
            _provider_instance = GeminiAIProvider(
                api_key=settings.GEMINI_API_KEY,
                model=settings.GEMINI_MODEL,
                timeout_seconds=settings.AI_TIMEOUT_SECONDS,
                max_retries=settings.AI_MAX_RETRIES,
            )
        else:
            raise AIConfigurationError(
                f"Unsupported AI provider: '{settings.AI_PROVIDER}'. Supported options are 'mock' and 'gemini'.",
                provider=settings.AI_PROVIDER,
            )

    return _provider_instance


def reset_ai_provider() -> None:
    """Reset the singleton instance (useful for testing and config switching)."""
    global _provider_instance
    _provider_instance = None
