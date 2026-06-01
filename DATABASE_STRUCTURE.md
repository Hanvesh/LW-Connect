# LW-Connect Database Structure

## Overview

LW-Connect uses **PostgreSQL** with the **pgvector** extension as its primary database, accessed via **SQLAlchemy** (async) ORM. The database supports a privacy-first learning and mentorship platform for public-sector innovation programs.

---

## Database Technology Stack

| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL |
| ORM | SQLAlchemy (Async) |
| Driver | asyncpg |
| Vector Search | pgvector |
| Migrations | Alembic (implied) |

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users     │──1:1──│   learners   │──1:N──│    bookings      │
│              │       └──────────────┘       │                  │
│              │       ┌──────────────┐       │                  │
│              │──1:1──│   mentors    │──1:N──│                  │
│              │       └──────┬───────┘       └────────┬─────────┘
│              │              │                        │
│              │──1:1──┐      │1:N                     │1:1
│              │       │      │                        │
│              │──1:N──┤ ┌────┴─────┐          ┌──────┴──────┐
└──────┬───────┘       │ │ sessions │          │  feedback   │
       │               │ └──────────┘          └─────────────┘
       │1:N            │
       │         ┌─────┴──────────────┐
┌──────┴───────┐ │ user_preferences   │
│notifications │ └────────────────────┘
└──────────────┘

┌──────────────┐       ┌──────────────┐       ┌─────────────────────┐
│   courses    │──1:N──│   cohorts    │──1:N──│ cohort_enrollments  │
│              │       └──────────────┘       └─────────────────────┘
│              │
│              │──M:N──┌──────────────┐
└──────────────┘       │   pathways   │
        (pathway_courses)└─────────────┘

┌────────────────────┐    ┌─────────────────────┐    ┌──────────────┐
│ embedding_metadata │    │ ai_topic_suggestions │    │  audit_logs  │
└────────────────────┘    └─────────────────────┘    └──────────────┘
```

---

## Tables

### 1. `users`

Central authentication and identity table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, default uuid4 | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User email |
| hashed_password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(255) | NOT NULL | Display name |
| role | ENUM(learner, mentor, admin) | NOT NULL, default 'learner' | User role |
| is_active | BOOLEAN | default TRUE | Account active status |
| is_verified | BOOLEAN | default FALSE | Email verification status |
| created_at | TIMESTAMP | default NOW | Account creation time |
| updated_at | TIMESTAMP | default NOW, on update | Last modification time |

**Relationships:** 1:1 → learners, mentors, user_preferences | 1:N → notifications

---

### 2. `learners`

Extended profile for users with the learner role.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Learner profile ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL, CASCADE | Owning user |
| bio | TEXT | | Personal biography |
| goals | VARCHAR[] | | Learning goals array |
| skills | VARCHAR[] | | Current skills array |
| interests | VARCHAR[] | | Areas of interest |
| experience_level | VARCHAR(50) | | beginner/intermediate/advanced |
| organization | VARCHAR(255) | | Organization name |
| department | VARCHAR(255) | | Department name |
| metadata | JSONB | default {} | Extensible metadata |
| created_at | TIMESTAMP | default NOW | |
| updated_at | TIMESTAMP | default NOW, on update | |

**Relationships:** 1:N → bookings, cohort_enrollments

---

### 3. `mentors`

Extended profile for users with the mentor role.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Mentor profile ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL, CASCADE | Owning user |
| bio | TEXT | | Professional biography |
| expertise | VARCHAR[] | | Areas of expertise |
| skills | VARCHAR[] | | Teachable skills |
| years_of_experience | INTEGER | | Professional experience |
| organization | VARCHAR(255) | | Organization name |
| job_title | VARCHAR(255) | | Current job title |
| is_available | BOOLEAN | default TRUE | Accepting mentees |
| max_mentees | INTEGER | default 5 | Maximum concurrent mentees |
| hourly_rate | INTEGER | default 0 | Rate (0 = free) |
| availability_schedule | JSONB | default {} | Weekly schedule |
| specialization | VARCHAR(255) | | Primary specialization |
| availability | VARCHAR(50) | | Availability pattern |
| metadata | JSONB | default {} | Extensible metadata |
| created_at | TIMESTAMP | default NOW | |
| updated_at | TIMESTAMP | default NOW, on update | |

**Relationships:** 1:N → bookings, sessions

---

### 4. `bookings`

Mentor-learner session bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Booking ID |
| learner_id | UUID | FK → learners.id, NOT NULL, CASCADE | Requesting learner |
| mentor_id | UUID | FK → mentors.id, NOT NULL, CASCADE | Assigned mentor |
| scheduled_at | TIMESTAMP | NOT NULL | Session date/time |
| duration_minutes | INTEGER | default 60 | Session length |
| status | ENUM(pending, confirmed, cancelled, completed) | default 'pending' | Booking state |
| meeting_url | VARCHAR(500) | | Video call link |
| notes | TEXT | | Session notes |
| cancellation_reason | TEXT | | Reason if cancelled |
| metadata | JSONB | default {} | Extensible metadata |
| created_at | TIMESTAMP | default NOW | |
| updated_at | TIMESTAMP | default NOW, on update | |

**Relationships:** 1:1 → feedback

---

### 5. `feedback`

Post-session feedback and ratings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Feedback ID |
| booking_id | UUID | FK → bookings.id, UNIQUE, NOT NULL, CASCADE | Related booking |
| rating | INTEGER | NOT NULL | 1–5 star rating |
| comment | TEXT | | Written feedback |
| created_at | TIMESTAMP | default NOW | |

---

### 6. `courses`

Learning content and course catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Course ID |
| title | VARCHAR(255) | NOT NULL | Course title |
| description | TEXT | | Full description |
| tags | VARCHAR[] | | Search/categorization tags |
| difficulty_level | VARCHAR(50) | | beginner/intermediate/advanced |
| duration_hours | INTEGER | | Estimated completion time |
| is_published | BOOLEAN | default FALSE | Visibility flag |
| prerequisites | VARCHAR[] | | Required prior knowledge |
| learning_outcomes | VARCHAR[] | | Expected outcomes |
| content_url | VARCHAR(500) | | Content link |
| thumbnail_url | VARCHAR(500) | | Preview image |
| metadata | JSONB | default {} | Extensible metadata |
| created_at | TIMESTAMP | default NOW | |
| updated_at | TIMESTAMP | default NOW, on update | |

**Relationships:** 1:N → cohorts | M:N → pathways (via pathway_courses)

---

### 7. `cohorts`

Group-based learning cohorts tied to courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Cohort ID |
| course_id | UUID | FK → courses.id, NOT NULL, CASCADE | Parent course |
| name | VARCHAR(255) | NOT NULL | Cohort name |
| description | VARCHAR(1000) | | Cohort description |
| start_date | DATE | | Start date |
| end_date | DATE | | End date |
| max_participants | INTEGER | default 30 | Capacity limit |
| is_active | BOOLEAN | default TRUE | Active status |
| metadata | JSONB | default {} | Extensible metadata |
| created_at | TIMESTAMP | default NOW | |
| updated_at | TIMESTAMP | default NOW, on update | |

**Relationships:** 1:N → cohort_enrollments

---

### 8. `cohort_enrollments`

Tracks learner enrollment and progress in cohorts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Enrollment ID |
| cohort_id | UUID | FK → cohorts.id, NOT NULL, CASCADE | Target cohort |
| learner_id | UUID | FK → learners.id, NOT NULL, CASCADE | Enrolled learner |
| enrolled_at | TIMESTAMP | default NOW | Enrollment time |
| completed_at | TIMESTAMP | nullable | Completion time |
| progress_percentage | INTEGER | default 0 | Progress (0–100) |
| is_active | BOOLEAN | default TRUE | Active enrollment |

---

### 9. `pathways`

Curated learning pathways composed of multiple courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, INDEX | Pathway ID |
| title | VARCHAR(255) | NOT NULL | Pathway title |
| description | TEXT | | Pathway description |
| duration_weeks | INTEGER | | Estimated duration |
| difficulty | VARCHAR(50) | | Difficulty level |

**Relationships:** M:N → courses (via pathway_courses)

---

### 10. `pathway_courses` (Junction Table)

Links pathways to courses with ordering.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| pathway_id | UUID | FK → pathways.id | Pathway reference |
| course_id | UUID | FK → courses.id | Course reference |
| sequence | INTEGER | default 0 | Order in pathway |

---

### 11. `sessions`

Scheduled mentor-led group sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Session ID |
| mentor_id | UUID | FK → mentors.user_id, NOT NULL, CASCADE | Hosting mentor |
| session_date | DATE | NOT NULL | Session date |
| start_time | VARCHAR(10) | NOT NULL | Start time (HH:MM) |
| end_time | VARCHAR(10) | NOT NULL | End time (HH:MM) |
| meeting_link | VARCHAR(500) | NOT NULL | Video call URL |
| concept | VARCHAR(255) | NOT NULL | Topic/concept covered |
| description | TEXT | | Session description |
| is_active | BOOLEAN | default TRUE | Active status |
| max_participants | INTEGER | default 30 | Capacity limit |
| created_at | TIMESTAMP | default NOW | |

---

### 12. `notifications`

User notification system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, INDEX | Notification ID |
| user_id | UUID | FK → users.id, NOT NULL | Target user |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification body |
| type | VARCHAR(50) | NOT NULL | booking/reminder/system/feedback |
| is_read | BOOLEAN | default FALSE | Read status |
| created_at | TIMESTAMP | default NOW | |

---

### 13. `user_preferences`

User topic preferences for personalized recommendations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Preference ID |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL, CASCADE | Owning user |
| preferred_topics | VARCHAR[] | | Topics of interest |
| blocked_topics | VARCHAR[] | | Topics to avoid |
| created_at | TIMESTAMP | default NOW | |
| updated_at | TIMESTAMP | default NOW, on update | |

---

### 14. `ai_topic_suggestions`

AI-curated topic suggestions with popularity tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Suggestion ID |
| category | VARCHAR(100) | NOT NULL | Topic category |
| topic_name | VARCHAR(255) | NOT NULL | Topic name |
| description | TEXT | | Topic description |
| popularity_score | INTEGER | default 0 | Usage-based ranking |
| is_active | BOOLEAN | default TRUE | Active status |
| created_at | TIMESTAMP | default NOW | |

---

### 15. `embedding_metadata`

Vector embeddings for AI-powered semantic search.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Embedding ID |
| entity_type | VARCHAR(50) | NOT NULL | mentor/course/learner |
| entity_id | UUID | NOT NULL | Referenced entity |
| content | TEXT | NOT NULL | Original text embedded |
| embedding | VECTOR(1536) | | 1536-dim vector (OpenAI) |
| model_name | VARCHAR(100) | | Embedding model used |
| created_at | TIMESTAMP | default NOW | |

---

### 16. `audit_logs`

System-wide audit trail for compliance and debugging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, INDEX | Log entry ID |
| user_id | UUID | FK → users.id, nullable | Acting user |
| action | VARCHAR(100) | NOT NULL | Action performed |
| resource_type | VARCHAR(50) | nullable | Affected resource type |
| resource_id | VARCHAR(255) | nullable | Affected resource ID |
| details | JSON | nullable | Action details/payload |
| ip_address | VARCHAR(45) | nullable | Client IP (IPv4/IPv6) |
| user_agent | TEXT | nullable | Client user agent |
| created_at | TIMESTAMP | default NOW, INDEX | Timestamp (indexed) |

---

### 17. `documents` (Langchain Vector Store)

Document chunks with vector embeddings for RAG-based retrieval.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Document chunk ID |
| content | TEXT | NOT NULL | Chunk text content |
| doc_type | TEXT | NOT NULL, INDEX | Document type |
| embedding | VECTOR(dimension) | IVFFlat INDEX | Vector embedding |
| metadata | JSONB | | Document metadata |
| chunk_index | INTEGER | | Position in source doc |
| created_at | TIMESTAMP | default NOW | |

**Indexes:** IVFFlat (cosine similarity) on embedding, B-tree on doc_type

---

## Design Advantages

### 1. UUID Primary Keys
- **Global uniqueness** — No collisions across distributed systems or microservices
- **Security** — Non-sequential IDs prevent enumeration attacks
- **Merge-friendly** — Safe for data migration and replication without conflicts

### 2. PostgreSQL Arrays (VARCHAR[])
- **Denormalized for performance** — Skills, topics, and tags stored directly without join tables
- **Native querying** — PostgreSQL `@>`, `&&`, `ANY()` operators for efficient array searches
- **Reduced complexity** — Eliminates many-to-many junction tables for simple tag-like data

### 3. JSONB Columns (metadata)
- **Schema flexibility** — Store evolving/optional attributes without migrations
- **Indexed queries** — GIN indexes on JSONB for fast key-value lookups
- **Future-proof** — Extend entities without altering table structure

### 4. pgvector Extension
- **Semantic search** — Cosine similarity search on 1536-dimension embeddings
- **AI-native** — Direct integration with OpenAI/LLM embedding models
- **IVFFlat indexing** — Approximate nearest neighbor search for sub-millisecond queries at scale
- **In-database ML** — No external vector DB needed, reducing infrastructure complexity

### 5. Cascading Deletes (ON DELETE CASCADE)
- **Referential integrity** — Automatic cleanup of dependent records
- **Data consistency** — No orphaned records when parent entities are removed
- **Simplified application logic** — No manual cascade handling in code

### 6. Async Database Access (asyncpg + SQLAlchemy Async)
- **High concurrency** — Non-blocking I/O for handling thousands of simultaneous connections
- **Low latency** — No thread pool overhead; native async/await with PostgreSQL protocol
- **Connection pooling** — Configurable pool_size and max_overflow for resource management

### 7. Role-Based Architecture
- **Single users table** — Unified authentication with role-based profile extension
- **1:1 profile separation** — Learner/Mentor profiles extend the base user without bloating
- **Clean authorization** — Role enum enables simple permission checks

### 8. Audit Logging
- **Compliance ready** — Full action trail with user, IP, and user agent tracking
- **Indexed timestamps** — Fast time-range queries for investigation
- **Nullable user_id** — Captures system-initiated actions alongside user actions

### 9. Feedback & Rating System
- **1:1 with bookings** — Ensures one feedback per session, preventing duplicates
- **Quantitative + qualitative** — Numeric rating with optional text comment
- **Mentor quality tracking** — Aggregatable ratings for recommendation algorithms

### 10. Cohort-Based Learning
- **Progress tracking** — Per-learner progress percentage within cohorts
- **Capacity management** — max_participants prevents over-enrollment
- **Temporal boundaries** — Start/end dates enable scheduled learning programs

### 11. Dual Vector Storage Strategy
- **embedding_metadata** — Entity-level embeddings for mentor/course/learner matching
- **documents** — Chunk-level embeddings for RAG document retrieval
- **Separation of concerns** — Different retrieval patterns optimized independently

### 12. Topic Preference System
- **Personalization** — Preferred/blocked topics drive AI recommendations
- **Popularity tracking** — Community-driven topic ranking via popularity_score
- **Privacy-first** — Preferences stored per-user with cascade delete on account removal

---

## Connection Configuration

| Parameter | Purpose |
|-----------|---------|
| pool_size | Base number of persistent connections |
| max_overflow | Additional connections under load |
| echo (DEBUG) | SQL logging for development |
| expire_on_commit=False | Prevents lazy-load issues in async context |
| autoflush=False | Explicit flush control for predictable behavior |

---

## Index Strategy

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| users | email | B-tree (UNIQUE) | Fast login lookup |
| documents | embedding | IVFFlat (cosine) | Vector similarity search |
| documents | doc_type | B-tree | Filter by document type |
| audit_logs | created_at | B-tree | Time-range queries |
| notifications | id | B-tree | Primary key lookup |
| embedding_metadata | embedding | (implicit) | Semantic search |
