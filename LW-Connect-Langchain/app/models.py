from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class DocumentType(str, Enum):
    MENTOR_BIO = "mentor_bio"
    COURSE = "course"
    COHORT = "cohort"
    FAQ = "faq"
    PATHWAY = "pathway"
    FEEDBACK = "feedback"

class Document(BaseModel):
    id: str
    content: str
    doc_type: DocumentType
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MentorProfile(BaseModel):
    id: str
    name: str
    bio: str
    expertise: List[str]
    skills: List[str]
    cohorts: List[str] = []
    rating: Optional[float] = None
    availability: bool = True

class QueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    top_k: int = 5
    provider: Optional[str] = None

class MentorRecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    user_goals: List[str] = []
    user_skills: List[str] = []
    skills: List[str] = []
    cohort_id: Optional[str] = None
    top_k: int = 3
    provider: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        # If user_skills is empty but skills is provided, use skills
        if not self.user_skills and self.skills:
            self.user_skills = self.skills

class CourseRecommendationRequest(BaseModel):
    user_id: str
    current_skills: List[str]
    learning_goals: List[str]
    top_k: int = 5

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    explanation: str
    confidence: float

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None
    provider: Optional[str] = None
    
class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = []
    session_id: str
