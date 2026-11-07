/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0B4A22',
          700: '#116B31',
          100: '#DCF2E3',
        },
        gold: {
          500: '#F5B800',
          100: '#FFF3CC',
        },
        danger: {
          600: '#C8161D',
          100: '#FDE3E3',
        },
        ok: {
          500: '#2E9E57',
          100: '#DDF5E5',
        },
        info: {
          100: '#E3ECFB',
        },
        surface: '#FFFFFF',
        canvas: '#F3F5FA',
        ink: {
          900: '#111827',
          600: '#4B5563',
        },
        line: '#E5E7EB',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
