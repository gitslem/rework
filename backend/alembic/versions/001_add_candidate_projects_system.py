"""Add candidate projects management system

Revision ID: 001_candidate_projects
Revises: e3da4ba29285
Create Date: 2025-11-26 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_candidate_projects'
down_revision: Union[str, Sequence[str], None] = 'e3da4ba29285'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add candidate projects, project updates, and project actions tables."""

    # Create enums
    candidate_project_status = postgresql.ENUM(
        'active', 'pending', 'completed', 'cancelled',
        name='candidate_project_status',
        create_type=False
    )
    candidate_project_status.create(op.get_bind(), checkfirst=True)

    project_action_status = postgresql.ENUM(
        'pending', 'in_progress', 'completed', 'cancelled',
        name='project_action_status',
        create_type=False
    )
    project_action_status.create(op.get_bind(), checkfirst=True)

    project_action_priority = postgresql.ENUM(
        'low', 'medium', 'high', 'urgent',
        name='project_action_priority',
        create_type=False
    )
    project_action_priority.create(op.get_bind(), checkfirst=True)

    # Create candidate_projects table
    op.create_table(
        'candidate_projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('platform', sa.String(), nullable=True),
        sa.Column('project_url', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('active', 'pending', 'completed', 'cancelled',
                                   name='candidate_project_status', create_type=False),
                 nullable=False, server_default='pending'),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('project_metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['candidate_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['agent_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_candidate_projects_id'), 'candidate_projects', ['id'], unique=False)

    # Create project_updates table
    op.create_table(
        'project_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.Integer(), nullable=False),
        sa.Column('week_number', sa.Integer(), nullable=True),
        sa.Column('update_title', sa.String(), nullable=False),
        sa.Column('update_content', sa.Text(), nullable=False),
        sa.Column('hours_completed', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('screen_sharing_hours', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('progress_percentage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('blockers', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('concerns', sa.Text(), nullable=True),
        sa.Column('next_steps', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('attachments', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('update_metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['candidate_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_updates_id'), 'project_updates', ['id'], unique=False)

    # Create project_actions table
    op.create_table(
        'project_actions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('assigned_to_candidate', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('assigned_to_agent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('action_type', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'cancelled',
                                   name='project_action_status', create_type=False),
                 nullable=False, server_default='pending'),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', 'urgent',
                                     name='project_action_priority', create_type=False),
                 nullable=False, server_default='medium'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('platform', sa.String(), nullable=True),
        sa.Column('platform_url', sa.String(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completion_notes', sa.Text(), nullable=True),
        sa.Column('attachments', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('action_metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['candidate_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_actions_id'), 'project_actions', ['id'], unique=False)


def downgrade() -> None:
    """Remove candidate projects tables."""

    # Drop tables
    op.drop_index(op.f('ix_project_actions_id'), table_name='project_actions')
    op.drop_table('project_actions')

    op.drop_index(op.f('ix_project_updates_id'), table_name='project_updates')
    op.drop_table('project_updates')

    op.drop_index(op.f('ix_candidate_projects_id'), table_name='candidate_projects')
    op.drop_table('candidate_projects')

    # Drop enums
    postgresql.ENUM(name='candidate_project_status').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='project_action_status').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='project_action_priority').drop(op.get_bind(), checkfirst=True)
