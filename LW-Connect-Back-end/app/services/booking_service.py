"""Booking service."""
from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.booking_repository import BookingRepository
from app.repositories.learner_repository import LearnerRepository
from app.repositories.mentor_repository import MentorRepository
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse, FeedbackCreate, FeedbackResponse, FeedbackSummary
from app.models.booking import BookingStatus, Booking


class BookingService:
    """Service for booking operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.learner_repo = LearnerRepository(db)
        self.mentor_repo = MentorRepository(db)
    
    def _to_booking_response(self, booking: Booking) -> BookingResponse:
        """Build booking response with related mentor and feedback data."""
        mentor_name = None
        if booking.mentor and booking.mentor.user:
            mentor_name = booking.mentor.user.full_name

        feedback = None
        if booking.feedback:
            feedback = FeedbackSummary.model_validate(booking.feedback)

        base = BookingResponse.model_validate(booking)
        return base.model_copy(update={"mentor_name": mentor_name, "feedback": feedback})

    async def create_booking(self, learner_id: UUID, booking_data: BookingCreate) -> BookingResponse:
        """Create a new booking."""
        # Verify learner exists
        learner = await self.learner_repo.get_by_id(learner_id)
        if not learner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner not found"
            )
        
        # Verify mentor exists and is available
        mentor = await self.mentor_repo.get_by_id(booking_data.mentor_id)
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor not found"
            )
        
        if not mentor.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mentor is not available"
            )
        
        booking = await self.booking_repo.create(learner_id, booking_data)
        return self._to_booking_response(booking)
    
    async def get_booking(self, booking_id: UUID) -> BookingResponse:
        """Get booking by ID."""
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        return self._to_booking_response(booking)
    
    async def update_booking(self, booking_id: UUID, booking_data: BookingUpdate) -> BookingResponse:
        """Update booking."""
        booking = await self.booking_repo.update(booking_id, booking_data)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        return self._to_booking_response(booking)
    
    async def cancel_booking(self, booking_id: UUID, reason: str) -> BookingResponse:
        """Cancel a booking."""
        booking_data = BookingUpdate(
            status=BookingStatus.CANCELLED,
            cancellation_reason=reason
        )
        return await self.update_booking(booking_id, booking_data)
    
    async def list_learner_bookings(self, learner_id: UUID, skip: int = 0, limit: int = 100) -> List[BookingResponse]:
        """List bookings for a learner."""
        bookings = await self.booking_repo.list_by_learner(learner_id, skip, limit)
        return [self._to_booking_response(b) for b in bookings]
    
    async def list_mentor_bookings(self, mentor_id: UUID, skip: int = 0, limit: int = 100) -> List[BookingResponse]:
        """List bookings for a mentor."""
        bookings = await self.booking_repo.list_by_mentor(mentor_id, skip, limit)
        return [self._to_booking_response(b) for b in bookings]
    
    async def create_feedback(self, feedback_data: FeedbackCreate, learner_id: UUID) -> FeedbackResponse:
        """Create feedback for a booking."""
        # Verify booking exists and is completed
        booking = await self.booking_repo.get_by_id(feedback_data.booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        if booking.learner_id != learner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to submit feedback for this booking"
            )
        
        if booking.status != BookingStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only provide feedback for completed bookings"
            )
        
        # Check if feedback already exists
        existing_feedback = await self.booking_repo.get_feedback_by_booking(feedback_data.booking_id)
        if existing_feedback:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback already exists for this booking"
            )
        
        feedback = await self.booking_repo.create_feedback(feedback_data)
        return FeedbackResponse.model_validate(feedback)
