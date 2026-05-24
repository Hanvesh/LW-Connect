from typing import Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from app.config import settings
from app.retrieval_service import retrieval_service
from app.models import ChatRequest, ChatResponse, QueryRequest
from app.prompts import SYSTEM_PROMPT, MODERATION_PROMPT
from app.cache import cache_service
import uuid
import logging

logger = logging.getLogger(__name__)

class ConversationalAssistant:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            openai_api_key=settings.openai_api_key
        )
        self.sessions: Dict[str, ConversationBufferWindowMemory] = {}
    
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Handle conversational interaction with context"""
        
        # Moderation check
        if settings.enable_moderation:
            is_safe = await self._moderate_query(request.message)
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
            top_k=3
        )
        
        retrieval_result = await retrieval_service.retrieve_and_answer(query_request)
        
        # Build prompt with context
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}\n\nRelevant Context:\n{context}")
        ])
        
        # Create conversation chain
        chain = ConversationChain(
            llm=self.llm,
            memory=memory,
            prompt=prompt,
            verbose=False
        )
        
        # Generate response
        context = retrieval_result.get("answer", "No specific context found.")
        response = await chain.apredict(
            input=request.message,
            context=context
        )
        
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
    
    async def _moderate_query(self, query: str) -> bool:
        """Check if query is appropriate"""
        try:
            moderation_llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0,
                max_tokens=50,
                openai_api_key=settings.openai_api_key
            )
            
            result = await moderation_llm.apredict(
                MODERATION_PROMPT.format(query=query)
            )
            
            return "SAFE" in result.upper()
        except Exception as e:
            logger.error(f"Moderation error: {e}")
            return True  # Fail open
    
    def clear_session(self, session_id: str):
        """Clear conversation history for session"""
        if session_id in self.sessions:
            del self.sessions[session_id]

conversational_assistant = ConversationalAssistant()
