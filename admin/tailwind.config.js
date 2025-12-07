module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layout/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          25:  '#fef2f3',
          50:  '#fde8ea',
          100: '#f9c4c9',
          200: '#f49da5',
          300: '#ee7681',
          400: '#d9525e',
          500: '#A82F39',
          600: '#962a33',
          700: '#84242d',
          800: '#721f27',
          900: '#601a21',
          950: '#3d1014',
        },
      },
    },
  },
  plugins: [],
}; 