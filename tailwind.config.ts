import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          main: {
            100: "hsl(var(--accent-main-100))",
            200: "hsl(var(--accent-main-200))",
          },
          secondary: {
            100: "hsl(var(--accent-secondary-100))",
          },
        },
        bg: {
          100: "hsl(var(--bg-100))",
          200: "hsl(var(--bg-200))",
          300: "hsl(var(--bg-300))",
        },
        text: {
          100: "hsl(var(--text-100))",
          200: "hsl(var(--text-200))",
          300: "hsl(var(--text-300))",
        },
        border: {
          100: "hsl(var(--border-100))",
        },
      },
    },
  },
  plugins: [],
};
export default config;
