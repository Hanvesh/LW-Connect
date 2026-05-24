# LW-Connect API Documentation

## Architecture Overview

LW-Connect follows clean architecture principles with clear separation of concerns:

- **API Layer** (`/app/api/v1`): FastAPI routes and endpoints
- **Service Layer** (`/app/services`): Business logic
- **Repository Layer** (`/app/repositories`): Data access
- **Models** (`/app/models`): SQLAlchemy ORM models
- **Schemas** (`/app/schemas`): Pydantic validation schemas
- **Core** (`/app/core`): Configuration, security, database
- **Workers** (`/app/workers`): Background tasks with Celery

## API Endpoints

### Authentication

#### POST /api/v1/auth/signup
Register a new user.

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "learner"
  }'
```

#### POST /api/v1/auth/login
Authenticate and get access token.

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### GET /api/v1/auth/me
Get current user information.

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mentors

#### POST /api/v1/mentors
Create mentor profile (requires mentor role).

```bash
curl -X POST http://localhost:8000/api/v1/mentors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Experienced mentor",
    "expertise": ["Policy", "Innovation"],
    "skills": ["Leadership", "Strategy"],
    "years_of_experience": 10,
    "is_available": true
  }'
```

#### GET /api/v1/mentors/{mentor_id}
Get mentor profile.

```bash
curl -X GET http://localhost:8000/api/v1/mentors/{mentor_id}
```

#### POST /api/v1/mentors/search
Search mentors with filters.

```bash
curl -X POST http://localhost:8000/api/v1/mentors/search \
  -H "Content-Type: application/json" \
  -d '{
    "expertise": ["Policy"],
    "is_available": true,
    "max_rate": 0
  }'
```

### Bookings

#### POST /api/v1/bookings
Create a booking (requires learner role).

```bash
curl -X POST http://localhost:8000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mentor_id": "uuid-here",
    "scheduled_at": "2026-06-01T10:00:00",
    "duration_minutes": 60,
    "notes": "Looking forward to discussing policy innovation"
  }'
```

#### GET /api/v1/bookings/learner/my-bookings
Get learner's bookings.

```bash
curl -X GET http://localhost:8000/api/v1/bookings/learner/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/v1/bookings/{booking_id}/cancel
Cancel a booking.

```bash
curl -X POST http://localhost:8000/api/v1/bookings/{booking_id}/cancel?reason=Schedule%20conflict \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/v1/bookings/feedback
Submit feedback for completed booking.

```bash
curl -X POST http://localhost:8000/api/v1/bookings/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "uuid-here",
    "rating": 5,
    "comment": "Excellent session!"
  }'
```

### Courses

#### POST /api/v1/courses
Create a course (requires admin role).

```bash
curl -X POST http://localhost:8000/api/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Innovation",
    "description": "Learn innovation fundamentals",
    "tags": ["innovation", "beginner"],
    "difficulty_level": "beginner",
    "duration_hours": 20,
    "is_published": true
  }'
```

#### GET /api/v1/courses
List all courses.

```bash
curl -X GET "http://localhost:8000/api/v1/courses?published_only=true&limit=10"
```

#### POST /api/v1/courses/search
Search courses by tags.

```bash
curl -X POST http://localhost:8000/api/v1/courses/search \
  -H "Content-Type: application/json" \
  -d '["innovation", "policy"]'
```

### Cohorts

#### POST /api/v1/cohorts
Create a cohort (requires admin role).

```bash
curl -X POST http://localhost:8000/api/v1/cohorts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "uuid-here",
    "name": "Spring 2026 Cohort",
    "description": "Spring cohort for innovation course",
    "start_date": "2026-06-01",
    "end_date": "2026-09-01",
    "max_participants": 30
  }'
```

#### POST /api/v1/cohorts/{cohort_id}/enroll/{learner_id}
Enroll learner in cohort.

```bash
curl -X POST http://localhost:8000/api/v1/cohorts/{cohort_id}/enroll/{learner_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /api/v1/cohorts/{cohort_id}/enrollments
Get cohort enrollments (requires admin role).

```bash
curl -X GET http://localhost:8000/api/v1/cohorts/{cohort_id}/enrollments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Dashboard

#### GET /api/v1/dashboard/metrics
Get dashboard metrics (requires admin role).

```bash
curl -X GET http://localhost:8000/api/v1/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response Format

All responses follow consistent format:

**Success Response:**
```json
{
  "id": "uuid",
  "field1": "value1",
  "created_at": "2026-05-24T11:48:38"
}
```

**Error Response:**
```json
{
  "detail": "Error message"
}
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Pagination

List endpoints support pagination:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 100)

## Role-Based Access

- **learner**: Can create bookings, enroll in cohorts, view mentors
- **mentor**: Can manage mentor profile, view bookings
- **admin**: Full access to all resources

## Rate Limiting

API is rate-limited to 60 requests per minute per IP address.

## Error Codes

- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `422`: Validation Error - Invalid data format
- `500`: Internal Server Error
