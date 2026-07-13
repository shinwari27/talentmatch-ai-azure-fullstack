/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563EB', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a'
        },
        teal: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14B8A6', 600: '#0d9488', 700: '#0f766e'
        },
        surface: '#F8FAFC',
        ink: { 900: '#0F172A', 700: '#334155', 500: '#64748B', 300: '#CBD5E1' }
      },
      fontFamily: {
        display: ['Poppins', 'Segoe UI', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'sans-serif']
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
      boxShadow: {
        soft: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        card: '0 4px 16px rgba(15,23,42,0.06)',
        hover: '0 8px 24px rgba(15,23,42,0.10)'
      }
    }
  },
  plugins: []
}
