export const colors = {
  bg: '#F4F1EA',
  card: '#FFFFFF',
  border: '#E6E2D8',
  borderStrong: '#DAD5C8',
  text: '#0F172A',
  muted: '#64748B',
  mutedLight: '#94A3B8',
  primary: '#10B981',
  primaryDark: '#047857',
  primaryTint: '#D7F1E5',
  primaryPress: '#0EA472',
  danger: '#DC2626',
  dangerTint: '#FEF2F2',
  chip: '#F1EEE6',
  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export type FontWeightKey = keyof typeof fonts;

export const radius = { sm: 10, md: 12, lg: 16, xl: 20, pill: 999 } as const;
export const SCREEN_PADDING = 24;

/** Removes the browser focus ring on web inputs (no-op natively). */
export const noOutline = { outlineStyle: 'none', outlineWidth: 0 } as any;
