## AI Model (resume generation speed)

Default model is `gpt-4o-mini` for sub-60s generation. For higher quality, set in `.env`:

```
OPENAI_MODEL=gpt-4o
```

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
celery -A app.celery_app worker --loglevel=info --pool=solo
```

Use `--pool=solo` on Windows (required; avoids `PermissionError: Access is denied`). On Linux/Mac you can omit it for multi-worker concurrency.

4. **Frontend**

```bash
cd frontend
pnpm dev
```

Access:

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Storage (resume uploads)

**Option A – Local storage (no Supabase Storage needed)**

Add to `.env`:

```
STORAGE_LOCAL_ENABLED=true
STORAGE_LOCAL_DIR=./storage/generated-resumes
```

Local storage is **always disabled in production** (`ENVIRONMENT=production`), even if enabled in `.env`. Use a path relative to the project root or an absolute path. Restart both worker and backend after changing. Directories are created automatically on first upload.

**Option B – Supabase Storage**

If you see "Bucket not found", create the bucket:

1. Supabase Dashboard → **Storage** → **Buckets**
2. Click **New bucket**
3. Name: `generated-resumes`
4. Public: **Unchecked** (private)
5. Click **Create bucket**

See `docs/SUPABASE_SETUP.md` for storage policies.

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
