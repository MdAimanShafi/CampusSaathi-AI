/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: "#0a0e1a", 800: "#0f1628", 700: "#111d3a" },
        cyan:   { DEFAULT: "#00d4ff", dark: "#0099bb" },
        blue:   { DEFAULT: "#3b82f6" },
        violet: { DEFAULT: "#7c3aed" },
      },
      fontFamily: { sans: ["Inter", "Segoe UI", "sans-serif"] },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0a0e1a 0%, #0f1e3d 50%, #0a0e1a 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(15,22,45,0.9), rgba(10,14,26,0.95))",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,212,255,0.15)",
        "glow-lg": "0 0 40px rgba(0,212,255,0.2)",
      },
    },
  },
  plugins: [],
};
