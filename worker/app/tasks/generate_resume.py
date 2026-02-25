"""Main resume generation task."""

import json
from typing import Dict

from celery import Task
from shared.app.constants import GenerationStatus
from supabase import Client, create_client

from app.ai.ats_scorer import ai_output_to_text, compute_ats_score
from app.ai.provider import get_ai_provider
from app.celery_app import celery_app
from app.core.config import settings
from app.latex.compiler import compile_pdf
from app.latex.renderer import render_latex
from app.storage.client import upload_file

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def _update_step(generated_resume_id: str, step: str) -> None:
    """Update current_step in generated_resume for live status display."""
    supabase.table("generated_resume").update({"current_step": step}).eq(
        "id", generated_resume_id
    ).execute()


@celery_app.task(bind=True, name="worker.app.tasks.generate_resume.generate_resume")
def generate_resume(self: Task, generated_resume_id: str) -> Dict:
    """
    Generate resume task.

    Steps:
    1. Fetch record, set RUNNING
    2. GENERATING_BULLETS -> First OpenAI call
    3. FINALIZING_RESUME -> Second OpenAI call
    4. RENDERING_TEMPLATE -> Jinja2 LaTeX
    5. COMPILING_PDF -> Tectonic
    6. UPLOADING -> Supabase Storage
    7. DONE
    """
    try:
        result = (
            supabase.table("generated_resume").select("*").eq("id", generated_resume_id).execute()
        )

        if not result.data:
            # Record may have been deleted or task is stale; skip without raising
            return {
                "status": "skipped",
                "generated_resume_id": generated_resume_id,
                "reason": "not_found",
            }

        gen_resume = result.data[0]

        supabase.table("generated_resume").update({"status": GenerationStatus.RUNNING}).eq(
            "id", generated_resume_id
        ).execute()

        from shared.app.utils.compress import decompress_text, unpack_profile_snapshot

        profile_snapshot = unpack_profile_snapshot(gen_resume.get("profile_snapshot"))
        jd_text = decompress_text(gen_resume.get("jd_snapshot") or "")

        ai_provider = get_ai_provider()

        def update_step(step: str) -> None:
            _update_step(generated_resume_id, step)

        ai_output = ai_provider.generate_content(
            profile_snapshot=profile_snapshot,
            job_description=jd_text,
            page_count=gen_resume["page_count"],
            include_projects=gen_resume["include_projects"],
            include_skills=gen_resume["include_skills"],
            update_step=update_step,
        )

        _update_step(generated_resume_id, "RENDERING_TEMPLATE")
        latex_content = render_latex(
            profile_data=profile_snapshot,
            ai_output=ai_output,
            include_projects=gen_resume["include_projects"],
            include_skills=gen_resume["include_skills"],
        )

        _update_step(generated_resume_id, "COMPILING_PDF")
        pdf_bytes = compile_pdf(latex_content)

        _update_step(generated_resume_id, "UPLOADING")
        user_id = gen_resume["user_id"]
        storage_key_latex = f"{user_id}/{generated_resume_id}/resume.tex"
        storage_key_pdf = f"{user_id}/{generated_resume_id}/resume.pdf"

        upload_file(storage_key_latex, latex_content.encode("utf-8"), "text/x-latex")
        upload_file(storage_key_pdf, pdf_bytes, "application/pdf")

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

        _update_step(generated_resume_id, "CHECKING_ATS")
        ats_result = compute_ats_score(
            resume_text=ai_output_to_text(ai_output),
            job_description=jd_text,
        )
        update_payload: Dict = {
            "status": GenerationStatus.DONE,
            "current_step": None,
            "ai_output_json": json.dumps(ai_output),
            "provider": ai_provider.get_provider_name(),
        }
        if ats_result:
            update_payload["ats_score"] = ats_result.get("score")
            update_payload["ats_feedback"] = ats_result.get("feedback") or None

        supabase.table("generated_resume").update(update_payload).eq(
            "id", generated_resume_id
        ).execute()

        return {"status": "success", "generated_resume_id": generated_resume_id}

    except Exception as e:
        supabase.table("generated_resume").update(
            {
                "status": GenerationStatus.FAILED,
                "current_step": None,
                "failure_reason": str(e),
            }
        ).eq("id", generated_resume_id).execute()
        raise
