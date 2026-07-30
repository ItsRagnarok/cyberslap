import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        ink: "#0b0d12",
        paper: "#f7f6f2",
        accent: "#6a5cff",
      },
    },
  },
  plugins: [],
};

export default config;
