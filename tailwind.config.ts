import type { Config } from "tailwindcss";

export default {
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
      },
      fontFamily: {
        'medieval': ['MedievalSharp', 'cursive'],
        'medieval-brand': ['MedievalSharp', 'cursive'],
        'cinzel': ['Cinzel', 'serif'],
        'unifraktur': ['UnifrakturMaguntia', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config;
