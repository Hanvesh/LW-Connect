# LW-Connect AI Assistant

AI-powered mentorship and learning recommendation system for PeopleWave platform.

## Architecture

```
User Query
    ↓
[FastAPI Layer]
    ↓
[Conversational Assistant] ← [Memory]
    ↓
[Retrieval Service] ← [Cache (Redis)]
    ↓
[Vector Store (pgvector)]
    ↓
[LangChain + OpenAI]
    ↓
Response
```

## Features

- **Semantic Search**: Find mentors, courses, and resources using natural language
- **Mentor Recommendations**: AI-powered mentor matching based on goals and skills
- **Course Recommendations**: Personalized learning pathway suggestions
- **Conversational Assistant**: Context-aware chat with memory
- **Caching**: Redis-based caching for low latency
- **Moderation**: Built-in safety and content moderation

## Tech Stack

- **Framework**: FastAPI
- **LLM**: OpenAI GPT-4 / GPT-3.5
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector DB**: PostgreSQL + pgvector
- **Cache**: Redis
- **Orchestration**: LangChain

## Quick Start

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Run Tests

```bash
# Install dependencies
pip install -r requirements.txt

# Run API tests
python tests/test_api.py

# Run evaluation
python tests/evaluation.py
```

## API Endpoints

### Indexing

```bash
# Index a document
POST /api/v1/index/document
{
  "id": "mentor_001",
  "content": "Mentor bio...",
  "doc_type": "mentor_bio",
  "metadata": {"name": "Dr. Sarah Chen"}
}

# Delete document
DELETE /api/v1/index/document/{doc_id}
```

### Query

```bash
# Ask a question
POST /api/v1/query
{
  "query": "I need help with AI governance",
  "top_k": 5
}
```

### Recommendations

```bash
# Get mentor recommendations
POST /api/v1/recommend/mentors
{
  "user_goals": ["AI governance", "policy innovation"],
  "user_skills": ["public policy"],
  "top_k": 3
}

# Get course recommendations
POST /api/v1/recommend/courses
{
  "user_id": "user_001",
  "current_skills": ["public policy"],
  "learning_goals": ["AI governance"],
  "top_k": 5
}
```

### Chat

```bash
# Chat with assistant
POST /api/v1/chat
{
  "message": "Recommend mentors for AI governance",
  "user_id": "user_001",
  "session_id": "optional-session-id"
}

# Clear session
DELETE /api/v1/chat/session/{session_id}
```

## Example Usage

```python
import httpx

async def get_mentor_recommendations():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/v1/recommend/mentors",
            json={
                "user_goals": ["AI governance", "digital transformation"],
                "user_skills": ["public policy", "stakeholder engagement"],
                "top_k": 3
            }
        )
        return response.json()
```

## Configuration

Key environment variables:

```bash
# OpenAI
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lwconnect

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Config
MAX_TOKENS=500
TEMPERATURE=0.7
TOP_K_RESULTS=5
```

## LangChain Components

### Chains
- **ConversationChain**: Chat with memory
- **LLMChain**: Prompt-based generation

### Retrievers
- Custom vector store retriever with pgvector
- Metadata filtering support

### Memory
- ConversationBufferWindowMemory (last 5 exchanges)

### Prompts
- System prompts for assistant behavior
- Task-specific prompts (mentor/course recommendations)
- Fallback and moderation prompts

## Evaluation Metrics

Run evaluation script to measure:

- **Retrieval Accuracy**: Hits@1, Hits@3, Hits@5, MRR
- **Latency**: Avg, P50, P95, Max response times
- **Recommendation Relevance**: Match scores
- **User Satisfaction**: (integrate with feedback system)

```bash
python tests/evaluation.py
```

## Production Deployment

### 1. Build and Deploy

```bash
# Build image
docker build -t lwconnect-ai:latest .

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Scaling Considerations

- **Horizontal Scaling**: Run multiple API instances behind load balancer
- **Vector Store**: Use connection pooling (configured in vector_store.py)
- **Redis**: Use Redis Cluster for high availability
- **Rate Limiting**: Add rate limiting middleware

### 3. Monitoring

- Health check: `GET /health`
- Prometheus metrics: Available at `/metrics` (add prometheus-fastapi-instrumentator)
- Log aggregation: Configure structured logging

### 4. Security

- Enable HTTPS in production
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Implement API authentication (JWT tokens)
- Enable request validation and sanitization

## Performance Optimization

### Caching Strategy

- **Embeddings**: 24-hour TTL
- **Query Results**: 30-minute TTL
- **Recommendations**: 1-hour TTL

### Vector Search Optimization

- Use IVFFlat index for large datasets (>100k vectors)
- Adjust `lists` parameter based on dataset size
- Consider HNSW index for better accuracy

### Batch Processing

```python
# Index documents in batches
await indexing_service.index_documents(documents)
```

## Troubleshooting

### Common Issues

1. **Slow queries**: Check vector index, increase cache TTL
2. **High memory usage**: Reduce conversation memory window
3. **Rate limits**: Implement exponential backoff for OpenAI API

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python -m app.main
```

## Contributing

1. Follow code structure and naming conventions
2. Add tests for new features
3. Update documentation
4. Run evaluation before submitting

## License

MIT License
