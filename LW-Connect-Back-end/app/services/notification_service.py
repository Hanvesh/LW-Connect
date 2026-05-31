"""Notification service."""
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate
from typing import List


class NotificationService:
    """Notification business logic."""
    
    def __init__(self, repository: NotificationRepository):
        self.repository = repository
    
    def create_notification(self, user_id: int, title: str, message: str, type: str):
        """Create a notification."""
        notification = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        return self.repository.create(notification)
    
    def get_user_notifications(self, user_id: int):
        """Get user notifications."""
        return self.repository.get_user_notifications(user_id)
    
    def get_unread_count(self, user_id: int):
        """Get unread count."""
        return self.repository.get_unread_count(user_id)
    
    def mark_as_read(self, notification_id: int, user_id: int):
        """Mark as read."""
        return self.repository.mark_as_read(notification_id, user_id)
    
    def mark_all_as_read(self, user_id: int):
        """Mark all as read."""
        return self.repository.mark_all_as_read(user_id)
    
    def notify_booking_created(self, user_id: int, mentor_name: str, date: str):
        """Notify booking created."""
        return self.create_notification(
            user_id=user_id,
            title="Booking Confirmed",
            message=f"Your session with {mentor_name} on {date} has been confirmed.",
            type="booking"
        )
    
    def notify_session_reminder(self, user_id: int, mentor_name: str, time: str):
        """Notify session reminder."""
        return self.create_notification(
            user_id=user_id,
            title="Session Reminder",
            message=f"Your session with {mentor_name} starts in {time}.",
            type="reminder"
        )
