from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.base import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # Nullable for anonymous events
    type = Column(String, nullable=False, index=True)  # 'page_view', 'search_query', etc.
    payload = Column(JSON, nullable=True)  # Flexible JSON data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
