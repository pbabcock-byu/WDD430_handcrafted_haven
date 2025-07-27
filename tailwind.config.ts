import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/app/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: '#2563EB',
        darkBlue: '#1E40AF',
        lightBlue: '#BFDBFE',
        grayLight: '#F3F4F6',
        grayMedium: '#9CA3AF',
        grayDark: '#374151',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;

