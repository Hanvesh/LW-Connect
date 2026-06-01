"""User preferences repository."""
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_preferences import UserPreferences, AITopicSuggestion
from app.schemas.user_preferences import UserPreferencesCreate, UserPreferencesUpdate


class UserPreferencesRepository:
    """Repository for user preferences operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[UserPreferences]:
        """Get all user preferences."""
        result = await self.db.execute(select(UserPreferences))
        return result.scalars().all()

    async def get_by_user_id(self, user_id: str) -> Optional[UserPreferences]:
        """Get user preferences by user ID."""
        result = await self.db.execute(
            select(UserPreferences).filter(UserPreferences.user_id == user_id)
        )
        return result.scalars().first()

    async def create(self, user_id: str, preferences: UserPreferencesCreate) -> UserPreferences:
        """Create new user preferences."""
        db_preferences = UserPreferences(
            user_id=user_id,
            **preferences.model_dump(exclude_unset=True, exclude={"user_id"})
        )
        self.db.add(db_preferences)
        await self.db.commit()
        await self.db.refresh(db_preferences)
        return db_preferences

    async def update(self, user_id: str, preferences: UserPreferencesUpdate) -> Optional[UserPreferences]:
        """Update user preferences."""
        db_preferences = await self.get_by_user_id(user_id)
        if not db_preferences:
            return None

        update_data = preferences.model_dump(exclude_unset=True, exclude={"user_id"})
        for field, value in update_data.items():
            setattr(db_preferences, field, value)

        await self.db.commit()
        await self.db.refresh(db_preferences)
        return db_preferences

    async def get_or_create_default(self, user_id: str) -> UserPreferences:
        """Get existing preferences or create default ones."""
        preferences = await self.get_by_user_id(user_id)
        if not preferences:
            default_preferences = UserPreferencesCreate()
            preferences = await self.create(user_id, default_preferences)
        return preferences

    async def get_topic_suggestions(self, category: Optional[str] = None, limit: int = 50) -> List[AITopicSuggestion]:
        """Get AI topic suggestions."""
        stmt = select(AITopicSuggestion).filter(AITopicSuggestion.is_active == True)
        
        if category:
            stmt = stmt.filter(AITopicSuggestion.category == category)
        
        stmt = stmt.order_by(AITopicSuggestion.popularity_score.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def increment_topic_popularity(self, topic_name: str):
        """Increment popularity score when a topic is selected."""
        result = await self.db.execute(
            select(AITopicSuggestion).filter(AITopicSuggestion.topic_name == topic_name)
        )
        topic = result.scalars().first()
        if topic:
            topic.popularity_score += 1
            await self.db.commit()
