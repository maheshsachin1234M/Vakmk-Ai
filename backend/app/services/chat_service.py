"""Chat service — manages sessions, messages, and RAG answer flow."""
from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.chat import ChatMessage, ChatSession
from app.rag import get_rag_pipeline

logger = logging.getLogger(__name__)


def list_sessions(db: Session, user_id: str) -> List[ChatSession]:
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


def get_session(db: Session, session_id: str, user_id: str) -> Optional[ChatSession]:
    return (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
        .first()
    )


def create_session(db: Session, user_id: str, title: str = "New conversation") -> ChatSession:
    session = ChatSession(user_id=user_id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def delete_session(db: Session, session: ChatSession) -> None:
    db.delete(session)
    db.commit()


def _build_history(session: ChatSession, max_turns: int = 6) -> list[dict]:
    """Most recent N turns formatted for the OpenAI API."""
    recent = session.messages[-max_turns * 2 :] if session.messages else []
    return [{"role": m.role, "content": m.content} for m in recent if m.role != "system"]


def ask(
    db: Session,
    user_id: str,
    message: str,
    session_id: Optional[str] = None,
    document_ids: Optional[List[str]] = None,
) -> tuple[ChatSession, ChatMessage]:
    """Send a message → run RAG → persist user + assistant messages → return assistant message."""
    # 1) Resolve or create the session
    if session_id:
        session = get_session(db, session_id, user_id)
        if not session:
            raise ValueError("Session not found")
    else:
        title = message[:60] + ("…" if len(message) > 60 else "")
        session = create_session(db, user_id, title=title)

    # 2) Persist user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=message)
    db.add(user_msg)
    db.commit()

    # 3) Run RAG
    history = _build_history(session)
    pipeline = get_rag_pipeline()
    result = pipeline.answer(
        query=message,
        owner_id=user_id,
        document_ids=document_ids,
        history=history,
    )

    # 4) Persist assistant message with citations
    sources_payload = [
        {
            "document_id": c.metadata.get("document_id"),
            "document_name": c.metadata.get("document_name"),
            "chunk_index": c.metadata.get("chunk_index"),
            "snippet": c.text[:300],
            "score": round(c.score, 4),
        }
        for c in result.sources
    ]
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=result.answer,
        sources=sources_payload,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    db.refresh(session)
    return session, assistant_msg
