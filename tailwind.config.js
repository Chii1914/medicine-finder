import { hover } from 'framer-motion';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7B91FF', // Tono azul violáceo claro
          DEFAULT: '#4c7d8e', // Azul violáceo principal
          dark: '#3346CC', // Azul violáceo oscuro
        },
        secondary: {
          light: '#7EE7F3', // Turquesa claro
          DEFAULT: '#40D9EA', // Turquesa principal
          dark: '#20B9CA', // Turquesa oscuro
        },
        surface: {
          light: '#F0F7F8', // Fondo claro con tinte azulado
          DEFAULT: '#E5F0F2', // Fondo principal
          dark: '#D1E5E8', // Fondo más oscuro
        },

        hover: '#eff4f7', // Color de fondo al pasar el mouse
        accent: '#6C8CD5', // Azul acento para elementos destacados
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-slide-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-slide-down': 'fade-slide-down 0.3s ease-out'
      }
    },
  },
  plugins: [],
}