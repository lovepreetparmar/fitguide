/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#090909',
        card: '#161616',
        primary: '#6C63FF',
        secondary: '#00D9A5',
        error: '#FF5252',
        warning: '#FFC107',
        text: '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        border: '#2A2A2A',
        success: '#00D9A5',
        recovery: {
          green: '#00D9A5',
          yellow: '#FFC107',
          red: '#FF5252',
        },
      },
      borderRadius: {
        DEFAULT: '20px',
        card: '20px',
        button: '16px',
        sm: '12px',
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        medium: ['Inter-Medium'],
        semibold: ['Inter-SemiBold'],
        bold: ['Inter-Bold'],
      },
    },
  },
  plugins: [],
};
