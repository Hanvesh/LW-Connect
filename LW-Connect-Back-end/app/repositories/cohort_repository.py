"""Cohort repository."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cohort import Cohort, CohortEnrollment
from app.models.course import Course
from app.schemas.cohort import CohortCreate, CohortUpdate


class CohortRepository:
    """Repository for cohort data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, cohort_data: CohortCreate) -> Cohort:
        """Create a new cohort."""
        cohort = Cohort(**cohort_data.model_dump(exclude_unset=True))
        self.db.add(cohort)
        await self.db.commit()
        await self.db.refresh(cohort)
        return cohort
    
    async def get_by_id(self, cohort_id: UUID) -> Optional[Cohort]:
        """Get cohort by ID."""
        result = await self.db.execute(
            select(Cohort)
            .options(selectinload(Cohort.course))
            .where(Cohort.id == cohort_id)
        )
        return result.scalar_one_or_none()
    
    async def update(self, cohort_id: UUID, cohort_data: CohortUpdate) -> Optional[Cohort]:
        """Update cohort."""
        cohort = await self.get_by_id(cohort_id)
        if not cohort:
            return None
        
        for key, value in cohort_data.model_dump(exclude_unset=True).items():
            setattr(cohort, key, value)
        
        await self.db.commit()
        await self.db.refresh(cohort)
        return cohort
    
    async def list_by_course(self, course_id: UUID, skip: int = 0, limit: int = 100) -> List[Cohort]:
        """List cohorts by course."""
        result = await self.db.execute(
            select(Cohort)
            .options(selectinload(Cohort.course))
            .where(Cohort.course_id == course_id)
            .order_by(Cohort.start_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_active(self, skip: int = 0, limit: int = 100) -> List[Cohort]:
        """List active cohorts available to learners."""
        result = await self.db.execute(
            select(Cohort)
            .options(selectinload(Cohort.course))
            .where(Cohort.is_active == True)
            .order_by(Cohort.start_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_enrollments_by_learner(self, learner_id: UUID) -> List[CohortEnrollment]:
        """List cohort enrollments for a learner."""
        result = await self.db.execute(
            select(CohortEnrollment)
            .where(CohortEnrollment.learner_id == learner_id)
            .order_by(CohortEnrollment.enrolled_at.desc())
        )
        return list(result.scalars().all())

    async def list_all(self, skip: int = 0, limit: int = 100) -> List[Cohort]:
        """List all cohorts."""
        result = await self.db.execute(
            select(Cohort)
            .options(selectinload(Cohort.course))
            .order_by(Cohort.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def enroll_learner(self, cohort_id: UUID, learner_id: UUID) -> CohortEnrollment:
        """Enroll a learner in a cohort."""
        enrollment = CohortEnrollment(cohort_id=cohort_id, learner_id=learner_id)
        self.db.add(enrollment)
        await self.db.commit()
        await self.db.refresh(enrollment)
        return enrollment
    
    async def get_enrollment(self, cohort_id: UUID, learner_id: UUID) -> Optional[CohortEnrollment]:
        """Get enrollment by cohort and learner."""
        result = await self.db.execute(
            select(CohortEnrollment).where(
                CohortEnrollment.cohort_id == cohort_id,
                CohortEnrollment.learner_id == learner_id
            )
        )
        return result.scalar_one_or_none()
    
    async def get_cohort_enrollments(self, cohort_id: UUID) -> List[CohortEnrollment]:
        """Get all enrollments for a cohort."""
        result = await self.db.execute(
            select(CohortEnrollment).where(CohortEnrollment.cohort_id == cohort_id)
        )
        return list(result.scalars().all())
    
    async def get_enrollment_count(self, cohort_id: UUID) -> int:
        """Get enrollment count for a cohort."""
        result = await self.db.execute(
            select(func.count(CohortEnrollment.id)).where(CohortEnrollment.cohort_id == cohort_id)
        )
        return result.scalar() or 0
