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
          orange: "#FF6200",
          pink: "#F7145E",
          purple: "#8C52FF",
          mint: "#85F9B4",
        },
        dark: {
          900: "#0A0A0F",
          800: "#12121A",
          700: "#1A1A25",
          600: "#222233",
          500: "#2A2A3D",
        },
        text: {
          primary: "#E8E8ED",
          secondary: "#9090A0",
          muted: "#606070",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-main": "linear-gradient(135deg, #FF6200, #F7145E, #8C52FF)",
        "gradient-warm": "linear-gradient(135deg, #FF6200, #F7145E)",
        "gradient-cool": "linear-gradient(135deg, #8C52FF, #85F9B4)",
        "gradient-mint": "linear-gradient(135deg, #85F9B4, #8C52FF)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
