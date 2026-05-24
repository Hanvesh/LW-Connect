from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from app.config import settings
from app.vector_store import vector_store
from app.cache import cache_service
from app.embedding_pipeline import EmbeddingPipeline
from app.models import DocumentType, QueryRequest
from app.prompts import QUERY_ANSWERING_PROMPT, FALLBACK_PROMPT
import logging

logger = logging.getLogger(__name__)

class RetrievalService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            openai_api_key=settings.openai_api_key
        )
        self.embedding_pipeline = EmbeddingPipeline()
    
    async def retrieve_and_answer(self, request: QueryRequest) -> Dict[str, Any]:
        """Main retrieval pipeline: query -> embed -> search -> generate"""
        
        # Check cache
        cache_key = f"qa:{request.query}:{request.top_k}"
        cached = await cache_service.get(cache_key)
        if cached:
            logger.info(f"Cache hit for query: {request.query}")
            return cached
        
        # Embed query
        query_embedding = await self.embedding_pipeline.embed_query(request.query)
        
        # Retrieve relevant documents
        results = await vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=request.top_k
        )
        
        if not results or results[0]["similarity"] < 0.5:
            # Fallback for low relevance
            return await self._fallback_response(request.query)
        
        # Build context
        context = self._build_context(results)
        
        # Generate answer
        prompt = PromptTemplate(
            template=QUERY_ANSWERING_PROMPT,
            input_variables=["context", "question"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = await chain.arun(context=context, question=request.query)
        
        result = {
            "answer": response.strip(),
            "sources": [
                {
                    "content": r["content"][:200] + "...",
                    "doc_type": r["doc_type"],
                    "similarity": r["similarity"]
                }
                for r in results[:3]
            ],
            "confidence": results[0]["similarity"] if results else 0.0
        }
        
        # Cache result
        await cache_service.set(cache_key, result, ttl=1800)
        
        return result
    
    async def retrieve_by_type(
        self, 
        query: str, 
        doc_type: DocumentType,
        top_k: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve documents filtered by type"""
        
        query_embedding = await self.embedding_pipeline.embed_query(query)
        
        results = await vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=top_k,
            doc_type=doc_type,
            metadata_filter=metadata_filter
        )
        
        return results
    
    def _build_context(self, results: List[Dict[str, Any]]) -> str:
        """Build context string from retrieved documents"""
        context_parts = []
        for idx, result in enumerate(results, 1):
            context_parts.append(
                f"[Source {idx}] ({result['doc_type']})\n{result['content']}\n"
            )
        return "\n".join(context_parts)
    
    async def _fallback_response(self, query: str) -> Dict[str, Any]:
        """Generate fallback response when no relevant docs found"""
        prompt = PromptTemplate(
            template=FALLBACK_PROMPT,
            input_variables=["query"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = await chain.arun(query=query)
        
        return {
            "answer": response.strip(),
            "sources": [],
            "confidence": 0.0,
            "fallback": True
        }

retrieval_service = RetrievalService()
