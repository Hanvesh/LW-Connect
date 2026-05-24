"""Mentor repository."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mentor import Mentor
from app.schemas.mentor import MentorCreate, MentorUpdate, MentorSearchFilters


class MentorRepository:
    """Repository for mentor data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, user_id: UUID, mentor_data: MentorCreate) -> Mentor:
        """Create a new mentor profile."""
        mentor = Mentor(
            user_id=user_id,
            **mentor_data.model_dump(exclude_unset=True)
        )
        self.db.add(mentor)
        await self.db.commit()
        await self.db.refresh(mentor)
        return mentor
    
    async def get_by_id(self, mentor_id: UUID) -> Optional[Mentor]:
        """Get mentor by ID."""
        result = await self.db.execute(select(Mentor).where(Mentor.id == mentor_id))
        return result.scalar_one_or_none()
    
    async def get_by_user_id(self, user_id: UUID) -> Optional[Mentor]:
        """Get mentor by user ID."""
        result = await self.db.execute(select(Mentor).where(Mentor.user_id == user_id))
        return result.scalar_one_or_none()
    
    async def update(self, mentor_id: UUID, mentor_data: MentorUpdate) -> Optional[Mentor]:
        """Update mentor profile."""
        mentor = await self.get_by_id(mentor_id)
        if not mentor:
            return None
        
        for key, value in mentor_data.model_dump(exclude_unset=True).items():
            setattr(mentor, key, value)
        
        await self.db.commit()
        await self.db.refresh(mentor)
        return mentor
    
    async def search(self, filters: MentorSearchFilters, skip: int = 0, limit: int = 100) -> List[Mentor]:
        """Search mentors with filters."""
        query = select(Mentor)
        conditions = []
        
        if filters.is_available is not None:
            conditions.append(Mentor.is_available == filters.is_available)
        
        if filters.min_experience is not None:
            conditions.append(Mentor.years_of_experience >= filters.min_experience)
        
        if filters.max_rate is not None:
            conditions.append(Mentor.hourly_rate <= filters.max_rate)
        
        if filters.expertise:
            conditions.append(Mentor.expertise.overlap(filters.expertise))
        
        if filters.skills:
            conditions.append(Mentor.skills.overlap(filters.skills))
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Mentor]:
        """List all mentors with pagination."""
        result = await self.db.execute(select(Mentor).offset(skip).limit(limit))
        return list(result.scalars().all())
