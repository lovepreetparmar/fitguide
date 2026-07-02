/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        card: '#111111',
        'secondary-background': '#181818',
        primary: '#0076FC',
        'primary-pressed': '#005ED4',
        'primary-light': '#4AA3FF',
        secondary: '#4AA3FF',
        error: '#FF5A5F',
        warning: '#FFB020',
        text: '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        border: 'rgba(255,255,255,0.05)',
        success: '#00D084',
        glass: 'rgba(255,255,255,0.04)',
        'glass-strong': 'rgba(255,255,255,0.08)',
        recovery: {
          green: '#00D084',
          yellow: '#FFB020',
          red: '#FF5A5F',
        },
      },
      borderRadius: {
        DEFAULT: '22px',
        card: '28px',
        button: '22px',
        sm: '16px',
      },
    },
  },
  plugins: [],
};
