const preset = require("@kalaiworks/config/tailwind-preset.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@kalaiworks/ui/dist/**/*.{js,cjs}",
  ],
};
