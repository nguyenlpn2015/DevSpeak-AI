import json
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ENVIRONMENT: Literal["development", "test", "staging", "production"] = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "DevSpeak AI API"
    API_V1_STR: str = "/api/v1"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_value(cls, v: object) -> bool:
        """Parse debug boolean safely even if host OS sets DEBUG=release."""
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            lower = v.strip().lower()
            if lower in ("release", "prod", "production", "0", "false", "no"):
                return False
            if lower in ("debug", "dev", "development", "1", "true", "yes"):
                return True
        return False

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        """Support comma-separated strings, JSON arrays, and Python lists."""
        if isinstance(v, str):
            clean = v.strip()
            if clean.startswith("[") and clean.endswith("]"):
                try:
                    parsed = json.loads(clean)
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if str(origin).strip()]
                except json.JSONDecodeError:
                    return [
                        origin.strip() for origin in clean.strip("[]").split(",") if origin.strip()
                    ]
            return [origin.strip() for origin in clean.split(",") if origin.strip()]
        if isinstance(v, list):
            return [str(origin).strip() for origin in v if str(origin).strip()]
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ]

    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # Database configuration (Defaults to zero-cost local SQLite)
    DATABASE_URL: str = "sqlite+aiosqlite:///./devspeak.db"
    DATABASE_ECHO: bool = False

    AI_PROVIDER: Literal["mock", "openai", "anthropic", "gemini"] = "mock"

    # API Keys for live providers (optional)
    OPENAI_API_KEY: str = Field(default="", repr=False)
    ANTHROPIC_API_KEY: str = Field(default="", repr=False)
    GEMINI_API_KEY: str = Field(default="", repr=False)
    GEMINI_MODEL: str = "gemini-flash-lite-latest"

    # AI Request & Reliability Limits
    AI_TIMEOUT_SECONDS: int = 25
    AI_MAX_RETRIES: int = 2
    AI_TEMPERATURE: float = 0.2

    # CORS configuration
    CORS_ORIGINS: list[str] | str = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    CORS_ORIGIN_REGEX: str | None = r"^https:\/\/.*\.run\.app$"

    # Quota and security boundaries
    DAILY_QUESTION_QUOTA: int = 20
    MAX_ANSWER_LENGTH: int = 4000

    # Authentication & JWT Security Settings
    JWT_SECRET_KEY: str = Field(
        default="devspeak-insecure-dev-secret-key-change-in-production-12345",
        repr=False,
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours



@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
