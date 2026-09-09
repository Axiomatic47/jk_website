import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1a17',
        paper: '#fbfaf7',
        rule: '#d9d4cb',
        muted: '#6b665e',
        accent: '#8a3b1e',
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Charter', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      maxWidth: { page: '46rem' },
    },
  },
  plugins: [],
} satisfies Config;
