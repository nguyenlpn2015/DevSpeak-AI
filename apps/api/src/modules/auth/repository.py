"""Database access layer for User entities."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.auth.models import User


class UserRepository:
    """Async database operations for users."""

    async def create_user(
        self,
        db: AsyncSession,
        email: str,
        hashed_password: str,
        full_name: str = "",
        target_role: str = "devops",
        target_level: str = "B2",
    ) -> User:
        """Insert and return a new User record."""
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            target_role=target_role,
            target_level=target_level,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        return user

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Query user by unique normalized email."""
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, db: AsyncSession, user_id: str) -> User | None:
        """Query user by primary key UUID."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()
