import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Brand tokens filled in Task 4
    },
  },
  plugins: [],
} satisfies Config;
