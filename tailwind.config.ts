import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            h1: {
              fontFamily: (theme('fontFamily.medieval') as unknown as string[]).join(', '),
              color: theme('colors.amber.600'),
            },
            h2: {
              fontFamily: (theme('fontFamily.medieval') as unknown as string[]).join(', '),
              color: theme('colors.amber.600'),
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.2'),
            },
            p: {
              color: theme('colors.gray.800'),
            },
            a: {
              color: theme('colors.amber.600'),
              textDecoration: 'none',
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.gray.200'),
            h1: {
              fontFamily: (theme('fontFamily.medieval') as unknown as string[]).join(', '),
              color: theme('colors.amber.400'),
            },
            h2: {
              fontFamily: (theme('fontFamily.medieval') as unknown as string[]).join(', '),
              color: theme('colors.amber.300'),
              marginTop: theme('spacing.8'),
              marginBottom: theme('spacing.3'),
            },
            p: {
              color: theme('colors.gray.200'),
            },
            a: {
              color: theme('colors.amber.300'),
              textDecoration: 'none',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;
