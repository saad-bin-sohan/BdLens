from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class TagResponse(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class EntityResponse(BaseModel):
    id: int
    name: str
    type: str

    class Config:
        from_attributes = True


class DocumentSourceResponse(BaseModel):
    id: int
    name: str
    base_url: str

    class Config:
        from_attributes = True


class DocumentSectionResponse(BaseModel):
    id: int
    order_index: int
    heading: Optional[str]
    text: str

    class Config:
        from_attributes = True


class DocumentListItem(BaseModel):
    id: int
    title: str
    content_type: str
    summary: Optional[str]
    crawled_at: datetime
    source: Optional[DocumentSourceResponse]
    tags: List[TagResponse]

    class Config:
        from_attributes = True


class DocumentDetail(BaseModel):
    id: int
    title: str
    content_text: str
    content_type: str
    url: Optional[str]
    published_at: Optional[datetime]
    crawled_at: datetime
    summary: Optional[str]
    explanation: Optional[str]
    language: Optional[str]
    created_at: datetime
    updated_at: datetime
    source: Optional[DocumentSourceResponse]
    tags: List[TagResponse]
    entities: List[EntityResponse]
    sections: List[DocumentSectionResponse]

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    title: str
    content_text: str
    content_type: str = "html"
    url: Optional[str] = None
    source_id: Optional[int] = None


class SearchResult(BaseModel):
    document_id: int
    document_title: str
    snippet: str
    score: float
    source: Optional[DocumentSourceResponse]
    tags: List[TagResponse]
    url: Optional[str]
