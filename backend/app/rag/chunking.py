"""
Text chunking with recursive character splitter.

We use LangChain's RecursiveCharacterTextSplitter because it produces
semantically coherent chunks by preferring paragraph -> sentence -> word
boundaries, with controlled overlap to preserve context across chunks.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings


@dataclass
class Chunk:
    index: int
    text: str
    char_count: int


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> List[Chunk]:
    """Split text into overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size or settings.CHUNK_SIZE,
        chunk_overlap=chunk_overlap or settings.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    pieces = splitter.split_text(text)
    return [
        Chunk(index=i, text=piece.strip(), char_count=len(piece))
        for i, piece in enumerate(pieces)
        if piece.strip()
    ]
