"""initial schema

Revision ID: 20250121_0001
Revises:
Create Date: 2025-01-21 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '20250121_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create document_sources table
    op.create_table(
        'document_sources',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('base_url', sa.String(), nullable=False),
        sa.Column('url_pattern', sa.String(), nullable=True),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_crawled_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )

    # Create documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('source_id', sa.Integer(), sa.ForeignKey('document_sources.id'), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('original_file_path', sa.String(), nullable=True),
        sa.Column('content_text', sa.Text(), nullable=False),
        sa.Column('content_type', sa.String(), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('crawled_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_documents_source_id', 'documents', ['source_id'])
    op.create_index('ix_documents_crawled_at', 'documents', ['crawled_at'])

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
    )
    op.create_index('ix_tags_name', 'tags', ['name'], unique=True)
    op.create_index('ix_tags_slug', 'tags', ['slug'], unique=True)

    # Create entities table
    op.create_table(
        'entities',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
    )
    op.create_index('ix_entities_name_type', 'entities', ['name', 'type'])

    # Create document_tags association table
    op.create_table(
        'document_tags',
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id'), primary_key=True),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id'), primary_key=True),
    )

    # Create document_entities association table
    op.create_table(
        'document_entities',
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id'), primary_key=True),
        sa.Column('entity_id', sa.Integer(), sa.ForeignKey('entities.id'), primary_key=True),
    )

    # Create document_sections table with vector embeddings
    op.create_table(
        'document_sections',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id'), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('heading', sa.String(), nullable=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(768), nullable=True),  # 768 dimensions for Gemini embeddings
    )
    op.create_index('ix_document_sections_document_id', 'document_sections', ['document_id'])

    # Create vector index for similarity search (using cosine distance)
    op.execute("""
        CREATE INDEX document_sections_embedding_idx
        ON document_sections
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
    """)

    # Create crawl_jobs table
    op.create_table(
        'crawl_jobs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('source_id', sa.Integer(), sa.ForeignKey('document_sources.id'), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_crawl_jobs_source_id', 'crawl_jobs', ['source_id'])
    op.create_index('ix_crawl_jobs_status', 'crawl_jobs', ['status'])

    # Create analytics_events table
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('payload', JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_analytics_events_type', 'analytics_events', ['type'])
    op.create_index('ix_analytics_events_created_at', 'analytics_events', ['created_at'])


def downgrade() -> None:
    op.drop_table('analytics_events')
    op.drop_table('crawl_jobs')
    op.drop_table('document_sections')
    op.drop_table('document_entities')
    op.drop_table('document_tags')
    op.drop_table('entities')
    op.drop_table('tags')
    op.drop_table('documents')
    op.drop_table('document_sources')
    op.drop_table('users')
    op.execute("DROP EXTENSION IF EXISTS vector")
