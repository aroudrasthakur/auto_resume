"""Embedding generation tasks."""

from app.celery_app import celery_app


@celery_app.task(name="worker.app.tasks.embeddings.generate_embedding_for_jd")
def generate_embedding_for_jd(jd_id: str) -> None:
    """Generate embedding for job description."""
    # TODO: Implement embedding generation
    pass

