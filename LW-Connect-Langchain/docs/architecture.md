# LW-Connect AI Assistant - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web App, Mobile App, API Clients)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Layer                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Indexing │  Query   │ Mentor   │ Course   │   Chat   │  │
│  │   API    │   API    │ Rec API  │ Rec API  │   API    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Conversational Assistant (LangChain)                │  │
│  │  - ConversationChain                                 │  │
│  │  - ConversationBufferWindowMemory                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┼────────────────────────────────┐ │
│  │  Retrieval Service   │  Recommendation Engines        │ │
│  │  - Query embedding   │  - Mentor matching             │ │
│  │  - Vector search     │  - Course suggestions          │ │
│  │  - Context building  │  - Pathway generation          │ │
│  └──────────────────────┴────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────┴────────────────────────────────┐ │
│  │  Indexing Service                                     │ │
│  │  - Document chunking                                  │ │
│  │  - Embedding generation                               │ │
│  │  - Batch processing                                   │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   OpenAI     │  │   pgvector   │  │    Redis     │
│   API        │  │  (Postgres)  │  │   Cache      │
│              │  │              │  │              │
│ - GPT-4      │  │ - Vectors    │  │ - Embeddings │
│ - Embeddings │  │ - Metadata   │  │ - Queries    │
│ - Moderation │  │ - Search     │  │ - Sessions   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

### 1. Document Indexing Flow

```
Document Input
    ↓
[Semantic Chunking]
    ↓
[Metadata Extraction]
    ↓
[Embedding Generation] → [Cache Embedding]
    ↓
[Vector Store Insert]
    ↓
[Index Update]
```

### 2. Query Processing Flow

```
User Query
    ↓
[Moderation Check] → [Block if unsafe]
    ↓
[Check Cache] → [Return if hit]
    ↓
[Query Embedding]
    ↓
[Vector Similarity Search]
    ↓
[Metadata Filtering]
    ↓
[Context Building]
    ↓
[LLM Generation]
    ↓
[Cache Result]
    ↓
Response
```

### 3. Recommendation Flow

```
User Profile
    ↓
[Build Search Query]
    ↓
[Retrieve Candidates] (Vector Search)
    ↓
[Apply Filters] (Availability, Cohort, etc.)
    ↓
[Rank by Similarity]
    ↓
[LLM Explanation Generation]
    ↓
[Structure Response]
    ↓
Recommendations + Explanations
```

### 4. Conversational Flow

```
User Message
    ↓
[Load Session Memory]
    ↓
[Retrieve Context] (Vector Search)
    ↓
[Build Prompt] (System + History + Context)
    ↓
[LLM Generation]
    ↓
[Update Memory]
    ↓
[Store Session]
    ↓
Response
```

## Component Details

### Embedding Pipeline

**Purpose**: Convert text to vector embeddings

**Components**:
- `RecursiveCharacterTextSplitter`: Semantic chunking
- `OpenAIEmbeddings`: Generate embeddings
- Token counter: Track usage

**Key Features**:
- Document-type aware chunking
- Metadata preservation
- Batch processing support

### Vector Store (pgvector)

**Purpose**: Store and search vector embeddings

**Schema**:
```sql
documents (
    id TEXT PRIMARY KEY,
    content TEXT,
    doc_type TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    chunk_index INTEGER,
    created_at TIMESTAMP
)
```

**Indexes**:
- IVFFlat on embedding (cosine similarity)
- B-tree on doc_type (filtering)

**Operations**:
- Similarity search with filters
- Batch insert
- Incremental updates

### Cache Layer (Redis)

**Purpose**: Reduce latency and API costs

**Cached Items**:
- Embeddings (24h TTL)
- Query results (30min TTL)
- Recommendations (1h TTL)

**Key Patterns**:
```
embedding:{hash(text)} → embedding vector
query:{hash(query)}:{hash(filters)} → results
session:{session_id} → conversation state
```

### LangChain Integration

**Chains Used**:
1. **LLMChain**: Simple prompt → response
2. **ConversationChain**: Chat with memory

**Memory**:
- `ConversationBufferWindowMemory`: Last 5 exchanges
- Stored per session_id

**Prompts**:
- System prompts (behavior)
- Task prompts (recommendations)
- Fallback prompts (no results)
- Moderation prompts (safety)

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    ↓
┌────────┬────────┬────────┐
│ API 1  │ API 2  │ API 3  │
└────────┴────────┴────────┘
    ↓         ↓         ↓
┌──────────────────────────┐
│   Shared Vector Store    │
└──────────────────────────┘
    ↓         ↓         ↓
┌──────────────────────────┐
│    Redis Cluster         │
└──────────────────────────┘
```

**Stateless API**: All state in Redis/Postgres
**Connection Pooling**: Reuse DB connections
**Cache Sharing**: All instances use same Redis

### Performance Optimization

**Vector Search**:
- IVFFlat index for 10k-1M vectors
- HNSW index for >1M vectors
- Adjust `lists` parameter based on size

**Caching Strategy**:
- Aggressive caching for embeddings
- Moderate caching for queries
- Session-based caching for conversations

**Batch Processing**:
- Index documents in batches
- Parallel embedding generation
- Bulk vector inserts

## Security & Privacy

### Data Protection

**At Rest**:
- Encrypted database storage
- Secure Redis configuration
- No PII in logs

**In Transit**:
- HTTPS/TLS for all APIs
- Encrypted Redis connections
- Secure OpenAI API calls

### Access Control

**API Level**:
- JWT authentication
- Rate limiting per user
- Request validation

**Data Level**:
- User-scoped queries
- Metadata-based filtering
- Session isolation

### Content Safety

**Moderation**:
- Pre-query moderation check
- OpenAI moderation API
- Custom safety rules

**Logging**:
- Audit trail for queries
- Anonymized analytics
- Compliance reporting

## Monitoring & Observability

### Health Checks

```python
GET /health
{
    "status": "healthy",
    "services": {
        "postgres": "up",
        "redis": "up",
        "openai": "up"
    }
}
```

### Metrics to Track

**Performance**:
- Query latency (p50, p95, p99)
- Cache hit rate
- Vector search time

**Quality**:
- Retrieval accuracy (MRR, Hits@K)
- Recommendation relevance
- User satisfaction scores

**Usage**:
- Queries per minute
- Active sessions
- Token consumption

### Logging

**Structured Logs**:
```json
{
    "timestamp": "2026-05-24T12:00:00Z",
    "level": "INFO",
    "user_id": "user_001",
    "query": "AI governance mentors",
    "latency_ms": 245,
    "cache_hit": false,
    "results": 3
}
```

## Deployment Architecture

### Development

```
docker-compose.yml
- postgres (pgvector)
- redis
- api (hot reload)
```

### Production

```
Kubernetes Cluster
├── API Deployment (3 replicas)
├── Postgres StatefulSet
├── Redis StatefulSet
├── Ingress (HTTPS)
└── HPA (auto-scaling)
```

**Environment Variables**:
- Secrets via AWS Secrets Manager
- Config via ConfigMaps
- Feature flags via environment

## Future Enhancements

### Short Term
- [ ] Add feedback loop for recommendations
- [ ] Implement A/B testing framework
- [ ] Add more document types
- [ ] Improve chunking strategies

### Medium Term
- [ ] Multi-modal search (text + images)
- [ ] Real-time indexing pipeline
- [ ] Advanced filtering (date, location)
- [ ] Personalization engine

### Long Term
- [ ] Multi-language support
- [ ] Custom LLM fine-tuning
- [ ] Graph-based recommendations
- [ ] Federated learning for privacy
