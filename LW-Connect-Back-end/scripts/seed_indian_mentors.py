"""Seed Indian mentors with availability data."""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.mentor import Mentor
from app.core.security import get_password_hash

# Indian mentors data with expertise and availability
INDIAN_MENTORS = [
    {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@lwconnect.in",
        "title": "Senior Policy Advisor",
        "bio": "15+ years in public policy and digital governance. Former IAS officer with expertise in e-governance initiatives.",
        "expertise": ["Digital Governance", "Public Policy", "E-Governance", "Smart Cities", "Administrative Reforms"],
        "specialization": "Digital Governance & Policy",
        "years_experience": 15,
        "availability": "weekdays_evenings",
        "location": "New Delhi"
    },
    {
        "name": "Priya Sharma",
        "email": "priya.sharma@lwconnect.in",
        "title": "Innovation Lead",
        "bio": "Expert in government innovation labs and citizen-centric service design. Led multiple state-level digital transformation projects.",
        "expertise": ["Innovation Management", "Service Design", "Citizen Engagement", "Design Thinking", "Agile Governance"],
        "specialization": "Innovation & Service Design",
        "years_experience": 12,
        "availability": "flexible",
        "location": "Bangalore"
    },
    {
        "name": "Amit Patel",
        "email": "amit.patel@lwconnect.in",
        "title": "Data Analytics Expert",
        "bio": "Specialist in government data analytics and evidence-based policymaking. Built analytics platforms for multiple ministries.",
        "expertise": ["Data Analytics", "Evidence-Based Policy", "Data Visualization", "Performance Metrics", "Open Data"],
        "specialization": "Data Analytics & Insights",
        "years_experience": 10,
        "availability": "weekends",
        "location": "Mumbai"
    },
    {
        "name": "Lakshmi Iyer",
        "email": "lakshmi.iyer@lwconnect.in",
        "title": "Digital Transformation Consultant",
        "bio": "Leading digital transformation initiatives across state governments. Expert in change management and capacity building.",
        "expertise": ["Digital Transformation", "Change Management", "Capacity Building", "IT Strategy", "Process Reengineering"],
        "specialization": "Digital Transformation",
        "years_experience": 14,
        "availability": "weekdays_mornings",
        "location": "Chennai"
    },
    {
        "name": "Vikram Singh",
        "email": "vikram.singh@lwconnect.in",
        "title": "Cybersecurity Advisor",
        "bio": "Government cybersecurity expert with focus on critical infrastructure protection and data privacy compliance.",
        "expertise": ["Cybersecurity", "Data Privacy", "Information Security", "Risk Management", "Compliance"],
        "specialization": "Cybersecurity & Privacy",
        "years_experience": 11,
        "availability": "weekdays_afternoons",
        "location": "Hyderabad"
    },
    {
        "name": "Anjali Desai",
        "email": "anjali.desai@lwconnect.in",
        "title": "Urban Planning Specialist",
        "bio": "Expert in smart city planning and sustainable urban development. Worked on multiple Smart Cities Mission projects.",
        "expertise": ["Urban Planning", "Smart Cities", "Sustainable Development", "Infrastructure", "GIS"],
        "specialization": "Urban Planning & Smart Cities",
        "years_experience": 13,
        "availability": "flexible",
        "location": "Pune"
    },
    {
        "name": "Suresh Reddy",
        "email": "suresh.reddy@lwconnect.in",
        "title": "Financial Management Expert",
        "bio": "Specialist in public financial management and budget reforms. Advised multiple state finance departments.",
        "expertise": ["Public Finance", "Budget Management", "Financial Reforms", "Fiscal Policy", "Treasury Management"],
        "specialization": "Public Financial Management",
        "years_experience": 16,
        "availability": "weekdays_mornings",
        "location": "Hyderabad"
    },
    {
        "name": "Meera Krishnan",
        "email": "meera.krishnan@lwconnect.in",
        "title": "Healthcare Innovation Lead",
        "bio": "Leading digital health initiatives and telemedicine programs. Expert in healthcare delivery transformation.",
        "expertise": ["Digital Health", "Telemedicine", "Healthcare Policy", "Health Systems", "Public Health"],
        "specialization": "Healthcare Innovation",
        "years_experience": 9,
        "availability": "weekdays_evenings",
        "location": "Kochi"
    },
    {
        "name": "Arjun Mehta",
        "email": "arjun.mehta@lwconnect.in",
        "title": "Education Technology Advisor",
        "bio": "Transforming government education through technology. Led state-wide digital learning initiatives.",
        "expertise": ["EdTech", "Digital Learning", "Education Policy", "Curriculum Design", "Teacher Training"],
        "specialization": "Education Technology",
        "years_experience": 8,
        "availability": "weekends",
        "location": "Ahmedabad"
    },
    {
        "name": "Kavita Nair",
        "email": "kavita.nair@lwconnect.in",
        "title": "Social Welfare Expert",
        "bio": "Expert in social welfare schemes and direct benefit transfer systems. Improved delivery of welfare programs.",
        "expertise": ["Social Welfare", "DBT Systems", "Welfare Schemes", "Poverty Alleviation", "Social Justice"],
        "specialization": "Social Welfare Programs",
        "years_experience": 12,
        "availability": "flexible",
        "location": "Thiruvananthapuram"
    },
    {
        "name": "Rahul Verma",
        "email": "rahul.verma@lwconnect.in",
        "title": "Agricultural Innovation Specialist",
        "bio": "Driving agricultural technology adoption and farmer welfare programs. Expert in agri-tech solutions.",
        "expertise": ["AgriTech", "Farmer Welfare", "Rural Development", "Agricultural Policy", "Supply Chain"],
        "specialization": "Agricultural Innovation",
        "years_experience": 10,
        "availability": "weekdays_afternoons",
        "location": "Lucknow"
    },
    {
        "name": "Deepa Menon",
        "email": "deepa.menon@lwconnect.in",
        "title": "Legal & Regulatory Expert",
        "bio": "Specialist in government legal frameworks and regulatory reforms. Drafted multiple policy documents.",
        "expertise": ["Legal Frameworks", "Regulatory Reform", "Policy Drafting", "Compliance", "Administrative Law"],
        "specialization": "Legal & Regulatory Affairs",
        "years_experience": 14,
        "availability": "weekdays_mornings",
        "location": "New Delhi"
    },
    {
        "name": "Karthik Subramanian",
        "email": "karthik.subramanian@lwconnect.in",
        "title": "Blockchain & Emerging Tech Expert",
        "bio": "Pioneer in blockchain applications for government. Leading distributed ledger technology initiatives.",
        "expertise": ["Blockchain", "Emerging Technologies", "Digital Identity", "Smart Contracts", "Innovation"],
        "specialization": "Blockchain & Emerging Tech",
        "years_experience": 7,
        "availability": "weekends",
        "location": "Bangalore"
    },
    {
        "name": "Nisha Gupta",
        "email": "nisha.gupta@lwconnect.in",
        "title": "Citizen Services Expert",
        "bio": "Redesigning citizen services for better accessibility. Expert in service delivery optimization.",
        "expertise": ["Citizen Services", "Service Delivery", "User Experience", "Process Optimization", "Grievance Redressal"],
        "specialization": "Citizen Services",
        "years_experience": 11,
        "availability": "flexible",
        "location": "Jaipur"
    },
    {
        "name": "Sanjay Rao",
        "email": "sanjay.rao@lwconnect.in",
        "title": "Infrastructure Development Advisor",
        "bio": "Expert in public infrastructure projects and PPP models. Managed large-scale infrastructure programs.",
        "expertise": ["Infrastructure", "PPP Models", "Project Management", "Construction", "Asset Management"],
        "specialization": "Infrastructure Development",
        "years_experience": 18,
        "availability": "weekdays_afternoons",
        "location": "Mumbai"
    }
]


def seed_indian_mentors():
    """Seed database with Indian mentors."""
    db = SessionLocal()
    try:
        print("🌱 Seeding Indian mentors...")
        
        # Check if mentors already exist
        existing_count = db.query(User).filter(User.role == 'mentor').count()
        if existing_count >= len(INDIAN_MENTORS):
            print(f"✅ Database already has {existing_count} mentors. Skipping seed.")
            return
        
        created_count = 0
        
        for mentor_data in INDIAN_MENTORS:
            # Check if mentor already exists
            existing_user = db.query(User).filter(User.email == mentor_data["email"]).first()
            if existing_user:
                print(f"⏭️  Skipping {mentor_data['name']} - already exists")
                continue
            
            # Create user account
            user = User(
                email=mentor_data["email"],
                name=mentor_data["name"],
                role="mentor",
                hashed_password=get_password_hash("mentor123"),  # Default password
                is_active=True
            )
            db.add(user)
            db.flush()  # Get user ID
            
            # Create mentor profile
            mentor = Mentor(
                user_id=user.id,
                bio=mentor_data["bio"],
                expertise=mentor_data["expertise"],
                specialization=mentor_data["specialization"],
                years_experience=mentor_data["years_experience"],
                availability=mentor_data["availability"],
                is_available=True
            )
            db.add(mentor)
            
            created_count += 1
            print(f"✅ Created mentor: {mentor_data['name']} ({mentor_data['location']})")
        
        db.commit()
        print(f"\n🎉 Successfully seeded {created_count} Indian mentors!")
        print(f"📊 Total mentors in database: {db.query(User).filter(User.role == 'mentor').count()}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding mentors: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_indian_mentors()
