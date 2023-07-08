/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  theme: {
    extend: {
      fontFamily: {
        display: ['ClementePDao', 'sans-serif'],
        sans: ['Atkinson Hyperlegible', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: [
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#77966D',
        },
      },
    ],
  },
};
