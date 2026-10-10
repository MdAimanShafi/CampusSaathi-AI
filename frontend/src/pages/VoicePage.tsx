import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw, AlertCircle } from "lucide-react";
import { sendChat, resetChat } from "../api";

interface Message { role: "user" | "assistant"; text: string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySR = any;

const SR: AnySR = typeof window !== "undefined"
  ? ((window as AnySR).SpeechRecognition || (window as AnySR).webkitSpeechRecognition || null)
  : null;

const TTS_SUPPORTED = typeof window !== "undefined" && "speechSynthesis" in window;

export default function VoicePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [lang, setLang] = useState("en-IN");
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");

  const recogRef = useRef<AnySR>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const historyForApi = useCallback((): [string, string][] =>
    messages.reduce<[string, string][]>((acc, m, i, arr) => {
      if (m.role === "user" && arr[i + 1]?.role === "assistant")
        acc.push([m.text, arr[i + 1].text]);
      return acc;
    }, []), [messages]);

  const speak = useCallback((text: string) => {
    if (!TTS_SUPPORTED || !ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.95;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [ttsEnabled, lang]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || pendingRef.current) return;
    pendingRef.current = true;
    setTranscript("");
    setError("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setProcessing(true);
    try {
      const { data } = await sendChat(msg, historyForApi());
      const reply = data.reply || "Sorry, I didn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    } catch (e: any) {
      const errMsg = e.response?.data?.detail || "Could not reach the AI. Check your backend.";
      setError(errMsg);
    } finally {
      setProcessing(false);
      pendingRef.current = false;
    }
  }, [historyForApi, speak]);

  const startListening = useCallback(() => {
    if (!SR) { setError("Speech recognition is not supported in this browser. Use Chrome or Edge."); return; }
    if (listening) return;
    setError("");
    setTranscript("");
    const recog = new SR();
    recog.lang = lang;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.onresult = (e: AnySR) => {
      const t = Array.from(e.results as AnySR[]).map((r: AnySR) => r[0].transcript).join("");
      setTranscript(t);
    };
    recog.onerror = (e: AnySR) => {
      setListening(false);
      if (e.error === "not-allowed") setError("Microphone access denied. Please allow microphone permission.");
      else if (e.error !== "aborted") setError(`Speech recognition error: ${e.error}`);
    };
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    recog.start();
    setListening(true);
  }, [listening, lang]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  const handleReset = async () => {
    stopSpeaking();
    await resetChat().catch(() => {});
    setMessages([]);
    setTranscript("");
    setError("");
  };

  const orbState = listening ? "listening" : processing ? "processing" : speaking ? "speaking" : "idle";

  const ORB_STYLES: Record<string, string> = {
    idle:       "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30",
    listening:  "bg-gradient-to-br from-cyan-400/40 to-blue-500/40 border-cyan-400 animate-pulse",
    processing: "bg-gradient-to-br from-violet-500/30 to-blue-600/30 border-violet-400 animate-pulse",
    speaking:   "bg-gradient-to-br from-green-500/30 to-cyan-500/30 border-green-400 animate-pulse",
  };

  const ORB_LABEL: Record<string, string> = {
    idle: "Tap the mic to speak",
    listening: "Listening…",
    processing: "Gemma 4 is thinking…",
    speaking: "Speaking…",
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">🎙️ Gemma Voice</h1>
          <p className="text-cyan-400 font-medium">Your Campus Companion</p>
          <p className="text-slate-500 text-sm mt-1">Talk naturally. Get campus help instantly.</p>
        </div>

        {/* Orb */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-36 h-36 rounded-full border-2 flex items-center justify-center mb-4 transition-all duration-500 ${ORB_STYLES[orbState]}`}>
            {listening ? (
              <div className="flex gap-1 items-end h-10">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-1.5 bg-cyan-400 rounded-full animate-bounce"
                       style={{ height: `${20 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : processing ? (
              <div className="w-10 h-10 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            ) : speaking ? (
              <Volume2 size={40} className="text-green-400" />
            ) : (
              <Mic size={40} className="text-cyan-400/60" />
            )}
          </div>
          <p className="text-slate-400 text-sm">{ORB_LABEL[orbState]}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {!listening ? (
            <button onClick={startListening} disabled={processing}
                    className="btn-primary flex items-center gap-2 disabled:opacity-40">
              <Mic size={18} /> Start Listening
            </button>
          ) : (
            <button onClick={stopListening}
                    className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 font-semibold px-6 py-3 rounded-xl hover:bg-red-500/30 transition-all">
              <MicOff size={18} /> Stop
            </button>
          )}
          {speaking ? (
            <button onClick={stopSpeaking} className="btn-secondary flex items-center gap-2">
              <VolumeX size={18} /> Stop Speaking
            </button>
          ) : (
            <button onClick={() => setTtsEnabled(v => !v)}
                    className={`btn-secondary flex items-center gap-2 ${!ttsEnabled ? "opacity-50" : ""}`}>
              {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {ttsEnabled ? "TTS On" : "TTS Off"}
            </button>
          )}
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Language selector */}
        <div className="flex justify-center mb-6">
          <select value={lang} onChange={e => setLang(e.target.value)}
                  className="input-field w-auto text-sm py-2">
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi</option>
            <option value="en-US">English (US)</option>
          </select>
        </div>

        {/* Transcript review */}
        {transcript && (
          <div className="card mb-4 animate-fade-in-up">
            <div className="text-xs text-slate-500 mb-2">Transcript (review before sending):</div>
            <div className="text-slate-200 text-sm mb-3 bg-white/5 rounded-lg p-3">{transcript}</div>
            <div className="flex gap-2">
              <button onClick={() => sendMessage(transcript)}
                      className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                <Send size={14} /> Send to Gemma 4
              </button>
              <button onClick={() => setTranscript("")}
                      className="btn-secondary text-sm py-2 px-4">Discard</button>
            </div>
          </div>
        )}

        {/* Text fallback */}
        <div className="card mb-6">
          <div className="text-xs text-slate-500 mb-2">Or type your question:</div>
          <div className="flex gap-2">
            <input value={textInput} onChange={e => setTextInput(e.target.value)}
                   onKeyDown={e => { if (e.key === "Enter") { sendMessage(textInput); setTextInput(""); } }}
                   placeholder="Type a campus question…" className="input-field flex-1 text-sm py-2" />
            <button onClick={() => { sendMessage(textInput); setTextInput(""); }}
                    disabled={!textInput.trim() || processing}
                    className="btn-primary px-4 py-2 disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl p-4 mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Conversation */}
        {messages.length > 0 && (
          <div className="card space-y-4">
            <div className="section-title">Conversation</div>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs
                  ${m.role === "assistant" ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {m.role === "assistant" ? "🤖" : "🎙️"}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${m.role === "assistant"
                    ? "bg-navy-800/80 border border-cyan-500/10 text-slate-200"
                    : "bg-blue-600/20 border border-blue-500/20 text-slate-200"}`}>
                  {m.text}
                  {m.role === "assistant" && ttsEnabled && (
                    <button onClick={() => speak(m.text)}
                            className="ml-2 text-slate-600 hover:text-cyan-400 transition-colors">
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <p className="text-slate-600 text-xs mt-6 text-center">
          🎙️ Speech recognition and synthesis are browser-native features (Chrome/Edge recommended).<br />
          Gemma 4 generates the response text; your browser speaks it. No audio is sent to any server.
        </p>
      </div>
    </div>
  );
}
