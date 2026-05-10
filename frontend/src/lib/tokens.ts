/** Design tokens — aligned with `planning/Ui.md` (single source for theme constants). */
export const tokens = {
  colors: {
    bg: {
      primary: '#050812',
      secondary: '#080D18',
      elevated: '#10182A',
      card: '#141D33',
      cardSoft: '#18223A',
      input: '#0B111C',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#B6C2D9',
      muted: '#7D8AA5',
      disabled: '#4E5A70',
    },
    semantic: {
      success: '#2DD4A3',
      analytics: '#4A9DFF',
      ai: '#8B5CF6',
      warning: '#F6B73C',
      danger: '#EF5F5F',
    },
    border: {
      subtle: 'rgba(126, 146, 185, 0.16)',
      strong: 'rgba(126, 146, 185, 0.28)',
    },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
  },
  motion: {
    fast: '120ms',
    base: '220ms',
    slow: '360ms',
  },
} as const;
