from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class DocumentSource(Base):
    __tablename__ = "document_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    base_url = Column(String, nullable=False)
    url_pattern = Column(String, nullable=True)  # Optional regex/pattern for filtering
    scraper_type = Column(String, default="simple", nullable=False)  # simple, dncc, mopa
    is_enabled = Column(Boolean, default=True, nullable=False)
    last_crawled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="source")
    crawl_jobs = relationship("CrawlJob", back_populates="source")
