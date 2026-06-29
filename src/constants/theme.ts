export const Colors = {
  background: '#090909',
  card: '#161616',
  primary: '#6C63FF',
  secondary: '#00D9A5',
  error: '#FF5252',
  warning: '#FFC107',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  border: '#2A2A2A',
  success: '#00D9A5',
  recovery: {
    green: '#00D9A5',
    yellow: '#FFC107',
    red: '#FF5252',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  card: 20,
  button: 16,
  sm: 12,
  full: 9999,
} as const;

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
} as const;
