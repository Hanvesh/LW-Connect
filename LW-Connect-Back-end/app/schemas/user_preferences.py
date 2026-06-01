"""User preferences schemas."""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class UserPreferencesBase(BaseModel):
    """Base user preferences schema."""
    preferred_topics: Optional[List[str]] = Field(default_factory=list, description="Preferred learning topics")
    blocked_topics: Optional[List[str]] = Field(default_factory=list, description="Topics to avoid")


class UserPreferencesCreate(UserPreferencesBase):
    """Schema for creating user preferences."""
    user_id: Optional[str] = Field(None, description="User ID")


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    user_id: Optional[str] = Field(None, description="User ID")
    preferred_topics: Optional[List[str]] = None
    blocked_topics: Optional[List[str]] = None


class UserPreferencesResponse(UserPreferencesBase):
    """Schema for user preferences response."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AITopicSuggestionBase(BaseModel):
    """Base AI topic suggestion schema."""
    category: str = Field(..., description="Topic category")
    topic_name: str = Field(..., description="Topic name")
    description: Optional[str] = Field(None, description="Topic description")
    popularity_score: Optional[int] = Field(0, description="Popularity score")


class AITopicSuggestionResponse(AITopicSuggestionBase):
    """Schema for AI topic suggestion response."""
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PreferenceOptionsResponse(BaseModel):
    """Schema for available preference options."""
    suggested_topics: List[AITopicSuggestionResponse]
