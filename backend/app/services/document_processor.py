"""
Document processing service.
Coordinates PDF extraction, AI analysis, and database storage.
"""
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import os
from datetime import datetime

from app.models.document import Document, DocumentSection
from app.models.tag import Tag
from app.models.entity import Entity
from app.services.ai_provider import ai_provider
from app.services.pdf_extractor import pdf_extractor


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


class DocumentProcessor:
    """Process and enrich documents with AI analysis."""

    def __init__(self, db: Session):
        self.db = db

    def process_text_document(
        self,
        title: str,
        content_text: str,
        content_type: str = "html",
        url: Optional[str] = None,
        source_id: Optional[int] = None,
        file_path: Optional[str] = None
    ) -> Document:
        """
        Process a text document (HTML or extracted PDF text).
        Creates document, sections, generates AI summaries/tags/entities/embeddings.
        """

        # Create the document record
        document = Document(
            title=title,
            content_text=content_text,
            content_type=content_type,
            url=url,
            source_id=source_id,
            original_file_path=file_path,
            crawled_at=datetime.utcnow()
        )

        self.db.add(document)
        self.db.flush()  # Get document ID

        # Generate AI content
        try:
            # Summary and explanation
            document.summary = ai_provider.generate_summary(content_text)
            document.explanation = ai_provider.generate_explanation(content_text)

            # Tags
            tag_names = ai_provider.classify_tags(content_text)
            for tag_name in tag_names:
                tag = self._get_or_create_tag(tag_name)
                if tag not in document.tags:
                    document.tags.append(tag)

            # Entities
            entities_data = ai_provider.extract_entities(content_text)
            for entity_data in entities_data:
                entity = self._get_or_create_entity(
                    entity_data.get('name', ''),
                    entity_data.get('type', 'unknown')
                )
                if entity and entity not in document.entities:
                    document.entities.append(entity)

        except Exception as e:
            print(f"Error in AI processing: {e}")

        # Create sections with embeddings
        self._create_sections(document, content_text)

        self.db.commit()
        self.db.refresh(document)

        return document

    def process_pdf_file(
        self,
        file_path: str,
        title: Optional[str] = None,
        source_id: Optional[int] = None,
        url: Optional[str] = None
    ) -> Document:
        """
        Process a PDF file: extract text, analyze with AI, store in database.
        """

        # Extract text
        content_text = pdf_extractor.extract_text(file_path)

        if not content_text or not content_text.strip():
            raise ValueError("Could not extract text from PDF")

        # Get title from metadata if not provided
        if not title:
            metadata = pdf_extractor.get_metadata(file_path)
            title = metadata.get('title') or os.path.basename(file_path)

        # Process as text document
        return self.process_text_document(
            title=title,
            content_text=content_text,
            content_type="pdf",
            url=url,
            source_id=source_id,
            file_path=file_path
        )

    def regenerate_summary(self, document_id: int) -> Document:
        """Regenerate summary and explanation for a document."""
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")

        document.summary = ai_provider.generate_summary(document.content_text)
        document.explanation = ai_provider.generate_explanation(document.content_text)
        document.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(document)

        return document

    def _create_sections(self, document: Document, content_text: str):
        """
        Split document into sections and generate embeddings.
        For simplicity, we split into chunks of ~800 characters.
        """
        chunk_size = 800
        overlap = 100

        sections = []
        start = 0
        order_index = 0

        while start < len(content_text):
            end = start + chunk_size
            chunk = content_text[start:end]

            if chunk.strip():
                # Generate embedding
                embedding = ai_provider.embed_text(chunk)

                section = DocumentSection(
                    document_id=document.id,
                    order_index=order_index,
                    heading=None,  # Could extract headings with more sophisticated parsing
                    text=chunk,
                    embedding=embedding
                )
                sections.append(section)
                order_index += 1

            start = end - overlap  # Overlap to avoid splitting important context

        self.db.add_all(sections)

    def _get_or_create_tag(self, tag_name: str) -> Tag:
        """Get existing tag or create new one."""
        tag_slug = slugify(tag_name)

        tag = self.db.query(Tag).filter(Tag.slug == tag_slug).first()
        if not tag:
            tag = Tag(name=tag_name, slug=tag_slug)
            self.db.add(tag)
            self.db.flush()

        return tag

    def _get_or_create_entity(self, name: str, entity_type: str) -> Optional[Entity]:
        """Get existing entity or create new one."""
        if not name or not name.strip():
            return None

        entity = self.db.query(Entity).filter(
            Entity.name == name,
            Entity.type == entity_type
        ).first()

        if not entity:
            entity = Entity(name=name, type=entity_type)
            self.db.add(entity)
            self.db.flush()

        return entity
