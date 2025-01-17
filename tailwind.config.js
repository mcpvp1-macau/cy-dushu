/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: {
          1: 'var(--ja-dark-gray-1)',
          2: 'var(--ja-dark-gray-2)',
          3: 'var(--ja-dark-gray-3)',
          4: 'var(--ja-dark-gray-4)',
          5: 'var(--ja-dark-gray-5)',
        },
        fore: 'var(--ja-light-gray-1)',
        primary: 'var(--primary-color)',
        ['primary-color']: {
          1: 'var(--primary-color-1)',
          2: 'var(--primary-color-2)',
          3: 'var(--primary-color-3)',
          4: 'var(--primary-color-4)',
          5: 'var(--primary-color-5)',
        },
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
