"""User authentication and session ownership schema.

Revision ID: 0002_user_authentication
Revises: 0001_initial
Create Date: 2026-10-21 03:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_user_authentication"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("target_role", sa.String(length=50), nullable=False, server_default="devops"),
        sa.Column("target_level", sa.String(length=10), nullable=False, server_default="B2"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_created_at", "users", ["created_at"], unique=False)

    # 2. Add user_id foreign key column to interview_sessions using batch mode for SQLite compatibility
    with op.batch_alter_table("interview_sessions") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.String(length=36), nullable=True))
        batch_op.create_index("ix_interview_sessions_user_id", ["user_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_interview_sessions_user_id_users",
            "users",
            ["user_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("interview_sessions") as batch_op:
        batch_op.drop_constraint(
            "fk_interview_sessions_user_id_users",
            type_="foreignkey",
        )
        batch_op.drop_index("ix_interview_sessions_user_id")
        batch_op.drop_column("user_id")

    op.drop_index("ix_users_created_at", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
