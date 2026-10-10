"""IEEE Innovation Hub backend tests.
Requires: uvicorn backend.main:app --reload --port 8000
"""
import sys
sys.path.insert(0, "C:/Users/DELL/gemma4-starter")

import requests

BASE = "http://127.0.0.1:8000/api"


def test_ieee_info():
    r = requests.get(f"{BASE}/ieee/info", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "branch_name" in d
    assert "official_url" in d
    assert "disclaimer" in d
    print("ieee_info_ok")


def test_ieee_meta():
    r = requests.get(f"{BASE}/ieee/meta", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert len(d["themes"]) > 0
    assert len(d["statuses"]) > 0
    assert len(d["feedback_categories"]) > 0
    print(f"ieee_meta_ok: {len(d['themes'])} themes, {len(d['statuses'])} statuses")


def test_project_lifecycle():
    # Submit project
    r = requests.post(f"{BASE}/ieee/projects", json={
        "title": "Smart Campus Energy Monitor",
        "theme": "IoT & Embedded Systems",
        "description": "Monitor energy consumption across campus buildings using IoT sensors and display real-time data.",
        "team_size": 3,
        "resources_needed": "Arduino, current sensors, cloud dashboard",
        "from_feedback_id": "",
    }, timeout=30)
    assert r.status_code == 200, f"Submit failed: {r.text}"
    proj = r.json()
    pid = proj["id"]
    assert pid.startswith("PROJ-")
    assert proj["status"] == "Idea Submitted"
    print(f"project_submit_ok: {pid}")

    # Get project
    r2 = requests.get(f"{BASE}/ieee/projects/{pid}", timeout=10)
    assert r2.status_code == 200
    assert r2.json()["id"] == pid
    print("project_get_ok")

    # List projects
    r3 = requests.get(f"{BASE}/ieee/projects", timeout=10)
    assert r3.status_code == 200
    ids = [p["id"] for p in r3.json()["projects"]]
    assert pid in ids
    print(f"project_list_ok: {len(ids)} projects")

    # Update status (valid admin key)
    r4 = requests.patch(f"{BASE}/ieee/projects/{pid}/status", json={
        "status": "Problem Validation",
        "notes": "Validated by test",
        "admin_key": "demo-admin",
    }, timeout=10)
    assert r4.status_code == 200
    assert r4.json()["status"] == "Problem Validation"
    print("project_status_update_ok")

    # Update status (invalid key)
    r5 = requests.patch(f"{BASE}/ieee/projects/{pid}/status", json={
        "status": "Prototype", "notes": "", "admin_key": "wrong-key",
    }, timeout=10)
    assert r5.status_code == 403
    print("project_auth_check_ok")

    # Showcase consent
    r6 = requests.patch(f"{BASE}/ieee/projects/{pid}/consent", json={"consent": True}, timeout=10)
    assert r6.status_code == 200
    assert r6.json()["showcase_consent"] is True
    print("showcase_consent_ok")

    # Showcase list
    r7 = requests.get(f"{BASE}/ieee/projects/showcase", timeout=10)
    assert r7.status_code == 200
    showcase_ids = [p["id"] for p in r7.json()["projects"]]
    assert pid in showcase_ids
    print("showcase_list_ok")

    return pid


def test_feedback_lifecycle():
    r = requests.post(f"{BASE}/ieee/feedback", json={
        "category": "Hands-on Learning",
        "suggestion": "Add more practical IoT lab sessions with real hardware kits for students.",
    }, timeout=30)
    assert r.status_code == 200, f"Feedback failed: {r.text}"
    fb = r.json()
    fid = fb["id"]
    assert fid.startswith("FB-")
    print(f"feedback_submit_ok: {fid}")

    r2 = requests.get(f"{BASE}/ieee/feedback", timeout=10)
    assert r2.status_code == 200
    ids = [f["id"] for f in r2.json()["feedback"]]
    assert fid in ids
    print(f"feedback_list_ok: {len(ids)} records")

    return fid


def test_ieee_stats():
    r = requests.get(f"{BASE}/ieee/stats", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "total_projects" in d
    assert "total_feedback" in d
    assert "showcase_ready" in d
    print(f"ieee_stats_ok: {d['total_projects']} projects, {d['total_feedback']} feedback")


def test_not_found():
    r = requests.get(f"{BASE}/ieee/projects/PROJ-NOTEXIST", timeout=10)
    assert r.status_code == 404
    print("project_not_found_ok")


if __name__ == "__main__":
    try:
        test_ieee_info()
        test_ieee_meta()
        test_project_lifecycle()
        test_feedback_lifecycle()
        test_ieee_stats()
        test_not_found()
        print("\nALL_IEEE_TESTS_PASS")
    except requests.ConnectionError:
        print("SKIP: backend not running on :8000 — start with: uvicorn backend.main:app --reload --port 8000")
        sys.exit(0)
    except AssertionError as e:
        print(f"FAIL: {e}")
        sys.exit(1)
