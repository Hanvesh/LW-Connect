from typing import List, Dict, Any
from app.llm_router import llm_router
from app.retrieval_service import retrieval_service
from app.models import CourseRecommendationRequest, DocumentType
from app.prompts import COURSE_RECOMMENDATION_PROMPT
import logging

logger = logging.getLogger(__name__)

class CourseRecommendationEngine:
    def __init__(self):
        self.llm = llm_router
    
    async def recommend_courses(
        self, 
        request: CourseRecommendationRequest
    ) -> Dict[str, Any]:
        """Generate course/pathway recommendations"""
        
        # Build search query
        query = self._build_course_query(request)
        
        # Retrieve courses and pathways
        course_results = await retrieval_service.retrieve_by_type(
            query=query,
            doc_type=DocumentType.COURSE,
            top_k=request.top_k
        )
        
        pathway_results = await retrieval_service.retrieve_by_type(
            query=query,
            doc_type=DocumentType.PATHWAY,
            top_k=3
        )
        
        all_results = course_results + pathway_results
        
        if not all_results:
            return {
                "recommendations": [],
                "explanation": "No courses found matching your learning goals.",
                "confidence": 0.0
            }
        
        # Build context
        course_context = self._build_course_context(all_results)
        
        prompt_text = COURSE_RECOMMENDATION_PROMPT.format(
            current_skills=", ".join(request.current_skills),
            learning_goals=", ".join(request.learning_goals),
            course_context=course_context,
            top_k=request.top_k
        )
        response = await self.llm.generate(prompt_text, provider=request.provider)
        
        recommendations = self._parse_course_recommendations(all_results[:request.top_k])
        
        return {
            "recommendations": recommendations,
            "explanation": response.strip(),
            "confidence": self._calculate_confidence(all_results)
        }
    
    def _build_course_query(self, request: CourseRecommendationRequest) -> str:
        """Build search query from learning profile"""
        query_parts = []
        
        if request.learning_goals:
            query_parts.append(f"Learn: {', '.join(request.learning_goals)}")
        
        if request.current_skills:
            query_parts.append(f"Building on: {', '.join(request.current_skills)}")
        
        return " ".join(query_parts)
    
    def _build_course_context(self, results: List[Dict[str, Any]]) -> str:
        """Build course context for LLM"""
        context_parts = []
        for idx, result in enumerate(results, 1):
            metadata = result.get("metadata", {})
            context_parts.append(
                f"Course {idx}:\n"
                f"Title: {metadata.get('title', 'Unknown')}\n"
                f"Type: {result['doc_type']}\n"
                f"Description: {result['content'][:250]}...\n"
                f"Duration: {metadata.get('duration', 'N/A')}\n"
                f"Level: {metadata.get('level', 'N/A')}\n"
            )
        return "\n".join(context_parts)
    
    def _parse_course_recommendations(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse course results into structured recommendations"""
        recommendations = []
        for result in results:
            metadata = result.get("metadata", {})
            recommendations.append({
                "course_id": metadata.get("course_id"),
                "title": metadata.get("title"),
                "type": result["doc_type"],
                "description": result["content"][:200],
                "duration": metadata.get("duration"),
                "level": metadata.get("level"),
                "match_score": round(result["similarity"], 2)
            })
        return recommendations
    
    def _calculate_confidence(self, results: List[Dict[str, Any]]) -> float:
        """Calculate confidence score"""
        if not results:
            return 0.0
        
        avg_similarity = sum(r["similarity"] for r in results[:3]) / min(3, len(results))
        return round(avg_similarity, 2)

course_recommendation_engine = CourseRecommendationEngine()
