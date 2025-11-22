"""
AI Provider service using Google Gemini API.
Handles all AI operations: summaries, explanations, tagging, entity extraction, and embeddings.
"""
import google.generativeai as genai
from typing import List, Dict, Any
import json
import time
from app.config import settings

# Configure Gemini API
genai.configure(api_key=settings.gemini_api_key)

# Models
TEXT_MODEL = "gemini-pro"
EMBEDDING_MODEL = "models/embedding-001"  # Gemini embedding model

# Rate limiting
RATE_LIMIT_DELAY = 1  # seconds between API calls


class AIProvider:
    """Centralized AI provider for all AI operations."""

    def __init__(self):
        self.text_model = genai.GenerativeModel(TEXT_MODEL)
        self.last_call_time = 0

    def _rate_limit(self):
        """Simple rate limiting to avoid hitting API limits."""
        elapsed = time.time() - self.last_call_time
        if elapsed < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - elapsed)
        self.last_call_time = time.time()

    def generate_summary(self, text: str) -> str:
        """
        Generate a short, plain-language summary of the document.
        Target: 2-3 sentences for general public understanding.
        """
        self._rate_limit()

        prompt = f"""Summarize the following government document in 2-3 clear sentences that a regular citizen can understand. Focus on what the document is about and why it matters to the community.

Document:
{text[:4000]}

Summary:"""

        try:
            response = self.text_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Summary generation failed."

    def generate_explanation(self, text: str) -> str:
        """
        Generate a longer, more detailed explanation.
        Target: A few paragraphs explaining the document in plain language.
        """
        self._rate_limit()

        prompt = f"""Provide a detailed but accessible explanation of this government document. Break down the key points, explain any technical or legal terms, and describe the practical implications for citizens. Write in plain language that anyone can understand.

Document:
{text[:4000]}

Explanation:"""

        try:
            response = self.text_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating explanation: {e}")
            return "Explanation generation failed."

    def classify_tags(self, text: str) -> List[str]:
        """
        Classify the document into relevant topic tags.
        Returns a list of tags like ["housing", "transportation", "education", etc.]
        """
        self._rate_limit()

        prompt = f"""Analyze this government document and identify the most relevant topic categories. Choose from the following categories (select 1-5 that apply):

Categories: housing, transportation, education, health, environment, safety, budget, planning, zoning, infrastructure, utilities, parks, community, business, legal, employment, taxes, elections, public-services

Return ONLY a JSON array of applicable categories, nothing else.

Document:
{text[:3000]}

Tags (JSON array):"""

        try:
            response = self.text_model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean up response to extract JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            tags = json.loads(result_text)
            return tags if isinstance(tags, list) else []
        except Exception as e:
            print(f"Error classifying tags: {e}")
            return ["uncategorized"]

    def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """
        Extract named entities from the document.
        Returns a list of dicts with 'name' and 'type' keys.
        Types: organization, location, person, date, etc.
        """
        self._rate_limit()

        prompt = f"""Extract important named entities from this government document. Identify organizations, locations, people, and other key entities.

Return ONLY a JSON array of objects with "name" and "type" fields, where type is one of: organization, location, person, event, law

Document:
{text[:3000]}

Entities (JSON array):"""

        try:
            response = self.text_model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean up response to extract JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            entities = json.loads(result_text)
            return entities if isinstance(entities, list) else []
        except Exception as e:
            print(f"Error extracting entities: {e}")
            return []

    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding vector for text using Gemini embedding model.
        Returns a list of floats (768 dimensions).
        """
        self._rate_limit()

        try:
            # Truncate text to avoid token limits (embedding models have limits)
            truncated_text = text[:1000]

            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=truncated_text,
                task_type="retrieval_document"
            )

            return result['embedding']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            # Return zero vector as fallback
            return [0.0] * 768

    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding vector for a search query.
        Uses a different task_type optimized for queries.
        """
        self._rate_limit()

        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=query,
                task_type="retrieval_query"
            )

            return result['embedding']
        except Exception as e:
            print(f"Error generating query embedding: {e}")
            # Return zero vector as fallback
            return [0.0] * 768


# Singleton instance
ai_provider = AIProvider()
