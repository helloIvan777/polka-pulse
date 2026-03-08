import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // на всякий случай
  ],
  theme: {
    extend: {
      colors: {
        // Глубокий черный фон для Web3 консоли
        background: "#050505",
        foreground: "#FFFFFF",
        // Официальный Розовый Polkadot
        primary: {
          DEFAULT: "#E6007A",
          foreground: "#FFFFFF",
        },
        // Антрацитовый для карточек
        secondary: {
          DEFAULT: "#0A0A0A",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#111111",
          foreground: "#A1A1AA",
        },
        border: "rgba(255, 255, 255, 0.1)",
        accent: {
          DEFAULT: "#E6007A",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      // Добавим эффект свечения для "Пульса"
      boxShadow: {
        'pulse-pink': '0 0 20px rgba(230, 0, 122, 0.2)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;