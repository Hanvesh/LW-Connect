"""User repository."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    """Repository for user data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, user_data: UserCreate, hashed_password: str) -> User:
        """Create a new user."""
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=user_data.role,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def exists_by_email(self, email: str) -> bool:
        """Check if user exists by email."""
        user = await self.get_by_email(email)
        return user is not None

    async def list_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """List all users."""
        result = await self.db.execute(
            select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, user_id: UUID, user_data: UserUpdate) -> Optional[User]:
        """Update user fields."""
        user = await self.get_by_id(user_id)
        if not user:
            return None

        for key, value in user_data.model_dump(exclude_unset=True).items():
            setattr(user, key, value)

        await self.db.commit()
        await self.db.refresh(user)
        return user
