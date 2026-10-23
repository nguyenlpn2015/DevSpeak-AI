"""Database engine and asynchronous session management."""

from collections.abc import AsyncGenerator
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.core.config import get_settings

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def normalize_database_url(url: str) -> str:
    """Ensure database URL specifies an asynchronous driver."""
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def get_engine() -> AsyncEngine:
    """Retrieve or create singleton AsyncEngine instance."""
    global _engine
    if _engine is None:
        settings = get_settings()
        db_url = normalize_database_url(settings.DATABASE_URL)
        connect_args: dict[str, Any] = {}
        engine_kwargs: dict[str, Any] = {
            "echo": settings.DATABASE_ECHO,
            "future": True,
        }
        if "sqlite" in db_url:
            connect_args["check_same_thread"] = False
        else:
            # Control connection pool for shared micro-tier Cloud SQL instance (db-f1-micro)
            engine_kwargs["pool_size"] = 3
            engine_kwargs["max_overflow"] = 2
            engine_kwargs["pool_recycle"] = 1800

        _engine = create_async_engine(
            db_url,
            connect_args=connect_args,
            **engine_kwargs,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Retrieve or create singleton sessionmaker instance."""
    global _session_factory
    if _session_factory is None:
        engine = get_engine()
        _session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a managed transactional AsyncSession."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def reset_database_engine(new_engine: AsyncEngine | None = None) -> None:
    """Reset global engine and sessionmaker (used primarily by test fixtures)."""
    global _engine, _session_factory
    _engine = new_engine
    if new_engine is not None:
        _session_factory = async_sessionmaker(
            bind=new_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    else:
        _session_factory = None
