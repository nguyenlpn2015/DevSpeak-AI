"""Pytest fixtures for isolated database testing and test client injection."""

import os
import tempfile
import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.core.rate_limit import auth_login_limiter, auth_register_limiter
from src.db.base import Base
from src.db.session import get_db_session
from src.main import app
from src.modules.auth.models import User  # noqa: F401
from src.modules.interviews.models import (  # noqa: F401
    InterviewAttempt,
    InterviewMessage,
    InterviewSession,
)


@pytest_asyncio.fixture(scope="function")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create a temporary, isolated SQLite database file for each test."""
    temp_db_name = f"test_devspeak_{uuid.uuid4().hex}.db"
    temp_db_path = os.path.join(tempfile.gettempdir(), temp_db_name)
    db_url = f"sqlite+aiosqlite:///{temp_db_path}"

    engine = create_async_engine(
        db_url,
        connect_args={"check_same_thread": False},
        future=True,
    )

    # Create all schema tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Teardown: dispose engine and remove temp file
    await engine.dispose()
    if os.path.exists(temp_db_path):
        try:
            os.remove(temp_db_path)
        except OSError:
            pass


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Yield a transactional AsyncSession bound to the isolated test database."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def async_client(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """Yield an AsyncClient with FastAPI's get_db_session overridden to use test_engine."""
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db_session] = override_get_db_session
    auth_register_limiter.reset()
    auth_login_limiter.reset()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    app.dependency_overrides.clear()
