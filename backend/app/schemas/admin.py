from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentSourceCreate(BaseModel):
    name: str
    base_url: str
    url_pattern: Optional[str] = None
    is_enabled: bool = True


class DocumentSourceUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    url_pattern: Optional[str] = None
    is_enabled: Optional[bool] = None


class DocumentSourceResponse(BaseModel):
    id: int
    name: str
    base_url: str
    url_pattern: Optional[str]
    is_enabled: bool
    last_crawled_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class CrawlJobResponse(BaseModel):
    id: int
    source_id: int
    status: str
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsOverview(BaseModel):
    total_documents: int
    total_users: int
    total_sources: int
    top_viewed_documents: list
    top_search_queries: list
    recent_activity: list
