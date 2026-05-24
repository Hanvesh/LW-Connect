from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List
import logging

from app.config import settings
from app.models import (
    Document, QueryRequest, ChatRequest, ChatResponse,
    MentorRecommendationRequest, CourseRecommendationRequest,
    RecommendationResponse
)
from app.vector_store import vector_store
from app.cache import cache_service
from app.retrieval_service import retrieval_service
from app.mentor_recommendation import mentor_recommendation_engine
from app.course_recommendation import course_recommendation_engine
from app.conversational_assistant import conversational_assistant
from app.indexing_service import indexing_service

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Initializing services...")
    await vector_store.initialize()
    await cache_service.initialize()
    logger.info("Services initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down services...")
    await vector_store.close()
    await cache_service.close()
    logger.info("Services shut down")

app = FastAPI(
    title="LW-Connect AI Assistant",
    description="AI-powered mentorship and learning recommendation system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.environment}

# Indexing endpoints
@app.post("/api/v1/index/documents")
async def index_documents(documents: List[Document]):
    """Index multiple documents"""
    try:
        await indexing_service.index_documents(documents)
        return {"status": "success", "indexed": len(documents)}
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/index/document")
async def index_document(document: Document):
    """Index single document"""
    try:
        await indexing_service.index_single_document(document)
        return {"status": "success", "document_id": document.id}
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/index/document/{doc_id}")
async def delete_document(doc_id: str):
    """Delete document from index"""
    try:
        await indexing_service.delete_document(doc_id)
        return {"status": "success", "document_id": doc_id}
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Query endpoint
@app.post("/api/v1/query")
async def query(request: QueryRequest):
    """Answer user query with context retrieval"""
    try:
        result = await retrieval_service.retrieve_and_answer(request)
        return result
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mentor recommendation
@app.post("/api/v1/recommend/mentors", response_model=RecommendationResponse)
async def recommend_mentors(request: MentorRecommendationRequest):
    """Get mentor recommendations"""
    try:
        result = await mentor_recommendation_engine.recommend_mentors(request)
        return RecommendationResponse(**result)
    except Exception as e:
        logger.error(f"Mentor recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Course recommendation
@app.post("/api/v1/recommend/courses", response_model=RecommendationResponse)
async def recommend_courses(request: CourseRecommendationRequest):
    """Get course/pathway recommendations"""
    try:
        result = await course_recommendation_engine.recommend_courses(request)
        return RecommendationResponse(**result)
    except Exception as e:
        logger.error(f"Course recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Conversational assistant
@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with AI assistant"""
    try:
        response = await conversational_assistant.chat(request)
        return response
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/chat/session/{session_id}")
async def clear_session(session_id: str):
    """Clear chat session history"""
    conversational_assistant.clear_session(session_id)
    return {"status": "success", "session_id": session_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development"
    )
