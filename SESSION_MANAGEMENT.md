# Session Management Implementation

## Overview
Automated session generation system for mentors with unique meeting links and concept-based scheduling.

## Features

### 1. Session Generation
- **Alternative Days**: Mentors get sessions on alternate weekdays (Mon-Fri only)
- **Unique Meeting Links**: Each mentor gets one permanent meeting link (hash-based)
- **Concept Scheduling**: One concept per session based on mentor expertise
- **Weekend Exclusion**: Saturday and Sunday are automatically skipped

### 2. API Endpoints

#### Generate Sessions
```
POST /api/v1/sessions/generate?weeks=4
```
Creates sessions for all active mentors for specified weeks.

#### Get Upcoming Sessions
```
GET /api/v1/sessions/upcoming?limit=50
```
Returns upcoming sessions visible to learners.

### 3. Database Schema

**sessions table:**
- `id`: UUID primary key
- `mentor_id`: Foreign key to mentors
- `session_date`: Date of session
- `start_time`, `end_time`: Session timing
- `meeting_link`: Unique meeting URL per mentor
- `concept`: Topic for the session
- `max_participants`: Default 30

### 4. Concept Mapping

Concepts are auto-assigned based on mentor expertise:
- **Python**: Python Basics, OOP, Data Structures, Web Dev, APIs
- **JavaScript**: JS Fundamentals, Async, React, Node.js, TypeScript
- **Data Science**: Analysis, ML, Statistics, Visualization, Deep Learning
- **Cloud**: AWS, Docker, Kubernetes, CI/CD, Serverless
- **AI/ML**: ML Algorithms, Neural Networks, NLP, Computer Vision

### 5. Usage

1. **Run Migration**:
   ```bash
   cd LW-Connect-Back-end
   alembic upgrade head
   ```

2. **Generate Sessions**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/sessions/generate?weeks=4
   ```

3. **View Sessions** (for learners):
   ```bash
   curl http://localhost:8000/api/v1/sessions/upcoming
   ```

## Implementation Details

- Sessions stagger across mentors (mentor_idx % 2) to distribute load
- Meeting links use MD5 hash of mentor_id for uniqueness
- Concepts cycle through expertise-based list
- ~3 sessions per week per mentor (alternative days)
