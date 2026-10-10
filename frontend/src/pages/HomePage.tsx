import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, FileText, BarChart3, MapPin, Bell, Shield } from "lucide-react";

const CampusExplorer = lazy(() => import("../components/CampusExplorer"));

const FEATURES = [
  { icon: <Bot size={22} />, title: "AI Campus Assistant", desc: "Ask anything about campus facilities, hostel, canteen, transport — powered by Gemma 4.", to: "/assistant", color: "text-cyan-400" },
  { icon: <FileText size={22} />, title: "Report a Problem", desc: "Submit complaints with AI-powered categorization, priority analysis, and tracking.", to: "/grievances", color: "text-blue-400" },
  { icon: <MapPin size={22} />, title: "Campus Explorer", desc: "Interactive 3D campus model with clickable buildings and official 360° virtual tour.", to: "/explore", color: "text-violet-400" },
  { icon: <Bell size={22} />, title: "Smart Notices", desc: "Paste any university notice — AI extracts dates, deadlines, and action items instantly.", to: "/notices", color: "text-yellow-400" },
  { icon: <BarChart3 size={22} />, title: "Live Dashboard", desc: "Real-time analytics from actual complaint data — categories, priorities, and status.", to: "/dashboard", color: "text-green-400" },
  { icon: <Shield size={22} />, title: "Grievance Tracking", desc: "Track your complaint by ID. Know exactly where it stands at every step.", to: "/grievances", color: "text-red-400" },
];

const STEPS = [
  { n: "01", title: "Describe the Problem", desc: "Select a category and describe what you observed." },
  { n: "02", title: "AI Analysis", desc: "Gemma 4 classifies, summarizes, and assigns a priority." },
  { n: "03", title: "Get a Complaint ID", desc: "A unique ID is generated and the record is saved." },
  { n: "04", title: "Track & Resolve", desc: "Monitor status updates until the issue is resolved." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                          bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-cyan-400 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Powered by Gemma 4 · gemma-4-26b-a4b-it
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
              <span className="glow-text">Your Campus.</span>
              <br />
              <span className="text-white">Smarter with AI.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              CampusSaathi AI is your intelligent campus companion for Kalinga University.
              Report problems, track complaints, explore facilities, and get instant AI-powered answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/explore" className="btn-primary flex items-center justify-center gap-2">
                🗺️ Explore 3D Campus <ArrowRight size={16} />
              </Link>
              <Link to="/assistant" className="btn-secondary flex items-center justify-center gap-2">
                🤖 Ask CampusSaathi AI
              </Link>
              <Link to="/voice" className="btn-secondary flex items-center justify-center gap-2">
                🎙️ Voice Assistant
              </Link>
            </div>
          </div>

          {/* 3D Scene */}
          <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-glow-lg">
            <Suspense fallback={
              <div className="h-[500px] flex items-center justify-center bg-navy-800 rounded-2xl">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-cyan-400">Loading 3D Campus…</div>
                </div>
              </div>
            }>
              <CampusExplorer />
            </Suspense>
          </div>
          <p className="text-center text-slate-600 text-xs mt-3">
            Illustrative 3D model — not a verified campus map. Use the official{" "}
            <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank" rel="noopener noreferrer"
               className="text-cyan-600 hover:text-cyan-400">360° virtual tour</a> for accurate campus navigation.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Campus Digital Tools</h2>
            <p className="text-slate-400">Everything you need to navigate campus life, powered by AI.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <Link key={f.title} to={f.to}
                    className="card hover:border-cyan-500/30 hover:shadow-glow transition-all duration-300 group">
                <div className={`${f.color} mb-3 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <div className="font-semibold text-white mb-2">{f.title}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{f.desc}</div>
                <div className={`${f.color} text-xs mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Open <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-4 bg-navy-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">AI-Powered Complaint Resolution</h2>
            <p className="text-slate-400">From problem to resolution — transparent and trackable.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-cyan-500/30 to-transparent z-0" />
                )}
                <div className="card relative z-10">
                  <div className="text-3xl font-black glow-text mb-3">{s.n}</div>
                  <div className="font-semibold text-white mb-2 text-sm">{s.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/grievances" className="btn-primary inline-flex items-center gap-2">
              Submit a Complaint <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Official resources ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card border-cyan-500/20">
            <div className="section-title">🏛️ Official Kalinga University Resources</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[
                { label: "Campus Facilities", url: "https://www.kalingauniversity.ac.in/campus-facilities", icon: "🏛️" },
                { label: "Grievance Redressal", url: "https://kalingauniversity.ac.in/grievance-redressal", icon: "📋" },
                { label: "Official 360° Tour", url: "https://virtualtour.kalingauniversity.ac.in/", icon: "🎥" },
              ].map(r => (
                <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 transition-all group">
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">{r.label} ↗</span>
                </a>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-4">
              CampusSaathi is a student-built platform and is not officially affiliated with or endorsed by Kalinga University.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
