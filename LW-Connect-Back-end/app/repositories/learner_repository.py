"""Learner repository."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.learner import Learner
from app.schemas.learner import LearnerCreate, LearnerUpdate


class LearnerRepository:
    """Repository for learner data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, user_id: UUID, learner_data: LearnerCreate) -> Learner:
        """Create a new learner profile."""
        learner = Learner(
            user_id=user_id,
            **learner_data.model_dump(exclude_unset=True)
        )
        self.db.add(learner)
        await self.db.commit()
        await self.db.refresh(learner)
        return learner
    
    async def get_by_id(self, learner_id: UUID) -> Optional[Learner]:
        """Get learner by ID."""
        result = await self.db.execute(select(Learner).where(Learner.id == learner_id))
        return result.scalar_one_or_none()
    
    async def get_by_user_id(self, user_id: UUID) -> Optional[Learner]:
        """Get learner by user ID."""
        result = await self.db.execute(select(Learner).where(Learner.user_id == user_id))
        return result.scalar_one_or_none()
    
    async def update(self, learner_id: UUID, learner_data: LearnerUpdate) -> Optional[Learner]:
        """Update learner profile."""
        learner = await self.get_by_id(learner_id)
        if not learner:
            return None
        
        for key, value in learner_data.model_dump(exclude_unset=True).items():
            setattr(learner, key, value)
        
        await self.db.commit()
        await self.db.refresh(learner)
        return learner
    
    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Learner]:
        """List all learners with pagination."""
        result = await self.db.execute(select(Learner).offset(skip).limit(limit))
        return list(result.scalars().all())
