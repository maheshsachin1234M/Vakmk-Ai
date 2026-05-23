"""
ChromaDB-backed vector store.

We use Chroma's persistent client with cosine similarity. All operations
are wrapped here so the rest of the codebase never touches Chroma directly.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class RetrievedChunk:
    chunk_id: str
    text: str
    metadata: Dict[str, Any]
    distance: float  # cosine distance — lower is better
    score: float  # similarity score (1 - distance) — higher is better


class VectorStore:
    """ChromaDB wrapper with persistent storage."""

    def __init__(
        self,
        persist_dir: str | None = None,
        collection_name: str | None = None,
    ):
        self.persist_dir = persist_dir or settings.CHROMA_PERSIST_DIR
        self.collection_name = collection_name or settings.CHROMA_COLLECTION
        self._client: chromadb.ClientAPI | None = None
        self._collection = None

    @property
    def client(self) -> chromadb.ClientAPI:
        if self._client is None:
            self._client = chromadb.PersistentClient(
                path=self.persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
        return self._client

    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )
        return self._collection

    # ---- writes ----
    def add(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ) -> None:
        if not ids:
            return
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def delete_by_document(self, document_id: str) -> None:
        """Remove all chunks belonging to a document."""
        self.collection.delete(where={"document_id": document_id})

    # ---- reads ----
    def query(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        document_ids: Optional[List[str]] = None,
        owner_id: Optional[str] = None,
    ) -> List[RetrievedChunk]:
        """Vector similarity search with optional metadata filtering."""
        where: Dict[str, Any] = {}
        if owner_id:
            where["owner_id"] = owner_id
        if document_ids:
            where["document_id"] = {"$in": document_ids}

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where if where else None,
        )

        if not results or not results.get("ids") or not results["ids"][0]:
            return []

        ids = results["ids"][0]
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]

        chunks = []
        for cid, text, meta, dist in zip(ids, docs, metas, distances):
            chunks.append(
                RetrievedChunk(
                    chunk_id=cid,
                    text=text,
                    metadata=meta or {},
                    distance=float(dist),
                    score=max(0.0, 1.0 - float(dist)),
                )
            )
        return chunks

    def count(self) -> int:
        return self.collection.count()


# Lazy singleton
_vector_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
