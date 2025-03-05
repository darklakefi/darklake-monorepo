import type { Config } from "tailwindcss";

const colors = {
  transparent: "rgba(0, 0, 0 ,0)",
  brand: {
    10: "#2CFF8E",
    20: "#35D688",
    30: "#1A9A56",
    40: "#0D4F2B",
    50: "#09351D",
    60: "#062916",
    70: "#041C0F",
    80: "#010804",
  },
  "modal-backdrop": "rgba(1,15,6,0.9)", 
};

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--font-primary)"],
        secondary: ["var(--font-secondary)"],
      },
      fontSize: {
        "3xl": "28px"
      },
      lineHeight: {
        "3xl": "30px"
      },
      colors,
    },
  },
  plugins: [],
} satisfies Config;
