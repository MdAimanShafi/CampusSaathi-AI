export default function Footer() {
  return (
    <footer className="border-t border-cyan-500/10 mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎓</span>
            <span className="font-bold glow-text">CampusSaathi AI</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every Campus Problem. One Intelligent Solution.<br />
            Built at MLH Hack Day, IIT Bhilai using Gemma 4.
          </p>
        </div>
        <div>
          <div className="font-semibold text-slate-300 mb-3">Official Links</div>
          <div className="flex flex-col gap-2 text-sm">
            <a href="https://www.kalingauniversity.ac.in" target="_blank" rel="noopener noreferrer"
               className="text-slate-500 hover:text-cyan-400 transition-colors">🌐 Kalinga University</a>
            <a href="https://www.kalingauniversity.ac.in/campus-facilities" target="_blank" rel="noopener noreferrer"
               className="text-slate-500 hover:text-cyan-400 transition-colors">🏛️ Campus Facilities</a>
            <a href="https://kalingauniversity.ac.in/grievance-redressal" target="_blank" rel="noopener noreferrer"
               className="text-slate-500 hover:text-cyan-400 transition-colors">📋 Grievance Redressal</a>
            <a href="https://virtualtour.kalingauniversity.ac.in/" target="_blank" rel="noopener noreferrer"
               className="text-slate-500 hover:text-cyan-400 transition-colors">🎥 Official Virtual Tour</a>
          </div>
        </div>
        <div>
          <div className="font-semibold text-slate-300 mb-3">Disclaimer</div>
          <p className="text-slate-500 text-xs leading-relaxed">
            CampusSaathi is a student-built hackathon MVP. It is not officially integrated with
            Kalinga University systems. Complaints are stored locally. AI responses are suggestions,
            not official decisions. The 3D campus model is illustrative only.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
        <span>© 2024 CampusSaathi AI — MIT License</span>
        <span>Powered by Gemma 4 (gemma-4-26b-a4b-it) · Python · FastAPI · React · Three.js</span>
      </div>
    </footer>
  );
}
