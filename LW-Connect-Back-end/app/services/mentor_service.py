"""Mentor service."""
from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.mentor_repository import MentorRepository
from app.schemas.mentor import MentorCreate, MentorUpdate, MentorResponse, MentorSearchFilters
from app.models.mentor import Mentor


class MentorService:
    """Service for mentor operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.mentor_repo = MentorRepository(db)
    
    async def create_profile(self, user_id: UUID, mentor_data: MentorCreate) -> MentorResponse:
        """Create mentor profile."""
        mentor = await self.mentor_repo.create(user_id, mentor_data)
        return MentorResponse.model_validate(mentor)
    
    async def get_profile(self, mentor_id: UUID) -> MentorResponse:
        """Get mentor profile by ID."""
        mentor = await self.mentor_repo.get_by_id(mentor_id)
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor not found"
            )
        return MentorResponse.model_validate(mentor)
    
    async def update_profile(self, mentor_id: UUID, mentor_data: MentorUpdate) -> MentorResponse:
        """Update mentor profile."""
        mentor = await self.mentor_repo.update(mentor_id, mentor_data)
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor not found"
            )
        return MentorResponse.model_validate(mentor)
    
    async def search_mentors(
        self, 
        filters: MentorSearchFilters, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[MentorResponse]:
        """Search mentors with filters."""
        mentors = await self.mentor_repo.search(filters, skip, limit)
        return [MentorResponse.model_validate(m) for m in mentors]
    
    async def list_mentors(self, skip: int = 0, limit: int = 100) -> List[MentorResponse]:
        """List all mentors."""
        mentors = await self.mentor_repo.list_all(skip, limit)
        return [MentorResponse.model_validate(m) for m in mentors]
