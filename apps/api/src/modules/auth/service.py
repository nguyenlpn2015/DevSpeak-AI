"""Business logic and dependency providers for authentication and authorization."""

import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db_session
from src.modules.auth.models import User
from src.modules.auth.password import hash_password, verify_password
from src.modules.auth.repository import UserRepository
from src.modules.auth.schemas import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from src.modules.auth.security import create_access_token, decode_access_token

logger = logging.getLogger("devspeak.auth.service")
security_bearer = HTTPBearer(auto_error=False)


class AuthService:
    """Coordinates candidate registration, credentials validation, and session auth."""

    def __init__(self, repository: UserRepository | None = None) -> None:
        self.repository = repository or UserRepository()

    async def register(self, db: AsyncSession, payload: UserRegisterRequest) -> TokenResponse:
        """Register a new candidate, hash password with Argon2id, and issue token."""
        existing = await self.repository.get_by_email(db=db, email=payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists.",
            )

        hashed = hash_password(payload.password)
        user = await self.repository.create_user(
            db=db,
            email=payload.email,
            hashed_password=hashed,
            full_name=payload.full_name,
            target_role=payload.target_role,
            target_level=payload.target_level,
        )
        await db.commit()
        await db.refresh(user)

        token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "role": user.target_role},
        )
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    async def login(self, db: AsyncSession, payload: UserLoginRequest) -> TokenResponse:
        """Authenticate candidate credentials and issue signed access token."""
        user = await self.repository.get_by_email(db=db, email=payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            logger.warning("Failed login attempt for email=%s", payload.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated.",
            )

        token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "role": user.target_role},
        )
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    async def get_user_from_token(self, db: AsyncSession, token: str) -> User:
        """Decode token and retrieve active user record."""
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token payload.",
                )
        except ExpiredSignatureError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc
        except InvalidTokenError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

        user = await self.repository.get_by_id(db=db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated.",
            )

        return user


_auth_service_instance = AuthService()


def get_auth_service() -> AuthService:
    """Dependency provider for AuthService."""
    return _auth_service_instance


async def get_current_user(
    auth: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db_session),
    service: AuthService = Depends(get_auth_service),
) -> User:
    """Strict authentication dependency requiring a valid Bearer token."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await service.get_user_from_token(db=db, token=auth.credentials)


async def get_optional_user(
    auth: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    db: AsyncSession = Depends(get_db_session),
    service: AuthService = Depends(get_auth_service),
) -> User | None:
    """Permissive authentication dependency returning User if token present and valid, else None."""
    if not auth or not auth.credentials:
        return None
    try:
        return await service.get_user_from_token(db=db, token=auth.credentials)
    except HTTPException:
        return None
