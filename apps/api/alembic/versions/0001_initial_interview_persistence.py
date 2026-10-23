"""Initial interview persistence schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-10-19 20:15:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Create interview_sessions table
    op.create_table(
        "interview_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("question_id", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="in_progress"),
        sa.Column("session_metadata", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interview_sessions_id", "interview_sessions", ["id"], unique=False)
    op.create_index(
        "ix_interview_sessions_question_id", "interview_sessions", ["question_id"], unique=False
    )
    op.create_index("ix_interview_sessions_status", "interview_sessions", ["status"], unique=False)
    op.create_index(
        "ix_interview_sessions_created_at", "interview_sessions", ["created_at"], unique=False
    )

    # 2. Create interview_attempts table
    op.create_table(
        "interview_attempts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("user_answer", sa.Text(), nullable=False),
        sa.Column("feedback_snapshot", sa.JSON(), nullable=False),
        sa.Column("overall_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["session_id"],
            ["interview_sessions.id"],
            name="fk_interview_attempts_session_id_interview_sessions",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interview_attempts_id", "interview_attempts", ["id"], unique=False)
    op.create_index(
        "ix_interview_attempts_session_id", "interview_attempts", ["session_id"], unique=False
    )
    op.create_index(
        "ix_interview_attempts_overall_score", "interview_attempts", ["overall_score"], unique=False
    )
    op.create_index(
        "ix_interview_attempts_created_at", "interview_attempts", ["created_at"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_interview_attempts_created_at", table_name="interview_attempts")
    op.drop_index("ix_interview_attempts_overall_score", table_name="interview_attempts")
    op.drop_index("ix_interview_attempts_session_id", table_name="interview_attempts")
    op.drop_index("ix_interview_attempts_id", table_name="interview_attempts")
    op.drop_table("interview_attempts")

    op.drop_index("ix_interview_sessions_created_at", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_status", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_question_id", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_id", table_name="interview_sessions")
    op.drop_table("interview_sessions")
