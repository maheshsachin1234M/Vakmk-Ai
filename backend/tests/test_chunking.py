"""Sanity tests for the chunker. Run with: pytest backend/tests"""
from app.rag.chunking import chunk_text


def test_chunk_text_produces_chunks():
    text = "Paragraph one.\n\n" + ("Sentence. " * 200)
    chunks = chunk_text(text, chunk_size=300, chunk_overlap=50)
    assert len(chunks) > 1
    assert all(c.text for c in chunks)
    assert all(c.char_count > 0 for c in chunks)


def test_chunk_text_empty():
    assert chunk_text("") == []
