/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        brand: {
          DEFAULT: '#9d174d',
          dark: '#831843',
          light: '#fb7185'
        },
        'primary-berry': '#9d174d',
        'primary-dark': '#831843',
        'secondary-gold': '#f4c95d',
        'secondary-dark': '#caa240',
        midnight: '#0f172a',
        blush: '#ffe4ec'
      },
      boxShadow: {
        glow: '0px 10px 60px rgba(157, 23, 77, 0.25)'
      }
    }
  },
  plugins: []
};


