from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime

from app.db.base import get_db
from app.models.document import Document
from app.models.user import User
from app.models.analytics_event import AnalyticsEvent
from app.schemas.document import DocumentListItem, DocumentDetail, TagResponse
from app.auth.dependencies import get_current_user, get_current_user_optional, get_current_admin_user
from app.services.document_processor import DocumentProcessor

router = APIRouter()


@router.get("", response_model=List[DocumentListItem])
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tag: Optional[str] = None,
    source_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List documents with optional filters."""
    query = db.query(Document)

    # Filter by tag
    if tag:
        from app.models.tag import Tag
        tag_obj = db.query(Tag).filter(Tag.slug == tag).first()
        if tag_obj:
            query = query.filter(Document.tags.contains(tag_obj))

    # Filter by source
    if source_id:
        query = query.filter(Document.source_id == source_id)

    # Simple text search on title and summary
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Document.title.ilike(search_pattern),
                Document.summary.ilike(search_pattern),
                Document.content_text.ilike(search_pattern)
            )
        )

    # Order by most recent first
    query = query.order_by(Document.crawled_at.desc())

    # Paginate
    documents = query.offset(skip).limit(limit).all()

    return documents


@router.get("/{document_id}", response_model=DocumentDetail)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed document information."""
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Log page view analytics
    event = AnalyticsEvent(
        user_id=current_user.id,
        type="page_view",
        payload={"document_id": document_id}
    )
    db.add(event)
    db.commit()

    return document


@router.post("/{document_id}/regenerate-summary", response_model=DocumentDetail)
async def regenerate_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Regenerate AI summary and explanation for a document (admin only)."""
    processor = DocumentProcessor(db)

    try:
        document = processor.regenerate_summary(document_id)
        return document
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error regenerating summary: {str(e)}")


@router.get("/tags/list", response_model=List[TagResponse])
async def list_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available tags."""
    from app.models.tag import Tag
    tags = db.query(Tag).order_by(Tag.name).all()
    return tags
