from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("document_sources.id"), nullable=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)  # Nullable for uploaded PDFs
    original_file_path = Column(String, nullable=True)  # For uploaded PDFs
    content_text = Column(Text, nullable=False)
    content_type = Column(String, nullable=False)  # 'html' or 'pdf'
    published_at = Column(DateTime, nullable=True)
    crawled_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    summary = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    language = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    source = relationship("DocumentSource", back_populates="documents")
    sections = relationship("DocumentSection", back_populates="document", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="document_tags", back_populates="documents")
    entities = relationship("Entity", secondary="document_entities", back_populates="documents")


class DocumentSection(Base):
    __tablename__ = "document_sections"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    heading = Column(String, nullable=True)
    text = Column(Text, nullable=False)
    # Vector embedding - using pgvector
    # Will add this column in migration with: embedding = Column(Vector(768))

    # Relationships
    document = relationship("Document", back_populates="sections")
