/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'emerald-light': '#10B981',
        'emerald': '#059669',
        'emerald-dark': '#047857',
        'ruby': '#DC2626',
        'ruby-dark': '#B91C1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
