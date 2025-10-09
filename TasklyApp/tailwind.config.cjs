/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // azul Taskly
          light: '#3b82f6',
          dark: '#1e40af',
        },
        neutral: {
          light: '#f9fafb',
          DEFAULT: '#f3f4f6',
          dark: '#111827',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
