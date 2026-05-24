# LW-Connect (PeopleWave)

Privacy-first learning and mentorship platform for public-sector innovation programs.

## Architecture

```
/app
  /api/v1          # API routes
  /core            # Config, security, dependencies
  /models          # SQLAlchemy models
  /schemas         # Pydantic schemas
  /services        # Business logic
  /repositories    # Data access layer
  /workers         # Background tasks
  /utils           # Helpers
  /tests           # Test suite
/alembic           # Database migrations
/scripts           # Seed and utility scripts
```

## Tech Stack

- Python 3.12
- FastAPI
- PostgreSQL + pgvector
- SQLAlchemy + Alembic
- Redis + Celery
- JWT Authentication
- Pydantic v2

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed data
python scripts/seed.py

# Start server
uvicorn app.main:app --reload

# Start worker
celery -A app.workers.celery_app worker --loglevel=info
```

## Docker

```bash
docker-compose up -d
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest app/tests -v --cov=app
```
