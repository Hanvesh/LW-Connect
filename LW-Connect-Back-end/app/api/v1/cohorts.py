"""Cohort routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.services.cohort_service import CohortService
from app.schemas.cohort import CohortCreate, CohortUpdate, CohortResponse, CohortEnrollmentResponse

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


@router.get("/{cohort_id}", response_model=CohortResponse)
async def get_cohort(
    cohort_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get cohort by ID."""
    cohort_service = CohortService(db)
    return await cohort_service.get_cohort(cohort_id)


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


@router.post("/{cohort_id}/enroll/{learner_id}", response_model=CohortEnrollmentResponse, status_code=201)
async def enroll_learner(
    cohort_id: UUID,
    learner_id: UUID,
    current_user = Depends(require_role("admin", "learner")),
    db: AsyncSession = Depends(get_db)
):
    """Enroll a learner in a cohort."""
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
