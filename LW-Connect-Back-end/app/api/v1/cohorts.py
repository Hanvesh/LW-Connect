"""Cohort routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.repositories.learner_repository import LearnerRepository
from app.services.cohort_service import CohortService
from app.schemas.cohort import (
    CohortCreate,
    CohortUpdate,
    CohortResponse,
    CohortEnrollmentResponse,
    LearnerCohortEnrollmentResponse,
)

router = APIRouter(prefix="/cohorts", tags=["Cohorts"])


@router.post("", response_model=CohortResponse, status_code=201)
async def create_cohort(
    cohort_data: CohortCreate,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new cohort."""
    cohort_service = CohortService(db)
    return await cohort_service.create_cohort(cohort_data)


@router.get("", response_model=List[CohortResponse])
async def list_cohorts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List cohorts visible to the current user."""
    cohort_service = CohortService(db)
    return await cohort_service.list_cohorts_for_user(current_user, skip, limit)


@router.get("/my-enrollments", response_model=List[LearnerCohortEnrollmentResponse])
async def list_my_enrollments(
    current_user = Depends(require_role("learner")),
    db: AsyncSession = Depends(get_db)
):
    """List cohort enrollments for the current learner."""
    cohort_service = CohortService(db)
    return await cohort_service.list_learner_enrollments(current_user.id)


@router.get("/course/{course_id}", response_model=List[CohortResponse])
async def list_course_cohorts(
    course_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List cohorts for a course."""
    cohort_service = CohortService(db)
    return await cohort_service.list_course_cohorts(course_id, skip, limit)


@router.get("/{cohort_id}", response_model=CohortResponse)
async def get_cohort(
    cohort_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get cohort by ID."""
    cohort_service = CohortService(db)
    learner_id = None
    if current_user.role == "learner":
        learner_repo = LearnerRepository(db)
        learner = await learner_repo.get_by_user_id(current_user.id)
        learner_id = learner.id if learner else None
    return await cohort_service.get_cohort(cohort_id, learner_id)


@router.put("/{cohort_id}", response_model=CohortResponse)
async def update_cohort(
    cohort_id: UUID,
    cohort_data: CohortUpdate,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Update cohort."""
    cohort_service = CohortService(db)
    return await cohort_service.update_cohort(cohort_id, cohort_data)


@router.post("/{cohort_id}/enroll/me", response_model=CohortEnrollmentResponse, status_code=201)
async def enroll_self(
    cohort_id: UUID,
    current_user = Depends(require_role("learner")),
    db: AsyncSession = Depends(get_db)
):
    """Enroll the current learner in a cohort."""
    learner_repo = LearnerRepository(db)
    learner = await learner_repo.get_by_user_id(current_user.id)
    if not learner:
        raise HTTPException(status_code=404, detail="Learner profile not found")

    cohort_service = CohortService(db)
    return await cohort_service.enroll_learner(cohort_id, learner.id)


@router.post("/{cohort_id}/enroll/{learner_id}", response_model=CohortEnrollmentResponse, status_code=201)
async def enroll_learner(
    cohort_id: UUID,
    learner_id: UUID,
    current_user = Depends(require_role("admin", "learner")),
    db: AsyncSession = Depends(get_db)
):
    """Enroll a learner in a cohort."""
    if current_user.role == "learner":
        learner_repo = LearnerRepository(db)
        learner = await learner_repo.get_by_user_id(current_user.id)
        if not learner or learner.id != learner_id:
            raise HTTPException(
                status_code=403,
                detail="Learners can only enroll themselves in a cohort"
            )

    cohort_service = CohortService(db)
    return await cohort_service.enroll_learner(cohort_id, learner_id)


@router.get("/{cohort_id}/enrollments", response_model=List[CohortEnrollmentResponse])
async def get_cohort_enrollments(
    cohort_id: UUID,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Get all enrollments for a cohort."""
    cohort_service = CohortService(db)
    return await cohort_service.get_cohort_enrollments(cohort_id)
