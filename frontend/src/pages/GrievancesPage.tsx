import { useState, useEffect } from "react";
import { Search, Send, AlertCircle, CheckCircle } from "lucide-react";
import {
  submitComplaint, getComplaint, updateComplaintStatus, getCategories,
  PRIORITY_COLORS, STATUS_COLORS, type Complaint, type AIAnalysis,
} from "../api";

export default function GrievancesPage() {
  const [tab, setTab] = useState<"submit"|"track"|"update">("submit");
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  // Submit form
  const [form, setForm] = useState({ category: "", title: "", description: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ complaint: Complaint; ai_analysis: AIAnalysis } | null>(null);
  const [submitError, setSubmitError] = useState("");

  // Track
  const [trackId, setTrackId] = useState("");
  const [tracked, setTracked] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState("");
  const [tracking, setTracking] = useState(false);

  // Update
  const [updId, setUpdId] = useState("");
  const [updStatus, setUpdStatus] = useState("");
  const [updNotes, setUpdNotes] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [updResult, setUpdResult] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getCategories().then(r => {
      setCategories(r.data.categories);
      setStatuses(r.data.statuses);
      setForm(f => ({ ...f, category: r.data.categories[0] || "" }));
      setUpdStatus(r.data.statuses[0] || "");
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(""); setSubmitResult(null); setSubmitting(true);
    try {
      const { data } = await submitComplaint(form);
      setSubmitResult(data);
      setForm(f => ({ ...f, title: "", description: "", location: "" }));
    } catch (e: any) {
      setSubmitError(e.response?.data?.detail || "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(""); setTracked(null); setTracking(true);
    try {
      const { data } = await getComplaint(trackId.trim().toUpperCase());
      setTracked(data);
    } catch (e: any) {
      setTrackError(e.response?.status === 404 ? `No complaint found with ID "${trackId.trim().toUpperCase()}".` : "Lookup failed.");
    } finally { setTracking(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdResult(""); setUpdating(true);
    try {
      const { data } = await updateComplaintStatus(updId.trim().toUpperCase(), updStatus, updNotes, adminKey);
      setUpdResult(`✅ Status updated to "${data.status}" for ${data.id}`);
    } catch (e: any) {
      setUpdResult(e.response?.status === 403 ? "❌ Invalid admin key." : `❌ ${e.response?.data?.detail || "Update failed."}`);
    } finally { setUpdating(false); }
  };

  const TABS = [
    { id: "submit", label: "📝 Submit Complaint" },
    { id: "track",  label: "🔍 Track Complaint" },
    { id: "update", label: "🔧 Update Status" },
  ] as const;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📝 Grievance Management</h1>
          <p className="text-slate-400 text-sm">Submit, track, and manage campus complaints with AI-powered analysis.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      tab === t.id ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
                    }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Submit ── */}
        {tab === "submit" && (
          <div className="card">
            <div className="section-title">Submit a Campus Complaint</div>
            <p className="text-slate-500 text-xs mb-4">
              Your complaint will be analyzed by Gemma 4 AI. This is a demonstration platform — complaints are stored locally.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                        className="input-field bg-navy/80" required>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Complaint Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                       placeholder="Brief title for your complaint" className="input-field" required minLength={5} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Location / Facility</label>
                <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                       placeholder="e.g. Block-A Hostel, Main Canteen" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                          placeholder="Describe what you observed, when it started, and how it affects you…"
                          rows={5} className="input-field resize-none" required minLength={15} />
              </div>
              {submitError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
                  <AlertCircle size={16} /> {submitError}
                </div>
              )}
              <button type="submit" disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing with Gemma 4…</>
                ) : (
                  <><Send size={16} /> Submit Complaint</>
                )}
              </button>
            </form>

            {submitResult && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in-up">
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                  <CheckCircle size={18} /> Complaint Submitted Successfully
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-slate-500 text-xs">Complaint ID</div>
                    <div className="font-mono font-bold text-cyan-400 text-lg">{submitResult.complaint.id}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">AI Priority</div>
                    <span className={`status-badge ${PRIORITY_COLORS[submitResult.ai_analysis.priority]}`}>
                      {submitResult.ai_analysis.priority}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div><span className="text-slate-500">Summary:</span> {submitResult.ai_analysis.summary}</div>
                  <div><span className="text-slate-500">Next Action:</span> {submitResult.ai_analysis.next_action}</div>
                  {submitResult.ai_analysis.missing_info && (
                    <div><span className="text-slate-500">To help resolve faster:</span> {submitResult.ai_analysis.missing_info}</div>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  💡 Save your Complaint ID to track status in the Track tab.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Track ── */}
        {tab === "track" && (
          <div className="card">
            <div className="section-title">Track Your Complaint</div>
            <form onSubmit={handleTrack} className="flex gap-2 mb-6">
              <input value={trackId} onChange={e => setTrackId(e.target.value)}
                     placeholder="Enter Complaint ID (e.g. CS-A1B2C3D4)"
                     className="input-field flex-1" required />
              <button type="submit" disabled={tracking} className="btn-primary px-4 flex items-center gap-2 disabled:opacity-50">
                {tracking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
                Track
              </button>
            </form>

            {trackError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
                <AlertCircle size={16} /> {trackError}
              </div>
            )}

            {tracked && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-mono font-bold text-cyan-400 text-xl">{tracked.id}</div>
                  <span className={`status-badge ${STATUS_COLORS[tracked.status]}`}>{tracked.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Category", tracked.category],
                    ["Location", tracked.location || "—"],
                    ["AI Priority", tracked.ai_priority || "—"],
                    ["Submitted", tracked.created_at],
                    ["Last Updated", tracked.updated_at],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div className="text-slate-500 text-xs">{k}</div>
                      <div className="text-slate-200">{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Description</div>
                  <div className="text-slate-300 text-sm bg-white/5 rounded-lg p-3">{tracked.description}</div>
                </div>
                {tracked.ai_summary && (
                  <div>
                    <div className="text-slate-500 text-xs mb-1">AI Summary</div>
                    <div className="text-slate-300 text-sm">{tracked.ai_summary}</div>
                  </div>
                )}
                {tracked.resolution_notes && (
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Resolution Notes</div>
                    <div className="text-slate-300 text-sm bg-green-500/5 border border-green-500/20 rounded-lg p-3">{tracked.resolution_notes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Update ── */}
        {tab === "update" && (
          <div className="card">
            <div className="section-title">Update Complaint Status</div>
            <p className="text-slate-500 text-xs mb-4">
              Admin function. Default demo key: <code className="text-cyan-600">demo-admin</code>
            </p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input value={updId} onChange={e => setUpdId(e.target.value)}
                     placeholder="Complaint ID (e.g. CS-A1B2C3D4)" className="input-field" required />
              <select value={updStatus} onChange={e => setUpdStatus(e.target.value)} className="input-field bg-navy/80">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea value={updNotes} onChange={e => setUpdNotes(e.target.value)}
                        placeholder="Resolution notes (optional)" rows={3} className="input-field resize-none" />
              <input value={adminKey} onChange={e => setAdminKey(e.target.value)}
                     placeholder="Admin key" type="password" className="input-field" required />
              <button type="submit" disabled={updating}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                Update Status
              </button>
            </form>
            {updResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${updResult.startsWith("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {updResult}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
