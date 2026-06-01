"""Enhanced AI service with semantic mentor recommendations and user preferences."""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.mentor import Mentor
from app.models.user_preferences import UserPreferences
from app.repositories.user_preferences_repository import UserPreferencesRepository
from app.ai.training_data import get_training_data, get_availability_pattern
import httpx
import os


class AIService:
    """AI-powered recommendation service with semantic search."""
    
    def __init__(self, db: Session):
        self.db = db
        self.training_data = get_training_data()
        self.langchain_url = os.getenv("LANGCHAIN_SERVICE_URL", "http://localhost:8001")
        self.preferences_repo = UserPreferencesRepository(db)
    
    async def recommend_mentors(
        self, 
        learner_interests: List[str],
        learner_goals: Optional[List[str]] = None,
        availability_preference: Optional[str] = None,
        limit: int = 3,
        user_id: Optional[str] = None
    ) -> List[Dict]:
        """Recommend mentors using semantic AI matching with user preferences."""
        
        # Get user preferences if user_id provided
        user_preferences = None
        if user_id:
            user_preferences = self.preferences_repo.get_by_user_id(user_id)
            if user_preferences:
                # Override limit with user preference
                limit = user_preferences.max_recommendations_per_session or limit
                # Use preferred topics if available
                if user_preferences.preferred_topics:
                    learner_interests.extend(user_preferences.preferred_topics)
                # Filter out blocked topics
                if user_preferences.blocked_topics:
                    learner_interests = [topic for topic in learner_interests 
                                       if topic not in user_preferences.blocked_topics]
        
        # Try semantic recommendation via langchain service
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.langchain_url}/recommend-mentors",
                    json={
                        "user_goals": learner_goals or learner_interests,
                        "user_skills": learner_interests,
                        "cohort_id": None,
                        "top_k": limit,
                        "provider": "bedrock",
                        "user_preferences": self._serialize_preferences(user_preferences) if user_preferences else None
                    }
                )
                if response.status_code == 200:
                    result = response.json()
                    return self._enrich_recommendations(result.get("recommendations", []), user_preferences)
        except (httpx.TimeoutException, httpx.ConnectError):
            pass  # Fallback to rule-based
        
        # Fallback: rule-based matching
        return self._rule_based_recommend(learner_interests, learner_goals, availability_preference, limit, user_preferences)
    
    def _rule_based_recommend(
        self,
        learner_interests: List[str],
        learner_goals: Optional[List[str]],
        availability_preference: Optional[str],
        limit: int,
        user_preferences: Optional[UserPreferences] = None
    ) -> List[Dict]:
        """Rule-based mentor recommendation fallback with preferences."""
        mentors = self.db.query(Mentor).join(User).filter(
            User.role == 'mentor',
            User.is_active == True,
            Mentor.is_available == True
        ).all()
        
        if not mentors:
            return []
        
        scored_mentors = []
        for mentor in mentors:
            score = self._calculate_mentor_score(mentor, learner_interests, learner_goals, availability_preference, user_preferences)
            scored_mentors.append({
                "mentor_id": mentor.user_id,
                "name": mentor.user.name,
                "email": mentor.user.email,
                "specialization": mentor.specialization,
                "expertise": mentor.expertise,
                "years_experience": mentor.years_experience,
                "availability": mentor.availability,
                "availability_slots": get_availability_pattern(mentor.availability),
                "bio": mentor.bio,
                "score": score,
                "match_reason": self._get_match_reason(mentor, learner_interests)
            })
        
        scored_mentors.sort(key=lambda x: x["score"], reverse=True)
        return scored_mentors[:limit]
    
    def _enrich_recommendations(self, recommendations: List[Dict], user_preferences: Optional[UserPreferences] = None) -> List[Dict]:
        """Enrich AI recommendations with DB data and preferences."""
        enriched = []
        for rec in recommendations:
            mentor = self.db.query(Mentor).filter(Mentor.user_id == rec.get("mentor_id")).first()
            if mentor:
                enriched.append({
                    **rec,
                    "email": mentor.user.email,
                    "availability_slots": get_availability_pattern(mentor.availability),
                    "years_experience": mentor.years_experience
                })
        return enriched
    
    def _calculate_mentor_score(
        self,
        mentor: Mentor,
        interests: List[str],
        goals: Optional[List[str]],
        availability_pref: Optional[str],
        user_preferences: Optional[UserPreferences] = None
    ) -> float:
        """Calculate match score for a mentor with user preferences."""
        score = 0.0
        
        if interests:
            interest_matches = sum(
                1 for interest in interests
                for expertise in mentor.expertise
                if interest.lower() in expertise.lower()
            )
            score += (interest_matches / len(interests)) * 40
        
        if goals:
            goal_matches = sum(
                1 for goal in goals
                for expertise in mentor.expertise
                if goal.lower() in expertise.lower() or goal.lower() in mentor.specialization.lower()
            )
            score += (goal_matches / len(goals)) * 30
        
        experience_score = min(mentor.years_experience / 20, 1.0) * 20
        score += experience_score
        
        # Apply user preferences
        if user_preferences:
            # Preferred time slots matching
            if user_preferences.preferred_time_slots and mentor.availability in user_preferences.preferred_time_slots:
                score += 15
            # Communication style preference (if mentor has this info)
            if user_preferences.preferred_communication_style:
                score += 5  # Bonus for having preference set
        
        if availability_pref and mentor.availability == availability_pref:
            score += 10
        elif mentor.availability == "flexible":
            score += 5
        
        return round(score, 2)
    
    def _get_match_reason(self, mentor: Mentor, interests: List[str]) -> str:
        """Generate human-readable match reason."""
        matched_expertise = [
            exp for exp in mentor.expertise
            if any(interest.lower() in exp.lower() for interest in interests)
        ]
        
        if matched_expertise:
            return f"Expert in {', '.join(matched_expertise[:2])}"
        return f"Specialist in {mentor.specialization}"
    
    def get_mentor_by_expertise(self, expertise_area: str) -> List[Dict]:
        """Find mentors by specific expertise area."""
        mentors = self.db.query(Mentor).join(User).filter(
            User.role == 'mentor',
            User.is_active == True,
            Mentor.is_available == True
        ).all()
        
        matching_mentors = []
        for mentor in mentors:
            if any(expertise_area.lower() in exp.lower() for exp in mentor.expertise):
                matching_mentors.append({
                    "mentor_id": mentor.user_id,
                    "name": mentor.user.name,
                    "specialization": mentor.specialization,
                    "expertise": mentor.expertise,
                    "availability": mentor.availability,
                    "years_experience": mentor.years_experience
                })
        
        return matching_mentors
    
    def get_available_mentors_by_time(self, availability_type: str) -> List[Dict]:
        """Get mentors available at specific times."""
        mentors = self.db.query(Mentor).join(User).filter(
            User.role == 'mentor',
            User.is_active == True,
            Mentor.is_available == True,
            Mentor.availability.in_([availability_type, "flexible"])
        ).all()
        
        return [{
            "mentor_id": mentor.user_id,
            "name": mentor.user.name,
            "specialization": mentor.specialization,
            "availability": mentor.availability,
            "availability_slots": get_availability_pattern(mentor.availability)
        } for mentor in mentors]
    
    def _serialize_preferences(self, preferences: UserPreferences) -> Dict:
        """Serialize user preferences for API calls."""
        return {
            "learning_style": preferences.preferred_learning_style,
            "session_duration": preferences.preferred_session_duration,
            "time_slots": preferences.preferred_time_slots,
            "communication_style": preferences.preferred_communication_style,
            "difficulty_level": preferences.content_difficulty_level,
            "preferred_topics": preferences.preferred_topics,
            "blocked_topics": preferences.blocked_topics
        }
