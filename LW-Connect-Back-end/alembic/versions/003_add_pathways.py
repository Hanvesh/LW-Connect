"""Add pathways table

Revision ID: 003_add_pathways
Revises: 002_add_notifications
Create Date: 2026-05-31

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = '003_add_pathways'
down_revision = '002_add_notifications'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'pathways',
        sa.Column('id', UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration_weeks', sa.Integer(), nullable=True),
        sa.Column('difficulty', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pathways_id'), 'pathways', ['id'], unique=False)
    
    op.create_table(
        'pathway_courses',
        sa.Column('pathway_id', UUID(as_uuid=True), nullable=False),
        sa.Column('course_id', UUID(as_uuid=True), nullable=False),
        sa.Column('sequence', sa.Integer(), nullable=True, server_default='0'),
        sa.ForeignKeyConstraint(['pathway_id'], ['pathways.id'], ),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], )
    )


def downgrade():
    op.drop_table('pathway_courses')
    op.drop_index(op.f('ix_pathways_id'), table_name='pathways')
    op.drop_table('pathways')
