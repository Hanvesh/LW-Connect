# LW-Connect Quick Reference

## 🚀 Quick Start Commands

### Development Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup environment
cp .env.example .env

# 3. Start PostgreSQL and Redis
docker-compose up -d postgres redis

# 4. Run migrations
alembic upgrade head

# 5. Seed database
python scripts/seed.py

# 6. Start API server
uvicorn app.main:app --reload

# 7. Start Celery worker (new terminal)
celery -A app.workers.celery_app worker --loglevel=info
```

### Docker Setup (Easiest)
```bash
docker-compose up -d
docker-compose exec app alembic upgrade head
docker-compose exec app python scripts/seed.py
```

## 📋 Common Commands

### Database
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current version
alembic current

# View migration history
alembic history
```

### Testing
```bash
# Run all tests
pytest app/tests -v

# Run with coverage
pytest app/tests --cov=app --cov-report=html

# Run specific test
pytest app/tests/test_auth.py::test_signup -v
```

### Docker
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build

# Execute command in container
docker-compose exec app python scripts/seed.py
```

## 🔑 API Quick Reference

### Authentication
```bash
# Signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","full_name":"User","role":"learner"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get current user
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mentors
```bash
# List mentors
curl http://localhost:8000/api/v1/mentors

# Search mentors
curl -X POST http://localhost:8000/api/v1/mentors/search \
  -H "Content-Type: application/json" \
  -d '{"expertise":["Policy"],"is_available":true}'

# Get mentor
curl http://localhost:8000/api/v1/mentors/{mentor_id}
```

### Bookings
```bash
# Create booking
curl -X POST http://localhost:8000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mentor_id":"uuid","scheduled_at":"2026-06-01T10:00:00","duration_minutes":60}'

# My bookings
curl http://localhost:8000/api/v1/bookings/learner/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cancel booking
curl -X POST http://localhost:8000/api/v1/bookings/{id}/cancel?reason=Conflict \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Courses
```bash
# List courses
curl http://localhost:8000/api/v1/courses?published_only=true

# Search by tags
curl -X POST http://localhost:8000/api/v1/courses/search \
  -H "Content-Type: application/json" \
  -d '["innovation","policy"]'
```

### Dashboard
```bash
# Get metrics (admin only)
curl http://localhost:8000/api/v1/dashboard/metrics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🗂️ File Structure Quick Map

```
app/
├── main.py              → FastAPI app entry
├── api/v1/              → API endpoints
│   ├── auth.py          → /auth/* routes
│   ├── mentors.py       → /mentors/* routes
│   ├── bookings.py      → /bookings/* routes
│   ├── courses.py       → /courses/* routes
│   ├── cohorts.py       → /cohorts/* routes
│   └── dashboard.py     → /dashboard/* routes
├── core/                → Core functionality
│   ├── config.py        → Settings
│   ├── database.py      → DB connection
│   └── security.py      → Auth & JWT
├── models/              → Database models
├── schemas/             → Pydantic schemas
├── repositories/        → Data access
├── services/            → Business logic
└── workers/             → Background tasks
```

## 🔐 Default Credentials (After Seeding)

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@lwconnect.com      | admin123    |
| Learner | learner1@example.com     | password123 |
| Learner | learner2@example.com     | password123 |
| Mentor  | mentor1@example.com      | password123 |
| Mentor  | mentor2@example.com      | password123 |

## 🌐 URLs

- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📊 Database Tables

1. `users` - User authentication
2. `learners` - Learner profiles
3. `mentors` - Mentor profiles
4. `courses` - Learning courses
5. `cohorts` - Learning cohorts
6. `cohort_enrollments` - Enrollment tracking
7. `bookings` - Session bookings
8. `feedback` - Session feedback
9. `embedding_metadata` - AI embeddings

## 🎯 User Roles & Permissions

### Learner
- Create bookings
- View mentors
- Enroll in cohorts
- Submit feedback

### Mentor
- Manage profile
- View bookings
- Update availability

### Admin
- Full access
- Create courses
- Create cohorts
- View analytics

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps postgres
# Or: sudo systemctl status postgresql

# Test connection
psql postgresql://postgres:postgres@localhost:5432/lwconnect
```

### Redis Connection Error
```bash
# Check Redis is running
docker-compose ps redis
# Or: sudo systemctl status redis

# Test connection
redis-cli ping
```

### Migration Error
```bash
# Reset database (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head
python scripts/seed.py
```

### Import Error
```bash
# Ensure you're in project root
cd /home/hanvesh/Projects/LW-Connect

# Activate virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## 📦 Environment Variables

Key variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/lwconnect

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## 🔄 Development Workflow

1. Create feature branch
2. Make changes
3. Run tests: `pytest app/tests -v`
4. Create migration if needed: `alembic revision --autogenerate -m "description"`
5. Test locally
6. Commit and push

## 📚 Documentation Files

- `README.md` - Project overview
- `ARCHITECTURE.md` - Complete architecture guide
- `API_DOCS.md` - API endpoint documentation
- `DEPLOYMENT.md` - Production deployment guide
- `QUICKSTART.md` - This file

## 🎓 Learning Resources

- FastAPI: https://fastapi.tiangolo.com
- SQLAlchemy: https://docs.sqlalchemy.org
- Alembic: https://alembic.sqlalchemy.org
- Pydantic: https://docs.pydantic.dev
- Celery: https://docs.celeryq.dev

## 💡 Tips

- Use Swagger UI for interactive API testing
- Check logs with `docker-compose logs -f`
- Use `alembic current` to verify migration status
- Test endpoints with sample credentials after seeding
- Enable DEBUG=True in development for detailed errors

---

**Need help?** Check the full documentation in ARCHITECTURE.md and API_DOCS.md
