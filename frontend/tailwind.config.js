/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050812',
          secondary: '#080D18',
          elevated: '#10182A',
          card: '#141D33',
          input: '#0B111C',
        },
        // Derived from the canonical --c-* channels in tokens.css (single
        // source of truth). `<alpha-value>` keeps `/opacity` modifiers working.
        text: {
          primary: 'rgb(var(--c-text-1) / <alpha-value>)',
          secondary: 'rgb(var(--c-text-2) / <alpha-value>)',
          muted: 'rgb(var(--c-text-4) / <alpha-value>)',
        },
        success: 'rgb(var(--c-profit) / <alpha-value>)',
        analytics: 'rgb(var(--c-info) / <alpha-value>)',
        ai: 'rgb(var(--c-ai) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',
        danger: 'rgb(var(--c-loss-strong) / <alpha-value>)',
        // Brand / primary = indigo-iris. Deliberately NOT green: green is
        // reserved exclusively for profit so "primary action" never reads as
        // "money positive". Mirrors --tx-brand* in tokens.css.
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          50: '#f8fafc',
          100: '#1e2530',
          200: '#171d27',
          300: '#131921',
          400: '#0f141c',
          500: '#0b0f16',
          600: '#080c12',
          700: '#05080d',
          800: '#030508',
          900: '#010203',
        },
        surface: {
          DEFAULT: '#1a2035',
          light: '#1e2745',
          dark: '#141b2d',
          border: '#2a3550',
        },
        profit: 'rgb(var(--c-profit) / <alpha-value>)',
        loss: 'rgb(var(--c-loss) / <alpha-value>)',
        warn: 'rgb(var(--c-warning) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
      },
      borderRadius: {
        card: '22px',
        button: '14px',
        nav: '24px',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-dark': 'linear-gradient(135deg, #1a2035, #0b0f16)',
        'glow-profit':
          'radial-gradient(ellipse at center, rgba(45,212,163,0.15) 0%, transparent 70%)',
        'glow-loss': 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99,102,241,0.22)',
        glow: '0 0 20px rgba(99,102,241,0.32)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.42)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.3)',
        card: '0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-legacy': '0 4px 20px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.5)',
        glowSemantic: '0 16px 40px rgba(45,212,163,0.12)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '220ms',
        slow: '360ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
