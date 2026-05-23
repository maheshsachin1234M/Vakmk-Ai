"""Document-related Pydantic schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    original_filename: str
    content_type: str
    size_bytes: int
    chunk_count: int
    status: str
    error_message: str | None = None
    created_at: datetime
