"""User preferences API endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.repositories.user_preferences_repository import UserPreferencesRepository
from app.schemas.user_preferences import (
    UserPreferencesResponse,
    UserPreferencesCreate,
    UserPreferencesUpdate,
    PreferenceOptionsResponse,
    AITopicSuggestionResponse
)

router = APIRouter(prefix="/preferences", tags=["User Preferences"])


@router.get("/options", response_model=PreferenceOptionsResponse)
async def get_preference_options(db: AsyncSession = Depends(get_db)):
    """Get available topic suggestions for the UI."""
    repo = UserPreferencesRepository(db)
    topic_suggestions = await repo.get_topic_suggestions()
    
    return PreferenceOptionsResponse(
        suggested_topics=[
            AITopicSuggestionResponse(
                id=str(topic.id),
                category=topic.category,
                topic_name=topic.topic_name,
                description=topic.description,
                popularity_score=topic.popularity_score,
                is_active=topic.is_active,
                created_at=topic.created_at
            ) for topic in topic_suggestions
        ]
    )


@router.get("", response_model=List[UserPreferencesResponse])
async def get_user_preferences(
    db: AsyncSession = Depends(get_db)
):
    """Get all user preferences."""
    repo = UserPreferencesRepository(db)
    preferences_list = await repo.get_all()
    
    return [
        UserPreferencesResponse(
            id=str(p.id),
            user_id=str(p.user_id),
            preferred_topics=p.preferred_topics or [],
            blocked_topics=p.blocked_topics or [],
            created_at=p.created_at,
            updated_at=p.updated_at
        ) for p in preferences_list
    ]


@router.post("", response_model=UserPreferencesResponse)
async def create_user_preferences(
    preferences: UserPreferencesCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create user topic preferences."""
    repo = UserPreferencesRepository(db)
    user_id = str(current_user.id)
    
    existing = await repo.get_by_user_id(user_id)
    if existing:
        update_data = UserPreferencesUpdate(
            preferred_topics=preferences.preferred_topics,
            blocked_topics=preferences.blocked_topics
        )
        db_preferences = await repo.update(user_id, update_data)
    else:
        for topic in preferences.preferred_topics or []:
            await repo.increment_topic_popularity(topic)
        db_preferences = await repo.create(user_id, preferences)
    
    return UserPreferencesResponse(
        id=str(db_preferences.id),
        user_id=str(db_preferences.user_id),
        preferred_topics=db_preferences.preferred_topics or [],
        blocked_topics=db_preferences.blocked_topics or [],
        created_at=db_preferences.created_at,
        updated_at=db_preferences.updated_at
    )


@router.put("", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user topic preferences."""
    repo = UserPreferencesRepository(db)
    user_id = str(current_user.id)
    
    if preferences.preferred_topics:
        for topic in preferences.preferred_topics:
            await repo.increment_topic_popularity(topic)
    
    db_preferences = await repo.update(user_id, preferences)
    if not db_preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found"
        )
    
    return UserPreferencesResponse(
        id=str(db_preferences.id),
        user_id=str(db_preferences.user_id),
        preferred_topics=db_preferences.preferred_topics or [],
        blocked_topics=db_preferences.blocked_topics or [],
        created_at=db_preferences.created_at,
        updated_at=db_preferences.updated_at
    )


@router.get("/topics/{category}", response_model=List[AITopicSuggestionResponse])
async def get_topic_suggestions_by_category(
    category: str,
    db: AsyncSession = Depends(get_db)
):
    """Get topic suggestions by category."""
    repo = UserPreferencesRepository(db)
    topics = await repo.get_topic_suggestions(category=category)
    
    return [
        AITopicSuggestionResponse(
            id=str(topic.id),
            category=topic.category,
            topic_name=topic.topic_name,
            description=topic.description,
            popularity_score=topic.popularity_score,
            is_active=topic.is_active,
            created_at=topic.created_at
        ) for topic in topics
    ]
