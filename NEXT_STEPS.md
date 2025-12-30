# Next Steps - Getting Your App Running

Based on your current setup, here's what to do next:

## ✅ What's Already Done

- ✅ Project structure created
- ✅ Requirements.txt fixed and compatible
- ✅ Virtual environment created
- ✅ .env file exists

## 🎯 Immediate Next Steps

### Step 1: Install Python Dependencies (5 minutes)

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install all requirements
pip install -r requirements.txt

# Install shared package
pip install -e ./shared

# Install dev dependencies (optional but recommended)
pip install -r requirements-dev.txt
```

**Verify installation:**

```powershell
python -c "import fastapi, supabase, celery; print('All packages installed successfully!')"
```

### Step 2: Install Frontend Dependencies (2 minutes)

Open a **new terminal**:

```powershell
cd frontend
pnpm install
```

**Verify installation:**

```powershell
pnpm --version
```

### Step 3: Configure Supabase (10 minutes)

If you haven't set up Supabase yet:

1. **Go to**: https://supabase.com/dashboard
2. **Create Project** (or use existing)
3. **Enable pgvector**: SQL Editor → Run `CREATE EXTENSION IF NOT EXISTS vector;`
4. **Get Credentials**:
   - Project Settings → API → Copy URL, anon key, service key
   - Project Settings → Database → Copy connection string
5. **Create Storage Bucket**: Storage → New bucket → `generated-resumes` (private)

### Step 4: Update .env File

Edit your `.env` file with Supabase credentials:

```bash
# Replace these with your actual Supabase values
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Keep these for local dev
DEV_AUTH_BYPASS=true
AI_PROVIDER=mock
```

### Step 5: Run Database Migrations (2 minutes)

```powershell
# Make sure venv is activated
.\venv\Scripts\Activate.ps1

cd migrations
alembic upgrade head
python seed.py
```

**Expected output:**

- `INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial`
- `Inserted template JakesResumeATS with ID: ...`

### Step 6: Start All Services (4 terminals)

#### Terminal 1: Redis

```powershell
docker compose up -d redis
docker ps  # Verify it's running
```

#### Terminal 2: Backend API

```powershell
.\venv\Scripts\Activate.ps1
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected**: `INFO:     Uvicorn running on http://0.0.0.0:8000`

#### Terminal 3: Celery Worker

```powershell
.\venv\Scripts\Activate.ps1
cd worker
celery -A app.celery_app worker --loglevel=info
```

**Expected**: `[tasks] . worker.app.tasks.generate_resume.generate_resume`

#### Terminal 4: Frontend

```powershell
cd frontend
pnpm dev
```

**Expected**: `▲ Next.js 14.0.4 - Local: http://localhost:3000`

### Step 7: Verify Everything Works

1. **Backend Health**: http://localhost:8000/health

   - Should return: `{"status":"healthy","service":"ai-resume-creator-api"}`

2. **API Docs**: http://localhost:8000/docs

   - Should show Swagger UI with all endpoints

3. **Frontend**: http://localhost:3000
   - Should load the dashboard

## 🚀 Quick Command Reference

```powershell
# Install everything
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -e ./shared
pip install -r requirements-dev.txt

cd frontend
pnpm install

# Run migrations
cd migrations
alembic upgrade head
python seed.py

# Start services (in separate terminals)
docker compose up -d redis
cd backend && uvicorn app.main:app --reload
cd worker && celery -A app.celery_app worker --loglevel=info
cd frontend && pnpm dev
```

## 🐛 Troubleshooting

### Issue: "Module not found"

**Solution**: Make sure virtual environment is activated: `.\venv\Scripts\Activate.ps1`

### Issue: Database connection fails

**Solution**:

- Check `.env` file has correct `DATABASE_URL`
- Verify Supabase project is active
- Check password in URL matches Supabase password

### Issue: Redis connection refused

**Solution**: `docker compose up -d redis` and verify with `docker ps`

### Issue: Port already in use

**Solution**: Change `API_PORT` in `.env` or stop other services

## 📝 Checklist

- [ ] Python dependencies installed
- [ ] Shared package installed (`pip install -e ./shared`)
- [ ] Frontend dependencies installed (`pnpm install`)
- [ ] Supabase project created and configured
- [ ] `.env` file updated with Supabase credentials
- [ ] Database migrations run (`alembic upgrade head`)
- [ ] Redis running (`docker compose up -d redis`)
- [ ] Backend running (http://localhost:8000/docs)
- [ ] Worker running (Celery tasks visible)
- [ ] Frontend running (http://localhost:3000)

## 🎉 Once Everything is Running

1. **Create a Profile**: http://localhost:3000/dashboard/profile
2. **Add Experience**: http://localhost:3000/dashboard/experience
3. **Generate Resume**: http://localhost:3000/dashboard/generate

You're ready to generate your first AI-powered resume!
