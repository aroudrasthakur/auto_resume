# AI Resume Creator

[![CI](https://github.com/aroudrasthakur/auto_resume/actions/workflows/ci.yml/badge.svg)](https://github.com/aroudrasthakur/auto_resume/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![codecov](https://codecov.io/gh/aroudrasthakur/auto_resume/branch/main/graph/badge.svg)](https://codecov.io/gh/aroudrasthakur/auto_resume)

**AI-powered resume generation that tailors your experience to each job description—without inventing facts.**

AI Resume Creator is a full-stack application for building a structured career profile once, then generating job-specific resumes on demand. A FastAPI backend and Celery worker orchestrate semantic matching over your real experience (pgvector), AI-assisted content selection (OpenAI, Ollama, or a deterministic mock), and deterministic rendering through Jake's Resume LaTeX template into PDF, LaTeX, and DOCX. A Next.js frontend handles profile management, auth, and downloads—backed by Supabase, Redis, and AWS Cognito.

---

## Key Features

- 🧠 **Vector-Powered Matching** — Embeds job descriptions and profile content in PostgreSQL (pgvector) to surface the most relevant experience and projects before AI optimization.
- 🤖 **Multi-Provider AI Pipeline** — Pluggable adapters for OpenAI, local Ollama, and a mock provider for CI and offline development.
- 📄 **Deterministic LaTeX Rendering** — Jake's Resume ATS template rendered with Jinja2, escaped user content, and compiled to PDF via Tectonic for consistent, professional output.
- 🔐 **Production-Grade Security** — AWS Cognito JWT validation, row-level ownership, AES-256-GCM encrypted contact fields, rate limiting, and Supabase RLS.
- 📦 **Async Export & Downloads** — Celery workers generate PDF, LaTeX, and DOCX in the background; finished files are stored in Supabase Storage with time-limited presigned URLs.
- 🗂️ **Full Profile CRUD** — Manage profiles, education, experience (with bullets), projects, skills, and saved job descriptions from a modern Next.js UI.

---

## Tech Stack & Architecture

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, AWS Amplify |
| **API** | FastAPI, Pydantic v2, SQLAlchemy, Alembic, SlowAPI (rate limits) |
| **Worker** | Celery 5, Redis 7, Jinja2, python-docx, sentence-transformers |
| **Data** | Supabase (PostgreSQL 15+ with pgvector, Storage) |
| **Auth** | AWS Cognito (Hosted UI + JWT / JWKS); optional `DEV_AUTH_BYPASS` for local dev |
| **AI** | OpenAI GPT (LangChain), Ollama, mock adapter |
| **Infra (local)** | Docker Compose (Redis) |

**Why this stack?**

- **FastAPI + Celery** separates synchronous API concerns from long-running resume jobs (embedding, AI calls, LaTeX compile) without blocking HTTP workers.
- **Supabase + pgvector** gives managed Postgres, object storage, and native vector search in one platform—avoiding a separate vector DB for semantic JD matching.
- **Next.js 14** delivers a typed, SSR-capable UI with strong form validation for complex profile data entry.
- **Deterministic LaTeX** (vs. pure HTML-to-PDF) produces ATS-friendly, pixel-stable resumes; the AI only selects and rewrites content—the layout stays predictable.

For diagrams and data-flow detail, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). For day-to-day startup commands, see [`STARTUP_GUIDE.md`](STARTUP_GUIDE.md).

```mermaid
graph LR
    User[Browser] --> Next[Next.js]
    Next -->|JWT| API[FastAPI]
    API --> DB[(Supabase / pgvector)]
    API --> Redis[(Redis)]
    Redis --> Worker[Celery Worker]
    Worker --> AI[AI Provider]
    Worker --> Storage[Supabase Storage]
```

---

## Getting Started

### Prerequisites

| Requirement | Version / Notes |
|-------------|-----------------|
| **Python** | 3.11+ |
| **Node.js** | 20+ |
| **pnpm** | 8+ |
| **Docker** | For Redis (`docker compose`) |
| **Supabase** | Project with pgvector enabled |
| **AWS Cognito** | User pool + app client (or `DEV_AUTH_BYPASS=true`) |
| **Tectonic** | LaTeX compiler for PDF output ([install guide](https://tectonic-typesetting.github.io/)) |

Optional: **Ollama** (local AI), **OpenAI API key** (cloud AI).

### Installation

```bash
# Clone
git clone https://github.com/aroudrasthakur/auto_resume.git
cd auto_resume

# Environment (root .env is shared by backend, worker, and migrations)
cp .env.example .env
# Edit .env — see Configuration below

# Python virtual environment (single venv for backend, worker, migrations)
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -e ./shared

# Optional: dev tools (pytest, black, mypy)
pip install -r requirements-dev.txt

# Database
cd migrations
alembic upgrade head
python seed.py   # optional: sample templates / data
cd ..

# Frontend
cd frontend
pnpm install
cd ..
```

### Running the App

Start four processes (four terminals recommended):

```bash
# Terminal 1 — Redis
docker compose up -d redis

# Terminal 2 — API (from repo root, venv active)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3 — Celery worker (venv active)
cd worker
celery -A app.celery_app worker --loglevel=info

# Terminal 4 — Frontend
cd frontend
pnpm dev
```

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API** | http://localhost:8000 |
| **OpenAPI / Swagger** | http://localhost:8000/docs |
| **Health check** | http://localhost:8000/health |

**Interactive setup:** run `.\setup.ps1` on Windows for a guided `.env` wizard.

---

## Configuration

All backend, worker, and migration services load environment variables from the **repository root** `.env`. Copy from `.env.example` and fill in your values.

```bash
# ── Supabase ─────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ── Auth (Cognito) ───────────────────────────────────────────────────────
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=your-app-client-id
COGNITO_CLIENT_SECRET=          # required if app client has a secret
COGNITO_REGION=us-east-1
COGNITO_JWKS_URL=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx/.well-known/jwks.json
DEV_AUTH_BYPASS=false           # set true to skip Cognito locally

# ── AI ───────────────────────────────────────────────────────────────────
AI_PROVIDER=mock                # mock | openai | ollama
OPENAI_API_KEY=sk-...           # required when AI_PROVIDER=openai
OLLAMA_URL=http://localhost:11434

EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# ── Infrastructure ───────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0
ENCRYPTION_KEY=                  # 64 hex chars (32 bytes); generate with:
                                 # python -c "import secrets; print(secrets.token_hex(32))"

# ── App ──────────────────────────────────────────────────────────────────
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development
CELERY_CONCURRENCY=2

# ── Frontend (also in root .env) ───────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COGNITO_DOMAIN=https://your-domain.auth.region.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
```

**Cognito Hosted UI checklist (common login failures):**

- Callback URL: `http://localhost:3000/callback`
- Sign-out URL: `http://localhost:3000`
- Grant type: Authorization code
- Scopes: `openid`, `email`, `profile`

---

## Usage Examples & API Reference

### Generate a tailored resume

`POST /api/v1/resumes/generate` — enqueues async generation (rate-limited). Requires `Authorization: Bearer <JWT>` (or dev bypass).

**Request**

```bash
curl -X POST http://localhost:8000/api/v1/resumes/generate \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "550e8400-e29b-41d4-a716-446655440000",
    "job_description_text": "Senior backend engineer with FastAPI, PostgreSQL, and distributed systems experience.",
    "template_id": "jakes-resume-ats",
    "page_count": 1,
    "include_projects": true,
    "include_skills": true,
    "outputs": ["PDF", "DOCX"]
  }'
```

**Response** `202`-style body (immediate queue acknowledgment)

```json
{
  "generated_resume_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "QUEUED",
  "message": "Resume generation started"
}
```

### Poll status and download

```bash
# Status
curl http://localhost:8000/api/v1/resumes/{resume_id} \
  -H "Authorization: Bearer YOUR_JWT"

# List files (when status is DONE)
curl http://localhost:8000/api/v1/resumes/{resume_id}/files \
  -H "Authorization: Bearer YOUR_JWT"

# Presigned download URL
curl http://localhost:8000/api/v1/resumes/{resume_id}/files/{file_id}/download \
  -H "Authorization: Bearer YOUR_JWT"
```

### Core API surface

| Prefix | Description |
|--------|-------------|
| `/api/v1/auth` | Signup, login, password reset (Cognito-backed) |
| `/api/v1/profiles` | Profile CRUD and completeness check |
| `/api/v1/education` | Education entries and highlights |
| `/api/v1/experience` | Work history and bullets |
| `/api/v1/projects` | Projects and bullets |
| `/api/v1/skills` | Skill categories and items |
| `/api/v1/job-descriptions` | Saved job descriptions |
| `/api/v1/resumes` | Generate, list, status, file downloads |

Full interactive docs: **http://localhost:8000/docs**

---

## Project Structure

```
auto_resume/
├── frontend/           # Next.js 14 UI
├── backend/            # FastAPI application
├── worker/             # Celery tasks (AI, LaTeX, embeddings)
├── shared/             # Pydantic schemas & shared utilities (pip install -e)
├── migrations/         # Alembic migrations + seed script
├── templates/          # Jake's Resume LaTeX templates
├── docs/               # Architecture & design docs
├── .github/workflows/  # CI (pytest, Jest, Codecov)
├── docker-compose.yml  # Redis for local development
├── requirements.txt    # Unified Python dependencies
└── .env.example        # Environment template
```

---

## Testing

```bash
# Backend (venv active, from backend/)
pytest --cov=app --cov-report=html

# Worker (use mock AI to avoid API calls)
cd worker
set AI_PROVIDER=mock          # Windows
# export AI_PROVIDER=mock     # macOS/Linux
pytest --cov=app --cov-report=html

# Frontend
cd frontend
pnpm test --coverage
```

CI runs on every push/PR to `main` via [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Security

- JWT validation on protected routes (Cognito JWKS)
- Per-user row ownership (`user_id` filtering) to prevent IDOR
- AES-256-GCM encryption for sensitive contact fields
- Rate limiting on resume generation (10 requests/hour per IP, configurable)
- Pydantic input validation; no PII in application logs
- Supabase Row Level Security policies in production

---

## Deployment Notes

| Component | Suggested targets |
|-----------|-------------------|
| **Backend / Worker** | AWS ECS, Google Cloud Run, Railway |
| **Frontend** | Vercel, Netlify |
| **Database / Storage** | Supabase (production project + connection pooling) |
| **Queue** | Managed Redis (ElastiCache, Upstash, etc.) |

Set production env vars from `.env.example`, disable `DEV_AUTH_BYPASS`, and align Cognito callback URLs with your production domain.

---

## Roadmap & Contributing

### Roadmap

- [ ] GraphQL or tRPC layer for typed frontend queries
- [ ] Additional resume templates beyond Jake's ATS layout
- [ ] Batch generation for multiple job descriptions
- [ ] Admin dashboard for usage analytics and template management
- [ ] One-click deploy (Docker Compose full stack or Helm chart)

### Contributing

Contributions are welcome. Fork the repository, create a feature branch from `main`, and open a Pull Request with a clear description of your change. Run backend, worker, and frontend tests locally before submitting; maintain existing coverage thresholds (>80% backend/worker, >70% frontend where applicable).

1. Fork → `git checkout -b feature/your-feature`
2. Install deps and run tests (see **Testing**)
3. Open a PR against `main`

---

## License & Contact

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

| | |
|---|---|
| **Repository** | https://github.com/aroudrasthakur/auto_resume |
| **Issues** | https://github.com/aroudrasthakur/auto_resume/issues |
| **Author** | [aroudrasthakur](https://github.com/aroudrasthakur) |

For bugs, feature requests, or questions, please [open an issue](https://github.com/aroudrasthakur/auto_resume/issues).
