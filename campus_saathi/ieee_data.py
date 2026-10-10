"""IEEE & Innovation Hub persistence layer.
Stores project proposals, feedback, and event records locally (MVP).
Designed to migrate to PostgreSQL.
"""

import json
import time
import uuid
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROJECTS_FILE = DATA_DIR / "ieee_projects.json"
FEEDBACK_FILE = DATA_DIR / "ieee_feedback.json"

# ── Constants ─────────────────────────────────────────────────────────────────

PROJECT_THEMES = [
    "AI/ML & Data Science",
    "Robotics & Automation",
    "IoT & Embedded Systems",
    "Electronics & Hardware",
    "Software Engineering",
    "Sustainability & Green Tech",
    "Assistive Technology",
    "Open Source",
    "Other",
]

PROJECT_STATUSES = [
    "Idea Submitted",
    "Problem Validation",
    "Team Formation",
    "Prototype",
    "Testing",
    "Review",
    "Showcase",
    "Archived",
]

FEEDBACK_CATEGORIES = [
    "Workshop Quality",
    "Hands-on Learning",
    "Research Support",
    "Lab Access",
    "Project Mentoring",
    "Event Organization",
    "Other",
]

# Verified IEEE KU activities sourced from kalingauniversity.ac.in/ieee
# These are documented activities — not invented future events.
VERIFIED_IEEE_INFO = {
    "branch_name": "IEEE Kalinga University Student Branch",
    "official_url": "https://kalingauniversity.ac.in/ieee",
    "note": (
        "Information sourced from the official Kalinga University IEEE page. "
        "Verify current activities and membership at the official URL above."
    ),
    "documented_activities": [
        "Technical workshops and seminars",
        "Coding competitions and hackathons",
        "Robotics and electronics project activities",
        "Industry expert talks and conferences",
        "Research paper writing guidance",
        "Open-source contribution drives",
    ],
    "disclaimer": (
        "CampusSaathi is not officially operated by IEEE. "
        "It cannot register IEEE members, approve funding, or issue certificates. "
        "Use official IEEE channels for those actions."
    ),
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _load(path: Path) -> list:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def _save(path: Path, records: list) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")


# ── Projects ──────────────────────────────────────────────────────────────────

def submit_project(
    title: str,
    theme: str,
    description: str,
    team_size: int = 1,
    resources_needed: str = "",
    from_feedback_id: str = "",
) -> dict:
    records = _load(PROJECTS_FILE)
    project = {
        "id": "PROJ-" + uuid.uuid4().hex[:8].upper(),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "title": title.strip()[:200],
        "theme": theme,
        "description": description.strip()[:2000],
        "team_size": max(1, min(team_size, 20)),
        "resources_needed": resources_needed.strip()[:500],
        "status": "Idea Submitted",
        "status_notes": "",
        "from_feedback_id": from_feedback_id,
        "showcase_consent": False,
        "ai_suggestions": "",
    }
    records.append(project)
    _save(PROJECTS_FILE, records)
    return project


def get_project(project_id: str) -> dict | None:
    for p in _load(PROJECTS_FILE):
        if p["id"].upper() == project_id.strip().upper():
            return p
    return None


def update_project_status(
    project_id: str, new_status: str, notes: str = "", admin_key: str = ""
) -> dict | None:
    import os
    expected = os.environ.get("ADMIN_KEY", "demo-admin")
    if admin_key != expected:
        return None
    records = _load(PROJECTS_FILE)
    for p in records:
        if p["id"].upper() == project_id.strip().upper():
            p["status"] = new_status
            p["status_notes"] = notes.strip()[:500]
            p["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            _save(PROJECTS_FILE, records)
            return p
    return None


def set_showcase_consent(project_id: str, consent: bool) -> dict | None:
    records = _load(PROJECTS_FILE)
    for p in records:
        if p["id"].upper() == project_id.strip().upper():
            p["showcase_consent"] = consent
            p["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            _save(PROJECTS_FILE, records)
            return p
    return None


def all_projects(theme: str = "", status: str = "") -> list:
    records = _load(PROJECTS_FILE)
    if theme:
        records = [p for p in records if p["theme"] == theme]
    if status:
        records = [p for p in records if p["status"] == status]
    return sorted(records, key=lambda x: x["created_at"], reverse=True)


def showcase_projects() -> list:
    """Only projects with explicit showcase consent."""
    return [p for p in _load(PROJECTS_FILE) if p.get("showcase_consent")]


# ── Feedback ──────────────────────────────────────────────────────────────────

def submit_feedback(category: str, suggestion: str, ai_solutions: str = "") -> dict:
    records = _load(FEEDBACK_FILE)
    fb = {
        "id": "FB-" + uuid.uuid4().hex[:8].upper(),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "category": category,
        "suggestion": suggestion.strip()[:1000],
        "ai_solutions": ai_solutions,
        "converted_to_project": "",
    }
    records.append(fb)
    _save(FEEDBACK_FILE, records)
    return fb


def get_feedback(feedback_id: str) -> dict | None:
    for f in _load(FEEDBACK_FILE):
        if f["id"].upper() == feedback_id.strip().upper():
            return f
    return None


def all_feedback(category: str = "") -> list:
    records = _load(FEEDBACK_FILE)
    if category:
        records = [f for f in records if f["category"] == category]
    return sorted(records, key=lambda x: x["created_at"], reverse=True)


def mark_feedback_converted(feedback_id: str, project_id: str) -> dict | None:
    records = _load(FEEDBACK_FILE)
    for f in records:
        if f["id"].upper() == feedback_id.strip().upper():
            f["converted_to_project"] = project_id
            _save(FEEDBACK_FILE, records)
            return f
    return None


# ── Dashboard stats ───────────────────────────────────────────────────────────

def ieee_stats() -> dict:
    projects = _load(PROJECTS_FILE)
    feedback = _load(FEEDBACK_FILE)
    by_theme = {t: 0 for t in PROJECT_THEMES}
    by_status = {s: 0 for s in PROJECT_STATUSES}
    for p in projects:
        by_theme[p.get("theme", "Other")] = by_theme.get(p.get("theme", "Other"), 0) + 1
        by_status[p.get("status", "Idea Submitted")] = by_status.get(p.get("status", "Idea Submitted"), 0) + 1
    return {
        "total_projects": len(projects),
        "total_feedback": len(feedback),
        "showcase_ready": len([p for p in projects if p.get("showcase_consent")]),
        "by_theme": {k: v for k, v in by_theme.items() if v > 0},
        "by_status": {k: v for k, v in by_status.items() if v > 0},
    }
