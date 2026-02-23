"""Seed script to insert initial data.

Uses Supabase REST API (SUPABASE_URL + SUPABASE_SERVICE_KEY) so it works
even when direct Postgres (DATABASE_URL) is unreachable due to DNS/network.
"""

import json
import os
from pathlib import Path
from uuid import UUID, uuid4

# Load .env from project root
try:
    from dotenv import load_dotenv
    _env_file = Path(__file__).resolve().parent.parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file)
except ImportError:
    pass

# Dev user UUID - must match backend/app/auth/dependencies.py DEV_USER_ID
DEV_USER_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"


def get_supabase():
    """Get Supabase client (uses REST API, not direct Postgres)."""
    from supabase import create_client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY are required")
    return create_client(url, key)


def seed_dev_app_user():
    """Insert dev app_user for DEV_AUTH_BYPASS local development."""
    supabase = get_supabase()

    existing = supabase.table("app_user").select("id").eq("id", DEV_USER_ID).execute()
    if existing.data and len(existing.data) > 0:
        print("Dev app_user already exists, skipping seed")
        return

    supabase.table("app_user").insert({
        "id": DEV_USER_ID,
        "cognito_sub": "dev-user-123",
        "email": "dev@example.com",
    }).execute()

    print(f"Inserted dev app_user with id={DEV_USER_ID}")


def seed_resume_template():
    """Insert Jake's Resume template."""
    supabase = get_supabase()

    existing = supabase.table("resume_template").select("id").eq("name", "JakesResumeATS").execute()
    if existing.data and len(existing.data) > 0:
        print("Template JakesResumeATS already exists, skipping seed")
        return

    files_manifest = {
        "files": [
            {"path": "resume.cls", "type": "latex_class"},
            {"path": "template.tex.jinja2", "type": "template"},
        ]
    }

    supabase.table("resume_template").insert({
        "id": str(uuid4()),
        "name": "JakesResumeATS",
        "version": "1.0.0",
        "description": "Jake's Resume template optimized for ATS (Applicant Tracking Systems)",
        "template_kind": "jakes-latex",
        "files_manifest": files_manifest,
    }).execute()

    print("Inserted template JakesResumeATS")


if __name__ == "__main__":
    seed_dev_app_user()
    seed_resume_template()

