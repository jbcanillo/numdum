/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Custom oklch-based palette (Vercel/Linear inspired)
        primary: {
          50: 'oklch(0.97 0.02 250)',
          100: 'oklch(0.94 0.04 250)',
          200: 'oklch(0.88 0.08 250)',
          300: 'oklch(0.78 0.12 250)',
          400: 'oklch(0.68 0.16 250)',
          500: 'oklch(0.58 0.19 250)',
          600: 'oklch(0.52 0.18 250)',
          700: 'oklch(0.42 0.14 250)',
          800: 'oklch(0.32 0.10 250)',
          900: 'oklch(0.25 0.06 250)',
        },
        accent: {
          50: 'oklch(0.98 0.02 300)',
          100: 'oklch(0.95 0.05 300)',
          200: 'oklch(0.90 0.08 300)',
          300: 'oklch(0.80 0.12 300)',
          400: 'oklch(0.70 0.16 300)',
          500: 'oklch(0.60 0.19 300)',
          600: 'oklch(0.53 0.17 300)',
          700: 'oklch(0.43 0.13 300)',
          800: 'oklch(0.33 0.09 300)',
          900: 'oklch(0.23 0.05 300)',
        },
        success: {
          500: 'oklch(0.72 0.19 145)',
          600: 'oklch(0.62 0.16 145)',
        },
        warning: {
          500: 'oklch(0.78 0.16 85)',
          600: 'oklch(0.68 0.14 85)',
        },
        error: {
          500: 'oklch(0.65 0.24 25)',
          600: 'oklch(0.55 0.20 25)',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 15px rgba(139, 92, 246, 0.3)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        'modern-mint': {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          default: true,
          'primary': '#6366f1', // Indigo primary
          'primary-content': '#ffffff',
          'secondary': '#8b5cf6', // Violet
          'secondary-content': '#ffffff',
          'accent': '#06b6d4', // Cyan
          'accent-content': '#ffffff',
          'neutral': '#0f172a', // Slate 900
          'neutral-content': '#f1f5f9',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#f1f5f9',
          'base-content': '#0f172a',
          'info': '#3b82f6',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
          'radius': '0.75rem',
        },
        'modern-mint-dark': {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          'primary': '#818cf8', // lighter indigo
          'primary-content': '#1e1b4b',
          'secondary': '#a78bfa', // lighter violet
          'secondary-content': '#1e1b4b',
          'accent': '#22d3ee', // cyan
          'accent-content': '#164e63',
          'neutral': '#e2e8f0',
          'neutral-content': '#0f172a',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#f1f5f9',
          'info': '#60a5fa',
          'success': '#34d399',
          'warning': '#fbbf24',
          'error': '#f87171',
          'radius': '0.75rem',
        },
      },
    ],
    darkTheme: 'modern-mint-dark',
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    log: false,
  },
}
