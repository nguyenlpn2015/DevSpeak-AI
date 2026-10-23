"""Integration tests for Alembic database migration upgrade and downgrade lifecycle."""

import os
import tempfile
import uuid

import pytest
from alembic.config import Config
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import command


@pytest.mark.asyncio
async def test_alembic_upgrade_and_downgrade_lifecycle() -> None:
    """Verify that Alembic migrations apply cleanly and can be reversed without error."""
    temp_db_name = f"test_alembic_{uuid.uuid4().hex}.db"
    temp_db_path = os.path.join(tempfile.gettempdir(), temp_db_name)
    db_url = f"sqlite+aiosqlite:///{temp_db_path}"

    # Prepare Alembic config pointing to temp DB
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    ini_path = os.path.join(api_dir, "alembic.ini")
    script_location = os.path.join(api_dir, "alembic")

    alembic_cfg = Config(ini_path)
    alembic_cfg.set_main_option("script_location", script_location)
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    alembic_cfg.set_main_option("path_separator", os.pathsep)

    try:
        # 1. Apply all migrations (upgrade head)
        command.upgrade(alembic_cfg, "head")

        # 2. Inspect created schema using async engine
        engine = create_async_engine(db_url)
        async with engine.connect() as conn:
            tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
            assert "interview_sessions" in tables
            assert "interview_attempts" in tables
            assert "interview_messages" in tables
            assert "users" in tables
            assert "alembic_version" in tables

            # Verify columns on interview_messages
            msg_columns = await conn.run_sync(
                lambda sync_conn: [
                    c["name"] for c in inspect(sync_conn).get_columns("interview_messages")
                ]
            )
            assert "id" in msg_columns
            assert "session_id" in msg_columns
            assert "role" in msg_columns
            assert "content" in msg_columns
            assert "turn_index" in msg_columns
            assert "feedback_snapshot" in msg_columns
            assert "created_at" in msg_columns

            # Verify columns on interview_sessions
            columns = await conn.run_sync(
                lambda sync_conn: [
                    c["name"] for c in inspect(sync_conn).get_columns("interview_sessions")
                ]
            )
            assert "id" in columns
            assert "user_id" in columns
            assert "question_id" in columns
            assert "status" in columns
            assert "session_metadata" in columns
            assert "created_at" in columns
            assert "updated_at" in columns

        await engine.dispose()

        # 3. Test downgrade to base
        command.downgrade(alembic_cfg, "base")

        # Verify tables dropped
        engine = create_async_engine(db_url)
        async with engine.connect() as conn:
            tables_after_downgrade = await conn.run_sync(
                lambda sync_conn: inspect(sync_conn).get_table_names()
            )
            assert "interview_sessions" not in tables_after_downgrade
            assert "interview_attempts" not in tables_after_downgrade
            assert "interview_messages" not in tables_after_downgrade

        await engine.dispose()

        # 4. Re-apply upgrade to ensure full idempotency
        command.upgrade(alembic_cfg, "head")

    finally:
        if os.path.exists(temp_db_path):
            try:
                os.remove(temp_db_path)
            except OSError:
                pass
