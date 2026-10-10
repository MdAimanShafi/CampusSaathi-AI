"""Premium dark theme CSS for CampusSaathi."""

CSS = """
/* ── Base ── */
:root {
    --navy: #0a0e1a;
    --navy2: #0f1628;
    --card: rgba(15,22,45,0.85);
    --border: rgba(0,212,255,0.18);
    --cyan: #00d4ff;
    --blue: #3b82f6;
    --violet: #7c3aed;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --success: #10b981;
    --warn: #f59e0b;
    --danger: #ef4444;
}
body, .gradio-container {
    background: var(--navy) !important;
    color: var(--text) !important;
    font-family: 'Inter', 'Segoe UI', sans-serif !important;
}
/* ── Hero ── */
.hero-wrap {
    background: linear-gradient(135deg, #0a0e1a 0%, #0f1e3d 50%, #0a0e1a 100%);
    border-bottom: 1px solid var(--border);
    padding: 2.5rem 1.5rem 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
}
.hero-wrap::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%);
    pointer-events: none;
}
.hero-title {
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 800;
    background: linear-gradient(90deg, #00d4ff, #3b82f6, #7c3aed);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin: 0 0 0.4rem;
    letter-spacing: -0.02em;
}
.hero-sub {
    color: var(--muted); font-size: 1rem; margin: 0 0 1.2rem;
}
.hero-badges { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
.badge {
    background: rgba(0,212,255,0.1); border: 1px solid var(--border);
    color: var(--cyan); padding: 0.25rem 0.75rem; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
}
/* ── Cards ── */
.gr-group, .gr-box, .gr-form {
    background: var(--card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(12px);
}
/* ── Inputs ── */
input, textarea, .gr-input, .gr-textarea {
    background: rgba(10,14,26,0.8) !important;
    border: 1px solid var(--border) !important;
    color: var(--text) !important;
    border-radius: 8px !important;
}
input:focus, textarea:focus {
    border-color: var(--cyan) !important;
    box-shadow: 0 0 0 2px rgba(0,212,255,0.15) !important;
}
/* ── Buttons ── */
.gr-button-primary, button.primary {
    background: linear-gradient(135deg, #0ea5e9, #3b82f6) !important;
    border: none !important; color: #fff !important;
    font-weight: 600 !important; border-radius: 8px !important;
    transition: opacity 0.2s !important;
}
.gr-button-primary:hover, button.primary:hover { opacity: 0.88 !important; }
button.secondary {
    background: rgba(0,212,255,0.08) !important;
    border: 1px solid var(--border) !important;
    color: var(--cyan) !important; border-radius: 8px !important;
}
/* ── Tabs ── */
.tab-nav button {
    color: var(--muted) !important; border-bottom: 2px solid transparent !important;
    background: transparent !important; font-weight: 500 !important;
}
.tab-nav button.selected {
    color: var(--cyan) !important; border-bottom-color: var(--cyan) !important;
}
/* ── Stat cards ── */
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 1rem; margin: 1rem 0; }
.stat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 1.2rem; text-align: center;
}
.stat-num { font-size: 2rem; font-weight: 800; color: var(--cyan); }
.stat-label { font-size: 0.78rem; color: var(--muted); margin-top: 0.2rem; }
/* ── Status pills ── */
.pill {
    display: inline-block; padding: 0.2rem 0.7rem;
    border-radius: 999px; font-size: 0.75rem; font-weight: 600;
}
.pill-submitted  { background: rgba(59,130,246,0.2); color: #60a5fa; }
.pill-review     { background: rgba(245,158,11,0.2); color: #fbbf24; }
.pill-progress   { background: rgba(139,92,246,0.2); color: #a78bfa; }
.pill-resolved   { background: rgba(16,185,129,0.2); color: #34d399; }
.pill-rejected   { background: rgba(239,68,68,0.2);  color: #f87171; }
/* ── Complaint card ── */
.complaint-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 0.75rem;
}
.complaint-id { font-size: 0.75rem; color: var(--cyan); font-weight: 700; }
.complaint-cat { font-size: 0.75rem; color: var(--muted); }
/* ── Section headers ── */
.section-title {
    font-size: 1.1rem; font-weight: 700; color: var(--cyan);
    border-left: 3px solid var(--cyan); padding-left: 0.6rem; margin-bottom: 0.75rem;
}
/* ── Chatbot ── */
.gr-chatbot { background: rgba(10,14,26,0.6) !important; border: 1px solid var(--border) !important; }
/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--navy); }
::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 3px; }
/* ── Mobile ── */
@media (max-width: 640px) {
    .hero-title { font-size: 1.6rem; }
    .stat-grid { grid-template-columns: repeat(2,1fr); }
}
"""
