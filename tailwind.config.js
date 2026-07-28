/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        glass: "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
        stellar: {
          violet: "#A855F7",
          cyan: "#00F0FF",
          obsidian: "#07070E",
          surface: "#0D0D1F",
          card: "rgba(19, 19, 43, 0.65)",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-card": "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(0, 240, 255, 0.05) 100%)",
        "stellar-hero": "radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.15) 0%, rgba(7, 7, 14, 1) 70%)"
      },
      boxShadow: {
        "glow-violet": "0 0 25px -5px rgba(168, 85, 247, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.4)",
        "glass-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    },
  },
  plugins: [],
}
