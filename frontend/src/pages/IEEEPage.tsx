import { useState, useEffect } from "react";
import { Send, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import {
  getIEEEMeta, createProject, listProjects, submitIEEEFeedback,
  listFeedback, getIEEEStats, updateProjectStatus, setShowcaseConsent,
  PROJECT_STATUS_COLORS,
  type IEEEProject, type IEEEFeedback, type IEEEStats,
} from "../api";

const WORKFLOW = [
  { n: "01", label: "Idea Submitted" },
  { n: "02", label: "Problem Validation" },
  { n: "03", label: "Team Formation" },
  { n: "04", label: "Prototype" },
  { n: "05", label: "Testing" },
  { n: "06", label: "Review" },
  { n: "07", label: "Showcase" },
];

type Tab = "hub" | "propose" | "projects" | "feedback" | "admin";

export default function IEEEPage() {
  const [tab, setTab] = useState<Tab>("hub");
  const [meta, setMeta] = useState<{ themes: string[]; statuses: string[]; feedback_categories: string[] } | null>(null);
  const [stats, setStats] = useState<IEEEStats | null>(null);
  const [projects, setProjects] = useState<IEEEProject[]>([]);
  const [feedback, setFeedback] = useState<IEEEFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Propose form
  const [form, setForm] = useState({ title: "", theme: "", description: "", team_size: 1, resources_needed: "", from_feedback_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [newProject, setNewProject] = useState<IEEEProject | null>(null);

  // Feedback form
  const [fbForm, setFbForm] = useState({ category: "", suggestion: "" });
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [newFb, setNewFb] = useState<IEEEFeedback | null>(null);

  // Admin
  const [adminKey, setAdminKey] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [adminResult, setAdminResult] = useState("");
  const [adminUpdating, setAdminUpdating] = useState(false);

  useEffect(() => {
    getIEEEMeta().then(r => {
      setMeta(r.data);
      setForm(f => ({ ...f, theme: r.data.themes[0] || "", }));
      setFbForm(f => ({ ...f, category: r.data.feedback_categories[0] || "" }));
    }).catch(() => {});
    getIEEEStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const loadProjects = () => {
    setLoading(true);
    listProjects().then(r => setProjects(r.data.projects)).catch(() => setError("Could not load projects.")).finally(() => setLoading(false));
  };

  const loadFeedback = () => {
    setLoading(true);
    listFeedback().then(r => setFeedback(r.data.feedback)).catch(() => setError("Could not load feedback.")).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === "projects") loadProjects();
    if (tab === "feedback") loadFeedback();
  }, [tab]);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNewProject(null); setSubmitting(true);
    try {
      const { data } = await createProject(form);
      setNewProject(data);
      setForm(f => ({ ...f, title: "", description: "", resources_needed: "", from_feedback_id: "" }));
      getIEEEStats().then(r => setStats(r.data)).catch(() => {});
    } catch (e: any) {
      setError(e.response?.data?.detail || "Submission failed.");
    } finally { setSubmitting(false); }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNewFb(null); setFbSubmitting(true);
    try {
      const { data } = await submitIEEEFeedback(fbForm.category, fbForm.suggestion);
      setNewFb(data);
      setFbForm(f => ({ ...f, suggestion: "" }));
      getIEEEStats().then(r => setStats(r.data)).catch(() => {});
    } catch (e: any) {
      setError(e.response?.data?.detail || "Submission failed.");
    } finally { setFbSubmitting(false); }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminResult(""); setAdminUpdating(true);
    try {
      const { data } = await updateProjectStatus(adminId.trim().toUpperCase(), adminStatus, adminNotes, adminKey);
      setAdminResult(`✅ Status updated to "${data.status}" for ${data.id}`);
    } catch (e: any) {
      const msg = e.response?.status === 403 ? "❌ Invalid admin key." : `❌ ${e.response?.data?.detail || "Update failed."}`;
      setAdminResult(msg);
    } finally { setAdminUpdating(false); }
  };

  const handleConsent = async (id: string, consent: boolean) => {
    try {
      await setShowcaseConsent(id, consent);
      loadProjects();
    } catch { setError("Could not update consent."); }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "hub",      label: "🏛️ IEEE Hub" },
    { id: "propose",  label: "💡 Propose Project" },
    { id: "projects", label: "📂 Projects" },
    { id: "feedback", label: "📣 Feedback" },
    { id: "admin",    label: "🔧 Admin" },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔬 IEEE &amp; Innovation Hub</h1>
          <p className="text-slate-400 text-sm">Kalinga University Student Branch · AI/ML · Robotics · IoT · Open Source</p>
          <a href="https://kalingauniversity.ac.in/ieee" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 mt-2">
            Official IEEE KU Page <ExternalLink size={11} />
          </a>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Projects", value: stats.total_projects, color: "text-cyan-400" },
              { label: "Feedback", value: stats.total_feedback, color: "text-violet-400" },
              { label: "Showcase Ready", value: stats.showcase_ready, color: "text-green-400" },
            ].map(s => (
              <div key={s.label} className="card text-center py-4">
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-slate-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(""); }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors min-w-[80px] ${
                      tab === t.id ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
                    }`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl p-3 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ── Hub info ── */}
        {tab === "hub" && (
          <div className="space-y-5">
            <div className="card">
              <div className="section-title">About IEEE Kalinga University Student Branch</div>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                The IEEE Kalinga University Student Branch supports technical learning, research, and innovation
                for students across engineering and technology disciplines.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 mb-4">
                ⚠️ CampusSaathi is not officially operated by IEEE. It cannot register IEEE members,
                approve funding, or issue certificates. Use official IEEE channels for those actions.
              </div>
              <a href="https://kalingauniversity.ac.in/ieee" target="_blank" rel="noopener noreferrer"
                 className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
                Visit Official IEEE KU Page <ExternalLink size={14} />
              </a>
            </div>

            <div className="card">
              <div className="section-title">Documented Activities</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Technical workshops and seminars",
                  "Coding competitions and hackathons",
                  "Robotics and electronics projects",
                  "Industry expert talks",
                  "Research paper writing guidance",
                  "Open-source contribution drives",
                ].map(a => (
                  <div key={a} className="flex items-start gap-2 text-sm text-slate-300 bg-white/3 rounded-lg p-3">
                    <span className="text-cyan-400 mt-0.5">•</span> {a}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-3">
                Source: kalingauniversity.ac.in/ieee. Verify current schedule at the official page.
              </p>
            </div>

            <div className="card">
              <div className="section-title">Project Improvement Workflow</div>
              <div className="flex flex-wrap gap-2 items-center">
                {WORKFLOW.map((w, i) => (
                  <div key={w.n} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="text-xs font-black glow-text">{w.n}</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">{w.label}</div>
                    </div>
                    {i < WORKFLOW.length - 1 && <span className="text-slate-600 text-xs">→</span>}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-3">
                Every status change requires an authorized action — not an automatic timer.
              </p>
            </div>

            <div className="card">
              <div className="section-title">Suggested Project Themes</div>
              <p className="text-slate-500 text-xs mb-3">
                These are proposed ideas — not claims that the university has confirmed these problems or approved these projects.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Smart energy monitoring","Smart waste monitoring","IoT environmental monitoring",
                  "Low-cost practical-learning kits","Accessible campus info tools","AI educational assistance"].map(t => (
                  <div key={t} className="text-xs text-slate-300 bg-white/3 rounded-lg p-2 text-center">{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Propose project ── */}
        {tab === "propose" && (
          <div className="card">
            <div className="section-title">Propose a Student Project</div>
            <p className="text-slate-500 text-xs mb-4">
              Gemma 4 will suggest improvements to your proposal. Projects are stored locally (MVP demo).
            </p>
            <form onSubmit={handlePropose} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Project Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                       placeholder="e.g. Smart Campus Energy Monitor" className="input-field" required minLength={5} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Theme *</label>
                <select value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
                        className="input-field bg-navy/80">
                  {meta?.themes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="What problem does it solve? What will you build? Who benefits?"
                          rows={4} className="input-field resize-none" required minLength={15} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Team Size</label>
                  <input type="number" min={1} max={20} value={form.team_size}
                         onChange={e => setForm(f => ({ ...f, team_size: parseInt(e.target.value) || 1 }))}
                         className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">From Feedback ID (optional)</label>
                  <input value={form.from_feedback_id} onChange={e => setForm(f => ({ ...f, from_feedback_id: e.target.value }))}
                         placeholder="FB-XXXXXXXX" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Resources Needed</label>
                <input value={form.resources_needed} onChange={e => setForm(f => ({ ...f, resources_needed: e.target.value }))}
                       placeholder="e.g. Arduino, sensors, cloud credits" className="input-field" />
              </div>
              <button type="submit" disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing with Gemma 4…</>
                ) : <><Send size={16} /> Submit Proposal</>}
              </button>
            </form>

            {newProject && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in-up">
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                  <CheckCircle size={18} /> Project Submitted
                </div>
                <div className="font-mono text-cyan-400 text-lg mb-2">{newProject.id}</div>
                <div className="text-xs text-slate-500 mb-1">Status: <span className="text-slate-300">{newProject.status}</span></div>
                {newProject.ai_suggestions && (
                  <div className="mt-3 bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-cyan-400 font-semibold mb-1">Gemma 4 Suggestions:</div>
                    <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{newProject.ai_suggestions}</div>
                  </div>
                )}
                <p className="text-slate-600 text-xs mt-3">
                  Save your Project ID. Use the Admin tab to update status (key: demo-admin).
                  Enable showcase consent in the Projects tab when ready.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Projects list ── */}
        {tab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="section-title mb-0">All Projects ({projects.length})</div>
              <button onClick={loadProjects} disabled={loading} className="btn-secondary py-2 px-3 text-sm flex items-center gap-2">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
            {loading && <div className="text-center py-8 text-slate-500">Loading…</div>}
            {!loading && projects.length === 0 && (
              <div className="card text-center py-12 text-slate-500">
                <div className="text-4xl mb-3">💡</div>
                No projects yet. Be the first to propose one!
              </div>
            )}
            {projects.map(p => (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                  <div className="font-mono text-cyan-400 text-sm font-bold">{p.id}</div>
                  <span className={`status-badge ${PROJECT_STATUS_COLORS[p.status] || "text-slate-400 bg-slate-400/10"}`}>
                    {p.status}
                  </span>
                </div>
                <div className="font-semibold text-white mb-1">{p.title}</div>
                <div className="text-xs text-slate-500 mb-2">{p.theme} · Team: {p.team_size} · {p.created_at.slice(0, 10)}</div>
                <div className="text-slate-300 text-sm mb-2 line-clamp-3">{p.description}</div>
                {p.resources_needed && (
                  <div className="text-xs text-slate-500">Resources: {p.resources_needed}</div>
                )}
                {p.ai_suggestions && (
                  <details className="mt-2">
                    <summary className="text-xs text-cyan-500 cursor-pointer hover:text-cyan-400">Gemma 4 suggestions</summary>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap bg-white/3 rounded-lg p-2">{p.ai_suggestions}</div>
                  </details>
                )}
                {p.status_notes && (
                  <div className="text-xs text-slate-500 mt-1">Notes: {p.status_notes}</div>
                )}
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={p.showcase_consent}
                           onChange={e => handleConsent(p.id, e.target.checked)}
                           className="rounded" />
                    Showcase consent
                  </label>
                  {p.showcase_consent && (
                    <span className="text-xs text-green-400">✓ Approved for showcase</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Feedback ── */}
        {tab === "feedback" && (
          <div className="space-y-5">
            <div className="card">
              <div className="section-title">Submit Improvement Suggestion</div>
              <p className="text-slate-500 text-xs mb-4">
                Suggest improvements to workshops, labs, research support, or project mentoring.
                Gemma 4 will propose possible solutions. No personal data is required.
              </p>
              <form onSubmit={handleFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Category *</label>
                  <select value={fbForm.category} onChange={e => setFbForm(f => ({ ...f, category: e.target.value }))}
                          className="input-field bg-navy/80">
                    {meta?.feedback_categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Your Suggestion *</label>
                  <textarea value={fbForm.suggestion} onChange={e => setFbForm(f => ({ ...f, suggestion: e.target.value }))}
                            placeholder="Describe what could be improved and how it would help students…"
                            rows={4} className="input-field resize-none" required minLength={10} />
                </div>
                <button type="submit" disabled={fbSubmitting}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {fbSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</>
                  ) : <><Send size={16} /> Submit Feedback</>}
                </button>
              </form>
              {newFb && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in-up">
                  <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                    <CheckCircle size={16} /> Feedback Recorded — {newFb.id}
                  </div>
                  {newFb.ai_solutions && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-cyan-400 font-semibold mb-1">Gemma 4 — Possible Solutions:</div>
                      <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{newFb.ai_solutions}</div>
                    </div>
                  )}
                  <p className="text-slate-600 text-xs mt-2">
                    Use your Feedback ID ({newFb.id}) when proposing a project to link them.
                  </p>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="section-title mb-0">All Feedback ({feedback.length})</div>
                <button onClick={loadFeedback} disabled={loading} className="btn-secondary py-2 px-3 text-sm flex items-center gap-2">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
              {feedback.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500">No feedback yet.</div>
              )}
              <div className="space-y-3">
                {feedback.map(f => (
                  <div key={f.id} className="p-3 bg-white/3 border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs text-cyan-400">{f.id}</span>
                      <span className="text-xs text-slate-500">{f.created_at.slice(0, 10)}</span>
                    </div>
                    <div className="text-xs text-violet-400 mb-1">{f.category}</div>
                    <div className="text-slate-300 text-sm">{f.suggestion}</div>
                    {f.converted_to_project && (
                      <div className="text-xs text-green-400 mt-1">→ Project: {f.converted_to_project}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Admin ── */}
        {tab === "admin" && (
          <div className="card">
            <div className="section-title">Update Project Status</div>
            <p className="text-slate-500 text-xs mb-4">
              Authorized admin function. Default demo key: <code className="text-cyan-600">demo-admin</code>.
              Every status change must come from an authorized action.
            </p>
            <form onSubmit={handleAdminUpdate} className="space-y-4">
              <input value={adminId} onChange={e => setAdminId(e.target.value)}
                     placeholder="Project ID (e.g. PROJ-A1B2C3D4)" className="input-field" required />
              <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)}
                      className="input-field bg-navy/80">
                <option value="">Select new status…</option>
                {meta?.statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Status notes (optional)" rows={2} className="input-field resize-none" />
              <input value={adminKey} onChange={e => setAdminKey(e.target.value)}
                     type="password" placeholder="Admin key" className="input-field" required />
              <button type="submit" disabled={adminUpdating || !adminStatus}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {adminUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Update Status
              </button>
            </form>
            {adminResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${adminResult.startsWith("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {adminResult}
              </div>
            )}
          </div>
        )}

        <p className="text-slate-600 text-xs mt-8 text-center">
          CampusSaathi is not affiliated with or endorsed by IEEE. Project data is stored locally (MVP demo).
          <br />Official IEEE KU: <a href="https://kalingauniversity.ac.in/ieee" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:text-cyan-500">kalingauniversity.ac.in/ieee</a>
        </p>
      </div>
    </div>
  );
}
