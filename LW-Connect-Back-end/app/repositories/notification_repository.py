"""Notification repository."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from typing import List


class NotificationRepository:
    """Notification data access."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, notification: NotificationCreate) -> Notification:
        """Create notification."""
        db_notification = Notification(**notification.dict())
        self.db.add(db_notification)
        self.db.commit()
        self.db.refresh(db_notification)
        return db_notification
    
    def get_user_notifications(self, user_id: int, limit: int = 50) -> List[Notification]:
        """Get user notifications."""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(desc(Notification.created_at)).limit(limit).all()
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count."""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark notification as read."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            self.db.commit()
            return True
        return False
    
    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read."""
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        self.db.commit()
        return count
