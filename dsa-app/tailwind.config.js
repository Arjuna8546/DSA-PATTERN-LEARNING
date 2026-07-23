/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0d10',
          900: '#12161b',
          800: '#1a2028',
          700: '#252c36',
          600: '#333c48',
          500: '#4a5563',
        },
        paper: {
          50: '#f7f8fa',
          100: '#eef0f3',
          200: '#e2e6ea',
        },
        signal: {
          amber: '#e8a13d',
          teal: '#3ba79c',
          coral: '#d9695b',
          violet: '#8b7ec8',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
