# VAKMK AI — Engineering Intelligence Platform

> A production-grade, full-stack RAG platform. Upload technical documents, chat with them, and get answers grounded in your knowledge — with inline citations.

VAKMK AI is a futuristic AI-powered Engineering Intelligence Platform. It pairs a premium Next.js 15 frontend with a clean FastAPI backend, a real Retrieval-Augmented Generation pipeline (LangChain + OpenAI + ChromaDB), JWT auth, and a Postgres-backed data layer.

---

## Highlights

- **End-to-end RAG pipeline** — chunking → embeddings → vector indexing → retrieval → citation-grounded generation.
- **ChromaDB vector store** with persistent storage, cosine similarity, and owner-scoped metadata filtering.
- **Premium dark UI** — Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, shadcn-style components, gradient glows, glassmorphism.
- **Real auth** — JWT (HS256), bcrypt hashed passwords, protected routes, per-user document isolation.
- **Streaming-ready** — generation layer exposes both single-shot and streaming token APIs.
- **Production scaffolding** — Dockerfile per service, docker-compose for Postgres + backend + frontend, env-driven config, healthchecks.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Next.js 15 (App Router)                │
│  Landing · Auth · Dashboard · Chat · Documents · Search · Settings │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST + JWT
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          FastAPI Backend                        │
│  /auth  /users  /documents  /chat                               │
│                                                                 │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────┐  │
│  │  Auth (JWT) │   │  RAG Pipeline│   │  Doc Service         │  │
│  │  + bcrypt   │   │  ├ chunking  │   │  ├ upload → disk     │  │
│  └─────────────┘   │  ├ embeddings│   │  ├ extract (PDF/DOCX)│  │
│                    │  ├ vectors   │   │  └ index in vectors  │  │
│  ┌─────────────┐   │  ├ retrieval │   └──────────────────────┘  │
│  │  SQLAlchemy │   │  └ generation│                             │
│  │  Postgres   │   └──────────────┘                             │
│  └──────┬──────┘           │                                    │
└─────────┼──────────────────┼────────────────────────────────────┘
          ▼                  ▼
   ┌─────────────┐     ┌──────────────────┐
   │  PostgreSQL │     │   ChromaDB       │
   │  users      │     │   (persistent)   │
   │  documents  │     │   embeddings +   │
   │  chats      │     │   metadata       │
   └─────────────┘     └──────────────────┘
```

---

## Tech Stack

### Frontend

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS + tailwind-animate
- Framer Motion
- shadcn-style components (Button, Input, Card)
- Radix UI primitives (dialog, dropdown, etc.)
- Lucide icons
- react-markdown + rehype-highlight (chat rendering)
- Sonner (toasts)
- Axios

### Backend

- FastAPI (async)
- SQLAlchemy 2.0 + Postgres (psycopg2)
- Pydantic v2 + pydantic-settings
- JWT (`python-jose`) + bcrypt (`passlib`)
- LangChain (text splitter) + OpenAI client
- ChromaDB (persistent client, cosine)
- pypdf + python-docx (extraction)
- Tenacity (retries)

---

## Project Structure

```
VAKMK AI/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, users, documents, chat)
│   │   ├── auth/            # JWT + password hashing + dependencies
│   │   ├── database/        # SQLAlchemy engine/session
│   │   ├── models/          # User, Document, ChatSession, ChatMessage
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── services/        # Business logic (user, document, chat)
│   │   ├── rag/             # Chunking, embeddings, vector store, generation, pipeline
│   │   ├── utils/           # Logger, file_loader (PDF/DOCX/TXT)
│   │   ├── config.py        # Settings (env-driven)
│   │   └── main.py          # FastAPI app + lifespan
│   ├── tests/               # Pytest sanity tests
│   ├── uploads/             # Persisted uploaded files (volume in Docker)
│   ├── chroma_db/           # Vector DB persistence (volume in Docker)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/login, signup
│   │   ├── dashboard/       # layout + overview, chat, documents, search, settings
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              # Button, Input, Card, Spinner
│   │   ├── shared/          # Logo, AnimatedBackground
│   │   ├── dashboard/       # Sidebar, MobileNav
│   │   └── chat/            # MessageBubble, ChatInput, SessionList, EmptyState
│   ├── hooks/               # useAuth
│   ├── lib/                 # api client, utils
│   ├── services/            # auth, chat, document
│   ├── types/               # shared TS types
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml       # postgres + backend + frontend
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## Quick start

### 1. Prerequisites

- **Docker + Docker Compose** (easiest), OR
- Node 20+, Python 3.11+, Postgres 16, an OpenAI API key.

### 2. Configure env

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit `backend/.env`:

```
OPENAI_API_KEY=sk-...your-key...
SECRET_KEY=<paste at least 32 random characters>
```

### 3. Run with Docker (recommended)

```bash
docker compose up --build
```

That starts Postgres on `:5432`, the FastAPI backend on `:8000`, and the Next.js frontend on `:3000`. Open <http://localhost:3000>.

### 4. Run locally without Docker

Backend:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Either run Postgres yourself, OR use SQLite — uncomment in backend/.env:
#   DATABASE_URL=sqlite:///./vakmk.db

uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Visit <http://localhost:3000>.

---

## API Overview

All endpoints are prefixed with `/api/v1`. Auth uses Bearer tokens.

| Method | Path                                      | Description                                 |
|-------:|-------------------------------------------|---------------------------------------------|
| POST   | `/auth/signup`                            | Create account, returns JWT                 |
| POST   | `/auth/login`                             | Sign in, returns JWT                        |
| GET    | `/users/me`                               | Current user profile                        |
| POST   | `/documents/upload`                       | Multipart upload (PDF/DOCX/TXT)             |
| GET    | `/documents`                              | List your documents                         |
| GET    | `/documents/{id}`                         | Document detail                             |
| DELETE | `/documents/{id}`                         | Delete document + vectors                   |
| POST   | `/chat/ask`                               | Ask a question (RAG) — returns answer + sources |
| GET    | `/chat/sessions`                          | List chat sessions                          |
| GET    | `/chat/sessions/{id}/messages`            | Messages in a session                       |
| DELETE | `/chat/sessions/{id}`                     | Delete a session                            |

Interactive docs: <http://localhost:8000/docs>.

---

## How the RAG pipeline works

1. **Upload** → `document_service.save_upload_and_create_record` streams the file to disk (size-checked) and creates a `Document` row with `status="processing"`.
2. **Background indexing** → FastAPI `BackgroundTasks` invokes `document_service.index_document`, which:
   - extracts text via `utils/file_loader.py` (pypdf / python-docx / plain),
   - chunks it with `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap),
   - calls OpenAI embeddings in batches (retried with exponential backoff),
   - upserts vectors into ChromaDB with metadata `{document_id, owner_id, chunk_index, document_name, char_count}`.
3. **Ask** → `chat_service.ask`:
   - persists the user message,
   - calls `RAGPipeline.answer`: embeds the query, runs a cosine top-K query in ChromaDB **filtered by `owner_id`**, builds a numbered context block, generates with the OpenAI chat model (low temperature), and returns answer + sources,
   - persists the assistant message with citation metadata.
4. **Frontend** renders the answer in markdown and shows source chips with score, doc name, and chunk index.

Tunables live in `backend/.env`:

```
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RETRIEVAL=5
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

---

## Pages

| Route                       | What it is                                            |
|-----------------------------|-------------------------------------------------------|
| `/`                         | Premium landing page with hero, features, CTA         |
| `/login`, `/signup`         | Auth pages with glow border                           |
| `/dashboard`                | Overview with stats, quick actions, recent items      |
| `/dashboard/chat`           | ChatGPT-style workspace, session list, citations      |
| `/dashboard/documents`      | Upload, list, status polling, delete                  |
| `/dashboard/search`         | Semantic search with passage cards                    |
| `/dashboard/settings`       | Profile + sign out                                    |

---

## Deployment

### Frontend → Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel, set the **Root Directory** to `frontend`.
3. Set env var `NEXT_PUBLIC_API_URL` to your backend URL.
4. Deploy. Vercel auto-detects Next.js.

### Backend → Render / Railway / Fly.io

A `backend/Dockerfile` is provided. Any container host works. Required env:

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SECRET_KEY=<32+ chars>
BACKEND_CORS_ORIGINS=https://your-frontend.vercel.app
```

Mount a persistent volume at `/app/chroma_db` and `/app/uploads`.

---

## Roadmap

- Streaming token responses end-to-end (backend exposes it; frontend currently uses the JSON answer).
- S3-backed file storage adapter.
- Server-sent events for live indexing status.
- Multi-document filter UI in the chat workspace.
- Reranker stage (Cohere / cross-encoder) before generation.

---

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  <strong>VAKMK AI</strong> — Engineering Intelligence Platform
</p>
