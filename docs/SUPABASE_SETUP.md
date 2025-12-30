# Supabase Setup Guide

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Access to Supabase dashboard

## Steps

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Project name: `ai-resume-creator` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 2. Enable pgvector Extension

1. Go to Database → Extensions
2. Search for "pgvector"
3. Click "Enable" on the pgvector extension

Alternatively, run this SQL in the SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Get Connection Details

1. Go to Project Settings → Database
2. Copy the following:
   - Connection string (URI format)
   - Connection pooler (if using)
3. Go to Project Settings → API
4. Copy:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_KEY) - Keep this secret!

### 4. Create Storage Bucket

1. Go to Storage → Buckets
2. Click "New bucket"
3. Name: `generated-resumes`
4. Public: **Unchecked** (private bucket)
5. Click "Create bucket"

### 5. Configure Storage Policies (RLS)

1. Go to Storage → Policies
2. Select `generated-resumes` bucket
3. Create policy: "Users can upload their own files"

```sql
-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

Note: Since we're using AWS Cognito for auth, you may need to adjust these policies or use service_role key for storage operations.

### 6. Update Environment Variables

Copy the values to your `.env` file:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

### 7. Run Migrations

After setting up Alembic, run:

```bash
cd migrations
alembic upgrade head
```

This will create all tables and indexes.

## Verification

Run this SQL in Supabase SQL Editor to verify pgvector is enabled:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see a row with `extname = 'vector'`.

## Production Considerations

- Use connection pooling for production (Supabase provides pooler URLs)
- Set up database backups
- Monitor storage usage
- Consider upgrading plan if needed for production scale

