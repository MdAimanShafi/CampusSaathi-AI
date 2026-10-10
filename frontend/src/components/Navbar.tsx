import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/",          label: "Home" },
  { to: "/explore",   label: "Explore Campus" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/voice",     label: "🎙️ Voice" },
  { to: "/grievances",label: "Grievances" },
  { to: "/notices",   label: "Notices" },
  { to: "/ieee",      label: "🔬 IEEE Hub" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about",     label: "About" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🎓</span>
          <div>
            <div className="font-bold text-sm leading-tight glow-text">CampusSaathi AI</div>
            <div className="text-xs text-slate-500 leading-tight hidden sm:block">Kalinga University</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === n.to
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-slate-400 hover:text-white p-2"
                onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-cyan-500/10 bg-navy-800/95 backdrop-blur-xl">
          {NAV.map(n => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium border-b border-white/5 transition-colors ${
                pathname === n.to ? "text-cyan-400 bg-cyan-500/10" : "text-slate-400 hover:text-white"
              }`}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
