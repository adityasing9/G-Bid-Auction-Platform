/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        accent: {
          yellow: "#E6FF00",
          green: "#7CFFB2",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-yellow': '0 0 15px rgba(230, 255, 0, 0.4)',
        'neon-green': '0 0 15px rgba(124, 255, 178, 0.4)',
      }
    },
  },
  plugins: [],
}
