/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: {
          100: '#1b222b',
          140: '#16202B',
          180: '#262e36',
          200: '#27303b',
          250: '#37414d',
          300: '#424b54',
        },
        fore: '#c7d1dc',
        primary: '#4c90f0',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
