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
        brand: {
          black: "#000000",
          dark: "#111111",
          gray: "#1a1a1a",
          gold: "#c9a84c",
          white: "#ffffff",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Oswald", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      transitionDuration: {
        brand: "300ms",
      },
      transitionTimingFunction: {
        brand: "ease",
      },
    },
  },
  plugins: [],
};
export default config;
