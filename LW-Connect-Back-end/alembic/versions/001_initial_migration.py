"""Initial migration - create all tables

Revision ID: 001
Revises: 
Create Date: 2026-05-24 11:48:38

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('learner', 'mentor', 'admin', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('is_verified', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create learners table
    op.create_table(
        'learners',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('bio', sa.Text),
        sa.Column('goals', postgresql.ARRAY(sa.String)),
        sa.Column('skills', postgresql.ARRAY(sa.String)),
        sa.Column('interests', postgresql.ARRAY(sa.String)),
        sa.Column('experience_level', sa.String(50)),
        sa.Column('organization', sa.String(255)),
        sa.Column('department', sa.String(255)),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create mentors table
    op.create_table(
        'mentors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('bio', sa.Text),
        sa.Column('expertise', postgresql.ARRAY(sa.String)),
        sa.Column('skills', postgresql.ARRAY(sa.String)),
        sa.Column('years_of_experience', sa.Integer),
        sa.Column('organization', sa.String(255)),
        sa.Column('job_title', sa.String(255)),
        sa.Column('is_available', sa.Boolean, default=True),
        sa.Column('max_mentees', sa.Integer, default=5),
        sa.Column('hourly_rate', sa.Integer, default=0),
        sa.Column('availability_schedule', postgresql.JSONB, server_default='{}'),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create courses table
    op.create_table(
        'courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('tags', postgresql.ARRAY(sa.String)),
        sa.Column('difficulty_level', sa.String(50)),
        sa.Column('duration_hours', sa.Integer),
        sa.Column('is_published', sa.Boolean, default=False),
        sa.Column('prerequisites', postgresql.ARRAY(sa.String)),
        sa.Column('learning_outcomes', postgresql.ARRAY(sa.String)),
        sa.Column('content_url', sa.String(500)),
        sa.Column('thumbnail_url', sa.String(500)),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create cohorts table
    op.create_table(
        'cohorts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(1000)),
        sa.Column('start_date', sa.Date),
        sa.Column('end_date', sa.Date),
        sa.Column('max_participants', sa.Integer, default=30),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create cohort_enrollments table
    op.create_table(
        'cohort_enrollments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('cohort_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cohorts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('learner_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('learners.id', ondelete='CASCADE'), nullable=False),
        sa.Column('enrolled_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('progress_percentage', sa.Integer, default=0),
        sa.Column('is_active', sa.Boolean, default=True),
    )
    
    # Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('learner_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('learners.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mentor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('mentors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scheduled_at', sa.DateTime, nullable=False),
        sa.Column('duration_minutes', sa.Integer, default=60),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'cancelled', 'completed', name='bookingstatus'), default='pending'),
        sa.Column('meeting_url', sa.String(500)),
        sa.Column('notes', sa.Text),
        sa.Column('cancellation_reason', sa.Text),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create feedback table
    op.create_table(
        'feedback',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('bookings.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('rating', sa.Integer, nullable=False),
        sa.Column('comment', sa.Text),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    
    # Create embedding_metadata table (requires pgvector PostgreSQL extension)
    # Install with: sudo apt install postgresql-14-pgvector
    # Then run a separate migration to create this table


def downgrade() -> None:
    if HAS_PGVECTOR:
        op.drop_index('idx_embedding_entity', table_name='embedding_metadata')
        op.drop_table('embedding_metadata')
    op.drop_table('feedback')
    op.drop_table('bookings')
    op.drop_table('cohort_enrollments')
    op.drop_table('cohorts')
    op.drop_table('courses')
    op.drop_table('mentors')
    op.drop_table('learners')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS bookingstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
