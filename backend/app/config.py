"""
Central configuration using Pydantic Settings.
All env vars flow through here — never read os.environ directly elsewhere.
"""
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- App ----
    PROJECT_NAME: str = "VAKMK AI"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # ---- Database ----
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: str = "vakmk"
    POSTGRES_PASSWORD: str = "vakmk_secure_password_change_me"
    POSTGRES_DB: str = "vakmk_ai"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # ---- Auth ----
    SECRET_KEY: str = "dev-secret-key-please-change-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # ---- AI Provider ----
    # "gemini" (free, default) or "openai" (paid)
    LLM_PROVIDER: str = "gemini"

    # ---- Google Gemini (default — free tier) ----
    GOOGLE_API_KEY: str = ""
    GEMINI_CHAT_MODEL: str = "gemini-1.5-flash-latest"
    GEMINI_EMBEDDING_MODEL: str = "models/embedding-001"

    # ---- OpenAI (optional — paid) ----
    OPENAI_API_KEY: str = ""
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # ---- RAG ----
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHROMA_COLLECTION: str = "vakmk_documents"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RETRIEVAL: int = 5

    # ---- Uploads ----
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_MB: int = 25

    # ----- Derived helpers -----
    @property
    def database_url(self) -> str:
        """Resolve the SQLAlchemy database URL."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated CORS origins."""
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Cached settings — call this everywhere instead of instantiating Settings."""
    return Settings()


# Convenience singleton
settings = get_settings()
