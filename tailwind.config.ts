import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0b1020",
          accent: "#00d4ff",
          grad1: "#00d4ff",
          grad2: "#00ff85",
          grad3: "#ffe066"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
