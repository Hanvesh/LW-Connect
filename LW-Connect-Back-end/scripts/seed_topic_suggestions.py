"""Seed AI topic suggestions for user preferences."""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user_preferences import AITopicSuggestion

def seed_topic_suggestions():
    """Seed the database with AI topic suggestions."""
    db: Session = SessionLocal()
    
    try:
        # Technology topics
        tech_topics = [
            ("Artificial Intelligence", "Machine learning, deep learning, and AI applications"),
            ("Cloud Computing", "AWS, Azure, Google Cloud platforms and services"),
            ("Data Science", "Data analysis, visualization, and statistical modeling"),
            ("Cybersecurity", "Information security, threat analysis, and protection strategies"),
            ("Software Development", "Programming languages, frameworks, and development practices"),
            ("DevOps", "Continuous integration, deployment, and infrastructure automation"),
            ("Blockchain", "Distributed ledger technology and cryptocurrency"),
            ("Internet of Things", "Connected devices and smart systems"),
            ("Mobile Development", "iOS, Android, and cross-platform app development"),
            ("Web Development", "Frontend, backend, and full-stack web technologies")
        ]
        
        # Leadership topics
        leadership_topics = [
            ("Team Management", "Leading teams, delegation, and performance management"),
            ("Strategic Planning", "Long-term planning, goal setting, and execution"),
            ("Change Management", "Organizational change, transformation, and adaptation"),
            ("Communication Skills", "Public speaking, presentation, and interpersonal communication"),
            ("Conflict Resolution", "Mediation, negotiation, and problem-solving"),
            ("Decision Making", "Critical thinking, analysis, and strategic decisions"),
            ("Emotional Intelligence", "Self-awareness, empathy, and relationship management"),
            ("Project Management", "Planning, execution, and delivery of projects"),
            ("Innovation Management", "Fostering creativity and managing innovation processes"),
            ("Performance Coaching", "Mentoring, feedback, and employee development")
        ]
        
        # Innovation topics
        innovation_topics = [
            ("Design Thinking", "Human-centered design and creative problem solving"),
            ("Lean Startup", "Rapid prototyping, MVP development, and iteration"),
            ("Digital Transformation", "Technology adoption and organizational change"),
            ("Agile Methodology", "Scrum, Kanban, and agile project management"),
            ("Product Management", "Product strategy, roadmaps, and lifecycle management"),
            ("User Experience", "UX design, user research, and interface design"),
            ("Business Model Innovation", "New revenue models and value propositions"),
            ("Sustainability", "Environmental responsibility and sustainable practices"),
            ("Social Innovation", "Solutions for social and community challenges"),
            ("Entrepreneurship", "Starting and scaling new ventures")
        ]
        
        # Public Sector topics
        public_sector_topics = [
            ("Public Policy", "Policy development, analysis, and implementation"),
            ("Government Technology", "GovTech, digital services, and modernization"),
            ("Citizen Engagement", "Community involvement and participatory governance"),
            ("Regulatory Compliance", "Legal frameworks and compliance management"),
            ("Public-Private Partnerships", "Collaboration between sectors"),
            ("Budget Management", "Financial planning and resource allocation"),
            ("Transparency & Accountability", "Open government and ethical practices"),
            ("Emergency Management", "Crisis response and disaster preparedness"),
            ("Healthcare Administration", "Public health systems and management"),
            ("Education Policy", "Educational systems and reform initiatives")
        ]
        
        # Professional Development topics
        professional_topics = [
            ("Career Planning", "Career paths, goal setting, and professional growth"),
            ("Networking", "Building professional relationships and connections"),
            ("Personal Branding", "Professional image and reputation management"),
            ("Time Management", "Productivity, prioritization, and efficiency"),
            ("Continuous Learning", "Skill development and lifelong learning strategies"),
            ("Work-Life Balance", "Managing professional and personal responsibilities"),
            ("Negotiation Skills", "Contract negotiation and deal-making"),
            ("Financial Literacy", "Personal finance and investment strategies"),
            ("Cross-Cultural Communication", "Working in diverse and global environments"),
            ("Mentoring & Coaching", "Developing others and knowledge transfer")
        ]
        
        # Create topic suggestions
        categories = [
            ("Technology", tech_topics),
            ("Leadership", leadership_topics),
            ("Innovation", innovation_topics),
            ("Public Sector", public_sector_topics),
            ("Professional Development", professional_topics)
        ]
        
        for category, topics in categories:
            for topic_name, description in topics:
                # Check if topic already exists
                existing = db.query(AITopicSuggestion).filter(
                    AITopicSuggestion.topic_name == topic_name,
                    AITopicSuggestion.category == category
                ).first()
                
                if not existing:
                    topic = AITopicSuggestion(
                        category=category,
                        topic_name=topic_name,
                        description=description,
                        popularity_score=0,
                        is_active=True
                    )
                    db.add(topic)
        
        db.commit()
        print(f"Successfully seeded {sum(len(topics) for _, topics in categories)} topic suggestions")
        
    except Exception as e:
        print(f"Error seeding topic suggestions: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_topic_suggestions()