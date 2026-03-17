/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f59e0b',
        secondary: '#ec4899',
        accent: '#8b5cf6',
      },
    },
  },
  plugins: [],
}
