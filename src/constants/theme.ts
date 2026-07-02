export const Colors = {
  background: '#000000',
  secondaryBackground: '#181818',
  card: '#111111',
  primary: '#0076FC',
  primaryPressed: '#005ED4',
  primaryLight: '#4AA3FF',
  border: 'rgba(255,255,255,0.05)',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  success: '#00D084',
  warning: '#FFB020',
  danger: '#FF5A5F',
  blueGlow: 'rgba(0,118,252,0.25)',
  glass: 'rgba(255,255,255,0.04)',
  glassStrong: 'rgba(255,255,255,0.08)',
  recovery: {
    green: '#00D084',
    yellow: '#FFB020',
    red: '#FF5A5F',
  },
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  screen: 24,
  hero: 32,
} as const;

export const BorderRadius = {
  sm: 16,
  md: 22,
  card: 28,
  button: 22,
  pill: 9999,
  full: 9999,
} as const;

export const Typography = {
  largeTitle: { fontSize: 40, fontWeight: '700' as const, lineHeight: 46, letterSpacing: -1 },
  title: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.7 },
  headline: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.4 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  blue: {
    shadowColor: '#0076FC',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;
