"""CampusSaathi AI — FastAPI backend.
Run: uvicorn backend.main:app --reload --port 8000
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator
from typing import Optional
import os

import gemma_client
from campus_saathi import data as db
from campus_saathi import ai
from campus_saathi import ieee_data as idb

app = FastAPI(title="CampusSaathi AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                   "http://localhost:4173", "http://127.0.0.1:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: list = []

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Message cannot be empty")
        return v[:2000]


class ComplaintRequest(BaseModel):
    category: str
    title: str
    description: str
    location: str = ""

    @field_validator("category")
    @classmethod
    def valid_category(cls, v):
        if v not in db.CATEGORIES:
            raise ValueError(f"Invalid category. Must be one of: {db.CATEGORIES}")
        return v

    @field_validator("description")
    @classmethod
    def description_length(cls, v):
        if len(v.strip()) < 15:
            raise ValueError("Description must be at least 15 characters")
        return v.strip()[:3000]

    @field_validator("title")
    @classmethod
    def title_length(cls, v):
        if len(v.strip()) < 5:
            raise ValueError("Title must be at least 5 characters")
        return v.strip()[:200]


class StatusUpdateRequest(BaseModel):
    status: str
    notes: str = ""
    admin_key: str = ""

    @field_validator("status")
    @classmethod
    def valid_status(cls, v):
        if v not in db.STATUSES:
            raise ValueError(f"Invalid status")
        return v


class NoticeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_length(cls, v):
        if len(v.strip()) < 20:
            raise ValueError("Notice text too short")
        return v.strip()[:5000]


class ProjectRequest(BaseModel):
    title: str
    theme: str
    description: str
    team_size: int = 1
    resources_needed: str = ""
    from_feedback_id: str = ""

    @field_validator("title")
    @classmethod
    def title_ok(cls, v):
        if len(v.strip()) < 5:
            raise ValueError("Title must be at least 5 characters")
        return v.strip()[:200]

    @field_validator("theme")
    @classmethod
    def theme_ok(cls, v):
        if v not in idb.PROJECT_THEMES:
            raise ValueError(f"Invalid theme")
        return v

    @field_validator("description")
    @classmethod
    def desc_ok(cls, v):
        if len(v.strip()) < 15:
            raise ValueError("Description must be at least 15 characters")
        return v.strip()[:2000]


class ProjectStatusRequest(BaseModel):
    status: str
    notes: str = ""
    admin_key: str = ""

    @field_validator("status")
    @classmethod
    def status_ok(cls, v):
        if v not in idb.PROJECT_STATUSES:
            raise ValueError("Invalid status")
        return v


class FeedbackRequest(BaseModel):
    category: str
    suggestion: str

    @field_validator("category")
    @classmethod
    def cat_ok(cls, v):
        if v not in idb.FEEDBACK_CATEGORIES:
            raise ValueError("Invalid category")
        return v

    @field_validator("suggestion")
    @classmethod
    def sug_ok(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Suggestion too short")
        return v.strip()[:1000]


class ShowcaseConsentRequest(BaseModel):
    consent: bool


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "model": gemma_client.MODEL}


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        history, _ = ai.campus_chat(req.history, req.message)
        reply = history[-1]["content"] if history else ""
        return {"reply": reply, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=gemma_client.describe_error(e))


@app.post("/api/chat/reset")
def chat_reset():
    ai.reset_chat()
    return {"status": "reset"}


# ── Complaints ────────────────────────────────────────────────────────────────

@app.get("/api/complaints/categories")
def get_categories():
    return {"categories": db.CATEGORIES, "statuses": db.STATUSES}


@app.post("/api/complaints")
def submit_complaint(req: ComplaintRequest):
    try:
        ai_data = ai.analyze_complaint(req.category, req.location, req.description)
    except Exception:
        ai_data = {
            "category": req.category, "summary": req.title,
            "priority": "Medium", "priority_reason": "Auto-analysis unavailable.",
            "next_action": "Manual review required.", "missing_info": "",
        }

    full_description = f"{req.title}\n\n{req.description}"
    complaint = db.submit_complaint(
        category=ai_data.get("category", req.category),
        location=req.location,
        description=full_description,
        ai_summary=ai_data.get("summary", req.title),
        ai_priority=ai_data.get("priority", "Medium"),
    )
    return {
        "complaint": complaint,
        "ai_analysis": ai_data,
    }


@app.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: str):
    c = db.get_complaint(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found")
    return c


@app.patch("/api/complaints/{complaint_id}/status")
def update_status(complaint_id: str, req: StatusUpdateRequest):
    # Simple admin key check — env var ADMIN_KEY, defaults to "demo-admin"
    expected = os.environ.get("ADMIN_KEY", "demo-admin")
    if req.admin_key != expected:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    c = db.update_status(complaint_id, req.status, req.notes)
    if not c:
        raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found")
    return c


@app.get("/api/complaints")
def list_complaints(category: str = "", status: str = "", limit: int = 50):
    records = db.all_complaints()
    if category:
        records = [r for r in records if r["category"] == category]
    if status:
        records = [r for r in records if r["status"] == status]
    records = sorted(records, key=lambda x: x["created_at"], reverse=True)
    return {"complaints": records[:limit], "total": len(records)}


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def dashboard():
    return db.dashboard_stats()


# ── Notices ───────────────────────────────────────────────────────────────────

@app.post("/api/notices/summarize")
def summarize_notice(req: NoticeRequest):
    try:
        result = ai.summarize_notice(req.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=gemma_client.describe_error(e))


# ── IEEE / Innovation Hub ────────────────────────────────────────────────────

@app.get("/api/ieee/info")
def ieee_info():
    return idb.VERIFIED_IEEE_INFO


@app.get("/api/ieee/meta")
def ieee_meta():
    return {
        "themes": idb.PROJECT_THEMES,
        "statuses": idb.PROJECT_STATUSES,
        "feedback_categories": idb.FEEDBACK_CATEGORIES,
    }


@app.post("/api/ieee/projects")
def create_project(req: ProjectRequest):
    try:
        # Ask Gemma for project suggestions
        prompt = (
            f"Student project proposal:\nTitle: {req.title}\n"
            f"Theme: {req.theme}\nDescription: {req.description}\n"
            "Give 3 concise, practical suggestions to improve this project proposal. "
            "Focus on feasibility, impact, and learning outcomes. Max 150 words."
        )
        ai_suggestions = gemma_client.ask(prompt)
    except Exception:
        ai_suggestions = ""
    project = idb.submit_project(
        title=req.title, theme=req.theme, description=req.description,
        team_size=req.team_size, resources_needed=req.resources_needed,
        from_feedback_id=req.from_feedback_id,
    )
    project["ai_suggestions"] = ai_suggestions
    # persist ai_suggestions
    records = idb._load(idb.PROJECTS_FILE)
    for p in records:
        if p["id"] == project["id"]:
            p["ai_suggestions"] = ai_suggestions
            break
    idb._save(idb.PROJECTS_FILE, records)
    return project


@app.get("/api/ieee/projects")
def list_projects(theme: str = "", status: str = ""):
    return {"projects": idb.all_projects(theme, status)}


@app.get("/api/ieee/projects/showcase")
def showcase():
    return {"projects": idb.showcase_projects()}


@app.get("/api/ieee/projects/{project_id}")
def get_project(project_id: str):
    p = idb.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return p


@app.patch("/api/ieee/projects/{project_id}/status")
def update_project_status(project_id: str, req: ProjectStatusRequest):
    p = idb.update_project_status(project_id, req.status, req.notes, req.admin_key)
    if p is None:
        raise HTTPException(status_code=403, detail="Invalid admin key or project not found")
    return p


@app.patch("/api/ieee/projects/{project_id}/consent")
def set_consent(project_id: str, req: ShowcaseConsentRequest):
    p = idb.set_showcase_consent(project_id, req.consent)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p


@app.post("/api/ieee/feedback")
def submit_feedback(req: FeedbackRequest):
    try:
        prompt = (
            f"Student feedback about campus learning:\n"
            f"Category: {req.category}\nSuggestion: {req.suggestion}\n"
            "Propose 2-3 practical technical or organizational solutions a student team could implement. "
            "Be specific and realistic. Max 120 words."
        )
        ai_solutions = gemma_client.ask(prompt)
    except Exception:
        ai_solutions = ""
    fb = idb.submit_feedback(req.category, req.suggestion, ai_solutions)
    return fb


@app.get("/api/ieee/feedback")
def list_feedback(category: str = ""):
    return {"feedback": idb.all_feedback(category)}


@app.get("/api/ieee/stats")
def ieee_stats():
    return idb.ieee_stats()


@app.post("/api/notices/summarize-image")
async def summarize_notice_image(file: UploadFile = File(...)):
    allowed = {"image/png", "image/jpeg", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PNG/JPEG/WEBP images are supported")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    import tempfile, pathlib
    suffix = pathlib.Path(file.filename or "upload.png").suffix or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        extracted = gemma_client.ask_with_image(
            tmp_path, "Extract all text from this notice image exactly as written."
        )
        result = ai.summarize_notice(extracted)
        result["extracted_text"] = extracted
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=gemma_client.describe_error(e))
    finally:
        pathlib.Path(tmp_path).unlink(missing_ok=True)
