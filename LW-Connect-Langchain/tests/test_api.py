import asyncio
import httpx
from app.models import Document, DocumentType, MentorProfile
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

async def test_indexing():
    """Test document indexing"""
    print("\n=== Testing Document Indexing ===")
    
    # Sample mentor document
    mentor_doc = Document(
        id="mentor_001",
        content="Dr. Sarah Chen is an expert in AI governance and public policy innovation. "
                "She has 15 years of experience working with government agencies on digital transformation. "
                "Her expertise includes policy design, stakeholder engagement, and technology ethics.",
        doc_type=DocumentType.MENTOR_BIO,
        metadata={
            "mentor_id": "mentor_001",
            "name": "Dr. Sarah Chen",
            "expertise": ["AI Governance", "Public Policy", "Digital Transformation"],
            "availability": True
        }
    )
    
    # Sample course document
    course_doc = Document(
        id="course_001",
        content="Introduction to AI Governance: Learn the fundamentals of AI policy, "
                "ethical frameworks, and regulatory approaches. This course covers risk assessment, "
                "stakeholder engagement, and implementation strategies for public sector organizations.",
        doc_type=DocumentType.COURSE,
        metadata={
            "course_id": "course_001",
            "title": "Introduction to AI Governance",
            "duration": "4 weeks",
            "level": "Beginner"
        }
    )
    
    async with httpx.AsyncClient() as client:
        # Index mentor
        response = await client.post(
            f"{BASE_URL}/index/document",
            json=mentor_doc.model_dump(mode='json')
        )
        print(f"Mentor indexed: {response.json()}")
        
        # Index course
        response = await client.post(
            f"{BASE_URL}/index/document",
            json=course_doc.model_dump(mode='json')
        )
        print(f"Course indexed: {response.json()}")

async def test_query():
    """Test query answering"""
    print("\n=== Testing Query Answering ===")
    
    query = {
        "query": "I need help with AI governance",
        "top_k": 3
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/query", json=query)
        result = response.json()
        
        print(f"Query: {query['query']}")
        print(f"Answer: {result['answer']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Sources: {len(result['sources'])}")

async def test_mentor_recommendation():
    """Test mentor recommendations"""
    print("\n=== Testing Mentor Recommendations ===")
    
    request = {
        "user_goals": ["AI governance", "policy innovation"],
        "user_skills": ["public policy", "stakeholder engagement"],
        "top_k": 3
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/recommend/mentors", json=request)
        result = response.json()
        
        print(f"User Goals: {request['user_goals']}")
        print(f"Recommendations: {len(result['recommendations'])}")
        print(f"Explanation: {result['explanation']}")
        print(f"Confidence: {result['confidence']}")

async def test_course_recommendation():
    """Test course recommendations"""
    print("\n=== Testing Course Recommendations ===")
    
    request = {
        "user_id": "user_001",
        "current_skills": ["public policy"],
        "learning_goals": ["AI governance", "digital transformation"],
        "top_k": 3
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/recommend/courses", json=request)
        result = response.json()
        
        print(f"Learning Goals: {request['learning_goals']}")
        print(f"Recommendations: {len(result['recommendations'])}")
        print(f"Explanation: {result['explanation']}")

async def test_chat():
    """Test conversational assistant"""
    print("\n=== Testing Conversational Assistant ===")
    
    messages = [
        "I'm interested in learning about AI governance",
        "Can you recommend a mentor for this?",
        "What courses should I take?"
    ]
    
    session_id = None
    
    async with httpx.AsyncClient() as client:
        for msg in messages:
            request = {
                "message": msg,
                "user_id": "user_001",
                "session_id": session_id
            }
            
            response = await client.post(f"{BASE_URL}/chat", json=request)
            result = response.json()
            
            session_id = result["session_id"]
            
            print(f"\nUser: {msg}")
            print(f"Assistant: {result['response']}")
            print(f"Sources: {len(result['sources'])}")

async def main():
    """Run all tests"""
    print("Starting LW-Connect AI Assistant Tests")
    print("=" * 50)
    
    # Wait for services to be ready
    await asyncio.sleep(2)
    
    try:
        await test_indexing()
        await asyncio.sleep(1)
        
        await test_query()
        await asyncio.sleep(1)
        
        await test_mentor_recommendation()
        await asyncio.sleep(1)
        
        await test_course_recommendation()
        await asyncio.sleep(1)
        
        await test_chat()
        
        print("\n" + "=" * 50)
        print("All tests completed!")
        
    except Exception as e:
        print(f"\nError during testing: {e}")

if __name__ == "__main__":
    asyncio.run(main())
