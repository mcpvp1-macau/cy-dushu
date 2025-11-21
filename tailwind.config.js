import container_queries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: {
          1: 'rgba(var(--ground-color-1), <alpha-value>)',
          2: 'rgba(var(--ground-color-2), <alpha-value>)',
          3: 'rgba(var(--ground-color-3), <alpha-value>)',
          4: 'rgba(var(--ground-color-4), <alpha-value>)',
          5: 'rgba(var(--ground-color-5), <alpha-value>)',
          6: 'rgba(var(--ground-color-6), <alpha-value>)',
        },
        fore: 'rgba(var(--fore-color), <alpha-value>)',
        primary: 'rgba(var(--primary-color), <alpha-value>)',
        ['primary-color']: {
          1: 'var(--primary-color-1)',
          2: 'var(--primary-color-2)',
          3: 'var(--primary-color-3)',
          4: 'var(--primary-color-4)',
          5: 'var(--primary-color-5)',
        },
        hightlight: 'rgba(var(--highlight-color), <alpha-value>)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line
    require('tailwindcss-animate'),
    container_queries,
  ],
}
