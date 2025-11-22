"""
Base scraper class for document ingestion.
Provides common methods for fetching and processing documents.
"""
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from abc import ABC, abstractmethod


class BaseScraper(ABC):
    """Base class for website scrapers."""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.Client(timeout=30.0, follow_redirects=True)

    def fetch_page(self, url: str) -> Optional[str]:
        """Fetch HTML content from a URL."""
        try:
            response = self.client.get(url)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def fetch_pdf(self, url: str, save_path: str) -> bool:
        """Download a PDF file to the specified path."""
        try:
            response = self.client.get(url)
            response.raise_for_status()

            with open(save_path, 'wb') as f:
                f.write(response.content)

            return True
        except Exception as e:
            print(f"Error downloading PDF from {url}: {e}")
            return False

    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content with BeautifulSoup."""
        return BeautifulSoup(html, 'lxml')

    @abstractmethod
    def fetch_document_links(self) -> List[Dict[str, str]]:
        """
        Fetch all document links from the source.
        Should return a list of dicts with 'url', 'title', and 'type' keys.
        Must be implemented by subclasses.
        """
        pass

    @abstractmethod
    def fetch_document_content(self, url: str) -> Dict[str, any]:
        """
        Fetch and process a single document.
        Should return a dict with document data.
        Must be implemented by subclasses.
        """
        pass

    def close(self):
        """Close the HTTP client."""
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
