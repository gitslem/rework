"""add email notification preferences

Revision ID: 002_email_prefs
Revises: 001_add_candidate_projects_system
Create Date: 2024-12-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_email_prefs'
down_revision: Union[str, None] = '001_add_candidate_projects_system'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add email_notifications column to profiles table"""

    # Add email_notifications column with default preferences
    op.add_column(
        'profiles',
        sa.Column(
            'email_notifications',
            sa.JSON(),
            nullable=True,
            server_default=sa.text("'{\"project_created\": true, \"project_updated\": true, \"project_status_changed\": true, \"new_messages\": true, \"payment_updates\": true, \"weekly_summary\": true}'")
        )
    )

    # Update existing rows to have default notification preferences
    op.execute("""
        UPDATE profiles
        SET email_notifications = '{
            "project_created": true,
            "project_updated": true,
            "project_status_changed": true,
            "new_messages": true,
            "payment_updates": true,
            "weekly_summary": true
        }'::json
        WHERE email_notifications IS NULL
    """)


def downgrade() -> None:
    """Remove email_notifications column from profiles table"""
    op.drop_column('profiles', 'email_notifications')
