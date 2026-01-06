## Run Services (four terminals)

1. **Redis (Docker)**

```bash
docker compose up -d redis
```

2. **Backend API**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Celery Worker**

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
