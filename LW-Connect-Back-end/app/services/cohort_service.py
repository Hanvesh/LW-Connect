"""Cohort service."""
from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.cohort_repository import CohortRepository
from app.repositories.course_repository import CourseRepository
from app.repositories.learner_repository import LearnerRepository
from app.schemas.cohort import (
    CohortCreate,
    CohortUpdate,
    CohortResponse,
    CohortEnrollmentResponse,
    LearnerCohortEnrollmentResponse,
)
from app.models.cohort import Cohort
from app.models.user import User, UserRole


class CohortService:
    """Service for cohort operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cohort_repo = CohortRepository(db)
        self.course_repo = CourseRepository(db)
        self.learner_repo = LearnerRepository(db)

    async def _to_cohort_response(
        self,
        cohort: Cohort,
        learner_id: Optional[UUID] = None,
    ) -> CohortResponse:
        """Build cohort response with enrollment stats."""
        enrollment_count = await self.cohort_repo.get_enrollment_count(cohort.id)
        enrollments = await self.cohort_repo.get_cohort_enrollments(cohort.id)
        completed = sum(1 for enrollment in enrollments if enrollment.completed_at is not None)
        completion_rate = (completed / enrollment_count * 100) if enrollment_count > 0 else 0.0
        course_name = cohort.course.title if cohort.course else None
        spots_remaining = max(cohort.max_participants - enrollment_count, 0)
        is_enrolled = False
        if learner_id:
            is_enrolled = await self.cohort_repo.get_enrollment(cohort.id, learner_id) is not None

        base = CohortResponse.model_validate(cohort)
        return base.model_copy(update={
            "course_name": course_name,
            "learner_count": enrollment_count,
            "completion_rate": round(completion_rate, 2),
            "spots_remaining": spots_remaining,
            "is_enrolled": is_enrolled,
        })
    
    async def create_cohort(self, cohort_data: CohortCreate) -> CohortResponse:
        """Create a new cohort."""
        course = await self.course_repo.get_by_id(cohort_data.course_id)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        cohort = await self.cohort_repo.create(cohort_data)
        cohort = await self.cohort_repo.get_by_id(cohort.id)
        return await self._to_cohort_response(cohort)
    
    async def get_cohort(self, cohort_id: UUID, learner_id: Optional[UUID] = None) -> CohortResponse:
        """Get cohort by ID."""
        cohort = await self.cohort_repo.get_by_id(cohort_id)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cohort not found"
            )
        return await self._to_cohort_response(cohort, learner_id)
    
    async def update_cohort(self, cohort_id: UUID, cohort_data: CohortUpdate) -> CohortResponse:
        """Update cohort."""
        cohort = await self.cohort_repo.update(cohort_id, cohort_data)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cohort not found"
            )
        cohort = await self.cohort_repo.get_by_id(cohort_id)
        return await self._to_cohort_response(cohort)
    
    async def list_cohorts_for_user(
        self,
        user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[CohortResponse]:
        """List cohorts visible to the current user."""
        learner_id = None
        if user.role == UserRole.ADMIN:
            cohorts = await self.cohort_repo.list_all(skip, limit)
        else:
            cohorts = await self.cohort_repo.list_active(skip, limit)
            if user.role == UserRole.LEARNER:
                learner = await self.learner_repo.get_by_user_id(user.id)
                learner_id = learner.id if learner else None

        return [await self._to_cohort_response(cohort, learner_id) for cohort in cohorts]

    async def list_course_cohorts(self, course_id: UUID, skip: int = 0, limit: int = 100) -> List[CohortResponse]:
        """List cohorts for a course."""
        cohorts = await self.cohort_repo.list_by_course(course_id, skip, limit)
        return [await self._to_cohort_response(cohort) for cohort in cohorts]

    async def list_learner_enrollments(self, user_id: UUID) -> List[LearnerCohortEnrollmentResponse]:
        """List cohort enrollments for the current learner."""
        learner = await self.learner_repo.get_by_user_id(user_id)
        if not learner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner profile not found"
            )

        enrollments = await self.cohort_repo.list_enrollments_by_learner(learner.id)
        results: List[LearnerCohortEnrollmentResponse] = []
        for enrollment in enrollments:
            cohort = await self.cohort_repo.get_by_id(enrollment.cohort_id)
            if not cohort:
                continue
            cohort_response = await self._to_cohort_response(cohort, learner.id)
            results.append(
                LearnerCohortEnrollmentResponse(
                    id=enrollment.id,
                    cohort_id=enrollment.cohort_id,
                    learner_id=enrollment.learner_id,
                    enrolled_at=enrollment.enrolled_at,
                    completed_at=enrollment.completed_at,
                    progress_percentage=enrollment.progress_percentage,
                    is_active=enrollment.is_active,
                    cohort=cohort_response,
                )
            )
        return results
    
    async def enroll_learner(self, cohort_id: UUID, learner_id: UUID) -> CohortEnrollmentResponse:
        """Enroll a learner in a cohort."""
        cohort = await self.cohort_repo.get_by_id(cohort_id)
        if not cohort:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cohort not found"
            )

        if not cohort.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This cohort is not currently open for enrollment"
            )
        
        existing = await self.cohort_repo.get_enrollment(cohort_id, learner_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already enrolled in this cohort"
            )
        
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
