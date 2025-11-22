"""Ingestion module for BdLens scrapers."""

from app.ingestion.simple_scraper import SimpleScraper
from app.ingestion.dncc_scraper import DNCCScraper
from app.ingestion.mopa_scraper import MOPAScraper
from app.models.document_source import DocumentSource


def get_scraper_for_source(source: DocumentSource):
    """
    Dynamically load the appropriate scraper based on source.scraper_type.

    Args:
        source: DocumentSource object with scraper_type field

    Returns:
        Instance of the appropriate scraper class
    """
    scraper_type = source.scraper_type.lower()

    if scraper_type == "dncc":
        return DNCCScraper(source.base_url, source.url_pattern)
    elif scraper_type == "mopa":
        return MOPAScraper(source.base_url, source.url_pattern)
    else:
        # Default to SimpleScraper
        return SimpleScraper(source.base_url, source.url_pattern)
