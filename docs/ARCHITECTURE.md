# Architecture Notes

This document captures design choices made in VAKMK AI so they're explainable, not invisible.

## 1. Why FastAPI + SQLAlchemy 2.0

- FastAPI's Pydantic-first design gives us auto-validated request bodies and OpenAPI schemas for free.
- SQLAlchemy 2.0's typed `Mapped[...]` columns play nicely with modern Python type checkers and IDEs.
- `BackgroundTasks` is enough for our initial indexing workload; if a queue is needed later, Celery / RQ / Arq slot in cleanly behind the same `document_service.index_document` boundary.

## 2. Why ChromaDB

- Embedded mode means no extra infrastructure to operate during development.
- `PersistentClient` writes to disk, so the vector index survives restarts.
- Metadata filtering supports the multi-tenant invariant: every query passes `owner_id` so users can only retrieve their own chunks.
- Cosine similarity (`hnsw:space=cosine`) matches OpenAI embedding semantics out of the box.

If we outgrow Chroma, the `VectorStore` class is the only thing that needs reimplementing — `RAGPipeline` doesn't know what backs it.

## 3. Chunking strategy

`RecursiveCharacterTextSplitter` walks separators from coarsest (`\n\n`) to finest (chars) until a chunk fits the size budget. This:

- Preserves paragraph/sentence boundaries when possible.
- Falls back gracefully for documents without nice formatting.
- Overlap (200 chars on 1000-char chunks = 20%) keeps semantic continuity so a chunk boundary never severs an answer.

## 4. Per-request session pattern

Every endpoint takes `db: Session = Depends(get_db)`. The dependency yields a session, FastAPI closes it after the response. No global session = no thread-safety surprises.

Background indexing creates its own session (`SessionLocal()`) because it runs after the request's session is closed.

## 5. Auth

- Passwords: bcrypt via passlib (12 rounds default).
- JWT: HS256 over a `SECRET_KEY` env var. `sub` carries the user id. 7-day expiry.
- The frontend stores the token in `localStorage` and ships it as `Authorization: Bearer …`. A 401 response triggers a token wipe and a redirect to `/login` (see `lib/api.ts`).
- For higher-security deployments, swap localStorage for an httpOnly cookie and add CSRF protection.

## 6. Frontend state

We deliberately kept state lightweight: React hooks, Zustand only listed as a dependency for future growth. The chat workspace refetches the message list after each `ask` to stay simple and correct.

## 7. Citations

The backend returns sources as a typed list. The frontend renders each as a chip with:

- the document name,
- the chunk index (so the user can find the passage in the source file),
- the similarity score as a percentage.

Hovering shows the chunk snippet via the title attribute (lightweight; a popover component is the obvious upgrade).

## 8. What's intentionally not here yet

- **Streaming UI**: the backend `Generator.stream` works; the frontend currently uses the JSON answer path for reliability. Switching to SSE is a small change.
- **Reranker**: top-K cosine works well for most queries. A cross-encoder rerank between retrieval and generation is the next quality lever.
- **File storage abstraction**: `document_service` writes to a local dir today. Replacing with S3 means swapping `save_upload_and_create_record` and `delete_document`'s file ops.
