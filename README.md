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

## Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd auto_resume
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `DATABASE_URL`
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_REGION` (or set `DEV_AUTH_BYPASS=true`)
- `AI_PROVIDER` (openai/mock/ollama)
- `OPENAI_API_KEY` (if using OpenAI)
- `ENCRYPTION_KEY` (64-character hex string)
- `REDIS_URL`

### 3. Setup Supabase

1. Create a Supabase project at https://supabase.com
2. Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Create storage bucket: `generated-resumes` (private)
4. See `docs/SUPABASE_SETUP.md` for detailed instructions

### 4. Run Database Migrations

```bash
cd migrations
poetry install
poetry run alembic upgrade head
poetry run python seed.py  # Seed template data
```

### 5. Install Dependencies

```bash
# Backend
cd backend
poetry install

# Worker
cd ../worker
poetry install

# Shared
cd ../shared
poetry install

# Frontend
cd ../frontend
pnpm install
```

### 6. Start Services

```bash
# Start Redis
docker compose up -d redis

# Start backend (in one terminal)
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start worker (in another terminal)
cd worker
poetry run celery -A app.celery_app worker --loglevel=info

# Start frontend (in another terminal)
cd frontend
pnpm dev
```

### 7. Access Application

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

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

