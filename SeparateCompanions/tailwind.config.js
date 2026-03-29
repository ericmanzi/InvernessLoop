/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Separate Companions brand palette
        navy: {
          DEFAULT: '#0D1B2A',
          light: '#162538',
          dark: '#080F16',
        },
        sand: {
          DEFAULT: '#E8D5B7',
          light: '#F2E8D5',
          dark: '#D4BF9E',
        },
        sage: {
          DEFAULT: '#7A9E7E',
          light: '#9CB8A0',
          dark: '#5F7F63',
        },
        blush: {
          DEFAULT: '#D4A5A5',
          light: '#E2BEBE',
          dark: '#C08E8E',
        },
        offwhite: {
          DEFAULT: '#F5F0E8',
          warm: '#EDE8DE',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      spacing: {
        18: '72px',
        22: '88px',
      },
    },
  },
  plugins: [],
};
