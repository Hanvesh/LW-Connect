"""Session generation service."""
from datetime import datetime, timedelta, date
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.mentor import Mentor
from app.models.session import Session as MentorSession
import hashlib


class SessionGeneratorService:
    """Generate scheduled sessions for mentors."""
    
    CONCEPTS_BY_EXPERTISE = {
        "Python": ["Python Basics", "OOP in Python", "Data Structures", "Web Development", "APIs"],
        "JavaScript": ["JS Fundamentals", "Async Programming", "React Basics", "Node.js", "TypeScript"],
        "Data Science": ["Data Analysis", "Machine Learning", "Statistics", "Visualization", "Deep Learning"],
        "Cloud": ["AWS Basics", "Docker", "Kubernetes", "CI/CD", "Serverless"],
        "AI/ML": ["ML Algorithms", "Neural Networks", "NLP", "Computer Vision", "Model Deployment"]
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_sessions_for_mentors(self, weeks: int = 4) -> List[Dict]:
        """Generate sessions for all active mentors."""
        mentors = self.db.query(Mentor).filter(Mentor.is_available == True).all()
        sessions_created = []
        
        for idx, mentor in enumerate(mentors):
            mentor_sessions = self._generate_mentor_sessions(mentor, idx, weeks)
            sessions_created.extend(mentor_sessions)
        
        self.db.commit()
        return sessions_created
    
    def _generate_mentor_sessions(self, mentor: Mentor, mentor_idx: int, weeks: int) -> List[Dict]:
        """Generate sessions for a single mentor on alternative days."""
        sessions = []
        start_date = self._get_next_weekday(datetime.now().date())
        meeting_link = self._generate_meeting_link(mentor.user_id)
        
        # Get concepts for mentor's primary expertise
        concepts = self._get_concepts_for_mentor(mentor)
        concept_idx = 0
        
        # Generate sessions on alternative days (skip weekends)
        current_date = start_date + timedelta(days=mentor_idx % 2)  # Stagger mentors
        days_generated = 0
        
        while days_generated < weeks * 3:  # ~3 sessions per week
            if current_date.weekday() < 5:  # Monday-Friday only
                session = MentorSession(
                    mentor_id=mentor.user_id,
                    session_date=current_date,
                    start_time="10:00",
                    end_time="11:00",
                    meeting_link=meeting_link,
                    concept=concepts[concept_idx % len(concepts)],
                    description=f"Session on {concepts[concept_idx % len(concepts)]} by {mentor.user.name}",
                    max_participants=30
                )
                self.db.add(session)
                sessions.append({
                    "mentor_id": str(mentor.user_id),
                    "date": str(current_date),
                    "concept": concepts[concept_idx % len(concepts)],
                    "meeting_link": meeting_link
                })
                concept_idx += 1
                days_generated += 1
            
            current_date += timedelta(days=2)  # Alternative days
        
        return sessions
    
    def _get_next_weekday(self, start_date: date) -> date:
        """Get next weekday (skip weekends)."""
        while start_date.weekday() >= 5:
            start_date += timedelta(days=1)
        return start_date
    
    def _generate_meeting_link(self, mentor_id) -> str:
        """Generate unique meeting link for mentor."""
        hash_str = hashlib.md5(str(mentor_id).encode()).hexdigest()[:8]
        return f"https://meet.lwconnect.com/{hash_str}"
    
    def _get_concepts_for_mentor(self, mentor: Mentor) -> List[str]:
        """Get concepts based on mentor expertise."""
        for expertise in mentor.expertise or []:
            for key in self.CONCEPTS_BY_EXPERTISE:
                if key.lower() in expertise.lower():
                    return self.CONCEPTS_BY_EXPERTISE[key]
        return ["General Mentoring", "Career Guidance", "Skill Development", "Project Review", "Q&A Session"]
    
    def get_upcoming_sessions(self, limit: int = 50) -> List[Dict]:
        """Get upcoming sessions for learners."""
        today = datetime.now().date()
        sessions = self.db.query(MentorSession).filter(
            MentorSession.session_date >= today,
            MentorSession.is_active == True
        ).order_by(MentorSession.session_date).limit(limit).all()
        
        return [{
            "id": str(s.id),
            "mentor_name": s.mentor.user.name,
            "mentor_expertise": s.mentor.expertise,
            "date": str(s.session_date),
            "time": f"{s.start_time} - {s.end_time}",
            "concept": s.concept,
            "description": s.description,
            "meeting_link": s.meeting_link,
            "max_participants": s.max_participants
        } for s in sessions]
