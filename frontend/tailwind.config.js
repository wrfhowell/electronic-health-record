/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pf: {
          rail: '#1a1a1a',
          topbar: '#333333',
          band: '#29abe2',
          bandDark: '#1e9cd7',
          tab: '#1387c4',
          blue: '#0091ea',
          link: '#0076c0',
          orange: '#f5821f',
          orangeDark: '#e07000',
          bg: '#e9e9e9',
          border: '#d4d4d4',
          text: '#333333',
          muted: '#767676',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        xxs: '11px',
      },
    },
  },
  plugins: [],
}
