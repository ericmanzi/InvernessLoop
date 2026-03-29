// ─── Brand color palette ──────────────────────────────────────────────────────
// Used both in NativeWind classes and inline StyleSheet styles

export const Colors = {
  // Primary background — deep night navy
  navy: '#0D1B2A',
  navyLight: '#162538',
  navyDark: '#080F16',

  // Warm accent — calm sand/parchment
  sand: '#E8D5B7',
  sandLight: '#F2E8D5',
  sandDark: '#D4BF9E',

  // Nature accent — muted sage green
  sage: '#7A9E7E',
  sageLight: '#9CB8A0',
  sageDark: '#5F7F63',

  // Soft accent — gentle blush
  blush: '#D4A5A5',
  blushLight: '#E2BEBE',
  blushDark: '#C08E8E',

  // Light surface
  offwhite: '#F5F0E8',
  offwhiteWarm: '#EDE8DE',

  // Semantic
  textPrimary: '#F5F0E8',
  textSecondary: '#B8AFA2',
  textMuted: '#6B6560',
  border: '#1E2E3F',
  borderLight: '#2A3F54',

  // Status — intentionally desaturated to avoid urgency
  unread: '#7A9E7E',    // sage dot instead of red badge
  quietMode: '#D4A5A5', // blush tint for DND state
  pending: '#D4BF9E',   // sand for pending states
  confirmed: '#7A9E7E', // sage for confirmed states

  // Transparent overlays
  overlayDark: 'rgba(13,27,42,0.85)',
  overlayLight: 'rgba(245,240,232,0.08)',

  // Gradient stops
  gradientNavy: ['#0D1B2A', '#162538'],
  gradientSand: ['#E8D5B7', '#D4BF9E'],
  gradientCard: ['rgba(13,27,42,0)', 'rgba(13,27,42,0.95)'],
} as const;

// ─── Breathing Room score → color mapping ────────────────────────────────────
// Returns a color representing the compatibility level

export function breathingRoomColor(score: number): string {
  if (score >= 80) return Colors.sage;        // great match
  if (score >= 60) return Colors.sageLight;   // good match
  if (score >= 40) return Colors.sand;        // moderate
  return Colors.blush;                        // lower compatibility
}

// ─── Attachment style → display color ────────────────────────────────────────

export function attachmentStyleColor(style: string): string {
  switch (style) {
    case 'secure-avoidant':   return Colors.sage;
    case 'lightly-avoidant':  return Colors.sand;
    case 'strongly-avoidant': return Colors.blush;
    default:                  return Colors.textSecondary;
  }
}
