"""
OpenAI embedding client with batching and retries.
"""
from __future__ import annotations

import logging
from typing import List

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingClient:
    """Thin wrapper around OpenAI embeddings — batched + retried."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        batch_size: int = 64,
    ):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_EMBEDDING_MODEL
        self.batch_size = batch_size
        self._client: OpenAI | None = None

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            if not self.api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY is not set — RAG pipeline cannot run."
                )
            self._client = OpenAI(api_key=self.api_key)
        return self._client

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        response = self.client.embeddings.create(model=self.model, input=texts)
        return [item.embedding for item in response.data]

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts, batching internally."""
        if not texts:
            return []
        out: List[List[float]] = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i : i + self.batch_size]
            logger.debug("Embedding batch %d..%d", i, i + len(batch))
            out.extend(self._embed_batch(batch))
        return out

    def embed_query(self, text: str) -> List[float]:
        return self._embed_batch([text])[0]
