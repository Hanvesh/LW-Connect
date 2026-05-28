# Quick Start Guide

Get LW-Connect AI Assistant running in 5 minutes.

## Prerequisites

- Docker & Docker Compose installed
- AWS Bedrock credentials
- 4GB RAM minimum

## Steps

### 1. Clone & Configure

```bash
# Clone repository
git clone <repo-url>
cd LW-Connect-Langchain

# Setup environment
cp .env.example .env
nano .env  # Add your AWS Bedrock credentials
```

### 2. Start Services

```bash
# Start PostgreSQL, Redis, and API
docker-compose up -d

# Wait for services to be ready (30 seconds)
sleep 30

# Check health
curl http://localhost:8000/health
```

Expected output:
```json
{
  "status": "healthy",
  "environment": "development"
}
```

### 3. Load Sample Data

```bash
# Install Python dependencies (if running locally)
pip install -r requirements.txt

# Load sample mentors, courses, and FAQs
python scripts/load_sample_data.py
```

### 4. Test the API

**Query Example:**
```bash
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need help with AI governance",
    "top_k": 3
  }'
```

**Mentor Recommendation:**
```bash
curl -X POST http://localhost:8000/api/v1/recommend/mentors \
  -H "Content-Type: application/json" \
  -d '{
    "user_goals": ["AI governance", "policy innovation"],
    "user_skills": ["public policy"],
    "top_k": 3
  }'
```

**Chat:**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Recommend mentors for digital transformation",
    "user_id": "user_001"
  }'
```

### 5. Run Tests

```bash
# Run API tests
python tests/test_api.py

# Run evaluation
python tests/evaluation.py
```

## What's Next?

### Explore the API

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### Add Your Own Data

```python
import httpx
from app.models import Document, DocumentType

async def index_custom_mentor():
    doc = {
        "id": "mentor_custom",
        "content": "Your mentor bio here...",
        "doc_type": "mentor_bio",
        "metadata": {
            "name": "Your Name",
            "expertise": ["Your", "Expertise"]
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/v1/index/document",
            json=doc
        )
        print(response.json())
```

### Customize Prompts

Edit prompts in `app/prompts.py`:
- `SYSTEM_PROMPT`: Assistant behavior
- `MENTOR_RECOMMENDATION_PROMPT`: Mentor matching logic
- `COURSE_RECOMMENDATION_PROMPT`: Course suggestions

### Adjust Configuration

Edit `.env` file:
- `BEDROCK_MODEL`: Switch the Bedrock model identifier
- `TEMPERATURE`: Control response creativity (0.0-1.0)
- `MAX_TOKENS`: Limit response length
- `TOP_K_RESULTS`: Number of search results

## Common Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # API
  - "5433:5432"  # Postgres
  - "6380:6379"  # Redis
```

**Bedrock usage note:**
```bash
# Use a lower-cost Bedrock model for testing
BEDROCK_MODEL=amazon.titan-text-lite
```

**Slow queries:**
```bash
# Increase cache TTL
CACHE_TTL=7200  # 2 hours
```

## Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────┐
│  FastAPI    │
└──────┬──────┘
       │
┌──────▼──────────────────┐
│  LangChain Services     │
│  - Retrieval            │
│  - Recommendations      │
│  - Conversational AI    │
└──────┬──────────────────┘
       │
┌──────┴──────┬──────────┬────────┐
│             │          │        │
▼             ▼          ▼        ▼
pgvector    Redis    OpenAI   Memory
```

## Key Features

✅ **Semantic Search**: Natural language queries  
✅ **Mentor Matching**: AI-powered recommendations  
✅ **Course Suggestions**: Personalized learning paths  
✅ **Conversational AI**: Context-aware chat  
✅ **Caching**: Low-latency responses  
✅ **Moderation**: Content safety  

## Resources

- **Documentation**: `docs/`
- **Architecture**: `docs/architecture.md`
- **Deployment**: `docs/deployment.md`
- **Examples**: `docs/example_conversations.md`

## Support

- GitHub Issues: Report bugs and request features
- Documentation: Check `docs/` for detailed guides
- Examples: See `tests/` for usage examples

## Next Steps

1. ✅ Get it running (you're here!)
2. 📚 Read the [Architecture Guide](docs/architecture.md)
3. 🚀 Deploy to production: [Deployment Guide](docs/deployment.md)
4. 🎨 Customize prompts and behavior
5. 📊 Monitor performance with evaluation scripts

Happy building! 🎉
