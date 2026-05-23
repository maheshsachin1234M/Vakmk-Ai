"""Document API — upload, list, get, delete."""
from typing import List

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import SessionLocal, get_db
from app.models.user import User
from app.schemas.document import DocumentOut
from app.services import document_service

router = APIRouter()


def _index_document_background(doc_id: str) -> None:
    """Background task wrapper — opens its own DB session."""
    db = SessionLocal()
    try:
        from app.models.document import Document

        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            document_service.index_document(db, doc)
    finally:
        db.close()


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentOut:
    """Upload a document. Indexing runs in the background."""
    try:
        doc = document_service.save_upload_and_create_record(db, current_user.id, file)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    background_tasks.add_task(_index_document_background, doc.id)
    return DocumentOut.model_validate(doc)


@router.get("", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[DocumentOut]:
    docs = document_service.list_user_documents(db, current_user.id)
    return [DocumentOut.model_validate(d) for d in docs]


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentOut:
    doc = document_service.get_document(db, doc_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentOut.model_validate(doc)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = document_service.get_document(db, doc_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    document_service.delete_document(db, doc)
    return None
