from typing import Dict, Any, Optional
from langchain.memory import ConversationBufferWindowMemory
from app.llm_router import llm_router
from app.config import settings
from app.retrieval_service import retrieval_service
from app.models import ChatRequest, ChatResponse, QueryRequest
from app.prompts import SYSTEM_PROMPT, MODERATION_PROMPT
import uuid
import logging

logger = logging.getLogger(__name__)

class ConversationalAssistant:
    def __init__(self):
        self.llm = llm_router
        self.sessions: Dict[str, ConversationBufferWindowMemory] = {}

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Handle conversational interaction with context"""

        # Moderation check
        if settings.enable_moderation:
            is_safe = await self._moderate_query(request.message, request.provider)
            if not is_safe:
                return ChatResponse(
                    response="I can only help with questions related to mentorship, learning, and the LW-Connect platform.",
                    sources=[],
                    session_id=request.session_id or str(uuid.uuid4())
                )

        # Get or create session
        session_id = request.session_id or str(uuid.uuid4())
        memory = self._get_or_create_memory(session_id)

        # Retrieve relevant context
        query_request = QueryRequest(
            query=request.message,
            user_id=request.user_id,
            top_k=3,
            provider=request.provider,
        )

        retrieval_result = await retrieval_service.retrieve_and_answer(query_request)

        # Build prompt with context and history
        history = memory.load_memory_variables({}).get("history", "")
        context = retrieval_result.get("answer", "No specific context found.")
        prompt_text = (
            f"{SYSTEM_PROMPT}\n\n"
            f"Conversation history:\n{history}\n\n"
            f"Human: {request.message}\n\n"
            f"Relevant Context:\n{context}\n\n"
            "Assistant:"
        )

        response = await self.llm.generate(prompt_text, provider=request.provider)
        memory.save_context({"input": request.message}, {"output": response})

        # Log if enabled
        if settings.log_prompts:
            logger.info(f"User: {request.user_id} | Query: {request.message}")
            logger.info(f"Response: {response[:100]}...")

        return ChatResponse(
            response=response.strip(),
            sources=retrieval_result.get("sources", []),
            session_id=session_id
        )

    def _get_or_create_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        """Get or create conversation memory for session"""
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationBufferWindowMemory(
                k=5,  # Keep last 5 exchanges
                return_messages=True
            )
        return self.sessions[session_id]

    async def _moderate_query(self, query: str, provider: Optional[str] = None) -> bool:
        """Check if query is appropriate"""
        try:
            result = await self.llm.generate(MODERATION_PROMPT.format(query=query), provider=provider)
            return "SAFE" in result.upper()
        except Exception as e:
            logger.error(f"Moderation error: {e}")
            return True  # Fail open

    def clear_session(self, session_id: str):
        """Clear conversation history for session"""
        if session_id in self.sessions:
            del self.sessions[session_id]


conversational_assistant = ConversationalAssistant()
