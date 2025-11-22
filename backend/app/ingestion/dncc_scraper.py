"""
DNCC (Dhaka North City Corporation) scraper implementation.
Source: https://dncc.gov.bd/notices
"""
from typing import List, Dict, Optional
from urllib.parse import urljoin
from app.ingestion.base import BaseScraper


class DNCCScraper(BaseScraper):
    """
    Scraper for Dhaka North City Corporation notices.
    Handles HTML notice pages with potential PDF attachments.
    """

    def __init__(self, base_url: str, url_pattern: Optional[str] = None):
        super().__init__(base_url)
        self.url_pattern = url_pattern

    def fetch_document_links(self) -> List[Dict[str, str]]:
        """
        Fetch all notice links from DNCC notices page.
        Returns list of dicts with url, title, and type.
        """
        documents = []

        # Fetch the notices page
        html = self.fetch_page(self.base_url)
        if not html:
            return documents

        soup = self.parse_html(html)

        # Find notice cards - DNCC uses various card/list structures
        # Try multiple selectors to find notice cards
        card_selectors = [
            '.notice-card',
            '.notice-item',
            '.card',
            'article',
            '.node-notice',
            '.view-content .views-row',
            'tbody tr'  # Table-based layout
        ]

        cards = []
        for selector in card_selectors:
            cards = soup.select(selector)
            if cards:
                break

        # If no cards found, try finding all links in a content area
        if not cards:
            content_area = soup.select_one('.content, .main-content, #content')
            if content_area:
                # Find all links that look like notices
                for link in content_area.find_all('a', href=True):
                    href = link['href']
                    if not href or href.startswith('#'):
                        continue

                    absolute_url = urljoin(self.base_url, href)
                    title = link.get_text(strip=True) or "Untitled Notice"

                    # Check if it's a PDF
                    if href.lower().endswith('.pdf'):
                        documents.append({
                            'url': absolute_url,
                            'title': title,
                            'type': 'pdf'
                        })
                    # Check if it looks like a notice detail page
                    elif 'notice' in href.lower() or 'notice' in absolute_url.lower():
                        documents.append({
                            'url': absolute_url,
                            'title': title,
                            'type': 'html'
                        })

                return documents

        # Process cards
        for card in cards:
            # Find the link in the card
            link = card.find('a', href=True)
            if not link:
                continue

            href = link['href']
            if not href or href.startswith('#'):
                continue

            absolute_url = urljoin(self.base_url, href)

            # Extract title - try multiple elements
            title = None
            title_selectors = ['h3', 'h4', '.title', '.notice-title', 'strong']
            for selector in title_selectors:
                title_elem = card.select_one(selector)
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    break

            if not title:
                title = link.get_text(strip=True) or "Untitled Notice"

            # Check if it's a PDF link
            if href.lower().endswith('.pdf'):
                documents.append({
                    'url': absolute_url,
                    'title': title,
                    'type': 'pdf'
                })
            else:
                # HTML notice page
                documents.append({
                    'url': absolute_url,
                    'title': title,
                    'type': 'html'
                })

            # Also check for PDF attachments in the card
            pdf_links = card.find_all('a', href=lambda x: x and x.lower().endswith('.pdf'))
            for pdf_link in pdf_links:
                pdf_url = urljoin(self.base_url, pdf_link['href'])
                pdf_title = pdf_link.get_text(strip=True) or f"{title} - Attachment"
                documents.append({
                    'url': pdf_url,
                    'title': pdf_title,
                    'type': 'pdf'
                })

        return documents

    def fetch_document_content(self, url: str) -> Dict[str, any]:
        """
        Fetch a single notice and extract its content.
        For HTML pages: extracts text and finds PDF attachments.
        For PDFs: returns metadata only.
        """
        if url.lower().endswith('.pdf'):
            return self._fetch_pdf_content(url)
        else:
            return self._fetch_html_content(url)

    def _fetch_html_content(self, url: str) -> Dict[str, any]:
        """Extract content from an HTML notice page."""
        html = self.fetch_page(url)
        if not html:
            return None

        soup = self.parse_html(html)

        # Try to find the main content
        main_content = None
        content_selectors = [
            'article',
            '.content',
            '.node-content',
            '.notice-content',
            '.main-content',
            '#content',
            'main'
        ]

        for selector in content_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                break

        # Fallback to body
        if not main_content:
            main_content = soup.body

        # Extract text with Unicode/Bangla support
        text = ""
        if main_content:
            # Remove script and style elements
            for script in main_content(["script", "style", "nav", "header", "footer"]):
                script.decompose()

            # Extract text preserving Bangla characters
            text = main_content.get_text(separator="\n", strip=True)

        # Try to get title
        title_tag = soup.find('title')
        h1_tag = soup.find('h1')
        title = (title_tag.get_text(strip=True) if title_tag
                 else h1_tag.get_text(strip=True) if h1_tag
                 else "Untitled Notice")

        # Extract all PDF links from the page
        pdf_links = []
        if main_content:
            for pdf_link in main_content.find_all('a', href=lambda x: x and x.lower().endswith('.pdf')):
                pdf_url = urljoin(url, pdf_link['href'])
                pdf_links.append(pdf_url)

        return {
            'title': title,
            'text': text,
            'url': url,
            'type': 'html',
            'pdf_links': pdf_links
        }

    def _fetch_pdf_content(self, url: str) -> Dict[str, any]:
        """
        Note: This method returns metadata only.
        Actual PDF processing happens in the ingestion service.
        """
        return {
            'title': url.split('/')[-1].replace('.pdf', ''),
            'url': url,
            'type': 'pdf',
            'text': None
        }
