# AI Resume Creator

AI-powered resume generation tool with vector-powered intelligent content selection, deterministic LaTeX rendering, and comprehensive security features.

## Features

- **Full CRUD** for profile, education, experience, projects, and skills
- **Vector-powered intelligent matching** using pgvector for semantic similarity search
- **AI-driven resume optimization** with multiple provider support (OpenAI, Mock, Ollama)
- **Jake's Resume LaTeX template** with deterministic rendering
- **PDF and DOCX export** with presigned download URLs
- **AWS Cognito authentication** with JWT validation
- **Encrypted contact fields** using AES-256-GCM
- **Comprehensive test coverage** (>80% backend/worker, >70% frontend)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hook Form, TanStack Query
- **Backend**: FastAPI, Python 3.11, Supabase (PostgreSQL + pgvector + Storage)
- **Worker**: Celery, Redis, Tectonic (LaTeX compiler)
- **AI**: OpenAI GPT-4, Mock adapter (for testing), Ollama (local models)
- **Database**: Supabase Cloud (PostgreSQL with pgvector extension)
- **Migrations**: Alembic
- **Testing**: pytest (>80% coverage), Jest, Codecov integration

## Prerequisites

- Python 3.11+
- Node.js 20+
- pnpm 8+
- Docker (for Redis)
- Supabase account
- AWS Cognito User Pool (or use DEV_AUTH_BYPASS for local dev)
- Tectonic (for PDF compilation)

## Local Setup (single `requirements.txt`)

### 1. Clone Repository
```bash
git clone <repository-url>
cd auto_resume
```

### 2. Configure Environment
Environment variables are read from the root `.env` by backend, worker, and migrations. Copy and fill:
```bash
cp .env.example .env
```
Key entries: `DATABASE_URL`, Supabase keys, Cognito (user pool/app client/domain), `AI_PROVIDER`, `OPENAI_API_KEY` (if needed), `REDIS_URL`, `ENCRYPTION_KEY` (64 hex chars).

Frontend uses `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COGNITO_DOMAIN=<https://your-domain.auth.<region>.amazoncognito.com>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<app-client-id>
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
```

More detailed startup steps are in `STARTUP_GUIDE.md`.

### 3. Python Setup (backend/worker/migrations share the same venv)
```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -e ./shared
```

### 4. Database Migrations
```bash
cd migrations
alembic upgrade head
python seed.py  # optional sample data/templates
```

### 5. Frontend Dependencies
```bash
cd frontend
pnpm install
```

### 6. Start Services
```bash
# From repo root
docker compose up -d redis

# Backend (new terminal)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Worker (new terminal)
cd worker
celery -A app.celery_app worker --loglevel=info

# Frontend (new terminal)
cd frontend
pnpm dev
```

### 7. Access Application
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 8. Notes / Troubleshooting
- Backend, worker, and migrations load `.env` from the project root automatically.
- If Alembic complains about `DATABASE_URL`, ensure it is set in `.env` and the virtualenv is active.
- If Cognito returns `invalid_scope` or `redirect_mismatch`, confirm the App Client has:
  - Grant: Authorization code
  - Scopes: `openid`, `email`, `profile`
  - Callback: `http://localhost:3000/callback`
  - Sign-out: `http://localhost:3000`

## Testing

### Backend Tests

```bash
cd backend
poetry run pytest --cov=app --cov-report=html
```

Coverage report: `backend/htmlcov/index.html`

### Worker Tests

```bash
cd worker
AI_PROVIDER=mock poetry run pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend
pnpm test --coverage
```

## AI Provider Configuration

### OpenAI (Default)

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
```

### Mock (For Testing/CI)

```bash
AI_PROVIDER=mock
```

Returns deterministic JSON without API calls.

### Ollama (Local)

```bash
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

Requires Ollama running locally with a compatible model.

## Project Structure

```
auto_resume/
├── frontend/          # Next.js frontend
├── backend/           # FastAPI backend
├── worker/            # Celery worker
├── shared/            # Shared Python utilities
├── migrations/        # Alembic migrations
├── templates/         # Jake's Resume LaTeX template
├── docs/              # Documentation
└── .github/workflows/ # CI/CD workflows
```

## Architecture

See `docs/ARCHITECTURE.md` for detailed architecture documentation with diagrams.

## Security

- JWT validation on all protected endpoints
- Row-level ownership enforcement (user_id filtering)
- Encrypted contact fields (AES-256-GCM)
- Rate limiting (10 generate requests/hour)
- Input validation with Pydantic
- No PII in logs
- Supabase RLS policies

## Development

### Code Quality

```bash
# Format code
cd backend && poetry run black . && poetry run isort .
cd worker && poetry run black . && poetry run isort .

# Type checking
cd backend && poetry run mypy app
cd worker && poetry run mypy app
cd frontend && pnpm type-check

# Linting
cd frontend && pnpm lint
```

## Deployment

### Backend/Worker

Deploy to AWS ECS, Google Cloud Run, or Railway:
- Set production environment variables
- Ensure Redis is accessible
- Configure Supabase connection pooling

### Frontend

Deploy to Vercel or Netlify:
- Set `NEXT_PUBLIC_API_URL` to production API URL
- Configure Cognito domain and redirect URIs

### Supabase

- Use production Supabase project
- Configure RLS policies
- Set up database backups

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass and coverage is maintained
5. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.

