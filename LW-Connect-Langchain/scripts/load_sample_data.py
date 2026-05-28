import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
from app.models import Document, DocumentType
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

# Sample mentor data
SAMPLE_MENTORS = [
    {
        "id": "mentor_001",
        "content": "Dr. Sarah Chen is a leading expert in AI governance and public policy innovation. "
                   "With over 15 years of experience working with government agencies, she specializes in "
                   "policy design, regulatory frameworks, stakeholder engagement, and technology ethics. "
                   "She has advised multiple national governments on AI strategy and implementation.",
        "metadata": {
            "mentor_id": "mentor_001",
            "name": "Dr. Sarah Chen",
            "expertise": ["AI Governance", "Public Policy", "Digital Transformation", "Ethics"],
            "skills": ["Policy Design", "Stakeholder Engagement", "Risk Assessment"],
            "cohorts": ["AI Leaders 2026", "Policy Innovation"],
            "rating": 4.9,
            "availability": True
        }
    },
    {
        "id": "mentor_002",
        "content": "Prof. Michael Torres is a digital transformation leader with 20 years of experience "
                   "in modernizing government services. He has led large-scale digital initiatives across "
                   "multiple agencies, focusing on citizen-centered design, agile methodologies, and "
                   "change management. His expertise includes service design, technology procurement, and "
                   "organizational transformation.",
        "metadata": {
            "mentor_id": "mentor_002",
            "name": "Prof. Michael Torres",
            "expertise": ["Digital Transformation", "Service Design", "Change Management"],
            "skills": ["Agile", "Citizen Experience", "Technology Strategy"],
            "cohorts": ["Digital Leaders 2026"],
            "rating": 4.8,
            "availability": True
        }
    },
    {
        "id": "mentor_003",
        "content": "Dr. Aisha Patel specializes in AI risk assessment and compliance for public sector "
                   "organizations. She has developed risk frameworks for AI systems in healthcare, education, "
                   "and social services. Her work focuses on algorithmic accountability, bias detection, "
                   "and responsible AI deployment in government contexts.",
        "metadata": {
            "mentor_id": "mentor_003",
            "name": "Dr. Aisha Patel",
            "expertise": ["AI Risk Management", "Compliance", "Algorithmic Accountability"],
            "skills": ["Risk Assessment", "Bias Detection", "Audit Frameworks"],
            "cohorts": ["AI Leaders 2026"],
            "rating": 4.7,
            "availability": True
        }
    }
]

# Sample course data
SAMPLE_COURSES = [
    {
        "id": "course_001",
        "content": "Introduction to AI Governance: A comprehensive course covering the fundamentals of "
                   "AI policy, ethical frameworks, and regulatory approaches. Learn about risk assessment, "
                   "stakeholder engagement, and implementation strategies for public sector organizations. "
                   "Topics include: AI ethics, policy design, regulatory compliance, risk management, and "
                   "practical case studies from government agencies worldwide.",
        "metadata": {
            "course_id": "course_001",
            "title": "Introduction to AI Governance",
            "duration": "4 weeks",
            "level": "Beginner",
            "topics": ["AI Ethics", "Policy Design", "Risk Management"],
            "format": "Self-paced with weekly live sessions"
        }
    },
    {
        "id": "course_002",
        "content": "Digital Transformation Fundamentals: Learn how to lead digital initiatives in government. "
                   "This course covers digital strategy, change management, technology evaluation, and "
                   "implementation planning. Includes real-world case studies from successful government "
                   "digital transformations. Topics: digital strategy, stakeholder management, agile methods, "
                   "measuring impact, and overcoming resistance to change.",
        "metadata": {
            "course_id": "course_002",
            "title": "Digital Transformation Fundamentals",
            "duration": "6 weeks",
            "level": "Intermediate",
            "topics": ["Digital Strategy", "Change Management", "Agile"],
            "format": "Cohort-based with projects"
        }
    },
    {
        "id": "course_003",
        "content": "Human-Centered Design for Government: Master the principles of service design and "
                   "citizen-centered innovation. Learn design thinking, user research, prototyping, and "
                   "testing methods specifically adapted for public sector contexts. Build skills in "
                   "empathy mapping, journey mapping, and co-design with citizens and stakeholders.",
        "metadata": {
            "course_id": "course_003",
            "title": "Human-Centered Design for Government",
            "duration": "5 weeks",
            "level": "Beginner",
            "topics": ["Service Design", "Design Thinking", "User Research"],
            "format": "Workshop-based with practical exercises"
        }
    }
]

# Sample learning pathways
SAMPLE_PATHWAYS = [
    {
        "id": "pathway_001",
        "content": "AI Leadership Pathway: A comprehensive learning journey for public sector leaders "
                   "looking to build AI capabilities. Start with AI fundamentals, progress through governance "
                   "and ethics, then advance to implementation and scaling. Includes: Introduction to AI, "
                   "AI Governance, Risk Management, Implementation Strategies, and Scaling AI in Government. "
                   "Total duration: 16 weeks. Recommended for senior leaders and program managers.",
        "metadata": {
            "pathway_id": "pathway_001",
            "title": "AI Leadership Pathway",
            "duration": "16 weeks",
            "level": "Intermediate to Advanced",
            "courses": ["course_001", "course_004", "course_005"],
            "target_audience": ["Senior Leaders", "Program Managers"]
        }
    },
    {
        "id": "pathway_002",
        "content": "Digital Innovation Pathway: Transform your organization through digital innovation. "
                   "This pathway covers digital strategy, service design, agile methods, and change management. "
                   "Learn to lead digital initiatives from conception to implementation. Includes: Digital "
                   "Transformation Fundamentals, Human-Centered Design, Agile for Government, and Innovation "
                   "Management. Total duration: 14 weeks.",
        "metadata": {
            "pathway_id": "pathway_002",
            "title": "Digital Innovation Pathway",
            "duration": "14 weeks",
            "level": "Beginner to Intermediate",
            "courses": ["course_002", "course_003", "course_006"],
            "target_audience": ["Innovation Leads", "Digital Managers"]
        }
    }
]

# Sample FAQs
SAMPLE_FAQS = [
    {
        "id": "faq_001",
        "content": "Q: How do I find a mentor?\nA: You can find mentors by browsing the mentor directory, "
                   "using the AI-powered search to describe your needs, or getting personalized recommendations "
                   "based on your goals and skills. Simply tell us what you're looking to learn or achieve, "
                   "and we'll match you with relevant mentors.",
        "metadata": {
            "category": "Mentorship",
            "tags": ["getting started", "mentor matching"]
        }
    },
    {
        "id": "faq_002",
        "content": "Q: What is a cohort?\nA: A cohort is a group of learners who progress through a "
                   "program together. Cohorts have scheduled start and end dates, regular live sessions, "
                   "peer collaboration opportunities, and shared learning experiences. This creates a "
                   "supportive community and enables networking with peers facing similar challenges.",
        "metadata": {
            "category": "Learning",
            "tags": ["cohorts", "learning format"]
        }
    },
    {
        "id": "faq_003",
        "content": "Q: How long does it take to complete a learning pathway?\nA: Learning pathways "
                   "typically range from 8 to 20 weeks depending on the topic and depth. Most pathways are "
                   "self-paced within cohort schedules, allowing you to balance learning with your work "
                   "commitments. Each pathway shows estimated time commitments upfront.",
        "metadata": {
            "category": "Learning",
            "tags": ["pathways", "time commitment"]
        }
    }
]

async def load_sample_data():
    """Load sample data into the system"""
    print("Loading sample data into LW-Connect AI Assistant...")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Load mentors
        print("\n📚 Loading mentors...")
        for mentor in SAMPLE_MENTORS:
            doc = Document(
                id=mentor["id"],
                content=mentor["content"],
                doc_type=DocumentType.MENTOR_BIO,
                metadata=mentor["metadata"]
            )
            
            try:
                response = await client.post(
                    f"{BASE_URL}/index/document",
                    json=doc.model_dump(mode='json')
                )
                print(f"  ✓ Indexed: {mentor['metadata']['name']}")
            except Exception as e:
                print(f"  ✗ Error indexing {mentor['id']}: {e}")
        
        # Load courses
        print("\n📖 Loading courses...")
        for course in SAMPLE_COURSES:
            doc = Document(
                id=course["id"],
                content=course["content"],
                doc_type=DocumentType.COURSE,
                metadata=course["metadata"]
            )
            
            try:
                response = await client.post(
                    f"{BASE_URL}/index/document",
                    json=doc.model_dump(mode='json')
                )
                print(f"  ✓ Indexed: {course['metadata']['title']}")
            except Exception as e:
                print(f"  ✗ Error indexing {course['id']}: {e}")
        
        # Load pathways
        print("\n🛤️  Loading learning pathways...")
        for pathway in SAMPLE_PATHWAYS:
            doc = Document(
                id=pathway["id"],
                content=pathway["content"],
                doc_type=DocumentType.PATHWAY,
                metadata=pathway["metadata"]
            )
            
            try:
                response = await client.post(
                    f"{BASE_URL}/index/document",
                    json=doc.model_dump(mode='json')
                )
                print(f"  ✓ Indexed: {pathway['metadata']['title']}")
            except Exception as e:
                print(f"  ✗ Error indexing {pathway['id']}: {e}")
        
        # Load FAQs
        print("\n❓ Loading FAQs...")
        for faq in SAMPLE_FAQS:
            doc = Document(
                id=faq["id"],
                content=faq["content"],
                doc_type=DocumentType.FAQ,
                metadata=faq["metadata"]
            )
            
            try:
                response = await client.post(
                    f"{BASE_URL}/index/document",
                    json=doc.model_dump(mode='json')
                )
                print(f"  ✓ Indexed: FAQ {faq['id']}")
            except Exception as e:
                print(f"  ✗ Error indexing {faq['id']}: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Sample data loading complete!")
    print("\nYou can now:")
    print("  - Query: POST /api/v1/query")
    print("  - Get mentor recommendations: POST /api/v1/recommend/mentors")
    print("  - Get course recommendations: POST /api/v1/recommend/courses")
    print("  - Chat: POST /api/v1/chat")

if __name__ == "__main__":
    asyncio.run(load_sample_data())
