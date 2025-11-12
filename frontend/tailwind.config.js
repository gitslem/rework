/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#3C1CFF', // Relaywork brand purple
          600: '#3318d9',
          700: '#2a13b3',
          800: '#210f8c',
          900: '#1a0c66',
        },
        accent: {
          purple: '#3C1CFF',
          white: '#FFFFFF',
          dark: '#0F0F1E',
          gray: {
            100: '#F5F5F7',
            200: '#E5E5E7',
            300: '#D1D1D6',
            400: '#A1A1AA',
            500: '#71717A',
            600: '#52525B',
            700: '#3F3F46',
            800: '#27272A',
            900: '#18181B',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        geometric: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #3C1CFF 0%, #7C3AED 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 100%)',
      },
    },
  },
  plugins: [],
}
