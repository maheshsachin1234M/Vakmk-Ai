"""
Embedding client supporting both Google Gemini (free, default) and OpenAI (paid).

The public `EmbeddingClient` is provider-agnostic. Internally it dispatches to
the right implementation based on `settings.LLM_PROVIDER`. Switching providers
is a single env-var change — no callers need to know which engine is in use.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import List

from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = logging.getLogger(__name__)


# ---------- Provider interface ----------
class BaseEmbedder(ABC):
    @abstractmethod
    def embed_texts(self, texts: List[str]) -> List[List[float]]: ...

    @abstractmethod
    def embed_query(self, text: str) -> List[float]: ...


# ---------- Google Gemini implementation ----------
class GeminiEmbedder(BaseEmbedder):
    """
    Uses Google's free embedding tier.

    Self-healing: tries a chain of known model names and sticks with the first
    one the user's API key actually supports. Eliminates "model not found"
    errors that depend on account region / API version.
    """

    # Hardcoded fallbacks (last resort if list_models() doesn't work)
    HARDCODED_FALLBACKS = [
        "models/embedding-001",
        "models/text-embedding-004",
    ]

    def __init__(self, api_key: str, model: str):
        import google.generativeai as genai

        if not api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY is not set. Get a free key at "
                "https://aistudio.google.com/app/apikey"
            )
        genai.configure(api_key=api_key)
        self._genai = genai
        self._configured_model = model
        self._working_model: str | None = None
        self._models_to_try: List[str] = []  # lazily populated

    def _call(self, model: str, text: str, task_type: str) -> List[float]:
        result = self._genai.embed_content(
            model=model,
            content=text,
            task_type=task_type,
        )
        return list(result["embedding"])

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        reraise=True,
    )
    def _call_sticky(self, text: str, task_type: str) -> List[float]:
        assert self._working_model is not None
        return self._call(self._working_model, text, task_type)

    def _discover_models(self) -> List[str]:
        """Query Gemini for models that actually support embedContent.

        Falls back to a hardcoded list if list_models() fails.
        """
        try:
            discovered = []
            for m in self._genai.list_models():
                methods = getattr(m, "supported_generation_methods", []) or []
                if "embedContent" in methods:
                    discovered.append(m.name)
            if discovered:
                logger.info("Gemini embedding models available: %s", discovered)
                # Put configured model first if it's in the list
                ordered = []
                if self._configured_model in discovered:
                    ordered.append(self._configured_model)
                for m in discovered:
                    if m not in ordered:
                        ordered.append(m)
                return ordered
        except Exception as e:
            logger.warning("Could not list Gemini models: %s", e)

        # Fallback: configured + hardcoded list
        seen = set()
        out: List[str] = []
        for m in [self._configured_model] + self.HARDCODED_FALLBACKS:
            if m and m not in seen:
                seen.add(m)
                out.append(m)
        return out

    def _embed_one(self, text: str, task_type: str) -> List[float]:
        # Once we know which model works, stick with it (with light retries)
        if self._working_model:
            return self._call_sticky(text, task_type)

        if not self._models_to_try:
            self._models_to_try = self._discover_models()

        last_err: Exception | None = None
        for m in self._models_to_try:
            try:
                emb = self._call(m, text, task_type)
                self._working_model = m
                logger.info("Gemini embeddings: using model '%s'", m)
                return emb
            except Exception as e:
                logger.warning("Gemini model '%s' failed: %s", m, str(e)[:300])
                last_err = e
        raise RuntimeError(
            f"All discovered Gemini embedding models failed. Last error: {last_err}"
        )

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        return [self._embed_one(t, "retrieval_document") for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_one(text, "retrieval_query")


# ---------- OpenAI implementation ----------
class OpenAIEmbedder(BaseEmbedder):
    """Uses OpenAI text-embedding-3-small — paid."""

    def __init__(self, api_key: str, model: str, batch_size: int = 64):
        from openai import OpenAI

        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set.")
        self._client = OpenAI(api_key=api_key)
        self.model = model
        self.batch_size = batch_size

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        resp = self._client.embeddings.create(model=self.model, input=texts)
        return [item.embedding for item in resp.data]

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        out: List[List[float]] = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i : i + self.batch_size]
            out.extend(self._embed_batch(batch))
        return out

    def embed_query(self, text: str) -> List[float]:
        return self._embed_batch([text])[0]


# ---------- Public façade ----------
class EmbeddingClient:
    """Provider-agnostic embedding client. Lazy-initialised."""

    def __init__(self):
        self._impl: BaseEmbedder | None = None

    def _ensure_impl(self) -> BaseEmbedder:
        if self._impl is not None:
            return self._impl
        provider = settings.LLM_PROVIDER.lower()
        if provider == "gemini":
            self._impl = GeminiEmbedder(
                api_key=settings.GOOGLE_API_KEY,
                model=settings.GEMINI_EMBEDDING_MODEL,
            )
        elif provider == "openai":
            self._impl = OpenAIEmbedder(
                api_key=settings.OPENAI_API_KEY,
                model=settings.OPENAI_EMBEDDING_MODEL,
            )
        else:
            raise RuntimeError(
                f"Unknown LLM_PROVIDER '{settings.LLM_PROVIDER}'. "
                "Use 'gemini' (free, default) or 'openai'."
            )
        logger.info("Embedding provider: %s", provider)
        return self._impl

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return self._ensure_impl().embed_texts(texts)

    def embed_query(self, text: str) -> List[float]:
        return self._ensure_impl().embed_query(text)
