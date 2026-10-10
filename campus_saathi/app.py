"""CampusSaathi AI — Kalinga University Smart Campus
Run: python campus_saathi/app.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import gradio as gr

from campus_saathi.theme import CSS
from campus_saathi import data as db
from campus_saathi import ai

HERO_HTML = """
<div class="hero-wrap">
  <div class="hero-title">🎓 CampusSaathi AI</div>
  <div class="hero-sub">Kalinga University Smart Campus &nbsp;·&nbsp; Every Campus Problem. One Intelligent Solution.</div>
  <div class="hero-badges">
    <span class="badge">⚡ Gemma 4 Powered</span>
    <span class="badge">🏛️ Kalinga University</span>
    <span class="badge">🤖 AI Complaint Analysis</span>
    <span class="badge">📋 Smart Notices</span>
  </div>
</div>
"""

CAMPUS_INFO_HTML = """
<div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1rem;">
  <div class="section-title">🏛️ Official Campus Links</div>
  <p style="color:#94a3b8;font-size:0.85rem;margin:0.3rem 0;">
    🌐 <a href="https://www.kalingauniversity.ac.in/campus-facilities" target="_blank" style="color:#00d4ff;">Campus Facilities</a> &nbsp;|&nbsp;
    📝 <a href="https://kalingauniversity.ac.in/grievance-redressal" target="_blank" style="color:#00d4ff;">Grievance Redressal</a> &nbsp;|&nbsp;
    🎥 <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank" style="color:#00d4ff;">Official 360° Virtual Tour ↗</a>
  </p>
  <p style="color:#64748b;font-size:0.75rem;margin:0.5rem 0 0;">
    ℹ️ CampusSaathi stores complaints locally (MVP). It is not officially integrated with university systems.
    AI responses are suggestions, not official decisions.
  </p>
</div>
"""

EXPLORER_HTML = """
<div style="text-align:center;padding:2rem 1rem;">
  <div style="font-size:3rem;margin-bottom:1rem;">🗺️</div>
  <div style="font-size:1.3rem;font-weight:700;color:#00d4ff;margin-bottom:0.5rem;">Kalinga University Campus Explorer</div>
  <p style="color:#94a3b8;max-width:500px;margin:0 auto 1.5rem;">
    Explore the campus in an immersive 360° virtual tour — officially provided by Kalinga University.
  </p>
  <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank"
     style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#3b82f6);color:#fff;
            padding:0.75rem 2rem;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;">
    🎥 Launch Official 360° Campus Tour ↗
  </a>
  <div style="margin-top:2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;max-width:700px;margin-left:auto;margin-right:auto;">
    <div class="stat-card">🍽️<br><b style="color:#e2e8f0;">Canteen & Mess</b><br><span style="color:#64748b;font-size:0.75rem;">Food & Dining</span></div>
    <div class="stat-card">🏠<br><b style="color:#e2e8f0;">Hostels</b><br><span style="color:#64748b;font-size:0.75rem;">Residential Blocks</span></div>
    <div class="stat-card">📚<br><b style="color:#e2e8f0;">Library</b><br><span style="color:#64748b;font-size:0.75rem;">Knowledge Hub</span></div>
    <div class="stat-card">🔬<br><b style="color:#e2e8f0;">Labs</b><br><span style="color:#64748b;font-size:0.75rem;">Research & Learning</span></div>
    <div class="stat-card">🚌<br><b style="color:#e2e8f0;">Transport</b><br><span style="color:#64748b;font-size:0.75rem;">Bus & Routes</span></div>
    <div class="stat-card">⚽<br><b style="color:#e2e8f0;">Sports</b><br><span style="color:#64748b;font-size:0.75rem;">Grounds & Courts</span></div>
  </div>
  <p style="color:#475569;font-size:0.72rem;margin-top:1.5rem;">
    Facility icons are illustrative. For verified campus maps, use the official virtual tour above.
  </p>
</div>
"""


# ── Complaint submission ──────────────────────────────────────────────────────

def submit_complaint(category, location, description):
    if not description.strip():
        return "⚠️ Please describe the problem.", ""
    if len(description.strip()) < 15:
        return "⚠️ Description too short. Please provide more detail.", ""

    ai_data = ai.analyze_complaint(category, location, description)
    complaint = db.submit_complaint(
        category=ai_data.get("category", category),
        location=location,
        description=description,
        ai_summary=ai_data.get("summary", ""),
        ai_priority=ai_data.get("priority", "Medium"),
    )

    result = f"""✅ **Complaint Submitted Successfully!**

**Complaint ID:** `{complaint['id']}`  
**Category:** {complaint['category']}  
**Priority (AI):** {ai_data.get('priority','Medium')} — {ai_data.get('priority_reason','')}  
**Status:** {complaint['status']}  
**Submitted:** {complaint['created_at']}

---
**AI Summary:** {ai_data.get('summary','')}

**Recommended Action:** {ai_data.get('next_action','')}
"""
    if ai_data.get("missing_info"):
        result += f"\n**ℹ️ To help resolve faster:** {ai_data['missing_info']}"

    result += "\n\n> 💡 Save your Complaint ID to track status in the **Track Complaint** tab."
    return result, complaint['id']


# ── Complaint tracking ────────────────────────────────────────────────────────

def track_complaint(complaint_id):
    if not complaint_id.strip():
        return "⚠️ Enter a Complaint ID."
    c = db.get_complaint(complaint_id)
    if not c:
        return f"❌ No complaint found with ID `{complaint_id.strip().upper()}`."

    status_emoji = {"Submitted":"📬","Under Review":"🔍","In Progress":"🔧","Resolved":"✅","Rejected":"❌"}.get(c['status'],'📋')
    return f"""## {status_emoji} Complaint `{c['id']}`

| Field | Details |
|---|---|
| **Category** | {c['category']} |
| **Location** | {c.get('location','—')} |
| **Status** | **{c['status']}** |
| **Priority** | {c.get('ai_priority','—')} |
| **Submitted** | {c['created_at']} |
| **Last Updated** | {c['updated_at']} |

**Description:** {c['description']}

**AI Summary:** {c.get('ai_summary','—')}

**Resolution Notes:** {c.get('resolution_notes','—') or '—'}
"""


def update_complaint_status(complaint_id, new_status, notes):
    if not complaint_id.strip():
        return "⚠️ Enter a Complaint ID."
    c = db.update_status(complaint_id, new_status, notes)
    if not c:
        return f"❌ Complaint `{complaint_id.strip().upper()}` not found."
    return f"✅ Status updated to **{new_status}** for `{c['id']}`."


# ── Dashboard ─────────────────────────────────────────────────────────────────

def build_dashboard(filter_cat, filter_status):
    stats = db.dashboard_stats()
    records = db.all_complaints()

    # Apply filters
    if filter_cat and filter_cat != "All":
        records = [r for r in records if r["category"] == filter_cat]
    if filter_status and filter_status != "All":
        records = [r for r in records if r["status"] == filter_status]

    stat_html = f"""
<div class="stat-grid">
  <div class="stat-card"><div class="stat-num">{stats['total']}</div><div class="stat-label">Total Complaints</div></div>
  <div class="stat-card"><div class="stat-num" style="color:#34d399">{stats['by_status'].get('Resolved',0)}</div><div class="stat-label">Resolved</div></div>
  <div class="stat-card"><div class="stat-num" style="color:#fbbf24">{stats['by_status'].get('In Progress',0)}</div><div class="stat-label">In Progress</div></div>
  <div class="stat-card"><div class="stat-num" style="color:#60a5fa">{stats['by_status'].get('Submitted',0)}</div><div class="stat-label">Submitted</div></div>
</div>
"""

    if not records:
        return stat_html + "<p style='color:#64748b;text-align:center;padding:2rem;'>No complaints match the selected filters.</p>"

    rows = ""
    for r in sorted(records, key=lambda x: x["created_at"], reverse=True):
        status_color = {"Submitted":"#60a5fa","Under Review":"#fbbf24","In Progress":"#a78bfa","Resolved":"#34d399","Rejected":"#f87171"}.get(r['status'],'#94a3b8')
        rows += f"""
<div class="complaint-card">
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
    <span class="complaint-id">{r['id']}</span>
    <span style="color:{status_color};font-size:0.75rem;font-weight:600;">{r['status']}</span>
  </div>
  <div style="color:#94a3b8;font-size:0.75rem;margin:0.2rem 0;">{r['category']} · {r.get('location','—')} · {r['created_at'][:10]}</div>
  <div style="color:#e2e8f0;font-size:0.85rem;margin-top:0.3rem;">{r['description'][:120]}{'…' if len(r['description'])>120 else ''}</div>
  <div style="color:#64748b;font-size:0.75rem;margin-top:0.3rem;">AI Priority: {r.get('ai_priority','—')} · {r.get('ai_summary','')[:80]}</div>
</div>"""

    # Category breakdown
    cat_rows = "".join(
        f"<div style='display:flex;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.05);'>"
        f"<span style='color:#94a3b8;font-size:0.82rem;'>{cat}</span>"
        f"<span style='color:#00d4ff;font-weight:700;'>{count}</span></div>"
        for cat, count in stats['by_category'].items() if count > 0
    ) or "<p style='color:#64748b;font-size:0.82rem;'>No data yet.</p>"

    return stat_html + f"""
<div style="display:grid;grid-template-columns:1fr 280px;gap:1rem;margin-top:1rem;">
  <div>
    <div class="section-title">Recent Complaints ({len(records)} shown)</div>
    {rows}
  </div>
  <div>
    <div class="section-title">By Category</div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1rem;">
      {cat_rows}
    </div>
  </div>
</div>
"""


# ── Notice summarizer ─────────────────────────────────────────────────────────

def summarize_notice(notice_text, image_path):
    text = notice_text.strip()
    if not text and image_path:
        try:
            import gemma_client
            text = gemma_client.ask_with_image(
                image_path,
                "Extract all text from this notice image exactly as written.",
            )
        except Exception as e:
            import gemma_client
            return gemma_client.describe_error(e)

    if not text:
        return "⚠️ Please paste notice text or upload a notice image."

    result = ai.summarize_notice(text)

    dates_md = "\n".join(f"- {d}" for d in result.get("dates", [])) or "- No explicit dates found in the text."
    actions_md = "\n".join(f"- {a}" for a in result.get("action_items", [])) or "- No specific action items identified."

    output = f"""## 📋 Notice Summary

{result.get('summary', 'Could not summarize.')}

### 📅 Dates & Deadlines
{dates_md}

### ✅ Action Items
{actions_md}
"""
    if result.get("missing_info"):
        output += f"\n### ⚠️ Missing Information\n{result['missing_info']}"

    output += "\n\n> ℹ️ This summary is AI-generated. Always verify against the original official notice."
    return output


# ── Build Gradio app ──────────────────────────────────────────────────────────

def build_app():
    cat_choices = db.CATEGORIES
    status_choices = db.STATUSES

    with gr.Blocks(title="CampusSaathi AI — Kalinga University") as demo:
        gr.HTML(f"<style>{CSS}</style>")
        gr.HTML(HERO_HTML)
        gr.HTML(CAMPUS_INFO_HTML)

        with gr.Tabs():

            # ── Home ──────────────────────────────────────────────────────────
            with gr.Tab("🏠 Home"):
                gr.Markdown("""
## Welcome to CampusSaathi AI

Your intelligent campus companion for **Kalinga University, Raipur**.

### What you can do here:
| Feature | Description |
|---|---|
| 🗺️ **Campus Explorer** | Explore facilities & launch the official 360° virtual tour |
| 🤖 **AI Assistant** | Ask any campus question — powered by Gemma 4 |
| 📝 **Report a Problem** | Submit complaints with AI-powered analysis |
| 🔍 **Track Complaint** | Check status of your submitted complaint |
| 📋 **Smart Notices** | Paste a notice and get an instant AI summary |
| 📊 **Dashboard** | View all complaints and analytics |

### Covered Categories
Canteen & Mess · Washrooms · Parking · Hostel · Library · Labs & Classrooms · Transport · Health & Safety · Sports & Other

> **Note:** CampusSaathi is an MVP built for the MLH Hack Day at IIT Bhilai.
> Complaints are stored locally. This is not an official university system.
""")

            # ── Campus Explorer ───────────────────────────────────────────────
            with gr.Tab("🗺️ Campus Explorer"):
                gr.HTML(EXPLORER_HTML)

            # ── AI Assistant ──────────────────────────────────────────────────
            with gr.Tab("🤖 AI Assistant"):
                gr.Markdown("### 🤖 CampusSaathi AI Assistant\nAsk anything about Kalinga University campus — facilities, hostel, canteen, transport, and more.")
                chatbot = gr.Chatbot(label="Chat", height=420, show_label=False)
                with gr.Row():
                    msg_box = gr.Textbox(
                        placeholder="Ask about canteen timings, hostel rules, library access…",
                        label="", scale=5, lines=1,
                    )
                    send_btn = gr.Button("Send ➤", variant="primary", scale=1)
                clear_btn = gr.Button("🔄 New Conversation", variant="secondary")

                send_btn.click(ai.campus_chat, [chatbot, msg_box], [chatbot, msg_box])
                msg_box.submit(ai.campus_chat, [chatbot, msg_box], [chatbot, msg_box])
                clear_btn.click(ai.reset_chat, [], [chatbot, msg_box])

                gr.Markdown("> ⚠️ AI responses are general guidance. For official information visit [kalingauniversity.ac.in](https://www.kalingauniversity.ac.in).")

            # ── Report a Problem ──────────────────────────────────────────────
            with gr.Tab("📝 Report a Problem"):
                gr.Markdown("### 📝 Submit a Campus Complaint\nYour complaint will be analyzed by Gemma 4 AI and assigned a priority.")
                with gr.Row():
                    with gr.Column(scale=1):
                        cat_input = gr.Dropdown(cat_choices, label="Category *", value=cat_choices[0])
                        loc_input = gr.Textbox(label="Location / Facility", placeholder="e.g. Block-A Hostel, Main Canteen")
                        desc_input = gr.Textbox(label="Describe the Problem *", lines=5,
                                                placeholder="Describe what you observed, when it started, and how it affects you…")
                        submit_btn = gr.Button("🚀 Submit Complaint", variant="primary")
                    with gr.Column(scale=1):
                        submit_result = gr.Markdown(label="Result")
                        complaint_id_out = gr.Textbox(label="Your Complaint ID (save this)", interactive=False)

                submit_btn.click(
                    submit_complaint,
                    [cat_input, loc_input, desc_input],
                    [submit_result, complaint_id_out],
                )

            # ── Track Complaint ───────────────────────────────────────────────
            with gr.Tab("🔍 Track Complaint"):
                gr.Markdown("### 🔍 Track Your Complaint")
                with gr.Row():
                    track_id = gr.Textbox(label="Complaint ID", placeholder="e.g. CS-A1B2C3D4", scale=4)
                    track_btn = gr.Button("Track", variant="primary", scale=1)
                track_result = gr.Markdown()
                track_btn.click(track_complaint, track_id, track_result)
                track_id.submit(track_complaint, track_id, track_result)

                gr.Markdown("---")
                gr.Markdown("#### 🔧 Update Status (Admin / Demo)")
                with gr.Row():
                    upd_id = gr.Textbox(label="Complaint ID", scale=2)
                    upd_status = gr.Dropdown(status_choices, label="New Status", value="Under Review", scale=2)
                    upd_notes = gr.Textbox(label="Resolution Notes", scale=3)
                    upd_btn = gr.Button("Update", variant="secondary", scale=1)
                upd_result = gr.Markdown()
                upd_btn.click(update_complaint_status, [upd_id, upd_status, upd_notes], upd_result)

            # ── Smart Notices ─────────────────────────────────────────────────
            with gr.Tab("📋 Smart Notices"):
                gr.Markdown("### 📋 Smart Notice Summarizer\nPaste notice text or upload a notice image. Gemma 4 will extract key dates and action items.")
                with gr.Row():
                    with gr.Column(scale=1):
                        notice_text = gr.Textbox(label="Paste Notice Text", lines=10,
                                                 placeholder="Paste the full notice text here…")
                        notice_image = gr.Image(type="filepath", label="Or Upload Notice Image (optional)")
                        notice_btn = gr.Button("📋 Summarize Notice", variant="primary")
                    with gr.Column(scale=1):
                        notice_result = gr.Markdown(label="Summary")
                notice_btn.click(summarize_notice, [notice_text, notice_image], notice_result)

            # ── Dashboard ─────────────────────────────────────────────────────
            with gr.Tab("📊 Dashboard"):
                gr.Markdown("### 📊 Complaints Dashboard\nAll metrics are calculated from persisted complaint records.")
                with gr.Row():
                    dash_cat = gr.Dropdown(["All"] + cat_choices, label="Filter by Category", value="All", scale=2)
                    dash_status = gr.Dropdown(["All"] + status_choices, label="Filter by Status", value="All", scale=2)
                    dash_btn = gr.Button("🔄 Refresh", variant="primary", scale=1)
                dash_output = gr.HTML()

                def refresh_dashboard(cat, status):
                    return build_dashboard(cat, status)

                dash_btn.click(refresh_dashboard, [dash_cat, dash_status], dash_output)
                dash_cat.change(refresh_dashboard, [dash_cat, dash_status], dash_output)
                dash_status.change(refresh_dashboard, [dash_cat, dash_status], dash_output)
                demo.load(refresh_dashboard, [dash_cat, dash_status], dash_output)

            # ── About ─────────────────────────────────────────────────────────
            with gr.Tab("ℹ️ About"):
                gr.Markdown("""
### About CampusSaathi AI

**CampusSaathi AI** is a smart campus problem-solving platform built for **Kalinga University, Raipur**.

Built at **MLH Hack Day, IIT Bhilai** using **Gemma 4** (`gemma-4-26b-a4b-it`) — an open model from Google.

#### Tech Stack
- **AI:** Google Gemma 4 (`gemma-4-26b-a4b-it`) via Google AI Studio
- **Backend:** Python + Gradio
- **Persistence:** JSON (MVP) — designed to migrate to PostgreSQL
- **API Client:** `gemma_client.py` with caching, retries and rate-limit handling

#### Features
- 🤖 AI Campus Assistant (Gemma 4 chat)
- 📝 Complaint submission with AI analysis (category, priority, summary)
- 🔍 Complaint tracking and status updates
- 📋 Smart notice summarizer (text + image)
- 📊 Live dashboard with real persisted data
- 🗺️ Campus Explorer with official 360° virtual tour link

#### Disclaimer
This is an MVP hackathon project. It is **not** officially integrated with Kalinga University systems.
Complaints are stored locally. AI responses are suggestions, not official decisions.

#### Links
- 🌐 [Kalinga University](https://www.kalingauniversity.ac.in)
- 📋 [Grievance Redressal](https://kalingauniversity.ac.in/grievance-redressal)
- 🎥 [Official Virtual Tour](https://virtualtour.kalingauniversity.ac.in/)
- 📄 [MIT License](../LICENSE)
""")

    return demo


if __name__ == "__main__":
    print("Starting CampusSaathi AI...")
    print("Open in browser: http://127.0.0.1:7860")
    build_app().launch(share=False)
