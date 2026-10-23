"""Pydantic schemas for authentication and user accounts."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRegisterRequest(BaseModel):
    """Payload for candidate registration."""

    email: EmailStr = Field(description="Unique email address")
    password: str = Field(min_length=8, max_length=128, description="Secure account password")
    full_name: str = Field(default="", max_length=100, description="Candidate display name")
    target_role: str = Field(default="devops", max_length=50, description="Target IT role")
    target_level: str = Field(default="B2", max_length=10, description="Target CEFR proficiency")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserLoginRequest(BaseModel):
    """Payload for candidate authentication."""

    email: EmailStr = Field(description="Account email address")
    password: str = Field(min_length=1, max_length=128, description="Account password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    """Public candidate profile schema (never exposes password hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    target_role: str
    target_level: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    """Authentication token response with candidate profile metadata."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
