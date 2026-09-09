/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        flickPrimary: '#6366F1',
        flickSecondary: '#4F46E5',
        flickAccent: '#EC4899',
        cinemaDark: '#0B0F19',
        cinemaSurface: '#131B2E',
        cinemaCard: '#1E293B',
        cinemaBorder: '#334155',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px -5px rgba(99, 102, 241, 0.5)',
        pinkGlow: '0 0 25px -5px rgba(236, 72, 153, 0.4)',
      },
    },
  },
  plugins: [],
};
