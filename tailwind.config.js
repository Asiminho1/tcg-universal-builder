/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712", // Sehr dunkles Grau/Schwarz für Mobile-First Dark Mode
        surface: "#111827",
        primary: "#3b82f6",
      }
    },
  },
  plugins: [],
}