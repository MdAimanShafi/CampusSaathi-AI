"""JSON persistence layer for complaints. Designed to migrate to PostgreSQL later."""

import json
import time
import uuid
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
COMPLAINTS_FILE = DATA_DIR / "complaints.json"

CATEGORIES = [
    "Canteen & Mess",
    "Washrooms",
    "Parking",
    "Hostel",
    "Library",
    "Labs & Classrooms",
    "Transport",
    "Health & Safety",
    "Sports & Other",
]

STATUSES = ["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"]


def _load() -> list:
    try:
        return json.loads(COMPLAINTS_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def _save(records: list) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    COMPLAINTS_FILE.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")


def submit_complaint(category: str, location: str, description: str,
                     ai_summary: str = "", ai_priority: str = "") -> dict:
    records = _load()
    # Duplicate protection: same category + description submitted within 60 seconds
    now_ts = time.time()
    for r in records:
        if (r["category"] == category
                and r["description"].strip().lower() == description.strip().lower()):
            try:
                existing_ts = time.mktime(time.strptime(r["created_at"], "%Y-%m-%d %H:%M:%S"))
                if now_ts - existing_ts < 60:
                    return r  # return existing record silently
            except Exception:
                pass
    complaint = {
        "id": "CS-" + uuid.uuid4().hex[:8].upper(),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "category": category,
        "location": location.strip(),
        "description": description.strip(),
        "ai_summary": ai_summary,
        "ai_priority": ai_priority,
        "status": "Submitted",
        "resolution_notes": "",
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    records.append(complaint)
    _save(records)
    return complaint


def get_complaint(complaint_id: str) -> dict | None:
    for c in _load():
        if c["id"].upper() == complaint_id.strip().upper():
            return c
    return None


def update_status(complaint_id: str, new_status: str, notes: str = "") -> dict | None:
    records = _load()
    for c in records:
        if c["id"].upper() == complaint_id.strip().upper():
            c["status"] = new_status
            c["resolution_notes"] = notes
            c["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            _save(records)
            return c
    return None


def all_complaints() -> list:
    return _load()


def dashboard_stats() -> dict:
    records = _load()
    by_cat = {c: 0 for c in CATEGORIES}
    by_status = {s: 0 for s in STATUSES}
    for r in records:
        by_cat[r.get("category", "Other")] = by_cat.get(r.get("category", "Other"), 0) + 1
        by_status[r.get("status", "Submitted")] = by_status.get(r.get("status", "Submitted"), 0) + 1
    return {
        "total": len(records),
        "by_category": by_cat,
        "by_status": by_status,
        "recent": sorted(records, key=lambda x: x["created_at"], reverse=True)[:5],
    }
