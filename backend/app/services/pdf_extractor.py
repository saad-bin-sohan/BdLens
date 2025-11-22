"""
PDF text extraction service.
Uses pdfplumber as primary method with PyPDF2 as fallback.
"""
import pdfplumber
from PyPDF2 import PdfReader
from typing import List, Dict
import os


class PDFExtractor:
    """Extract text and metadata from PDF files."""

    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extract all text from a PDF file.
        Returns the full text content.
        """
        try:
            # Try pdfplumber first (better at preserving layout)
            with pdfplumber.open(file_path) as pdf:
                text_parts = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)

                full_text = "\n\n".join(text_parts)
                if full_text.strip():
                    return full_text

        except Exception as e:
            print(f"pdfplumber failed, trying PyPDF2: {e}")

        try:
            # Fallback to PyPDF2
            reader = PdfReader(file_path)
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

            return "\n\n".join(text_parts)

        except Exception as e:
            print(f"PyPDF2 also failed: {e}")
            return ""

    @staticmethod
    def extract_sections(file_path: str, chunk_size: int = 1000) -> List[Dict[str, any]]:
        """
        Extract text and split into sections/chunks.
        Returns a list of section dicts with 'heading' and 'text'.

        For simplicity, we'll split by page or by character chunks.
        More sophisticated splitting could be added later.
        """
        try:
            sections = []
            with pdfplumber.open(file_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        # Split long pages into chunks
                        if len(page_text) > chunk_size:
                            chunks = [page_text[j:j+chunk_size]
                                      for j in range(0, len(page_text), chunk_size)]
                            for k, chunk in enumerate(chunks):
                                sections.append({
                                    "heading": f"Page {i+1} Part {k+1}",
                                    "text": chunk
                                })
                        else:
                            sections.append({
                                "heading": f"Page {i+1}",
                                "text": page_text
                            })

            return sections

        except Exception as e:
            print(f"Error extracting sections: {e}")
            # Fallback: return entire text as one section
            full_text = PDFExtractor.extract_text(file_path)
            if full_text:
                return [{"heading": None, "text": full_text}]
            return []

    @staticmethod
    def get_metadata(file_path: str) -> Dict[str, any]:
        """Extract metadata from PDF."""
        try:
            reader = PdfReader(file_path)
            metadata = reader.metadata

            return {
                "title": metadata.get("/Title", None) if metadata else None,
                "author": metadata.get("/Author", None) if metadata else None,
                "subject": metadata.get("/Subject", None) if metadata else None,
                "creator": metadata.get("/Creator", None) if metadata else None,
                "num_pages": len(reader.pages)
            }
        except Exception as e:
            print(f"Error extracting metadata: {e}")
            return {"num_pages": 0}


# Singleton instance
pdf_extractor = PDFExtractor()
