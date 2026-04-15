/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts,innerHTML}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000',
        secondary: '#FFFFFF',
        tertiary: '#F5F5F5',
        'yt-dark': '#030303',
        'yt-gray': '#666666',
        'yt-light-gray': '#E8E8E8',
        'yt-border': '#E0E0E0',
      },
      animation: {
        'pulse-play': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
