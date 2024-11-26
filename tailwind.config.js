/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        fadeOut: 'fadeOut 0.5s ease-out forwards',
      },
      colors: {
        primary: {
          DEFAULT: '#e5f301',  // Color principal
          'alpha-1': '#e5f301FF', // Color con 100% de opacidad (sin transparencia)
        },
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
      },
    },
  },
  plugins: [],
};