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
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse, FeedbackCreate, FeedbackResponse

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
