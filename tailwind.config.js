
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        coffee: {
          dark: '#2C1810',
          medium: '#5C3D2E',
          light: '#8B6F47',
        },
        cream: {
          bg: '#FDF8F4',
          card: '#FFFFFF',
        },
        accent: {
          primary: '#C4841D',
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(44, 24, 16, 0.05), 0 2px 4px -1px rgba(44, 24, 16, 0.03)',
      }
    },
  },
  plugins: [],
}
