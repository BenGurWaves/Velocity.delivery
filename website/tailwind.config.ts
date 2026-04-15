import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atelier: {
          black: '#0A0A0A',
          dark: '#141414',
          cream: '#C9A87C',
          'cream-muted': '#8B7355',
          orange: '#B8956C',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Neue Haas Grotesk', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'atelier': '0.25em',
        'tight-atelier': '0.1em',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'fade-in-out': 'fadeInOut 2s ease-in-out infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        fadeInOut: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
      },
      transitionTimingFunction: {
        'atelier': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
}

export default config
