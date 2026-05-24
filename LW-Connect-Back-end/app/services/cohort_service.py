"""Cohort service."""
from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.cohort_repository import CohortRepository
from app.repositories.course_repository import CourseRepository
from app.schemas.cohort import CohortCreate, CohortUpdate, CohortResponse, CohortEnrollmentResponse


class CohortService:
    """Service for cohort operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cohort_repo = CohortRepository(db)
        self.course_repo = CourseRepository(db)
    
    async def create_cohort(self, cohort_data: CohortCreate) -> CohortResponse:
        """Create a new cohort."""
        # Verify course exists
        course = await self.course_repo.get_by_id(cohort_data.course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        cohort = await self.cohort_repo.create(cohort_data)
        return CohortResponse.model_validate(cohort)
    
    async def get_cohort(self, cohort_id: UUID) -> CohortResponse:
        """Get cohort by ID."""
        cohort = await self.cohort_repo.get_by_id(cohort_id)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cohort not found"
            )
        return CohortResponse.model_validate(cohort)
    
    async def update_cohort(self, cohort_id: UUID, cohort_data: CohortUpdate) -> CohortResponse:
        """Update cohort."""
        cohort = await self.cohort_repo.update(cohort_id, cohort_data)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cohort not found"
            )
        return CohortResponse.model_validate(cohort)
    
    async def list_course_cohorts(self, course_id: UUID, skip: int = 0, limit: int = 100) -> List[CohortResponse]:
        """List cohorts for a course."""
        cohorts = await self.cohort_repo.list_by_course(course_id, skip, limit)
        return [CohortResponse.model_validate(c) for c in cohorts]
    
    async def enroll_learner(self, cohort_id: UUID, learner_id: UUID) -> CohortEnrollmentResponse:
        """Enroll a learner in a cohort."""
        # Verify cohort exists
        cohort = await self.cohort_repo.get_by_id(cohort_id)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cohort not found"
            )
        
        # Check if already enrolled
        existing = await self.cohort_repo.get_enrollment(cohort_id, learner_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Learner already enrolled in this cohort"
            )
        
        # Check capacity
        enrollment_count = await self.cohort_repo.get_enrollment_count(cohort_id)
        if enrollment_count >= cohort.max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cohort is full"
            )
        
        enrollment = await self.cohort_repo.enroll_learner(cohort_id, learner_id)
        return CohortEnrollmentResponse.model_validate(enrollment)
    
    async def get_cohort_enrollments(self, cohort_id: UUID) -> List[CohortEnrollmentResponse]:
        """Get all enrollments for a cohort."""
        enrollments = await self.cohort_repo.get_cohort_enrollments(cohort_id)
        return [CohortEnrollmentResponse.model_validate(e) for e in enrollments]
