"""Main resume generation task."""

import json
import os
from typing import Dict

from celery import Task
from supabase import Client, create_client

import os
from typing import Dict

from celery import Task
from supabase import Client, create_client

from worker.app.ai.provider import get_ai_provider
from worker.app.celery_app import celery_app
from worker.app.core.config import settings
from worker.app.latex.compiler import compile_pdf
from worker.app.latex.renderer import render_latex
from worker.app.storage.client import upload_file
from shared.app.constants import GenerationStatus

# Initialize Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
)


@celery_app.task(bind=True, name="worker.app.tasks.generate_resume.generate_resume")
def generate_resume(self: Task, generated_resume_id: str) -> Dict:
    """
    Generate resume task.

    Steps:
    1. Fetch generated_resume record
    2. Update status to RUNNING
    3. Generate JD embedding if needed
    4. Vector search for relevant content
    5. Call AI provider
    6. Validate and repair AI output
    7. Render LaTeX
    8. Compile PDF
    9. Generate DOCX (if requested)
    10. Upload files to Supabase Storage
    11. Update status to DONE or FAILED
    """
    try:
        # Fetch record
        result = (
            supabase.table("generated_resume")
            .select("*")
            .eq("id", generated_resume_id)
            .execute()
        )

        if not result.data:
            raise ValueError(f"Generated resume {generated_resume_id} not found")

        gen_resume = result.data[0]

        # Update status to RUNNING
        supabase.table("generated_resume").update({"status": GenerationStatus.RUNNING}).eq(
            "id", generated_resume_id
        ).execute()

        # Load profile snapshot
        profile_snapshot = json.loads(gen_resume["profile_snapshot"])
        jd_text = gen_resume["jd_snapshot"]

        # Get AI provider
        ai_provider = get_ai_provider()

        # Generate content with AI
        ai_output = ai_provider.generate_content(
            profile_snapshot=profile_snapshot,
            job_description=jd_text,
            page_count=gen_resume["page_count"],
            include_projects=gen_resume["include_projects"],
            include_skills=gen_resume["include_skills"],
        )

        # Render LaTeX
        latex_content = render_latex(
            profile_data=profile_snapshot,
            ai_output=ai_output,
            include_projects=gen_resume["include_projects"],
            include_skills=gen_resume["include_skills"],
        )

        # Compile PDF
        pdf_bytes = compile_pdf(latex_content)

        # Upload files
        user_id = gen_resume["user_id"]
        storage_key_latex = f"{user_id}/{generated_resume_id}/resume.tex"
        storage_key_pdf = f"{user_id}/{generated_resume_id}/resume.pdf"

        upload_file(storage_key_latex, latex_content.encode("utf-8"), "text/x-latex")
        upload_file(storage_key_pdf, pdf_bytes, "application/pdf")

        # Store file records
        supabase.table("generated_file").insert(
            [
                {
                    "generated_resume_id": generated_resume_id,
                    "user_id": user_id,
                    "type": "LATEX",
                    "storage_key": storage_key_latex,
                    "mime_type": "text/x-latex",
                    "size_bytes": len(latex_content.encode("utf-8")),
                },
                {
                    "generated_resume_id": generated_resume_id,
                    "user_id": user_id,
                    "type": "PDF",
                    "storage_key": storage_key_pdf,
                    "mime_type": "application/pdf",
                    "size_bytes": len(pdf_bytes),
                },
            ]
        ).execute()

        # Update status to DONE
        supabase.table("generated_resume").update(
            {
                "status": GenerationStatus.DONE,
                "ai_output_json": json.dumps(ai_output),
                "provider": ai_provider.get_provider_name(),
            }
        ).eq("id", generated_resume_id).execute()

        return {"status": "success", "generated_resume_id": generated_resume_id}

    except Exception as e:
        # Update status to FAILED
        supabase.table("generated_resume").update(
            {"status": GenerationStatus.FAILED, "failure_reason": str(e)}
        ).eq("id", generated_resume_id).execute()
        raise

