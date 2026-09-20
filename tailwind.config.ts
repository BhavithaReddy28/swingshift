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
        ink: {
          base: "#0A0E1C",
          elevated: "#131A2E",
          card: "#1B2440",
        },
        vermillion: {
          DEFAULT: "#FF5A36",
          glow: "#FF8A65",
          dark: "#7A2E3D",
        },
        chartreuse: {
          DEFAULT: "#C4F135",
          glow: "#DFFF7A",
          dark: "#7FA818",
        },
        periwinkle: {
          DEFAULT: "#8EA9FF",
          muted: "#7B85A6",
        },
        card: {
          DEFAULT: "#1B2440",
          foreground: "#F4F1EA",
          border: "rgba(123, 133, 166, 0.15)",
        },
        primary: {
          DEFAULT: "#FF5A36",
          hover: "#E04826",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#C4F135",
          hover: "#B3E024",
          foreground: "#0A0E1C",
        },
        support: {
          DEFAULT: "#8EA9FF",
          foreground: "#0A0E1C",
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
