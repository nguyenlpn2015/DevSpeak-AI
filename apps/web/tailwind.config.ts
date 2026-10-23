import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        slate: {
          850: "#172033",
          900: "#0f172a",
          950: "#020617",
        },
        lingua: {
          bg: "#05040F",
          sidebar: "#080613",
          card: "#0D0920",
          elevated: "#120C26",
          border: "#1F1538",
          purple: "#8B20F5",
          "purple-bright": "#A855F7",
          "purple-light": "#C084FC",
          "purple-glow": "rgba(139, 32, 245, 0.35)",
          blue: "#315BFF",
          pink: "#EC007A",
          teal: "#009F83",
          amber: "#FF7A00",
          primary: "#F5F3FF",
          secondary: "#9286C7",
          muted: "#6B5E99",
        },
      },
    },
  },
  plugins: [],
};

export default config;

