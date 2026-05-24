"""Course repository."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate


class CourseRepository:
    """Repository for course data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, course_data: CourseCreate) -> Course:
        """Create a new course."""
        course = Course(**course_data.model_dump(exclude_unset=True))
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course
    
    async def get_by_id(self, course_id: UUID) -> Optional[Course]:
        """Get course by ID."""
        result = await self.db.execute(select(Course).where(Course.id == course_id))
        return result.scalar_one_or_none()
    
    async def update(self, course_id: UUID, course_data: CourseUpdate) -> Optional[Course]:
        """Update course."""
        course = await self.get_by_id(course_id)
        if not course:
            return None
        
        for key, value in course_data.model_dump(exclude_unset=True).items():
            setattr(course, key, value)
        
        await self.db.commit()
        await self.db.refresh(course)
        return course
    
    async def delete(self, course_id: UUID) -> bool:
        """Delete course."""
        course = await self.get_by_id(course_id)
        if not course:
            return False
        
        await self.db.delete(course)
        await self.db.commit()
        return True
    
    async def list_all(self, skip: int = 0, limit: int = 100, published_only: bool = False) -> List[Course]:
        """List all courses with pagination."""
        query = select(Course)
        if published_only:
            query = query.where(Course.is_published == True)
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def search_by_tags(self, tags: List[str], skip: int = 0, limit: int = 100) -> List[Course]:
        """Search courses by tags."""
        query = select(Course).where(Course.tags.overlap(tags)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
