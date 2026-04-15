/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B4F72',
          light:   '#2E6A94',
          dark:    '#153D58',
        },
        surface: '#F4F6F9',
      },
    },
  },
  plugins: [],
}
