/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f13',
        surface: '#1a1a24',
        surfaceBorder: '#2a2a3a',
        forAccent: '#22c55e',
        againstAccent: '#ef4444',
        neutralAccent: '#6366f1',
        textPrimary: '#f1f5f9',
        textMuted: '#94a3b8',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}