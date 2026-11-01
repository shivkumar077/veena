import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '320px',
      sm: '375px',
      md: '430px',
      lg: '768px',
      xl: '1024px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        midnight: '#111722',
        gold: '#D6BD91',
        ivory: '#EDE8DE',
        teal: '#344C50',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        editorial: ['Cormorant Garamond', 'serif'],
      },
      maxWidth: {
        reading: '68rem',
      },
    },
  },
} satisfies Config;
