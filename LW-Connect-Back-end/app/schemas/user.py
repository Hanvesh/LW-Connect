"""User schemas."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.user import UserRole


def normalize_email(value: str) -> str:
    """Normalize email for consistent uniqueness checks."""
    return value.strip().lower()


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email_field(cls, value: str) -> str:
        return normalize_email(value)


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.LEARNER


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email_field(cls, value: str) -> str:
        return normalize_email(value)


class UserResponse(UserBase):
    """User response schema."""
    id: UUID
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    """User update schema (admin)."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class AdminUserCreate(UserBase):
    """Admin user creation schema."""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.LEARNER
