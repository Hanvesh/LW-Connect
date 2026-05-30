"""Booking repository."""
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus, Feedback
from app.models.mentor import Mentor
from app.models.learner import Learner
from app.schemas.booking import BookingCreate, BookingUpdate, FeedbackCreate


class BookingRepository:
    """Repository for booking data access."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, learner_id: UUID, booking_data: BookingCreate) -> Booking:
        """Create a new booking."""
        booking = Booking(
            learner_id=learner_id,
            **booking_data.model_dump(exclude_unset=True)
        )
        self.db.add(booking)
        await self.db.commit()
        # Re-fetch with relationships loaded
        return await self.get_by_id(booking.id)
    
    async def get_by_id(self, booking_id: UUID) -> Optional[Booking]:
        """Get booking by ID."""
        result = await self.db.execute(
            select(Booking)
            .options(
                selectinload(Booking.feedback),
                selectinload(Booking.mentor).selectinload(Mentor.user),
            )
            .where(Booking.id == booking_id)
        )
        return result.scalar_one_or_none()
    
    async def update(self, booking_id: UUID, booking_data: BookingUpdate) -> Optional[Booking]:
        """Update booking."""
        booking = await self.get_by_id(booking_id)
        if not booking:
            return None
        
        for key, value in booking_data.model_dump(exclude_unset=True).items():
            setattr(booking, key, value)
        
        await self.db.commit()
        return await self.get_by_id(booking_id)
    
    async def list_by_learner(self, learner_id: UUID, skip: int = 0, limit: int = 100) -> List[Booking]:
        """List bookings by learner."""
        result = await self.db.execute(
            select(Booking)
            .options(
                selectinload(Booking.feedback),
                selectinload(Booking.mentor).selectinload(Mentor.user),
            )
            .where(Booking.learner_id == learner_id)
            .order_by(Booking.scheduled_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def list_by_mentor(self, mentor_id: UUID, skip: int = 0, limit: int = 100) -> List[Booking]:
        """List bookings by mentor."""
        result = await self.db.execute(
            select(Booking)
            .options(
                selectinload(Booking.feedback),
                selectinload(Booking.learner).selectinload(Learner.user),
            )
            .where(Booking.mentor_id == mentor_id)
            .order_by(Booking.scheduled_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def create_feedback(self, feedback_data: FeedbackCreate) -> Feedback:
        """Create feedback for a booking."""
        feedback = Feedback(**feedback_data.model_dump())
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        return feedback
    
    async def get_feedback_by_booking(self, booking_id: UUID) -> Optional[Feedback]:
        """Get feedback by booking ID."""
        result = await self.db.execute(select(Feedback).where(Feedback.booking_id == booking_id))
        return result.scalar_one_or_none()
