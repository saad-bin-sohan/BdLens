"""add scraper_type to document_sources

Revision ID: 20251122_0001
Revises: 20250121_0001
Create Date: 2025-11-22 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '20251122_0001'
down_revision: Union[str, None] = '20250121_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add scraper_type column to document_sources table
    op.add_column(
        'document_sources',
        sa.Column('scraper_type', sa.String(), nullable=False, server_default='simple')
    )


def downgrade() -> None:
    # Remove scraper_type column
    op.drop_column('document_sources', 'scraper_type')
