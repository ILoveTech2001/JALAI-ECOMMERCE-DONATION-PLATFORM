/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jalai-green': '#10B981',
        'jalai-dark': '#1F2937',
      }
    },
  },
  plugins: [],
}
