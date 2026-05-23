"""
End-to-end RAG pipeline orchestrating chunking, embedding, retrieval, generation.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Generator, List, Optional

from app.config import settings
from app.rag.chunking import chunk_text
from app.rag.embeddings import EmbeddingClient
from app.rag.generation import Generator as AnswerGenerator
from app.rag.vector_store import RetrievedChunk, VectorStore, get_vector_store

logger = logging.getLogger(__name__)


@dataclass
class IndexResult:
    document_id: str
    chunk_count: int


@dataclass
class RAGAnswer:
    answer: str
    sources: List[RetrievedChunk]


class RAGPipeline:
    """Glue layer for document indexing and question answering."""

    def __init__(
        self,
        vector_store: VectorStore | None = None,
        embedding_client: EmbeddingClient | None = None,
        generator: AnswerGenerator | None = None,
    ):
        self.vector_store = vector_store or get_vector_store()
        self.embedding_client = embedding_client or EmbeddingClient()
        self.generator = generator or AnswerGenerator()

    # ----------------- INDEXING -----------------
    def index_document(
        self,
        *,
        document_id: str,
        document_name: str,
        owner_id: str,
        text: str,
    ) -> IndexResult:
        """Chunk → embed → store. Idempotent: replaces existing chunks for this doc."""
        # Remove any stale vectors for this document first
        try:
            self.vector_store.delete_by_document(document_id)
        except Exception:
            logger.debug("No prior chunks for %s — skipping delete", document_id)

        chunks = chunk_text(text)
        if not chunks:
            logger.warning("No chunks produced for doc %s", document_id)
            return IndexResult(document_id=document_id, chunk_count=0)

        logger.info("Embedding %d chunks for doc %s", len(chunks), document_id)
        embeddings = self.embedding_client.embed_texts([c.text for c in chunks])

        ids = [f"{document_id}::{c.index}" for c in chunks]
        metadatas = [
            {
                "document_id": document_id,
                "document_name": document_name,
                "owner_id": owner_id,
                "chunk_index": c.index,
                "char_count": c.char_count,
            }
            for c in chunks
        ]
        documents = [c.text for c in chunks]

        self.vector_store.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )
        logger.info("Indexed doc %s (%d chunks)", document_id, len(chunks))
        return IndexResult(document_id=document_id, chunk_count=len(chunks))

    def delete_document(self, document_id: str) -> None:
        self.vector_store.delete_by_document(document_id)

    # ----------------- RETRIEVAL -----------------
    def retrieve(
        self,
        query: str,
        owner_id: str,
        document_ids: Optional[List[str]] = None,
        top_k: int | None = None,
    ) -> List[RetrievedChunk]:
        embedding = self.embedding_client.embed_query(query)
        return self.vector_store.query(
            query_embedding=embedding,
            top_k=top_k or settings.TOP_K_RETRIEVAL,
            document_ids=document_ids,
            owner_id=owner_id,
        )

    # ----------------- ANSWER -----------------
    def answer(
        self,
        query: str,
        owner_id: str,
        document_ids: Optional[List[str]] = None,
        history: Optional[List[dict]] = None,
        top_k: int | None = None,
    ) -> RAGAnswer:
        chunks = self.retrieve(query, owner_id, document_ids, top_k)
        text = self.generator.generate(query, chunks, history=history)
        return RAGAnswer(answer=text, sources=chunks)

    def answer_stream(
        self,
        query: str,
        owner_id: str,
        document_ids: Optional[List[str]] = None,
        history: Optional[List[dict]] = None,
        top_k: int | None = None,
    ) -> tuple[Generator[str, None, None], List[RetrievedChunk]]:
        """Returns (token stream, sources). Sources are known before streaming."""
        chunks = self.retrieve(query, owner_id, document_ids, top_k)
        token_stream = self.generator.stream(query, chunks, history=history)
        return token_stream, chunks


# Lazy singleton
_pipeline: RAGPipeline | None = None


def get_rag_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline
