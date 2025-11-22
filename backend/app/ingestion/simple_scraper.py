"""
Simple scraper implementation for generic government websites.
This serves as an example and can be configured for different sources.
"""
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import re
from app.ingestion.base import BaseScraper


class SimpleScraper(BaseScraper):
    """
    A configurable scraper for simple government websites.
    Looks for PDF links and HTML pages matching certain patterns.
    """

    def __init__(self, base_url: str, url_pattern: Optional[str] = None):
        super().__init__(base_url)
        self.url_pattern = url_pattern

    def fetch_document_links(self) -> List[Dict[str, str]]:
        """
        Crawl the base URL and find all document links.
        Returns list of dicts with url, title, and type.
        """
        documents = []

        # Fetch the index page
        html = self.fetch_page(self.base_url)
        if not html:
            return documents

        soup = self.parse_html(html)

        # Find all links
        for link in soup.find_all('a', href=True):
            href = link['href']
            absolute_url = urljoin(self.base_url, href)

            # Get link text as potential title
            title = link.get_text(strip=True) or "Untitled"

            # Check if it's a PDF
            if href.lower().endswith('.pdf'):
                documents.append({
                    'url': absolute_url,
                    'title': title,
                    'type': 'pdf'
                })

            # Check if it matches the URL pattern (for HTML pages)
            elif self.url_pattern:
                if re.search(self.url_pattern, absolute_url):
                    documents.append({
                        'url': absolute_url,
                        'title': title,
                        'type': 'html'
                    })

            # Otherwise, if it's from the same domain and looks like a content page
            elif urlparse(absolute_url).netloc == urlparse(self.base_url).netloc:
                # Simple heuristic: if URL has path depth > 1, might be content
                path = urlparse(absolute_url).path
                if path.count('/') > 1 and not href.startswith('#'):
                    documents.append({
                        'url': absolute_url,
                        'title': title,
                        'type': 'html'
                    })

        return documents

    def fetch_document_content(self, url: str) -> Dict[str, any]:
        """
        Fetch a single document and extract its content.
        Returns a dict with title, text, and metadata.
        """
        if url.lower().endswith('.pdf'):
            return self._fetch_pdf_content(url)
        else:
            return self._fetch_html_content(url)

    def _fetch_html_content(self, url: str) -> Dict[str, any]:
        """Extract content from an HTML page."""
        html = self.fetch_page(url)
        if not html:
            return None

        soup = self.parse_html(html)

        # Try to find the main content
        # This is a simple heuristic; adjust based on target website structure
        main_content = None

        # Try common content containers
        for selector in ['main', 'article', '.content', '#content', '.main-content']:
            main_content = soup.select_one(selector)
            if main_content:
                break

        # Fallback to body
        if not main_content:
            main_content = soup.body

        # Extract text
        if main_content:
            # Remove script and style elements
            for script in main_content(["script", "style"]):
                script.decompose()

            text = main_content.get_text(separator='\n', strip=True)
        else:
            text = ""

        # Try to get title
        title_tag = soup.find('title')
        h1_tag = soup.find('h1')
        title = (title_tag.get_text(strip=True) if title_tag
                 else h1_tag.get_text(strip=True) if h1_tag
                 else "Untitled Document")

        return {
            'title': title,
            'text': text,
            'url': url,
            'type': 'html'
        }

    def _fetch_pdf_content(self, url: str) -> Dict[str, any]:
        """
        Note: This method returns metadata only.
        Actual PDF processing happens in the ingestion service
        after downloading the file.
        """
        return {
            'title': url.split('/')[-1].replace('.pdf', ''),
            'url': url,
            'type': 'pdf',
            'text': None  # Will be extracted after download
        }
