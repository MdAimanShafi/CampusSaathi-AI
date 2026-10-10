import { lazy, Suspense, useState, useRef, useCallback } from "react";
import { ExternalLink, Send, AlertCircle } from "lucide-react";
import { sendChat } from "../api";

const CampusExplorer = lazy(() => import("../components/CampusExplorer"));

// Safe text renderer — never uses innerHTML with user input
function SafeText({ text }: { text: string }) {
  return <span>{text}</span>;
}

// Inline campus chat using real Gemma 4 backend
// Simple navigation keywords still work when Gemma is unavailable
const NAV_KEYWORDS: Record<string, string> = {
  library: "Library",
  "lab": "Labs & Classrooms",
  canteen: "Canteen & Mess",
  mess: "Canteen & Mess",
  hostel: "Hostel",
  transport: "Transport",
  sports: "Sports & Other",
  washroom: "Washrooms",
  parking: "Parking",
  health: "Health & Safety",
};

function detectNavIntent(q: string): string | null {
  const lower = q.toLowerCase();
  for (const [kw, dest] of Object.entries(NAV_KEYWORDS)) {
    if (lower.includes(kw)) return dest;
  }
  return null;
}

interface ChatMsg { role: "user" | "bot"; text: string; }

function CampusWalkthroughChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "bot", text: "Namaste! I'm CampusSaathi. Ask me about campus facilities, or type a location name to navigate the 3D map." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gemmaUnavailable, setGemmaUnavailable] = useState(false);
  const historyRef = useRef<[string, string][]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setMsgs(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    // Always check for navigation intent first (works offline)
    const navDest = detectNavIntent(msg);

    try {
      const { data } = await sendChat(msg, historyRef.current);
      const reply = data.reply || "Sorry, no response received.";
      historyRef.current = ([...historyRef.current, [msg, reply]] as [string, string][]).slice(-6);
      const fullReply = navDest
        ? `${reply}\n\n📍 Tip: Use the 3D map above to navigate to ${navDest}.`
        : reply;
      setMsgs(prev => [...prev, { role: "bot", text: fullReply }]);
      setGemmaUnavailable(false);
    } catch {
      // Gemma unavailable — fall back to navigation-only mode
      setGemmaUnavailable(true);
      const fallback = navDest
        ? `📍 Navigate to ${navDest} using the 3D map above. (AI assistant temporarily unavailable — backend may not be running.)`
        : "I can help you navigate the 3D campus map. Try asking about the library, canteen, hostel, labs, or sports complex. (AI assistant temporarily unavailable.)";
      setMsgs(prev => [...prev, { role: "bot", text: fallback }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [loading]);

  return (
    <div className="card mt-4">
      <div className="section-title">🤖 Campus Assistant</div>
      {gemmaUnavailable && (
        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-400/10 rounded-lg p-2 mb-3">
          <AlertCircle size={13} /> AI backend unavailable — navigation commands still work.
        </div>
      )}
      <div className="h-48 overflow-y-auto space-y-3 mb-3 pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "bot"
                ? "bg-navy-800/80 border border-cyan-500/10 text-slate-200"
                : "bg-blue-600/20 border border-blue-500/20 text-slate-200"
            }`}>
              <SafeText text={m.text} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 px-3 py-2">
            {[0,1,2].map(j => (
              <div key={j} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                   style={{ animationDelay: `${j * 0.15}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
               onKeyDown={e => { if (e.key === "Enter") send(input); }}
               placeholder="Ask about campus facilities…"
               className="input-field flex-1 text-sm py-2" />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
                className="btn-primary px-4 py-2 disabled:opacity-40">
          <Send size={15} />
        </button>
      </div>
      <p className="text-slate-600 text-xs mt-2">
        Powered by Gemma 4. Navigation commands work even when AI is offline.
      </p>
    </div>
  );
}

export default function ExplorePage() {
  const [tourMode, setTourMode] = useState<"3d" | "official">("3d");

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🗺️ Campus Explorer</h1>
          <p className="text-slate-400 text-sm">
            Interactive 3D campus model · Click markers to explore facilities
            <span className="text-slate-600"> · Illustrative model — not verified campus geometry</span>
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-5">
          <button onClick={() => setTourMode("3d")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    tourMode === "3d" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white glass"
                  }`}>
            🗺️ 3D Campus Map
          </button>
          <button onClick={() => setTourMode("official")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    tourMode === "official" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white glass"
                  }`}>
            🎥 Official 360° Tour
          </button>
        </div>

        {/* 3D Explorer */}
        {tourMode === "3d" && (
          <>
            <Suspense fallback={
              <div className="h-[600px] flex items-center justify-center bg-navy-800 rounded-2xl border border-cyan-500/10">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-cyan-400">Loading 3D Campus…</div>
                  <div className="text-slate-600 text-xs mt-1">Requires WebGL</div>
                </div>
              </div>
            }>
              <CampusExplorer />
            </Suspense>
            <p className="text-center text-slate-600 text-xs mt-2">
              Illustrative 3D model — building positions are conceptual, not verified.
              Use the official tour for accurate navigation.
            </p>
            <CampusWalkthroughChat />
          </>
        )}

        {/* Official 360° Tour */}
        {tourMode === "official" && (
          <div className="card">
            <div className="section-title">🎥 Official Kalinga University 360° Virtual Tour</div>
            <p className="text-slate-400 text-sm mb-4">
              The official virtual tour is provided by Kalinga University. It may not embed in all browsers
              due to security policies. Use the button below to open it in a new tab if it does not load.
            </p>
            <div className="mb-4">
              <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank" rel="noopener noreferrer"
                 className="btn-primary inline-flex items-center gap-2">
                Open Official 360° Tour <ExternalLink size={16} />
              </a>
            </div>
            {/* Attempt embed with clear fallback notice */}
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/10" style={{ height: 500 }}>
              <iframe
                src="https://virtualtour.kalingauniversity.ac.in/"
                title="Kalinga University Official 360° Virtual Tour"
                className="w-full h-full border-0"
                allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                allowFullScreen
              />
              {/* Overlay shown if iframe is blank — CSS only, always visible as fallback text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-slate-600 text-xs">
                  If the tour does not appear above, open it in a new tab using the button.
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-xs mt-3">
              This is the official tour provided by Kalinga University. CampusSaathi is not affiliated with it.
            </p>
          </div>
        )}

        {/* Official resource links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Campus Facilities", url: "https://www.kalingauniversity.ac.in/campus-facilities", icon: "🏛️" },
            { label: "Grievance Redressal", url: "https://kalingauniversity.ac.in/grievance-redressal", icon: "📋" },
            { label: "Official 360° Virtual Tour", url: "https://virtualtour.kalingauniversity.ac.in/", icon: "🎥" },
          ].map(r => (
            <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
               className="card flex items-center gap-3 hover:border-cyan-500/30 transition-all group">
              <span className="text-2xl">{r.icon}</span>
              <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">{r.label} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
