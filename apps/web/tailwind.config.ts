import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: "#06b6d4",
          500: "#06b6d4",
        },
      },
      backdropBlur: {
        6: "6px",
      },
    },
  },
  plugins: [],
} satisfies Config;
