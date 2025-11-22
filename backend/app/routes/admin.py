from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import os
import uuid

from app.db.base import get_db
from app.models.document_source import DocumentSource
from app.models.crawl_job import CrawlJob
from app.models.document import Document
from app.models.user import User
from app.models.analytics_event import AnalyticsEvent
from app.schemas.admin import (
    DocumentSourceCreate,
    DocumentSourceUpdate,
    DocumentSourceResponse,
    CrawlJobResponse,
    AnalyticsOverview
)
from app.schemas.document import DocumentDetail
from app.auth.dependencies import get_current_admin_user
from app.services.document_processor import DocumentProcessor
from app.ingestion import get_scraper_for_source
from app.config import settings

router = APIRouter()


# ===== DOCUMENT SOURCES =====

@router.get("/sources", response_model=List[DocumentSourceResponse])
async def list_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all document sources."""
    sources = db.query(DocumentSource).order_by(DocumentSource.created_at.desc()).all()
    return sources


@router.post("/sources", response_model=DocumentSourceResponse, status_code=201)
async def create_source(
    source_data: DocumentSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new document source."""
    source = DocumentSource(**source_data.dict())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.put("/sources/{source_id}", response_model=DocumentSourceResponse)
async def update_source(
    source_id: int,
    source_data: DocumentSourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a document source."""
    source = db.query(DocumentSource).filter(DocumentSource.id == source_id).first()

    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    # Update fields
    update_data = source_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)

    db.commit()
    db.refresh(source)
    return source


@router.post("/sources/{source_id}/crawl", response_model=CrawlJobResponse)
async def trigger_crawl(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Trigger a crawl job for a source."""
    source = db.query(DocumentSource).filter(DocumentSource.id == source_id).first()

    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    if not source.is_enabled:
        raise HTTPException(status_code=400, detail="Source is disabled")

    # Create crawl job
    job = CrawlJob(
        source_id=source_id,
        status="pending",
        started_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Execute crawl (synchronous for now; could be async with background tasks)
    try:
        job.status = "running"
        db.commit()

        # Use dynamic scraper based on source.scraper_type
        scraper = get_scraper_for_source(source)
        processor = DocumentProcessor(db)

        documents_created = 0

        # Fetch document links
        doc_links = scraper.fetch_document_links()

        for doc_link in doc_links[:10]:  # Limit to 10 docs per crawl for free tier
            try:
                # Check if document already exists
                existing = db.query(Document).filter(Document.url == doc_link['url']).first()
                if existing:
                    continue

                # Fetch content
                doc_data = scraper.fetch_document_content(doc_link['url'])

                if not doc_data:
                    continue

                # Process PDF or HTML
                if doc_data['type'] == 'pdf':
                    # Download PDF
                    upload_dir = settings.upload_dir
                    os.makedirs(upload_dir, exist_ok=True)
                    filename = f"{uuid.uuid4()}.pdf"
                    file_path = os.path.join(upload_dir, filename)

                    if scraper.fetch_pdf(doc_data['url'], file_path):
                        processor.process_pdf_file(
                            file_path=file_path,
                            title=doc_data['title'],
                            source_id=source_id,
                            url=doc_data['url']
                        )
                        documents_created += 1

                else:  # HTML
                    if doc_data.get('text'):
                        processor.process_text_document(
                            title=doc_data['title'],
                            content_text=doc_data['text'],
                            content_type='html',
                            url=doc_data['url'],
                            source_id=source_id
                        )
                        documents_created += 1

                        # Process any PDF attachments found in HTML content
                        if doc_data.get('pdf_links'):
                            for pdf_url in doc_data['pdf_links']:
                                try:
                                    # Check if PDF already exists
                                    existing_pdf = db.query(Document).filter(Document.url == pdf_url).first()
                                    if existing_pdf:
                                        continue

                                    # Download and process PDF
                                    upload_dir = settings.upload_dir
                                    os.makedirs(upload_dir, exist_ok=True)
                                    filename = f"{uuid.uuid4()}.pdf"
                                    file_path = os.path.join(upload_dir, filename)

                                    if scraper.fetch_pdf(pdf_url, file_path):
                                        processor.process_pdf_file(
                                            file_path=file_path,
                                            title=f"{doc_data['title']} - Attachment",
                                            source_id=source_id,
                                            url=pdf_url
                                        )
                                        documents_created += 1
                                except Exception as pdf_error:
                                    print(f"Error processing PDF attachment {pdf_url}: {pdf_error}")
                                    continue

            except Exception as e:
                print(f"Error processing document {doc_link['url']}: {e}")
                continue

        scraper.close()

        # Update job status
        job.status = "success"
        job.finished_at = datetime.utcnow()
        source.last_crawled_at = datetime.utcnow()

        db.commit()
        db.refresh(job)

    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        job.finished_at = datetime.utcnow()
        db.commit()
        db.refresh(job)

    return job


@router.get("/crawl-jobs", response_model=List[CrawlJobResponse])
async def list_crawl_jobs(
    source_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List crawl jobs."""
    query = db.query(CrawlJob)

    if source_id:
        query = query.filter(CrawlJob.source_id == source_id)

    jobs = query.order_by(CrawlJob.created_at.desc()).limit(limit).all()
    return jobs


# ===== DOCUMENT UPLOAD =====

@router.post("/documents/upload", response_model=DocumentDetail)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    source_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a PDF document manually."""

    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Save file
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, 'wb') as f:
        content = await file.read()
        f.write(content)

    # Process PDF
    processor = DocumentProcessor(db)

    try:
        document = processor.process_pdf_file(
            file_path=file_path,
            title=title or file.filename,
            source_id=source_id
        )
        return document

    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


# ===== ANALYTICS =====

@router.get("/analytics/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get analytics overview."""

    # Total counts
    total_documents = db.query(func.count(Document.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_sources = db.query(func.count(DocumentSource.id)).scalar()

    # Top viewed documents
    top_views_query = db.query(
        AnalyticsEvent.payload['document_id'].astext.label('doc_id'),
        func.count().label('views')
    ).filter(
        AnalyticsEvent.type == 'page_view'
    ).group_by(
        AnalyticsEvent.payload['document_id'].astext
    ).order_by(
        func.count().desc()
    ).limit(5).all()

    top_viewed_documents = []
    for row in top_views_query:
        doc = db.query(Document).filter(Document.id == int(row.doc_id)).first()
        if doc:
            top_viewed_documents.append({
                "id": doc.id,
                "title": doc.title,
                "views": row.views
            })

    # Top search queries
    top_searches_query = db.query(
        AnalyticsEvent.payload['query'].astext.label('query'),
        func.count().label('count')
    ).filter(
        AnalyticsEvent.type == 'search_query'
    ).group_by(
        AnalyticsEvent.payload['query'].astext
    ).order_by(
        func.count().desc()
    ).limit(5).all()

    top_search_queries = [
        {"query": row.query, "count": row.count}
        for row in top_searches_query
    ]

    # Recent activity
    recent_events = db.query(AnalyticsEvent).order_by(
        AnalyticsEvent.created_at.desc()
    ).limit(10).all()

    recent_activity = [
        {
            "type": event.type,
            "payload": event.payload,
            "created_at": event.created_at.isoformat()
        }
        for event in recent_events
    ]

    return AnalyticsOverview(
        total_documents=total_documents,
        total_users=total_users,
        total_sources=total_sources,
        top_viewed_documents=top_viewed_documents,
        top_search_queries=top_search_queries,
        recent_activity=recent_activity
    )
