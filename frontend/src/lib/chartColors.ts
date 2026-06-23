/**
 * Canonical chart colors. Recharts renders to SVG attributes where CSS custom
 * properties don't resolve, so these mirror the --c-* channels in
 * `styles/tokens.css`. Keep the two in sync — this is the only place hex values
 * for charts should live.
 */
export const CHART = {
  profit: '#2dd4a3', // --c-profit
  loss: '#ff6b6b', // --c-loss
  info: '#4a9dff', // --c-info
  ai: '#c084fc', // --c-ai
  warning: '#f6b73c', // --c-warning
  neutral: '#64748b', // slate-500, axis ticks / no-data
  grid: 'rgba(42,53,80,0.6)',
} as const;
