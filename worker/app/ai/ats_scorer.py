"""ATS (Applicant Tracking System) score for resume vs job description."""

import json
from typing import Any, Dict, List, Optional

from langchain_openai import ChatOpenAI

from app.core.config import settings


def ai_output_to_text(ai_output: Dict[str, Any]) -> str:
    """Convert ai_output dict to plain text for ATS scoring."""
    if not ai_output:
        return ""
    parts: List[str] = []
    for edu in ai_output.get("education") or []:
        if isinstance(edu, dict):
            parts.append(edu.get("school", ""))
            parts.append(edu.get("degree", ""))
            parts.append(edu.get("major", ""))
            for h in edu.get("highlights", []):
                parts.append((h.get("highlight", h.get("bullet", str(h))) if isinstance(h, dict) else str(h)))
    for exp in ai_output.get("experience") or []:
        if isinstance(exp, dict):
            parts.append(exp.get("company", ""))
            parts.append(exp.get("role", ""))
            for b in exp.get("bullets", []):
                parts.append((b.get("bullet", b.get("highlight", str(b))) if isinstance(b, dict) else str(b)))
    for proj in ai_output.get("projects") or []:
        if isinstance(proj, dict):
            parts.append(proj.get("name", ""))
            for b in proj.get("bullets", []):
                parts.append((b.get("bullet", str(b)) if isinstance(b, dict) else str(b)))
    skills_raw = ai_output.get("skills") or {}
    cats = skills_raw.get("categories", skills_raw) if isinstance(skills_raw, dict) else skills_raw
    for cat in cats or []:
        if isinstance(cat, dict):
            parts.append(cat.get("name", ""))
            for i in cat.get("items", []):
                parts.append((i.get("item", str(i)) if isinstance(i, dict) else str(i)))
    return " ".join(str(p).strip() for p in parts if p).strip()


def _get_llm() -> ChatOpenAI:
    """Get configured ChatOpenAI instance."""
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY is required")
    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        temperature=0.2,
    )


def compute_ats_score(resume_text: str, job_description: str) -> Optional[Dict]:
    """
    Use OpenAI to score how well the resume matches the job description for ATS.

    Returns:
        {"score": int 0-100, "feedback": str} or None if scoring fails
    """
    if not resume_text or not job_description:
        return None
    try:
        llm = _get_llm()
        prompt = f"""You are an ATS (Applicant Tracking System) expert. Score how well this resume matches the job description for the specific company/role.

JOB DESCRIPTION:
{job_description[:4000]}

RESUME:
{resume_text[:4000]}

Respond with ONLY a JSON object: {{"score": <0-100>, "feedback": "<1-2 sentence summary of strengths and any gaps>"}}
No other text. Score 0-100 where 100 = perfect match."""
        response = llm.invoke(prompt)
        text = response.content.strip()
        # Extract JSON if wrapped in markdown
        if "```" in text:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                text = text[start:end]
        data = json.loads(text)
        score = data.get("score")
        feedback = data.get("feedback", "")
        if score is not None and isinstance(score, (int, float)):
            score = max(0, min(100, int(score)))
            return {"score": score, "feedback": str(feedback)[:500]}
    except Exception:
        pass
    return None
