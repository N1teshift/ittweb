import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const tailwindConfig = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "var(--amber-400, #fbbf24)",
          light: "var(--amber-300, #fcd34d)",
          dark: "#d97706",
          border: "rgba(251, 191, 36, 0.3)",
          "border-hover": "rgba(251, 191, 36, 0.5)",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        medieval: ["MedievalSharp", "cursive"],
        "medieval-brand": ["MedievalSharp", "cursive"],
        cinzel: ["Cinzel", "serif"],
        unifraktur: ["UnifrakturMaguntia", "cursive"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.08)",
        large: "0 8px 24px rgba(0, 0, 0, 0.12)",
        "inner-soft": "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "animated-border": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        l30: {
          "70%, 100%": { transform: "rotate(-270deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "animated-border": "animated-border 4s ease infinite",
        loader: "l30 1s infinite",
      },
      transitionDuration: {
        400: "400ms",
      },
      spacing: {
        section: "1.5rem",
        "section-lg": "2rem",
        card: "1.5rem",
        "card-sm": "1rem",
      },
      typography: ({ theme }: { theme: (path: string) => any }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.800"),
            h1: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.600"),
            },
            h2: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.600"),
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.2"),
            },
            p: {
              color: theme("colors.gray.800"),
            },
            a: {
              color: theme("colors.amber.600"),
              textDecoration: "none",
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.gray.200"),
            h1: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.400"),
            },
            h2: {
              fontFamily: (theme("fontFamily.medieval") as unknown as string[]).join(", "),
              color: theme("colors.amber.300"),
              marginTop: theme("spacing.8"),
              marginBottom: theme("spacing.3"),
            },
            p: {
              color: theme("colors.gray.200"),
            },
            a: {
              color: theme("colors.amber.300"),
              textDecoration: "none",
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;

export default tailwindConfig;









