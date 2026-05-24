# Production Deployment Guide

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 16+ with pgvector extension
- Redis 7+
- OpenAI API key
- Domain with SSL certificate

## Deployment Options

### Option 1: Docker Compose (Simple)

Best for: Small to medium deployments, single server

```bash
# 1. Clone repository
git clone <repo-url>
cd LW-Connect-Langchain

# 2. Configure environment
cp .env.example .env
nano .env  # Add your OpenAI API key and production settings

# 3. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
curl http://localhost:8000/health
```

### Option 2: Kubernetes (Scalable)

Best for: Large deployments, high availability

See `k8s/` directory for manifests.

### Option 3: AWS ECS (Managed)

Best for: AWS-native deployments

See `aws/` directory for CloudFormation templates.

## Production Configuration

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-prod-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small

# Database (use managed service)
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/lwconnect

# Redis (use managed service)
REDIS_URL=redis://prod-redis.example.com:6379/0

# API
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production

# AI Config
MAX_TOKENS=500
TEMPERATURE=0.7
TOP_K_RESULTS=5
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# Safety
ENABLE_MODERATION=true
LOG_PROMPTS=true

# Performance
CACHE_TTL=3600
VECTOR_DIMENSION=1536
```

### Database Setup

```bash
# 1. Create database
createdb lwconnect

# 2. Enable pgvector extension
psql lwconnect -c "CREATE EXTENSION vector;"

# 3. Run migrations (tables created automatically on first run)
# Or use migration script:
python scripts/init_db.py
```

### Redis Setup

```bash
# For production, use managed Redis:
# - AWS ElastiCache
# - Redis Cloud
# - Azure Cache for Redis

# Configuration:
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## Security Hardening

### 1. API Authentication

Add JWT authentication middleware:

```python
# app/auth.py
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # Verify JWT token
    if not is_valid_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return token
```

Add to endpoints:

```python
@app.post("/api/v1/query", dependencies=[Depends(verify_token)])
async def query(request: QueryRequest):
    ...
```

### 2. Rate Limiting

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.post("/api/v1/query")
@limiter.limit("10/minute")
async def query(request: Request, query_request: QueryRequest):
    ...
```

### 3. HTTPS/TLS

Use reverse proxy (nginx):

```nginx
server {
    listen 443 ssl http2;
    server_name api.lwconnect.example.com;

    ssl_certificate /etc/ssl/certs/lwconnect.crt;
    ssl_certificate_key /etc/ssl/private/lwconnect.key;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Secrets Management

Use AWS Secrets Manager:

```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# In config.py
secrets = get_secret('lwconnect/prod')
OPENAI_API_KEY = secrets['openai_api_key']
```

## Monitoring Setup

### 1. Prometheus Metrics

```bash
pip install prometheus-fastapi-instrumentator
```

```python
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)
```

### 2. Logging

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('logs/app.log', maxBytes=10485760, backupCount=5),
        logging.StreamHandler()
    ]
)
```

### 3. Health Checks

```python
@app.get("/health")
async def health_check():
    checks = {
        "postgres": await check_postgres(),
        "redis": await check_redis(),
        "openai": await check_openai()
    }
    
    status = "healthy" if all(checks.values()) else "unhealthy"
    
    return {
        "status": status,
        "services": checks,
        "timestamp": datetime.utcnow().isoformat()
    }
```

## Performance Tuning

### 1. Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM documents 
ORDER BY embedding <=> '[...]' 
LIMIT 5;

-- Adjust index parameters
CREATE INDEX documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);  -- Adjust based on dataset size

-- Vacuum regularly
VACUUM ANALYZE documents;
```

### 2. Connection Pooling

```python
# In vector_store.py
self.pool = await asyncpg.create_pool(
    settings.database_url,
    min_size=10,
    max_size=50,
    command_timeout=60
)
```

### 3. Redis Optimization

```bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
tcp-backlog 511
timeout 300
```

### 4. API Optimization

```python
# Enable compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Connection pooling for OpenAI
import httpx
client = httpx.AsyncClient(
    limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
)
```

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump lwconnect | gzip > backups/lwconnect_$DATE.sql.gz

# Retain last 7 days
find backups/ -name "*.sql.gz" -mtime +7 -delete
```

### Redis Persistence

```bash
# redis.conf
save 900 1
save 300 10
save 60 10000

appendonly yes
appendfsync everysec
```

## Disaster Recovery

### 1. Backup Restoration

```bash
# Restore database
gunzip -c backups/lwconnect_20260524.sql.gz | psql lwconnect

# Restore Redis
redis-cli --rdb /path/to/dump.rdb
```

### 2. Failover Strategy

```
Primary Region          Secondary Region
    ↓                        ↓
[API Cluster]          [API Cluster]
    ↓                        ↓
[DB Primary] --------→ [DB Replica]
    ↓                        ↓
[Redis Primary] -----→ [Redis Replica]
```

## Scaling Guide

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  api:
    image: lwconnect-ai:latest
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
```

```bash
docker-compose -f docker-compose.scale.yml up -d --scale api=5
```

### Load Balancer

```nginx
upstream api_backend {
    least_conn;
    server api1:8000;
    server api2:8000;
    server api3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://api_backend;
    }
}
```

### Auto-scaling (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lwconnect-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lwconnect-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Common Issues

**1. Slow queries**
```bash
# Check vector index
SELECT * FROM pg_indexes WHERE tablename = 'documents';

# Rebuild index if needed
REINDEX INDEX documents_embedding_idx;
```

**2. High memory usage**
```bash
# Check Redis memory
redis-cli INFO memory

# Clear cache if needed
redis-cli FLUSHDB
```

**3. OpenAI rate limits**
```python
# Add exponential backoff
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
async def call_openai_with_retry():
    return await openai_client.create(...)
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export LANGCHAIN_VERBOSE=true

# Run with debug
python -m app.main
```

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check API latency
- Review cache hit rates

**Weekly**:
- Analyze query patterns
- Review recommendation quality
- Update vector indexes

**Monthly**:
- Database vacuum and analyze
- Review and rotate logs
- Update dependencies
- Security patches

### Update Procedure

```bash
# 1. Backup
./scripts/backup.sh

# 2. Pull updates
git pull origin main

# 3. Update dependencies
pip install -r requirements.txt --upgrade

# 4. Rebuild containers
docker-compose build

# 5. Rolling update
docker-compose up -d --no-deps --build api

# 6. Verify
curl http://localhost:8000/health
```

## Cost Optimization

### OpenAI API Costs

```python
# Track token usage
import tiktoken

def estimate_cost(text, model="gpt-4"):
    encoding = tiktoken.encoding_for_model(model)
    tokens = len(encoding.encode(text))
    
    # GPT-4 pricing (example)
    cost_per_1k = 0.03  # Input tokens
    return (tokens / 1000) * cost_per_1k
```

### Caching Strategy

- Cache embeddings: 24h (high value, low change)
- Cache queries: 30min (balance freshness/cost)
- Cache recommendations: 1h (personalized, moderate change)

### Resource Optimization

- Use GPT-3.5 for simple queries
- Use GPT-4 for complex recommendations
- Batch embedding generation
- Implement request deduplication

## Compliance

### GDPR Compliance

- User data deletion endpoint
- Data export functionality
- Consent management
- Audit logging

```python
@app.delete("/api/v1/user/{user_id}/data")
async def delete_user_data(user_id: str):
    # Delete user sessions
    # Delete user queries from logs
    # Anonymize user data
    pass
```

### SOC 2 Requirements

- Access logging
- Encryption at rest and in transit
- Regular security audits
- Incident response plan

## Support

For production issues:
- Email: support@lwconnect.example.com
- Slack: #lwconnect-prod
- On-call: PagerDuty integration
