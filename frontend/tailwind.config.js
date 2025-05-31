module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        lmsblue: {
          DEFAULT: '#1a237e',
          dark: '#000051',
          light: '#534bae',
        },
      },
    },
  },
  plugins: [],
}; 