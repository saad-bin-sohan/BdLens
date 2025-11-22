from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional

from app.db.base import get_db
from app.models.user import User
from app.models.analytics_event import AnalyticsEvent
from app.models.document import DocumentSection, Document
from app.schemas.document import SearchResult
from app.auth.dependencies import get_current_user
from app.services.ai_provider import ai_provider

router = APIRouter()


@router.get("/search", response_model=List[SearchResult])
async def search_documents(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    tag: Optional[str] = None,
    source_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Semantic search for documents using embeddings.
    Returns relevant document sections ranked by similarity.
    """

    # Log search analytics
    event = AnalyticsEvent(
        user_id=current_user.id,
        type="search_query",
        payload={"query": q}
    )
    db.add(event)
    db.commit()

    # Generate query embedding
    query_embedding = ai_provider.embed_query(q)

    # Convert embedding to PostgreSQL vector format
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    # Build base query for similarity search
    # Using cosine distance (1 - cosine_similarity)
    similarity_query = text("""
        SELECT
            ds.id as section_id,
            ds.document_id,
            ds.text as snippet,
            d.title,
            d.url,
            d.source_id,
            1 - (ds.embedding <=> :query_embedding::vector) as score
        FROM document_sections ds
        JOIN documents d ON ds.document_id = d.id
        WHERE ds.embedding IS NOT NULL
    """)

    # Add filters if provided
    if tag:
        from app.models.tag import Tag
        tag_obj = db.query(Tag).filter(Tag.slug == tag).first()
        if tag_obj:
            similarity_query = text("""
                SELECT
                    ds.id as section_id,
                    ds.document_id,
                    ds.text as snippet,
                    d.title,
                    d.url,
                    d.source_id,
                    1 - (ds.embedding <=> :query_embedding::vector) as score
                FROM document_sections ds
                JOIN documents d ON ds.document_id = d.id
                JOIN document_tags dt ON d.id = dt.document_id
                WHERE ds.embedding IS NOT NULL
                AND dt.tag_id = :tag_id
            """)

    if source_id:
        similarity_query = text("""
            SELECT
                ds.id as section_id,
                ds.document_id,
                ds.text as snippet,
                d.title,
                d.url,
                d.source_id,
                1 - (ds.embedding <=> :query_embedding::vector) as score
            FROM document_sections ds
            JOIN documents d ON ds.document_id = d.id
            WHERE ds.embedding IS NOT NULL
            AND d.source_id = :source_id
        """)

    # Add ordering and limit
    final_query = text(str(similarity_query) + """
        ORDER BY score DESC
        LIMIT :limit
    """)

    # Execute query
    params = {"query_embedding": embedding_str, "limit": limit}
    if tag:
        from app.models.tag import Tag
        tag_obj = db.query(Tag).filter(Tag.slug == tag).first()
        if tag_obj:
            params["tag_id"] = tag_obj.id
    if source_id:
        params["source_id"] = source_id

    results = db.execute(final_query, params).fetchall()

    # Format results
    search_results = []
    seen_documents = set()

    for row in results:
        # Get document details
        document = db.query(Document).filter(Document.id == row.document_id).first()

        if not document or document.id in seen_documents:
            continue

        seen_documents.add(document.id)

        search_results.append(SearchResult(
            document_id=document.id,
            document_title=document.title,
            snippet=row.snippet[:300] + "..." if len(row.snippet) > 300 else row.snippet,
            score=float(row.score),
            source=document.source,
            tags=document.tags,
            url=document.url
        ))

    return search_results
