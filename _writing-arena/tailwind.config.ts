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
        background: "var(--background)",
        foreground: "var(--foreground)",
        sd: {
          bg: "#101012",
          card: "rgba(255, 255, 255, 0.025)",
          "card-hover": "rgba(255, 255, 255, 0.04)",
          border: "rgba(255, 255, 255, 0.05)",
          text: "rgba(255, 255, 255, 0.8)",
          "text-secondary": "rgba(255, 255, 255, 0.4)",
          "text-muted": "rgba(255, 255, 255, 0.22)",
          cyan: "#00e5e5",
          pink: "#ff5f8f",
          orange: "#ff9030",
          green: "#00d492",
        },
      },
      borderRadius: {
        sd: "14px",
        "sd-sm": "10px",
        "sd-xs": "6px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Consolas", "monospace"],
        cinzel: ["Cinzel", "serif"],
        cormorant: ["Cormorant Garamond", "serif"],
        // Fantasy theme fonts
        dutch809: ["var(--font-dutch809)", "serif"],
        avenir: ["var(--font-avenir)", "sans-serif"],
        memento: ["var(--font-memento)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
