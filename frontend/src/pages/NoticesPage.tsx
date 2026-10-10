import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { summarizeNotice, summarizeNoticeImage, type NoticeSummary } from "../api";

export default function NoticesPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NoticeSummary | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true);
    try {
      if (file) {
        const { data } = await summarizeNoticeImage(file);
        setResult(data);
      } else if (text.trim()) {
        const { data } = await summarizeNotice(text);
        setResult(data);
      } else {
        setError("Please paste notice text or upload an image.");
        setLoading(false); return;
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || "Summarization failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { setError("File too large (max 5 MB)."); return; }
    if (!f.type.startsWith("image/")) { setError("Only image files are supported (PNG, JPEG, WEBP)."); return; }
    setFile(f); setError("");
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📋 Smart Notice Summarizer</h1>
          <p className="text-slate-400 text-sm">Paste notice text or upload an image. Gemma 4 extracts dates, deadlines, and action items.</p>
        </div>

        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Paste Notice Text</label>
              <textarea value={text} onChange={e => { setText(e.target.value); setFile(null); }}
                        placeholder="Paste the full notice text here…"
                        rows={8} className="input-field resize-none" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Upload Notice Image (PNG/JPEG/WEBP, max 5 MB)</label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                  ${file ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10 hover:border-cyan-500/30"}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                       onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {file ? (
                  <div className="text-cyan-400 text-sm">
                    <FileText size={24} className="mx-auto mb-2" />
                    {file.name} ({(file.size/1024).toFixed(0)} KB)
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                            className="ml-2 text-slate-500 hover:text-red-400">✕</button>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">
                    <Upload size={24} className="mx-auto mb-2" />
                    Drag & drop or click to upload
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading || (!text.trim() && !file)}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing with Gemma 4…</>
              ) : "📋 Summarize Notice"}
            </button>
          </form>
        </div>

        {result && (
          <div className="card animate-fade-in-up space-y-5">
            <div className="section-title">📋 Notice Summary</div>
            <div className="text-slate-200 leading-relaxed">{result.summary}</div>

            {result.dates.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-yellow-400 mb-2">📅 Dates & Deadlines</div>
                <ul className="space-y-1">
                  {result.dates.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-yellow-400 mt-0.5">•</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.action_items.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-green-400 mb-2">✅ Action Items</div>
                <ul className="space-y-1">
                  {result.action_items.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 mt-0.5">•</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.missing_info && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-sm">
                ⚠️ {result.missing_info}
              </div>
            )}

            {result.extracted_text && (
              <details className="text-xs text-slate-600">
                <summary className="cursor-pointer hover:text-slate-400">View extracted text</summary>
                <pre className="mt-2 whitespace-pre-wrap bg-white/5 rounded-lg p-3 text-slate-500">{result.extracted_text}</pre>
              </details>
            )}

            <p className="text-slate-600 text-xs">
              ℹ️ AI-generated summary. Always verify against the original official notice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
