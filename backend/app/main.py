"""
VAKMK AI — FastAPI application entrypoint.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.config import settings
from app.database.session import init_db
from app.utils.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup & shutdown tasks."""
    logger.info("Starting VAKMK AI backend (env=%s)", settings.ENVIRONMENT)
    init_db()
    logger.info("Database initialized.")
    yield
    logger.info("Shutting down VAKMK AI backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "VAKMK AI — Engineering Intelligence Platform. "
        "RAG-powered document chat with semantic vector retrieval."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Health checks ----
@app.get("/", tags=["meta"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "Engineering Intelligence Platform",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}


# ---- API routes ----
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ---- Global error handler ----
@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )
