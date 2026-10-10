import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Copy, Check, Bot, User } from "lucide-react";
import { sendChat, resetChat } from "../api";

const SUGGESTIONS = [
  "What facilities are available in the hostel?",
  "How do I submit a complaint about the canteen?",
  "What are the library timings?",
  "How can I report a maintenance issue?",
  "What transport routes are available?",
];

interface Message { role: "user" | "bot"; text: string; }

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm CampusSaathi AI, your campus assistant for Kalinga University. Ask me anything about campus facilities, hostel, canteen, transport, or how to submit a complaint. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const historyForApi = (): [string, string][] =>
    messages.reduce<[string, string][]>((acc, m, i, arr) => {
      if (m.role === "user" && arr[i + 1]?.role === "bot")
        acc.push([m.text, arr[i + 1].text]);
      return acc;
    }, []);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const { data } = await sendChat(msg, historyForApi());
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch (e: any) {
      const errMsg = e.response?.data?.detail || "Could not reach the AI. Check your API key and backend.";
      setMessages(prev => [...prev, { role: "bot", text: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    await resetChat().catch(() => {});
    setMessages([{ role: "bot", text: "New conversation started. How can I help you?" }]);
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🤖 AI Campus Assistant</h1>
          <p className="text-slate-400 text-sm">Powered by Gemma 4 · gemma-4-26b-a4b-it</p>
        </div>

        <div className="card mb-4 h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm
                  ${m.role === "bot" ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {m.role === "bot" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${m.role === "bot"
                    ? "bg-navy-800/80 border border-cyan-500/10 text-slate-200"
                    : "bg-blue-600/20 border border-blue-500/20 text-slate-200"}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {m.role === "bot" && (
                    <button onClick={() => copyText(m.text, i)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400">
                      {copied === i ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-navy-800/80 border border-cyan-500/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                           style={{ animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-2">
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about campus facilities, hostel, canteen…"
                rows={2} className="input-field resize-none flex-1 text-sm" />
              <div className="flex flex-col gap-2">
                <button onClick={() => send(input)} disabled={loading || !input.trim()}
                        className="btn-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={16} />
                </button>
                <button onClick={handleReset} title="New conversation" className="btn-secondary px-4 py-2">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-2">Suggested questions:</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                      className="text-xs px-3 py-2 glass rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors border border-white/5">
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs mt-4 text-center">
          ⚠️ AI responses are general guidance. For official information visit{" "}
          <a href="https://www.kalingauniversity.ac.in" target="_blank" rel="noopener noreferrer"
             className="text-cyan-700 hover:text-cyan-500">kalingauniversity.ac.in</a>
        </p>
      </div>
    </div>
  );
}
