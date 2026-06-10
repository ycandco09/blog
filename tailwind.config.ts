import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0c10",
          card: "#13161a",
          border: "#1f2937",
        },
        light: {
          bg: "#ffffff",
          card: "#f9fafb",
          border: "#e5e7eb",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "8px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            pre: {
              fontFamily: "JetBrains Mono, monospace",
            },
            code: {
              fontFamily: "JetBrains Mono, monospace",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
