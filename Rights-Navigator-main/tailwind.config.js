/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f172a",
          dark: "#0b0f19",
          obsidian: "#070b14",
          emerald: "#10b981",
          jade: "#059669",
          amber: "#f59e0b",
          saffron: "#d97706",
          indigo: "#6366f1",
          sapphire: "#3b82f6",
          royal: "#4338ca",
          violet: "#4f46e5",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'glow-sapphire': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-white': '0 0 25px -5px rgba(255, 255, 255, 0.25)',
        'card': '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 20px 40px -10px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};
