/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#10B981', // Emerald 500
        'primary-focus': '#059669', // Emerald 600
        'secondary': '#F59E0B', // Amber 500
        'secondary-focus': '#D97706', // Amber 600
        'base-100': '#FFFFFF', // White
        'base-200': '#F3F4F6', // Gray 100
        'base-300': '#E5E7EB', // Gray 200
        'info': '#3B82F6', // Blue 500
        'success': '#22C55E', // Green 500
        'warning': '#F97316', // Orange 500
        'error': '#EF4444', // Red 500
      },
    },
  },
  plugins: [],
};
