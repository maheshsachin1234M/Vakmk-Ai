"""Chat API — sessions, messages, RAG-powered ask."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.chat import (
    ChatMessageOut,
    ChatRequest,
    ChatResponse,
    ChatSessionOut,
    SourceCitation,
)
from app.services import chat_service

router = APIRouter()


def _serialize_message(msg) -> ChatMessageOut:
    sources = None
    if msg.sources:
        sources = [SourceCitation(**s) for s in msg.sources if s.get("document_id")]
    return ChatMessageOut(
        id=msg.id,
        role=msg.role,
        content=msg.content,
        sources=sources,
        created_at=msg.created_at,
    )


@router.post("/ask", response_model=ChatResponse)
def ask(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """Send a message and get a RAG-grounded answer with citations."""
    try:
        session, assistant_msg = chat_service.ask(
            db=db,
            user_id=current_user.id,
            message=payload.message,
            session_id=payload.session_id,
            document_ids=payload.document_ids,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        # e.g. missing OPENAI_API_KEY
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    return ChatResponse(session_id=session.id, message=_serialize_message(assistant_msg))


@router.get("/sessions", response_model=List[ChatSessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ChatSessionOut]:
    sessions = chat_service.list_sessions(db, current_user.id)
    return [ChatSessionOut.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageOut])
def get_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ChatMessageOut]:
    session = chat_service.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return [_serialize_message(m) for m in session.messages]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = chat_service.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    chat_service.delete_session(db, session)
    return None
