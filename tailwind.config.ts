import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C0392B',
        'primary-dark': '#96281B',
        'primary-light': '#fdf1f0',
        'primary-mid': '#f2c4c0',
        accent: '#FFD600',
        'text-main': '#1a1a1a',
        muted: '#777',
        border: '#ebebeb',
        bg: '#f7f7f7',
        success: '#2d9e4a',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
