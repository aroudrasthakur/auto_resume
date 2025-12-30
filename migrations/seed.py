"""Seed script to insert initial data."""

import os
import json
from uuid import uuid4

import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    """Get database connection from environment."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is required")
    return psycopg2.connect(database_url)


def seed_resume_template():
    """Insert Jake's Resume template."""
    conn = get_db_connection()
    cur = conn.cursor()

    # Check if template already exists
    cur.execute("SELECT id FROM resume_template WHERE name = %s", ("JakesResumeATS",))
    if cur.fetchone():
        print("Template JakesResumeATS already exists, skipping seed")
        cur.close()
        conn.close()
        return

    # Files manifest for Jake's Resume template
    files_manifest = {
        "files": [
            {"path": "resume.cls", "type": "latex_class"},
            {"path": "template.tex.jinja2", "type": "template"},
        ]
    }

    template_id = uuid4()

    cur.execute(
        """
        INSERT INTO resume_template (id, name, version, description, template_kind, files_manifest)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            template_id,
            "JakesResumeATS",
            "1.0.0",
            "Jake's Resume template optimized for ATS (Applicant Tracking Systems)",
            "jakes-latex",
            json.dumps(files_manifest),
        ),
    )

    conn.commit()
    print(f"Inserted template JakesResumeATS with ID: {template_id}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    seed_resume_template()

