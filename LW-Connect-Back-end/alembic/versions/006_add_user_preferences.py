"""Add user preferences tables

Revision ID: 006_add_user_preferences
Revises: 005_mentor_availability
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '006_add_user_preferences'
down_revision = '006_create_sessions'
branch_labels = None
depends_on = None


def upgrade():
    # Create user_preferences table
    op.create_table('user_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('preferred_learning_style', sa.String(length=50), nullable=True),
        sa.Column('preferred_session_duration', sa.Integer(), nullable=True),
        sa.Column('preferred_time_slots', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('preferred_communication_style', sa.String(length=50), nullable=True),
        sa.Column('content_difficulty_level', sa.String(length=50), nullable=True),
        sa.Column('preferred_topics', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('blocked_topics', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('recommendation_frequency', sa.String(length=50), nullable=True),
        sa.Column('max_recommendations_per_session', sa.Integer(), nullable=True),
        sa.Column('enable_ai_suggestions', sa.Boolean(), nullable=True),
        sa.Column('content_filter_level', sa.String(length=50), nullable=True),
        sa.Column('enable_profanity_filter', sa.Boolean(), nullable=True),
        sa.Column('enable_topic_restrictions', sa.Boolean(), nullable=True),
        sa.Column('ai_personality_type', sa.String(length=50), nullable=True),
        sa.Column('response_length_preference', sa.String(length=50), nullable=True),
        sa.Column('enable_follow_up_questions', sa.Boolean(), nullable=True),
        sa.Column('custom_preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_preferences_user_id'), 'user_preferences', ['user_id'], unique=False)

    # Create ai_topic_suggestions table
    op.create_table('ai_topic_suggestions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('topic_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('popularity_score', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_topic_suggestions_category'), 'ai_topic_suggestions', ['category'], unique=False)
    op.create_index(op.f('ix_ai_topic_suggestions_is_active'), 'ai_topic_suggestions', ['is_active'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_ai_topic_suggestions_is_active'), table_name='ai_topic_suggestions')
    op.drop_index(op.f('ix_ai_topic_suggestions_category'), table_name='ai_topic_suggestions')
    op.drop_table('ai_topic_suggestions')
    op.drop_index(op.f('ix_user_preferences_user_id'), table_name='user_preferences')
    op.drop_table('user_preferences')