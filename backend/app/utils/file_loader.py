"""
Document text extraction for PDF / DOCX / TXT.

Each loader returns a single normalized string. Empty or unparseable files
raise ValueError so the upload pipeline can short-circuit cleanly.
"""
from __future__ import annotations

import logging
from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


def extract_text(path: str | Path) -> str:
    """Dispatch text extraction based on file extension."""
    path = Path(path)
    ext = path.suffix.lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}")

    try:
        if ext == ".pdf":
            text = _extract_pdf(path)
        elif ext == ".docx":
            text = _extract_docx(path)
        else:  # .txt or .md
            text = _extract_text(path)
    except Exception as e:
        logger.exception("Failed to extract %s", path)
        raise ValueError(f"Could not parse {path.name}: {e}") from e

    text = text.strip()
    if not text:
        raise ValueError(f"No text extracted from {path.name}")

    return text


def _extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        if page_text.strip():
            pages.append(page_text)
    return "\n\n".join(pages)


def _extract_docx(path: Path) -> str:
    doc = DocxDocument(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def _extract_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")
