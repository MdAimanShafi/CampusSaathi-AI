import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getDashboard, listComplaints, STATUS_COLORS, PRIORITY_COLORS, type DashboardStats, type Complaint } from "../api";

const PIE_COLORS = ["#00d4ff","#3b82f6","#7c3aed","#f59e0b","#10b981","#ef4444","#ec4899","#8b5cf6","#06b6d4"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [s, c] = await Promise.all([getDashboard(), listComplaints(filterCat, filterStatus)]);
      setStats(s.data);
      setComplaints(c.data.complaints);
    } catch { setError("Could not load dashboard. Is the backend running?"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterCat, filterStatus]);

  const catData = stats ? Object.entries(stats.by_category).filter(([,v]) => v > 0).map(([k,v]) => ({ name: k.split(" ")[0], full: k, value: v })) : [];
  const statusData = stats ? Object.entries(stats.by_status).map(([k,v]) => ({ name: k, value: v })) : [];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">📊 Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">All metrics from persisted complaint records.</p>
          </div>
          <button onClick={load} disabled={loading}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {error && <div className="text-red-400 bg-red-400/10 rounded-xl p-4 mb-6">{error}</div>}

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Complaints", value: stats.total, color: "text-cyan-400" },
              { label: "Resolved", value: stats.by_status["Resolved"] || 0, color: "text-green-400" },
              { label: "In Progress", value: stats.by_status["In Progress"] || 0, color: "text-violet-400" },
              { label: "Submitted", value: stats.by_status["Submitted"] || 0, color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className={`text-4xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-slate-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        {stats && catData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <div className="section-title">Complaints by Category</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f1628", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, color: "#e2e8f0" }}
                           formatter={(v, _, p) => [v, p.payload.full]} />
                  <Bar dataKey="value" fill="#00d4ff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="section-title">Status Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                       labelLine={{ stroke: "#334155" }}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f1628", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters + list */}
        <div className="card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="section-title mb-0">All Complaints ({complaints.length})</div>
            <div className="flex gap-2 flex-wrap">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                      className="input-field py-2 text-sm w-auto">
                <option value="">All Categories</option>
                {stats && Object.keys(stats.by_category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="input-field py-2 text-sm w-auto">
                <option value="">All Statuses</option>
                {stats && Object.keys(stats.by_status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading && <div className="text-center py-8 text-slate-500">Loading…</div>}

          {!loading && complaints.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              No complaints match the selected filters.
            </div>
          )}

          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="p-4 bg-white/3 border border-white/5 rounded-xl hover:border-cyan-500/20 transition-colors">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="font-mono text-cyan-400 text-sm font-bold">{c.id}</div>
                  <div className="flex gap-2">
                    {c.ai_priority && <span className={`status-badge ${PRIORITY_COLORS[c.ai_priority]}`}>{c.ai_priority}</span>}
                    <span className={`status-badge ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                  </div>
                </div>
                <div className="text-slate-500 text-xs mt-1">{c.category} · {c.location || "—"} · {c.created_at.slice(0,10)}</div>
                <div className="text-slate-300 text-sm mt-2 line-clamp-2">{c.description}</div>
                {c.ai_summary && <div className="text-slate-500 text-xs mt-1">AI: {c.ai_summary}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
