"""Add github_username and huggingface_username to profiles

Revision ID: e3da4ba29285
Revises:
Create Date: 2025-11-12 16:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3da4ba29285'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing columns to profiles table."""
    # Check if columns exist before adding (to avoid errors if already added)
    conn = op.get_bind()

    # Add github_username column if it doesn't exist
    try:
        op.add_column('profiles', sa.Column('github_username', sa.String(), nullable=True))
    except Exception as e:
        print(f"github_username column may already exist: {e}")

    # Add huggingface_username column if it doesn't exist
    try:
        op.add_column('profiles', sa.Column('huggingface_username', sa.String(), nullable=True))
    except Exception as e:
        print(f"huggingface_username column may already exist: {e}")


def downgrade() -> None:
    """Remove the added columns."""
    op.drop_column('profiles', 'huggingface_username')
    op.drop_column('profiles', 'github_username')
