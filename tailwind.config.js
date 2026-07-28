/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Editorial palette
        linen: '#F0EDE8',
        'linen-mid': '#EAEAE6',
        midnight: '#1A1814',
        ink: '#111009',
        'ink-muted': '#6B6860',
        gold: '#C9A96E',
        'warm-white': '#F7F5F2',
        // Keep legacy tokens for modal/dashboard components
        background: 'var(--background, #F0EDE8)',
        foreground: 'var(--foreground, #111009)',
        border: 'var(--border, rgba(17,16,9,0.12))',
        stellar: {
          violet: '#A855F7',
          cyan: '#00F0FF',
          obsidian: '#07070E',
          surface: '#0D0D1F',
          card: 'rgba(19, 19, 43, 0.65)',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
      },
      letterSpacing: {
        tightest: '-0.05em',
        editorial: '-0.04em',
      },
      lineHeight: {
        display: '0.88',
        editorial: '0.92',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
