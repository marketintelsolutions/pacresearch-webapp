/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        max: '1200px'
      },
      colors: {
        primaryBlue: '#15284A',
        secondaryBlue: '#15BFFD'
      },
      screens: {
        zr: "0px",
        mb: "430px",
        sm: "640px",
        md: "768px",
        lg: "991px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
}

