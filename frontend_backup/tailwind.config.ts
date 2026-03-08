import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#020817",
        foreground: "#e5e7eb",
        muted: {
          DEFAULT: "#020617",
          foreground: "#64748b"
        },
        border: "#1f2937",
        primary: {
          DEFAULT: "#38bdf8",
          foreground: "#0b1120"
        },
        accent: {
          DEFAULT: "#4f46e5",
          foreground: "#e5e7eb"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;

