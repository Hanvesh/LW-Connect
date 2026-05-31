"""Create sessions table

Revision ID: 004_create_sessions
Revises: 003_add_mentor_fields
Create Date: 2026-05-31 09:53:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_create_sessions'
down_revision = '005_mentor_availability'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('mentor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.String(length=10), nullable=False),
        sa.Column('end_time', sa.String(length=10), nullable=False),
        sa.Column('meeting_link', sa.String(length=500), nullable=False),
        sa.Column('concept', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('max_participants', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['mentor_id'], ['mentors.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_sessions_date', 'sessions', ['session_date'])
    op.create_index('idx_sessions_mentor', 'sessions', ['mentor_id'])


def downgrade():
    op.drop_index('idx_sessions_mentor', table_name='sessions')
    op.drop_index('idx_sessions_date', table_name='sessions')
    op.drop_table('sessions')
