/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: {
          50: "#f7f7f7",
          100: "#eeeeee",
          200: "#d9d9d9",
          300: "#bfbfbf",
          400: "#8c8c8c",
          500: "#595959",
          600: "#404040",
          700: "#262626",
          800: "#171717",
          900: "#0a0a0a",
        },
      },
    },
  },
  plugins: [],
};
