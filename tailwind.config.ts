import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/app/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-inter)',
        heading: 'var(--font-lusitana)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        blue: '#2563EB',
        darkBlue: '#1E40AF',
        lightBlue: '#BFDBFE',
        gray: {
          light: '#F3F4F6',
          medium: '#9CA3AF',
          dark: '#374151',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;

