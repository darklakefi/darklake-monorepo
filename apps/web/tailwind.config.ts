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
    80: "#03160B",
    90: "#041C0F",
    100: "#010804",
  },
  "modal-backdrop": "rgba(1,15,6,0.9)",
  neutral: {
    grey: "#888889",
    dark: "#111214",
  },
  status: {
    error: {
      10: "#FF5C5C",
      20: "#F26B6B",
    },
    warning: {
      10: "#FFC769",
      20: "#EED33A",
    },
    success: {
      10: "#2CFF8E",
      20: "#35D688",
    },
    info: {
      10: "#8a9cff",
      20: "#667EF1",
    },
  },
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
        "3xl": "28px",
      },
      lineHeight: {
        "3xl": "30px",
      },
      letterSpacing: {
        normal: "0.01em",
        wide: "0.02em",
      },
      borderRadius: {
        "4xl": "2.5rem",
      },
      colors,
      screens: {
        xs: "481px",
      },
      boxShadow: {
        "3xl": "12px 12px 0px 0px",
        md: "4px 4px 0px 0px",
      },
      minWidth: {
        "3xl": "720px",
      },
      maxWidth: {
        "2xl": "38.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
