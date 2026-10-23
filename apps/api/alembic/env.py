"""Alembic async environment configuration for DevSpeak AI."""

import asyncio
import concurrent.futures
from logging.config import fileConfig

from sqlalchemy.engine import Connection

from alembic import context
from src.core.config import get_settings
from src.db.base import Base

# Import models so target_metadata includes auth and interview tables
from src.modules.auth.models import User  # noqa: F401
from src.modules.interviews.models import (  # noqa: F401
    InterviewAttempt,
    InterviewMessage,
    InterviewSession,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    """Determine effective database URL from Alembic config or application settings."""
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        settings = get_settings()
        url = settings.DATABASE_URL
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode without an active DB connection."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Execute migrations within an active database connection."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create async engine connection and run sync migration callable."""
    from sqlalchemy.ext.asyncio import create_async_engine

    from src.db.session import normalize_database_url

    raw_url = get_url()
    db_url = normalize_database_url(raw_url)
    connect_args = {}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False

    engine = create_async_engine(db_url, connect_args=connect_args)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using async engine."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # Active loop detected (e.g. running inside pytest), execute on worker thread
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(asyncio.run, run_async_migrations())
            future.result()
    else:
        asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
