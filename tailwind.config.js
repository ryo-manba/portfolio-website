/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        rotateCoin: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "15%": { transform: "translateX(-8px) rotate(-4deg)" },
          "30%": { transform: "translateX(8px) rotate(4deg)" },
          "45%": { transform: "translateX(-6px) rotate(-3deg)" },
          "60%": { transform: "translateX(6px) rotate(3deg)" },
          "75%": { transform: "translateX(-3px) rotate(-1deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "rotate-coin": "rotateCoin 0.5s linear forwards",
        "shake-omikuji": "shake 0.6s ease-in-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-react-aria-components")],
};
