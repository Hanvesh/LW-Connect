"""Dashboard routes for metrics and analytics."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import require_role
from app.models.booking import Booking, BookingStatus
from app.models.cohort import CohortEnrollment, Cohort
from app.models.mentor import Mentor
from app.models.learner import Learner

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class DashboardMetrics(BaseModel):
    """Dashboard metrics response."""
    total_bookings: int
    completed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    total_enrollments: int
    active_enrollments: int
    completed_enrollments: int
    total_mentors: int
    available_mentors: int
    total_learners: int
    total_cohorts: int
    active_cohorts: int
    completion_rate: float


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard metrics."""
    
    # Booking metrics
    total_bookings = await db.scalar(select(func.count(Booking.id)))
    completed_bookings = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status == BookingStatus.COMPLETED)
    )
    pending_bookings = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status == BookingStatus.PENDING)
    )
    cancelled_bookings = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status == BookingStatus.CANCELLED)
    )
    
    # Enrollment metrics
    total_enrollments = await db.scalar(select(func.count(CohortEnrollment.id)))
    active_enrollments = await db.scalar(
        select(func.count(CohortEnrollment.id)).where(CohortEnrollment.is_active == True)
    )
    completed_enrollments = await db.scalar(
        select(func.count(CohortEnrollment.id)).where(CohortEnrollment.completed_at.isnot(None))
    )
    
    # Mentor metrics
    total_mentors = await db.scalar(select(func.count(Mentor.id)))
    available_mentors = await db.scalar(
        select(func.count(Mentor.id)).where(Mentor.is_available == True)
    )

    # Learner and cohort metrics
    total_learners = await db.scalar(select(func.count(Learner.id)))
    total_cohorts = await db.scalar(select(func.count(Cohort.id)))
    active_cohorts = await db.scalar(
        select(func.count(Cohort.id)).where(Cohort.is_active == True)
    )
    
    # Calculate completion rate
    completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0.0
    
    return DashboardMetrics(
        total_bookings=total_bookings or 0,
        completed_bookings=completed_bookings or 0,
        pending_bookings=pending_bookings or 0,
        cancelled_bookings=cancelled_bookings or 0,
        total_enrollments=total_enrollments or 0,
        active_enrollments=active_enrollments or 0,
        completed_enrollments=completed_enrollments or 0,
        total_mentors=total_mentors or 0,
        available_mentors=available_mentors or 0,
        total_learners=total_learners or 0,
        total_cohorts=total_cohorts or 0,
        active_cohorts=active_cohorts or 0,
        completion_rate=round(completion_rate, 2)
    )
