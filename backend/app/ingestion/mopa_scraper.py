"""
MOPA (Ministry of Public Administration) scraper implementation.
Source: https://mopa.gov.bd/site/view/notice
"""
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse, parse_qs
from app.ingestion.base import BaseScraper


class MOPAScraper(BaseScraper):
    """
    Scraper for Ministry of Public Administration notices.
    Handles table-based notice listings with PDF downloads.
    """

    def __init__(self, base_url: str, url_pattern: Optional[str] = None):
        super().__init__(base_url)
        self.url_pattern = url_pattern
        self.max_pages = 5  # Limit pagination to 5 pages

    def fetch_document_links(self) -> List[Dict[str, str]]:
        """
        Fetch all notice links from MOPA notices page.
        Supports pagination up to max_pages.
        Returns list of dicts with url, title, and type.
        """
        documents = []
        pages_to_fetch = [self.base_url]

        # Fetch first page to find pagination links
        html = self.fetch_page(self.base_url)
        if html:
            soup = self.parse_html(html)
            pagination_links = self._extract_pagination_links(soup)
            # Limit to max_pages
            pages_to_fetch.extend(pagination_links[:self.max_pages - 1])

        # Process each page
        for page_url in pages_to_fetch:
            html = self.fetch_page(page_url)
            if not html:
                continue

            soup = self.parse_html(html)
            page_documents = self._extract_documents_from_page(soup)
            documents.extend(page_documents)

        return documents

    def _extract_pagination_links(self, soup) -> List[str]:
        """Extract pagination links from the page."""
        pagination_links = []

        # Try common pagination selectors
        pager_selectors = [
            '.pager a',
            '.pagination a',
            'ul.pagination a',
            '.page-link',
            'a[rel="next"]'
        ]

        for selector in pager_selectors:
            pager_links = soup.select(selector)
            if pager_links:
                for link in pager_links:
                    href = link.get('href')
                    if href and not href.startswith('#'):
                        absolute_url = urljoin(self.base_url, href)
                        # Avoid duplicates
                        if absolute_url not in pagination_links and absolute_url != self.base_url:
                            pagination_links.append(absolute_url)
                break

        return pagination_links

    def _extract_documents_from_page(self, soup) -> List[Dict[str, str]]:
        """Extract document links from a single page."""
        documents = []

        # Find all tables on the page
        tables = soup.find_all('table')

        for table in tables:
            rows = table.find_all('tr')

            # Skip header row (first row usually contains column names)
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])

                if len(cells) < 2:
                    continue

                # Try to extract title and PDF link
                title = None
                pdf_url = None
                date = None

                # Common patterns:
                # Pattern 1: [Serial, Title, Date, Download]
                # Pattern 2: [Title, Date, Download]
                # Pattern 3: [Serial, Title, Download]

                # Look for PDF link in the row
                pdf_link = row.find('a', href=lambda x: x and '.pdf' in x.lower())

                if not pdf_link:
                    # Try to find any download link
                    for cell in cells:
                        link = cell.find('a', href=True)
                        if link and ('download' in link.get_text().lower() or
                                     'pdf' in link.get('href', '').lower()):
                            pdf_link = link
                            break

                if pdf_link:
                    pdf_url = urljoin(self.base_url, pdf_link['href'])

                # Extract title - usually in the second or first cell
                for i, cell in enumerate(cells):
                    cell_text = cell.get_text(strip=True)

                    # Skip serial numbers (usually just digits)
                    if cell_text.isdigit():
                        continue

                    # Skip cells with download/PDF text
                    if 'download' in cell_text.lower() or cell_text.lower() == 'pdf':
                        continue

                    # Check if this looks like a date
                    if self._looks_like_date(cell_text):
                        date = cell_text
                        continue

                    # This should be the title
                    if not title and len(cell_text) > 5:
                        title = cell_text

                # If we found a PDF URL, add it to documents
                if pdf_url and title:
                    documents.append({
                        'url': pdf_url,
                        'title': title,
                        'type': 'pdf'
                    })

        return documents

    def _looks_like_date(self, text: str) -> bool:
        """Check if text looks like a date."""
        # Common date patterns: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD
        import re
        date_patterns = [
            r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}',
            r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',
        ]

        for pattern in date_patterns:
            if re.search(pattern, text):
                return True

        return False

    def fetch_document_content(self, url: str) -> Dict[str, any]:
        """
        Fetch a single document.
        MOPA primarily serves PDFs, so this returns metadata only.
        """
        return self._fetch_pdf_content(url)

    def _fetch_pdf_content(self, url: str) -> Dict[str, any]:
        """
        Note: This method returns metadata only.
        Actual PDF processing happens in the ingestion service.
        """
        # Extract filename from URL
        filename = url.split('/')[-1]
        # Remove .pdf extension and clean up
        title = filename.replace('.pdf', '').replace('_', ' ').replace('-', ' ')

        return {
            'title': title,
            'url': url,
            'type': 'pdf',
            'text': None
        }
