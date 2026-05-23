"""Chat-related Pydantic schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SourceCitation(BaseModel):
    document_id: str
    document_name: str
    chunk_index: int
    snippet: str
    score: float


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    session_id: Optional[str] = None
    document_ids: Optional[List[str]] = None  # restrict retrieval to these docs


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    sources: Optional[List[SourceCitation]] = None
    created_at: datetime


class ChatResponse(BaseModel):
    session_id: str
    message: ChatMessageOut


class ChatSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    created_at: datetime
    updated_at: datetime
