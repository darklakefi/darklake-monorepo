const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        'payne-gray': '#3f3f46',
        'sonic-silver': '#71717a',
        'light-gray': '#a1a1aa',
        black: '#000000',
        white: '#ffffff',
        base: '#f5f5f5',
        slate: '#2a2e37',
        light: '#e0e7ff',
        'warning-content': '#000000',
        blue: '#1e40af',
        gray: '#9ca3af',
        primary: '#2563eb',
        destructive: '#dc2626',
        background: '#f9fafb',
        foreground: '#111827',
        'neutral-content': '#737373',
        'accent-foreground': '#2563eb',
        secondary: '#7c3aed',
        accent: '#3b82f6',
        transparent: 'transparent',
        popover: '#f3f4f6',
        'popover-foreground': '#1f2937',
        'muted-foreground': '#6b7280',
        border: '#d1d5db',
        'primary-content': '#000000',
        green: '#10b981',
        red: '#ef4444',
        'primary-foreground': '#ffffff',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark'],
  },
};
