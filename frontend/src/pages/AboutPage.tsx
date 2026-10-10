export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold glow-text mb-2">CampusSaathi AI</h1>
          <p className="text-slate-400">Every Campus Problem. One Intelligent Solution.</p>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="section-title">About the Project</div>
            <p className="text-slate-300 text-sm leading-relaxed">
              CampusSaathi AI is a smart campus problem-solving platform built for <strong className="text-white">Kalinga University, Raipur</strong>.
              It was created at <strong className="text-white">MLH Hack Day, IIT Bhilai</strong> using <strong className="text-cyan-400">Gemma 4</strong> (gemma-4-26b-a4b-it).
            </p>
          </div>

          <div className="card">
            <div className="section-title">Tech Stack</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["AI Model", "Gemma 4 · gemma-4-26b-a4b-it"],
                ["AI Provider", "Google AI Studio (free tier)"],
                ["Backend", "Python · FastAPI · uvicorn"],
                ["AI Client", "gemma_client.py (caching, retries)"],
                ["Frontend", "React · TypeScript · Vite"],
                ["3D Engine", "Three.js · React Three Fiber"],
                ["Styling", "Tailwind CSS"],
                ["Charts", "Recharts"],
                ["Persistence", "JSON → PostgreSQL-ready"],
                ["Fallback UI", "Gradio (campus_saathi/app.py)"],
              ].map(([k,v]) => (
                <div key={k} className="bg-white/3 rounded-lg p-3">
                  <div className="text-slate-500 text-xs">{k}</div>
                  <div className="text-slate-200 text-xs mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title">Disclaimer</div>
            <p className="text-slate-400 text-sm leading-relaxed">
              CampusSaathi is a hackathon MVP. It is <strong className="text-white">not</strong> officially integrated with Kalinga University systems.
              Complaints are stored locally. AI responses are suggestions, not official decisions.
              The 3D campus model is illustrative only — it does not represent verified campus geometry.
              Never commit your <code className="text-cyan-600">.env</code> file.
            </p>
          </div>

          <div className="card">
            <div className="section-title">Official Links</div>
            <div className="space-y-2">
              {[
                ["🌐 Kalinga University", "https://www.kalingauniversity.ac.in"],
                ["🏛️ Campus Facilities", "https://www.kalingauniversity.ac.in/campus-facilities"],
                ["📋 Grievance Redressal", "https://kalingauniversity.ac.in/grievance-redressal"],
                ["🎥 Official 360° Virtual Tour", "https://virtualtour.kalingauniversity.ac.in/"],
              ].map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                   className="block text-sm text-slate-400 hover:text-cyan-400 transition-colors">{label} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
