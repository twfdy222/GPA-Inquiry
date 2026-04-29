/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8efff',
          500: '#2c8ddf',
          600: '#1f72bd',
          700: '#195c9a',
        },
        ink: '#172033',
      },
      boxShadow: {
        soft: '0 12px 36px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
