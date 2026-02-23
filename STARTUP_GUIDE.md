## LaTeX (for PDF resume generation)

The worker compiles LaTeX to PDF. Install one of:

- **MiKTeX** (Windows): https://miktex.org/download — provides `pdflatex`
- **Tectonic**: https://tectonic-typesetting.github.io/

Ensure the chosen tool is on your PATH. If MiKTeX is installed but not on PATH (e.g. Celery started before PATH was updated), add to `.env`:

```
PDFLATEX_PATH=C:\Program Files\MiKTeX\miktex\bin\x64\pdflatex.exe
```

(Adjust the path to match your MiKTeX installation.)

## Run Services (four terminals)

Resume generation requires Redis + Celery worker. Start them before generating.

1. **Redis (Docker)** – required for Celery

```bash
docker compose up -d redis
```

2. **Backend API**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Celery Worker** – required for resume generation

```bash
cd worker
celery -A app.celery_app worker --loglevel=info
```

4. **Frontend**

```bash
cd frontend
pnpm dev
```

Access:

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Database migrations

After pulling changes that add migrations, run:

```bash
cd migrations
alembic upgrade head
```

(Requires `DATABASE_URL` in `.env` and `poetry install` or `pip install alembic`.)

## DEV_AUTH_BYPASS (local development)

When using `DEV_AUTH_BYPASS=true`, seed the dev app_user so profile creation works:

```bash
# From project root, with DATABASE_URL in env
python migrations/seed.py
```

## Cognito Checks (common login issues)

- App client → Hosted UI:
  - Callback URLs: `http://localhost:3000/callback`
  - Sign-out URLs: `http://localhost:3000`
  - Grant type: Authorization code
  - Scopes: `openid`, `email`, `profile`
- If you change Hosted UI settings, restart `pnpm dev`.

## Stopping Services

- Frontend/backend/worker: Ctrl+C in each terminal.
- Redis: `docker compose down` (if you only brought up redis, `docker compose stop redis`).
