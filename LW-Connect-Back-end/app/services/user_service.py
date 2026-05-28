"""User management service."""
from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository
from app.repositories.learner_repository import LearnerRepository
from app.repositories.mentor_repository import MentorRepository
from app.schemas.user import AdminUserCreate, UserUpdate, UserResponse
from app.schemas.learner import LearnerCreate
from app.schemas.mentor import MentorCreate
from app.models.user import UserRole


class UserService:
    """Service for admin user management."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.learner_repo = LearnerRepository(db)
        self.mentor_repo = MentorRepository(db)

    async def list_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """List all users."""
        users = await self.user_repo.list_all(skip, limit)
        return [UserResponse.model_validate(user) for user in users]

    async def create_user(self, user_data: AdminUserCreate) -> UserResponse:
        """Create a user (admin only)."""
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"This email is already registered as a {existing_user.role.value}. "
                    "Each email can only be used for one account type."
                )
            )

        hashed_password = get_password_hash(user_data.password)
        user = await self.user_repo.create(user_data, hashed_password)

        if user.role == UserRole.LEARNER:
            await self.learner_repo.create(user.id, LearnerCreate())
        elif user.role == UserRole.MENTOR:
            await self.mentor_repo.create(user.id, MentorCreate())

        return UserResponse.model_validate(user)

    async def update_user(self, user_id: UUID, user_data: UserUpdate) -> UserResponse:
        """Update a user."""
        existing = await self.user_repo.get_by_id(user_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user_data.role and user_data.role != existing.role:
            learner_roles = {UserRole.LEARNER, UserRole.MENTOR}
            if existing.role in learner_roles and user_data.role in learner_roles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Cannot change account from {existing.role.value} to {user_data.role.value}. "
                        "Each email can only be associated with one account type."
                    )
                )

            if user_data.role == UserRole.LEARNER:
                learner = await self.learner_repo.get_by_user_id(user_id)
                if not learner:
                    await self.learner_repo.create(user_id, LearnerCreate())
            elif user_data.role == UserRole.MENTOR:
                mentor = await self.mentor_repo.get_by_user_id(user_id)
                if not mentor:
                    await self.mentor_repo.create(user_id, MentorCreate())

        user = await self.user_repo.update(user_id, user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse.model_validate(user)
