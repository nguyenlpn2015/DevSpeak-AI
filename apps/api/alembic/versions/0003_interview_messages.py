"""Interview messages schema for stateful multi-turn interview dialogue.

Revision ID: 0003_interview_messages
Revises: 0002_user_authentication
Create Date: 2026-10-21 04:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003_interview_messages"
down_revision: str | None = "0002_user_authentication"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "interview_messages",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("turn_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("feedback_snapshot", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["interview_sessions.id"],
            name="fk_interview_messages_session_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interview_messages_id", "interview_messages", ["id"], unique=False)
    op.create_index(
        "ix_interview_messages_session_id",
        "interview_messages",
        ["session_id"],
        unique=False,
    )
    op.create_index("ix_interview_messages_role", "interview_messages", ["role"], unique=False)
    op.create_index(
        "ix_interview_messages_turn_index",
        "interview_messages",
        ["turn_index"],
        unique=False,
    )
    op.create_index(
        "ix_interview_messages_created_at",
        "interview_messages",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_interview_messages_created_at", table_name="interview_messages")
    op.drop_index("ix_interview_messages_turn_index", table_name="interview_messages")
    op.drop_index("ix_interview_messages_role", table_name="interview_messages")
    op.drop_index("ix_interview_messages_session_id", table_name="interview_messages")
    op.drop_index("ix_interview_messages_id", table_name="interview_messages")
    op.drop_table("interview_messages")
