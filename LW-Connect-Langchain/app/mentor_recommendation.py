from typing import List, Dict, Any
from app.llm_router import llm_router
from app.retrieval_service import retrieval_service
from app.models import MentorRecommendationRequest, DocumentType
from app.prompts import MENTOR_RECOMMENDATION_PROMPT
import logging

logger = logging.getLogger(__name__)

class MentorRecommendationEngine:
    def __init__(self):
        self.llm = llm_router
    
    async def recommend_mentors(
        self, 
        request: MentorRecommendationRequest
    ) -> Dict[str, Any]:
        """Generate mentor recommendations based on user profile"""
        
        # Build search query from user profile
        query = self._build_mentor_query(request)
        
        # Retrieve relevant mentor profiles
        metadata_filter = {}
        if request.cohort_id:
            metadata_filter["cohort_id"] = request.cohort_id
        
        mentor_results = await retrieval_service.retrieve_by_type(
            query=query,
            doc_type=DocumentType.MENTOR_BIO,
            top_k=request.top_k * 2,  # Get more for better filtering
            metadata_filter=metadata_filter if metadata_filter else None
        )
        
        if not mentor_results:
            return {
                "recommendations": [],
                "explanation": "No mentors found matching your criteria. Try broadening your search.",
                "confidence": 0.0
            }
        
        # Build context for LLM
        mentor_context = self._build_mentor_context(mentor_results)
        
        prompt_text = MENTOR_RECOMMENDATION_PROMPT.format(
            user_goals=", ".join(request.user_goals),
            user_skills=", ".join(request.user_skills),
            cohort_id=request.cohort_id or "Any",
            mentor_context=mentor_context,
            top_k=request.top_k
        )
        response = await self.llm.generate(prompt_text, provider=request.provider)
        
        # Parse and structure recommendations
        recommendations = self._parse_recommendations(mentor_results[:request.top_k])
        
        return {
            "recommendations": recommendations,
            "explanation": response.strip(),
            "confidence": self._calculate_confidence(mentor_results)
        }
    
    def _build_mentor_query(self, request: MentorRecommendationRequest) -> str:
        """Build semantic search query from user profile"""
        query_parts = []
        
        if request.user_goals:
            query_parts.append(f"Goals: {', '.join(request.user_goals)}")
        
        if request.user_skills:
            query_parts.append(f"Skills: {', '.join(request.user_skills)}")
        
        return " ".join(query_parts) if query_parts else "recommend a mentor"
    
    def _build_mentor_context(self, results: List[Dict[str, Any]]) -> str:
        """Build mentor context for LLM"""
        context_parts = []
        for idx, result in enumerate(results, 1):
            metadata = result.get("metadata", {})
            context_parts.append(
                f"Mentor {idx}:\n"
                f"Name: {metadata.get('name', 'Unknown')}\n"
                f"Expertise: {metadata.get('expertise', 'N/A')}\n"
                f"Bio: {result['content'][:300]}...\n"
                f"Similarity: {result['similarity']:.2f}\n"
            )
        return "\n".join(context_parts)
    
    def _parse_recommendations(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse mentor results into structured recommendations"""
        recommendations = []
        for result in results:
            metadata = result.get("metadata", {})
            recommendations.append({
                "mentor_id": metadata.get("mentor_id"),
                "name": metadata.get("name"),
                "expertise": metadata.get("expertise", []),
                "bio_snippet": result["content"][:200],
                "match_score": round(result["similarity"], 2),
                "availability": metadata.get("availability", True)
            })
        return recommendations
    
    def _calculate_confidence(self, results: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on similarity scores"""
        if not results:
            return 0.0
        
        avg_similarity = sum(r["similarity"] for r in results[:3]) / min(3, len(results))
        return round(avg_similarity, 2)

mentor_recommendation_engine = MentorRecommendationEngine()
