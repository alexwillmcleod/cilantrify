/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Atkinson Hyperlegible'],
      display: ['ClementePDao'],
    },
    colors: {
      'accent-green': '#77966D',
      'accent-blue': '#3F3D56',
      'accent-blue-clear': '#3F3D5620',
      'bright-red': '#FF6584',
      'accent-red': '#563D43',
      'accent-yellow': '#54563D',
      'accent-dark-green': '#3E563D',
      white: '#FFFFFF',
      'light-grey': '#444477',
    },
  },
  plugins: [require('daisyui')],
};
