/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        accent: {
          primary: '#6c63ff',
          secondary: '#a78bfa',
        },
        surface: {
          DEFAULT: '#0a0a0f',
          card: '#1a1a2e',
          secondary: '#12121a',
        }
      },
    },
  },
  plugins: [],
}
