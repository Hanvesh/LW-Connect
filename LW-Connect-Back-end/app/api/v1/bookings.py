"""Booking routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.services.booking_service import BookingService
from app.repositories.learner_repository import LearnerRepository
from app.repositories.mentor_repository import MentorRepository
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse, FeedbackCreate, FeedbackResponse, MentorBookingCreate
from app.models.booking import BookingStatus

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    booking_data: BookingCreate,
    current_user = Depends(require_role("learner")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new booking."""
    learner_repo = LearnerRepository(db)
    learner = await learner_repo.get_by_user_id(current_user.id)
    
    booking_service = BookingService(db)
    return await booking_service.create_booking(learner.id, booking_data)


@router.get("/learner/my-bookings", response_model=List[BookingResponse])
async def list_my_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user = Depends(require_role("learner")),
    db: AsyncSession = Depends(get_db)
):
    """List bookings for current learner."""
    learner_repo = LearnerRepository(db)
    learner = await learner_repo.get_by_user_id(current_user.id)
    
    booking_service = BookingService(db)
    return await booking_service.list_learner_bookings(learner.id, skip, limit)


@router.post("/mentor/create", response_model=BookingResponse, status_code=201)
async def mentor_create_booking(
    booking_data: MentorBookingCreate,
    current_user = Depends(require_role("mentor")),
    db: AsyncSession = Depends(get_db)
):
    """Mentor creates a session for a learner."""
    mentor_repo = MentorRepository(db)
    mentor = await mentor_repo.get_by_user_id(current_user.id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    learner_repo = LearnerRepository(db)
    learner = await learner_repo.get_by_user_id(booking_data.learner_id)
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")

    booking_service = BookingService(db)
    create_data = BookingCreate(
        mentor_id=mentor.id,
        scheduled_at=booking_data.scheduled_at,
        duration_minutes=booking_data.duration_minutes,
        notes=booking_data.notes,
    )
    booking = await booking_service.create_booking(learner.id, create_data)

    # If meeting URL provided, confirm immediately
    if booking_data.meeting_url:
        update_data = BookingUpdate(meeting_url=booking_data.meeting_url, status=BookingStatus.CONFIRMED)
        booking = await booking_service.update_booking(booking.id, update_data)

    return booking


@router.get("/mentor/my-bookings", response_model=List[BookingResponse])
async def list_mentor_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user = Depends(require_role("mentor")),
    db: AsyncSession = Depends(get_db)
):
    """List bookings for current mentor."""
    mentor_repo = MentorRepository(db)
    mentor = await mentor_repo.get_by_user_id(current_user.id)
    
    booking_service = BookingService(db)
    return await booking_service.list_mentor_bookings(mentor.id, skip, limit)


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user = Depends(require_role("learner")),
    db: AsyncSession = Depends(get_db)
):
    """Create feedback for a booking."""
    learner_repo = LearnerRepository(db)
    learner = await learner_repo.get_by_user_id(current_user.id)
    if not learner:
        raise HTTPException(status_code=404, detail="Learner profile not found")

    booking_service = BookingService(db)
    return await booking_service.create_feedback(feedback_data, learner.id)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get booking by ID."""
    booking_service = BookingService(db)
    return await booking_service.get_booking(booking_id)


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: UUID,
    booking_data: BookingUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update booking."""
    booking_service = BookingService(db)
    return await booking_service.update_booking(booking_id, booking_data)


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: UUID,
    reason: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel a booking."""
    booking_service = BookingService(db)
    return await booking_service.cancel_booking(booking_id, reason)


@router.put("/{booking_id}/meeting-link", response_model=BookingResponse)
async def set_meeting_link(
    booking_id: UUID,
    meeting_url: str,
    current_user = Depends(require_role("mentor", "admin")),
    db: AsyncSession = Depends(get_db)
):
    """Set meeting link for a booking (mentor action)."""
    booking_service = BookingService(db)
    booking_data = BookingUpdate(meeting_url=meeting_url, status=BookingStatus.CONFIRMED)
    return await booking_service.update_booking(booking_id, booking_data)
