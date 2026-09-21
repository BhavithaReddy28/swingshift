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
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        input: "var(--bg-input)",
        muted: "var(--text-muted)",
        border: "var(--border-subtle)",
        ink: {
          base: "var(--bg-base)",
          elevated: "var(--bg-elevated)",
          card: "var(--bg-card)",
        },
        primary: {
          DEFAULT: "var(--accent-primary)",
          glow: "var(--accent-primary-glow)",
        },
        secondary: {
          DEFAULT: "var(--accent-secondary)",
          glow: "var(--accent-secondary-glow)",
        },
        support: {
          DEFAULT: "var(--accent-support)",
        },
        vermillion: {
          DEFAULT: "var(--accent-primary)",
          glow: "var(--accent-primary-glow)",
        },
        chartreuse: {
          DEFAULT: "var(--accent-secondary)",
          glow: "var(--accent-secondary-glow)",
        },
        periwinkle: {
          DEFAULT: "var(--accent-support)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(255, 90, 54, 0.45)",
        "glow-chartreuse": "0 0 35px -5px rgba(196, 241, 53, 0.55)",
        "glow-periwinkle": "0 0 35px -5px rgba(142, 169, 255, 0.35)",
        glass: "0 12px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        "reel-spin": {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-90%)" },
        },
        "ball-bounce": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "70%": { transform: "scale(1.18)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "reel-spin": "reel-spin 0.8s ease-in-out infinite",
        "ball-bounce": "ball-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
