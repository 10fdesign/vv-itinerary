/** @type {import('tailwindcss').Config} */
module.exports = {
  blocklist: [
    'sticky',
  ],
  content: ["./assets/css/input.css","./_site/**/*.html", "./assets/js/*.js"],
  theme: {
    fontFamily: {
      body: ["georgiapro", "sans-serif"],
      display: ["franklin-gothic-atf", "sans-serif"]
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    },
    extend: {
    	aspectRatio: {
    		"3/2" : "3 / 2"
    	},
      colors: {
        "yellow": "#F5B324",
        "blue": "#35AFC8",
        "green": "#56A054",
        "grey": "#F2F2F2",
        "white": "#ffffff",
        "slate": "#20282A"
      }
    },
  },
  plugins: [],
};
