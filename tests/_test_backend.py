"""Verify FastAPI app loads and all expected routes are registered."""
import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Health check (no API key needed)
r = client.get("/api/health")
assert r.status_code == 200, f"Health check failed: {r.status_code}"
data = r.json()
assert data["status"] == "ok"
assert "gemma" in data["model"].lower() or "gemma" in data["model"]
print(f"health_ok: model={data['model']}")

# Categories endpoint
r = client.get("/api/complaints/categories")
assert r.status_code == 200
cats = r.json()
assert len(cats["categories"]) == 9
assert len(cats["statuses"]) == 5
print(f"categories_ok: {len(cats['categories'])} categories")

# Dashboard endpoint
r = client.get("/api/dashboard")
assert r.status_code == 200
dash = r.json()
assert "total" in dash
assert "by_category" in dash
assert "by_status" in dash
print(f"dashboard_ok: total={dash['total']}")

# List complaints
r = client.get("/api/complaints")
assert r.status_code == 200
print(f"list_complaints_ok: {r.json()['total']} records")

# Submit complaint (no AI call — uses fallback)
import os
os.environ["GEMMA_CACHE"] = "0"  # disable cache for test
r = client.post("/api/complaints", json={
    "category": "Washrooms",
    "title": "Test complaint from backend test",
    "description": "Washroom on floor 2 has no water supply since morning.",
    "location": "Block B, Floor 2"
})
assert r.status_code == 200, f"Submit failed: {r.text}"
result = r.json()
cid = result["complaint"]["id"]
assert cid.startswith("CS-")
print(f"submit_ok: id={cid}")

# Get complaint by ID
r = client.get(f"/api/complaints/{cid}")
assert r.status_code == 200
assert r.json()["id"] == cid
print(f"get_complaint_ok: {cid}")

# 404 for unknown ID
r = client.get("/api/complaints/CS-NOTEXIST")
assert r.status_code == 404
print("not_found_ok")

# Admin update — wrong key
r = client.patch(f"/api/complaints/{cid}/status", json={"status": "Resolved", "notes": "", "admin_key": "wrong"})
assert r.status_code == 403
print("auth_check_ok")

# Admin update — correct key
r = client.patch(f"/api/complaints/{cid}/status", json={"status": "Resolved", "notes": "Fixed.", "admin_key": "demo-admin"})
assert r.status_code == 200
assert r.json()["status"] == "Resolved"
print("status_update_ok")

# Notice summarize — too short
r = client.post("/api/notices/summarize", json={"text": "short"})
assert r.status_code == 422
print("notice_validation_ok")

print("\nALL_BACKEND_TESTS_PASS")
