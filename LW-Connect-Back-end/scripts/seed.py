"""Seed script to populate database with sample data."""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models import User, Learner, Mentor, Course, Cohort, UserRole
import uuid
from datetime import datetime, date, timedelta


async def seed_data():
    """Seed database with sample data."""
    async with AsyncSessionLocal() as db:
        print("🌱 Seeding database...")
        
        # Clear existing data (order matters due to foreign keys)
        for table in ['cohort_enrollments', 'cohorts', 'bookings', 'feedback', 'courses', 'learners', 'mentors', 'users']:
            await db.execute(text(f'DELETE FROM {table}'))
        await db.commit()
        
        # Create admin user
        admin = User(
            id=uuid.uuid4(),
            email="admin@lwconnect.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        
        # Create learner users
        learner_user1 = User(
            id=uuid.uuid4(),
            email="learner1@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Alice Johnson",
            role=UserRole.LEARNER,
            is_active=True,
            is_verified=True,
        )
        db.add(learner_user1)
        
        learner_user2 = User(
            id=uuid.uuid4(),
            email="learner2@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Bob Smith",
            role=UserRole.LEARNER,
            is_active=True,
            is_verified=True,
        )
        db.add(learner_user2)
        
        # Create mentor users
        mentor_user1 = User(
            id=uuid.uuid4(),
            email="mentor1@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Dr. Sarah Williams",
            role=UserRole.MENTOR,
            is_active=True,
            is_verified=True,
        )
        db.add(mentor_user1)
        
        mentor_user2 = User(
            id=uuid.uuid4(),
            email="mentor2@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Prof. Michael Chen",
            role=UserRole.MENTOR,
            is_active=True,
            is_verified=True,
        )
        db.add(mentor_user2)
        
        await db.commit()
        
        # Create learner profiles
        learner1 = Learner(
            id=uuid.uuid4(),
            user_id=learner_user1.id,
            bio="Passionate about public policy and innovation",
            goals=["Learn data analysis", "Improve policy writing"],
            skills=["Research", "Communication"],
            interests=["Public Policy", "Data Science"],
            experience_level="intermediate",
            organization="City Government",
            department="Policy Research",
        )
        db.add(learner1)
        
        learner2 = Learner(
            id=uuid.uuid4(),
            user_id=learner_user2.id,
            bio="New to public sector innovation",
            goals=["Understand innovation frameworks", "Network with experts"],
            skills=["Project Management"],
            interests=["Innovation", "Digital Transformation"],
            experience_level="beginner",
            organization="State Agency",
            department="Digital Services",
        )
        db.add(learner2)
        
        # Create mentor profiles
        mentor1 = Mentor(
            id=uuid.uuid4(),
            user_id=mentor_user1.id,
            bio="15 years experience in public sector innovation",
            expertise=["Policy Design", "Data Analytics", "Innovation Management"],
            skills=["Strategic Planning", "Data Visualization", "Stakeholder Engagement"],
            years_of_experience=15,
            organization="Innovation Lab",
            job_title="Senior Innovation Advisor",
            is_available=True,
            max_mentees=5,
            hourly_rate=0,
        )
        db.add(mentor1)
        
        mentor2 = Mentor(
            id=uuid.uuid4(),
            user_id=mentor_user2.id,
            bio="Expert in digital transformation and agile methodologies",
            expertise=["Digital Transformation", "Agile", "Change Management"],
            skills=["Agile Coaching", "Digital Strategy", "Process Improvement"],
            years_of_experience=12,
            organization="Digital Government Institute",
            job_title="Chief Digital Officer",
            is_available=True,
            max_mentees=3,
            hourly_rate=0,
        )
        db.add(mentor2)
        
        # Create courses
        course1 = Course(
            id=uuid.uuid4(),
            title="Introduction to Public Sector Innovation",
            description="Learn the fundamentals of innovation in government",
            tags=["innovation", "public-sector", "beginner"],
            difficulty_level="beginner",
            duration_hours=20,
            is_published=True,
            prerequisites=[],
            learning_outcomes=[
                "Understand innovation frameworks",
                "Apply design thinking",
                "Develop innovation proposals"
            ],
        )
        db.add(course1)
        
        course2 = Course(
            id=uuid.uuid4(),
            title="Data-Driven Policy Making",
            description="Use data analytics to inform policy decisions",
            tags=["data", "policy", "analytics", "intermediate"],
            difficulty_level="intermediate",
            duration_hours=30,
            is_published=True,
            prerequisites=["Basic statistics knowledge"],
            learning_outcomes=[
                "Analyze policy data",
                "Create data visualizations",
                "Present data-driven recommendations"
            ],
        )
        db.add(course2)
        
        await db.commit()
        
        # Create cohorts
        cohort1 = Cohort(
            id=uuid.uuid4(),
            course_id=course1.id,
            name="Innovation Cohort Spring 2026",
            description="Spring cohort for innovation fundamentals",
            start_date=date.today() + timedelta(days=7),
            end_date=date.today() + timedelta(days=90),
            max_participants=30,
            is_active=True,
        )
        db.add(cohort1)
        
        cohort2 = Cohort(
            id=uuid.uuid4(),
            course_id=course2.id,
            name="Data Policy Cohort 2026",
            description="Learn data-driven policy making",
            start_date=date.today() + timedelta(days=14),
            end_date=date.today() + timedelta(days=120),
            max_participants=25,
            is_active=True,
        )
        db.add(cohort2)
        
        await db.commit()
        
        print("✅ Database seeded successfully!")
        print("\n📝 Sample credentials:")
        print("Admin: admin@lwconnect.com / admin123")
        print("Learner 1: learner1@example.com / password123")
        print("Learner 2: learner2@example.com / password123")
        print("Mentor 1: mentor1@example.com / password123")
        print("Mentor 2: mentor2@example.com / password123")


if __name__ == "__main__":
    asyncio.run(seed_data())
