import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        foreground: "#F3F4F6",
        card: {
          DEFAULT: "rgba(17, 24, 39, 0.7)",
          foreground: "#F9FAFB",
          border: "rgba(255, 255, 255, 0.08)",
        },
        primary: {
          DEFAULT: "#F97316", // Warm amber/terracotta accent
          hover: "#EA580C",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#14B8A6", // Cool teal support accent
          hover: "#0D9488",
          foreground: "#FFFFFF",
        },
        dark: {
          100: "#1F2937",
          200: "#111827",
          300: "#0B0F17",
          400: "#070A10",
        },
        gold: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.3)",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(249, 115, 22, 0.3)",
        "glow-teal": "0 0 25px -5px rgba(20, 184, 166, 0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backdropBlur: {
        glass: "12px",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        "ball-flip": {
          "0%": { transform: "rotateX(90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)", opacity: "1" },
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 3s infinite ease-in-out",
        "ball-flip": "ball-flip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
