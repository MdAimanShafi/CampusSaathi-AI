import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
from campus_saathi import data as db

# Submit a test complaint
c = db.submit_complaint(
    category="Canteen & Mess",
    location="Main Canteen",
    description="Food quality has been poor for the past week.",
    ai_summary="Poor food quality reported at main canteen.",
    ai_priority="Medium",
)
print("Submitted:", c["id"])

# Retrieve it
found = db.get_complaint(c["id"])
assert found is not None, "get_complaint failed"
print("Retrieved:", found["id"], found["status"])

# Update status
updated = db.update_status(c["id"], "Under Review", "Forwarded to canteen manager.")
assert updated["status"] == "Under Review"
print("Updated status:", updated["status"])

# Dashboard stats
stats = db.dashboard_stats()
assert stats["total"] >= 1
print("Dashboard total:", stats["total"])

print("data_layer_ok")
