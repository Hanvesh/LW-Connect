"""Add specialization and availability to mentors table.

Revision ID: 005_mentor_availability
Revises: 004_add_audit_logs
Create Date: 2026-05-31 09:16:23
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '005_mentor_availability'
down_revision = '004_add_audit_logs'
branch_labels = None
depends_on = None


def upgrade():
    """Add specialization and availability columns to mentors table."""
    op.add_column('mentors', sa.Column('specialization', sa.String(255), nullable=True))
    op.add_column('mentors', sa.Column('availability', sa.String(50), nullable=True))


def downgrade():
    """Remove specialization and availability columns from mentors table."""
    op.drop_column('mentors', 'availability')
    op.drop_column('mentors', 'specialization')
