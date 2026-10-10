"""Generate CampusSaathi AI hackathon presentation.
Run: python make_presentation.py
Requires: pip install python-pptx  (included in requirements-dev.txt)
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

NAVY  = RGBColor(0x0a, 0x0e, 0x1a)
NAVY2 = RGBColor(0x0f, 0x16, 0x28)
CYAN  = RGBColor(0x00, 0xd4, 0xff)
WHITE = RGBColor(0xff, 0xff, 0xff)
MUTED = RGBColor(0x94, 0xa3, 0xb8)
BLUE  = RGBColor(0x3b, 0x82, 0xf6)
GREEN = RGBColor(0x10, 0xb9, 0x81)
AMBER = RGBColor(0xf5, 0x9e, 0x0b)
RED   = RGBColor(0xef, 0x44, 0x44)

SLIDES = [
    # 1 — Title
    {
        "title": "CampusSaathi AI",
        "body": [
            "Every Campus Problem. One Intelligent Solution.",
            "",
            "Kalinga University Smart Campus Platform",
            "Built at MLH Hack Day, IIT Bhilai",
            "",
            "Model: gemma-4-26b-a4b-it  (Gemma 4 via Gemini API)",
            "Stack: Python · FastAPI · React · Three.js · Gradio",
        ],
    },
    # 2 — Student problems
    {
        "title": "Student Challenges at Kalinga University",
        "body": [
            "Problems students face every day:",
            "",
            "  • No unified channel to report campus issues",
            "    (canteen, hostel, washrooms, labs, transport)",
            "  • No way to track whether a complaint was acted on",
            "  • Campus facility information scattered across websites",
            "  • University notices are dense — key dates get missed",
            "  • No interactive campus map for new students",
            "",
            "Manual processes are slow, opaque, and frustrating.",
            "Source: direct student feedback (demo scope).",
        ],
    },
    # 3 — Solution
    {
        "title": "CampusSaathi AI — The Solution",
        "body": [
            "One platform. Six AI-powered tools.",
            "",
            "  🤖  AI Campus Assistant   — Gemma 4 chat, multi-turn",
            "  📝  Report a Problem      — AI-analyzed complaints",
            "  🔍  Track Complaint       — real-time status by ID",
            "  📋  Smart Notices         — AI extracts dates & actions",
            "  📊  Live Dashboard        — charts from real data",
            "  🗺️  3D Campus Explorer    — React Three Fiber + WebGL",
            "  🎙️  Voice Assistant       — speech → Gemma 4 → TTS",
            "",
            "Disclaimer: MVP — not officially integrated with the university.",
        ],
    },
    # 4 — Gemma 4 integration
    {
        "title": "Real Gemma 4 Integration",
        "body": [
            "Model: gemma-4-26b-a4b-it  via Google AI Studio (free tier)",
            "",
            "gemma_client.py — the shared AI client:",
            "  client = genai.Client(api_key=key)",
            "  response = client.models.generate_content(",
            "      model='gemma-4-26b-a4b-it', contents=prompt)",
            "",
            "Safety features built in:",
            "  • Rate-limit spacing + automatic retries (429/500/503)",
            "  • On-disk response cache — no duplicate API calls",
            "  • API key never logged, printed, or committed to git",
            "  • Friendly error messages for missing/invalid keys",
            "",
            "Verified live: DIAGNOSTIC_PASS (test_gemma_diagnostic.py)",
        ],
    },
    # 5 — AI features detail
    {
        "title": "Three Gemma 4 AI Features",
        "body": [
            "1. Campus Assistant",
            "   Multi-turn chat with system prompt constraining Gemma",
            "   to campus topics. Admits uncertainty. Never invents facts.",
            "",
            "2. Complaint Analyzer",
            "   Free-text complaint → structured JSON:",
            "   category · summary · priority · next_action · missing_info",
            "   Priority: Low / Medium / High / Critical",
            "",
            "3. Smart Notice Summarizer",
            "   Paste text or upload image → Gemma extracts:",
            "   summary · dates · action_items",
            "   Never invents dates not present in the source text.",
        ],
    },
    # 6 — Voice assistant
    {
        "title": "Gemma Voice — Your Campus Companion",
        "body": [
            "\"Talk naturally. Get campus help instantly.\"",
            "",
            "Flow (transparent, no hidden recording):",
            "  1. User taps mic  →  browser speech recognition starts",
            "  2. Transcript shown for review before sending",
            "  3. User confirms  →  text sent to FastAPI backend",
            "  4. Backend calls Gemma 4  →  response returned",
            "  5. Browser Text-to-Speech reads the response aloud",
            "",
            "Key facts:",
            "  • No audio is sent to any server",
            "  • Gemma generates text; the browser speaks it",
            "  • Supports English (India), Hindi, English (US)",
            "  • Text input fallback always available",
            "  • Requires Chrome or Edge (Web Speech API)",
        ],
    },
    # 7 — Complaint workflow
    {
        "title": "AI-Powered Complaint Workflow",
        "body": [
            "Step 1  Student selects category + describes the problem",
            "Step 2  Gemma 4 analyzes: category · summary · priority",
            "Step 3  Unique ID issued: CS-A1B2C3D4",
            "Step 4  Record saved to JSON (MVP) / PostgreSQL (prod)",
            "Step 5  Student tracks status anytime with their ID",
            "Step 6  Admin updates: Submitted → In Progress → Resolved",
            "",
            "Dashboard shows real counts from persisted records.",
            "All metrics are live — no hardcoded numbers.",
            "",
            "Important: complaints are stored locally (MVP).",
            "They are not forwarded to university staff automatically.",
        ],
    },
    # 8 — 3D campus
    {
        "title": "Interactive 3D Campus Explorer",
        "body": [
            "Built with React Three Fiber + Three.js + Drei",
            "",
            "Features:",
            "  • Mouse/touch orbit, zoom, pan",
            "  • Animated floating hotspot markers",
            "  • Click marker → info panel with building details",
            "  • Camera reset button",
            "  • WebGL fallback → official 360° tour link",
            "  • Lazy-loaded (does not block page render)",
            "",
            "Hotspots: Main Academic Block · Library · Hostel",
            "          Canteen · Labs · Sports Complex",
            "",
            "Disclaimer: illustrative model — not verified campus geometry.",
            "Official tour: virtualtour.kalingauniversity.ac.in",
        ],
    },
    # 9 — Architecture
    {
        "title": "Application Architecture",
        "body": [
            "Browser (React + Vite :5173)",
            "  └─ /api proxy ──► FastAPI (uvicorn :8000)",
            "                       ├─ POST /api/chat",
            "                       ├─ POST /api/complaints",
            "                       ├─ POST /api/notices/summarize",
            "                       └─ GET  /api/dashboard",
            "                            │",
            "                     gemma_client.py",
            "                            │",
            "                   Gemini API (Google)",
            "                   gemma-4-26b-a4b-it",
            "",
            "Gradio fallback: campus_saathi/app.py (:7860)",
            "Persistence: data/complaints.json (git-ignored)",
        ],
    },
    # 10 — Tested features
    {
        "title": "Tested Features — Verified Results",
        "body": [
            "All tests run against real code. No mocked AI responses.",
            "",
            "test_gemma_diagnostic.py   PASS — live Gemma 4 confirmed",
            "test_chat_fix.py           PASS — real multi-turn chat",
            "test_chat_regression.py    PASS — Gradio format regression",
            "_test_data.py              PASS — persistence layer",
            "_test_imports.py           PASS — all imports clean",
            "_test_backend.py           PASS — all API endpoints",
            "npm run build              PASS — TypeScript clean build",
            "check_submission.py        PASS — license, model, key safety",
            "",
            "Bug fixed: backend chat endpoint read history[-1][1]",
            "(tuple format) instead of history[-1]['content'] (dict).",
        ],
    },
    # 11 — Privacy and responsible AI
    {
        "title": "Privacy and Responsible AI",
        "body": [
            "Data handling:",
            "  • API key: environment variable only, never in git",
            "  • Complaints: local JSON, git-ignored, no PII required",
            "  • Voice: no audio sent to server — text only",
            "  • No user accounts, no tracking, no analytics",
            "",
            "Responsible AI:",
            "  • AI responses labelled as suggestions, not decisions",
            "  • Gemma told to admit uncertainty, not invent facts",
            "  • Notice summarizer told never to invent dates",
            "  • 3D model labelled as illustrative, not verified",
            "  • No official university endorsement claimed",
            "",
            "Admin key: 'demo-admin' (change via ADMIN_KEY in .env)",
        ],
    },
    # 12 — Limitations
    {
        "title": "Honest Limitations",
        "body": [
            "What this MVP does NOT do:",
            "",
            "  • Complaints are NOT sent to university staff",
            "  • AI answers are NOT from live university systems",
            "  • 3D model is NOT verified campus geometry",
            "  • Voice requires Chrome/Edge (not Firefox/Safari)",
            "  • No user authentication or role management",
            "  • No push notifications for status updates",
            "  • Free API tier has rate limits (429 errors possible)",
            "  • Image OCR quality depends on image clarity",
            "",
            "These are known gaps, not hidden failures.",
            "Each limitation is documented in README.md.",
        ],
    },
    # 13 — Roadmap
    {
        "title": "Future Roadmap",
        "body": [
            "Near term (next sprint):",
            "  • PostgreSQL backend + proper migrations",
            "  • University API integration (official data feed)",
            "  • Push notifications for complaint status updates",
            "  • Role-based access (student / admin / staff)",
            "",
            "Medium term:",
            "  • Mobile app (React Native)",
            "  • Multi-language support (Hindi, Odia)",
            "  • Study Hub: AI-powered notes, quizzes, study plans",
            "  • Lab resource discovery and booking",
            "",
            "Long term:",
            "  • Robotics / IoT project roadmap assistant",
            "  • Student startup and incubation support",
            "  • Open-source release for other universities",
        ],
    },
    # 14 — Thank you
    {
        "title": "Thank You",
        "body": [
            "CampusSaathi AI",
            "Every Campus Problem. One Intelligent Solution.",
            "",
            "Built at MLH Hack Day, IIT Bhilai",
            "Powered by Gemma 4 (gemma-4-26b-a4b-it)",
            "Python · FastAPI · React · Three.js · Gradio",
            "",
            "github.com/RudraDudhat2509/gemma4-starter",
            "kalingauniversity.ac.in",
            "",
            "MIT License — open source",
        ],
    },
]


def _add_slide(prs, title_text, body_lines):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = NAVY

    # Title
    txb = slide.shapes.add_textbox(Inches(0.4), Inches(0.25), Inches(9.2), Inches(0.9))
    tf = txb.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(30)
    p.font.bold = True
    p.font.color.rgb = CYAN

    # Accent line under title
    line = slide.shapes.add_shape(1, Inches(0.4), Inches(1.15), Inches(9.2), Emu(28000))
    line.fill.solid()
    line.fill.fore_color.rgb = CYAN
    line.line.fill.background()

    # Body
    txb2 = slide.shapes.add_textbox(Inches(0.4), Inches(1.35), Inches(9.2), Inches(5.3))
    tf2 = txb2.text_frame
    tf2.word_wrap = True
    for i, line_text in enumerate(body_lines):
        p2 = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p2.text = line_text
        is_sub = line_text.startswith("  ") or line_text.startswith("   ")
        is_blank = line_text.strip() == ""
        p2.font.size = Pt(16) if not is_sub else Pt(15)
        p2.font.color.rgb = MUTED if is_sub or is_blank else WHITE
        p2.space_after = Pt(1)

    # Slide number (bottom right)
    idx = prs.slides.index(slide) + 1
    txb3 = slide.shapes.add_textbox(Inches(8.8), Inches(6.6), Inches(0.8), Inches(0.3))
    tf3 = txb3.text_frame
    p3 = tf3.paragraphs[0]
    p3.text = str(idx)
    p3.font.size = Pt(9)
    p3.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
    p3.alignment = PP_ALIGN.RIGHT

    return slide


def make_ppt(output_path="CampusSaathi_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width  = Inches(10)
    prs.slide_height = Inches(7)
    for s in SLIDES:
        _add_slide(prs, s["title"], s["body"])
    prs.save(output_path)
    print(f"Saved: {output_path}  ({len(SLIDES)} slides)")
    return len(SLIDES)


if __name__ == "__main__":
    make_ppt()
