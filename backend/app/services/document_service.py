"""Document service — handles upload, indexing, listing, deletion."""
from __future__ import annotations

import logging
import os
import shutil
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.models.document import Document
from app.rag import get_rag_pipeline
from app.utils.file_loader import SUPPORTED_EXTENSIONS, extract_text

logger = logging.getLogger(__name__)


def _ensure_upload_dir() -> Path:
    p = Path(settings.UPLOAD_DIR)
    p.mkdir(parents=True, exist_ok=True)
    return p


def list_user_documents(db: Session, user_id: str) -> List[Document]:
    return (
        db.query(Document)
        .filter(Document.owner_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )


def get_document(db: Session, doc_id: str, user_id: str) -> Optional[Document]:
    return (
        db.query(Document)
        .filter(Document.id == doc_id, Document.owner_id == user_id)
        .first()
    )


def save_upload_and_create_record(
    db: Session, user_id: str, file: UploadFile
) -> Document:
    """Persist the upload to disk and create a DB row (status=processing)."""
    if not file.filename:
        raise ValueError("File has no filename")

    ext = Path(file.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{ext}'. Allowed: {sorted(SUPPORTED_EXTENSIONS)}"
        )

    upload_dir = _ensure_upload_dir()
    stored_name = f"{uuid4().hex}{ext}"
    stored_path = upload_dir / stored_name

    # Stream to disk in chunks to handle large files safely
    size = 0
    with stored_path.open("wb") as out:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > settings.max_upload_bytes:
                out.close()
                stored_path.unlink(missing_ok=True)
                raise ValueError(
                    f"File exceeds max size of {settings.MAX_UPLOAD_MB} MB"
                )
            out.write(chunk)

    doc = Document(
        owner_id=user_id,
        filename=stored_name,
        original_filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size,
        storage_path=str(stored_path),
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def index_document(db: Session, doc: Document) -> Document:
    """Extract text → index in vector store → update DB status."""
    try:
        text = extract_text(doc.storage_path)
        pipeline = get_rag_pipeline()
        result = pipeline.index_document(
            document_id=doc.id,
            document_name=doc.original_filename,
            owner_id=doc.owner_id,
            text=text,
        )
        doc.chunk_count = result.chunk_count
        doc.status = "ready" if result.chunk_count > 0 else "failed"
        doc.error_message = None if doc.status == "ready" else "No content extracted"
    except Exception as e:
        logger.exception("Indexing failed for doc %s", doc.id)
        doc.status = "failed"
        doc.error_message = str(e)[:500]
    db.commit()
    db.refresh(doc)
    return doc


def delete_document(db: Session, doc: Document) -> None:
    """Remove vectors, file, and DB row."""
    try:
        get_rag_pipeline().delete_document(doc.id)
    except Exception:
        logger.exception("Failed to delete vectors for %s", doc.id)

    try:
        if doc.storage_path and os.path.exists(doc.storage_path):
            os.remove(doc.storage_path)
    except OSError:
        logger.exception("Failed to delete file %s", doc.storage_path)

    db.delete(doc)
    db.commit()
