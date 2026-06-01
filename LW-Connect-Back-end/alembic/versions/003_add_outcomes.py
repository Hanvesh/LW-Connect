"""Add outcomes tracking tables

Revision ID: 003_add_outcomes
Revises: 002_add_notifications
Create Date: 2026-06-01 12:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_add_outcomes'
down_revision = '002_add_notifications'
branch_labels = None
depends_on = None


def upgrade():
    # Create skill_assessments table
    op.create_table('skill_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('skill_name', sa.String(length=255), nullable=False),
        sa.Column('assessment_type', sa.Enum('PRE_ASSESSMENT', 'POST_ASSESSMENT', 'ONGOING', name='assessmenttype'), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('assessment_date', sa.DateTime(), nullable=True),
        sa.Column('pathway_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pathway_id'], ['pathways.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_skill_assessments_user_id', 'skill_assessments', ['user_id'])
    
    # Create learning_outcomes table
    op.create_table('learning_outcomes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pathway_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('outcome_type', sa.Enum('SKILL_ASSESSMENT', 'LEARNING_OUTCOME', 'CAREER_PROGRESSION', 'PROGRAM_COMPLETION', name='outcometype'), nullable=False),
        sa.Column('metric_name', sa.String(length=255), nullable=False),
        sa.Column('baseline_value', sa.Float(), nullable=True),
        sa.Column('current_value', sa.Float(), nullable=True),
        sa.Column('target_value', sa.Float(), nullable=True),
        sa.Column('improvement_percentage', sa.Float(), nullable=True),
        sa.Column('achieved_at', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['pathway_id'], ['pathways.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_learning_outcomes_user_id', 'learning_outcomes', ['user_id'])
    
    # Create career_progressions table
    op.create_table('career_progressions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('previous_value', sa.String(length=255), nullable=True),
        sa.Column('new_value', sa.String(length=255), nullable=True),
        sa.Column('event_date', sa.DateTime(), nullable=False),
        sa.Column('attributed_to_program', sa.String(length=255), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create program_metrics table
    op.create_table('program_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cohort_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('pathway_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('metric_name', sa.String(length=255), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('calculation_date', sa.DateTime(), nullable=True),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['cohort_id'], ['cohorts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['pathway_id'], ['pathways.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create roi_calculations table
    op.create_table('roi_calculations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cohort_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('program_cost', sa.Float(), nullable=False),
        sa.Column('productivity_gain', sa.Float(), nullable=True),
        sa.Column('cost_savings', sa.Float(), nullable=True),
        sa.Column('revenue_impact', sa.Float(), nullable=True),
        sa.Column('total_benefit', sa.Float(), nullable=False),
        sa.Column('roi_percentage', sa.Float(), nullable=False),
        sa.Column('calculation_date', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['cohort_id'], ['cohorts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('roi_calculations')
    op.drop_table('program_metrics')
    op.drop_table('career_progressions')
    op.drop_index('ix_learning_outcomes_user_id', table_name='learning_outcomes')
    op.drop_table('learning_outcomes')
    op.drop_index('ix_skill_assessments_user_id', table_name='skill_assessments')
    op.drop_table('skill_assessments')
    op.execute('DROP TYPE outcometype')
    op.execute('DROP TYPE assessmenttype')
