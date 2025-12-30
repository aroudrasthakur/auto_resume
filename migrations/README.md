# Database Migrations

This directory contains Alembic migrations for the database schema.

## Setup

1. Install dependencies:
```bash
poetry install
```

2. Configure database URL in `.env`:
```
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

## Running Migrations

### Apply all migrations
```bash
alembic upgrade head
```

### Create a new migration
```bash
alembic revision --autogenerate -m "description"
```

### Rollback one migration
```bash
alembic downgrade -1
```

### View migration history
```bash
alembic history
```

## Seeding

Run the seed script to insert initial template data:
```bash
poetry run python seed.py
```

This inserts the `JakesResumeATS` template record.

