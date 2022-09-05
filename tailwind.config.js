/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  important: true,
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#004f49',

          secondary: '#e4f1de',

          accent: '#d9e5ec',

          neutral: '#ffffff',

          'base-100': '#FFFFFF',

          info: '#2277E5',

          success: '#31A171',

          warning: '#FBBD23',

          error: '#E54D2B'
        }
      }
    ]
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')]
};
