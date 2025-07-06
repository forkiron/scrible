/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue,svelte}"],
  theme: {
    extend: {
      fontFamily: {
        mynerve: ["Mynerve", "cursive"],
      },
    },
  },
  plugins: [],
};
