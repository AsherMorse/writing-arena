/**
 * Color constants for the Writing Arena application
 * Centralized color definitions for consistent theming
 */

export const COLORS = {
  // Primary brand colors
  primary: {
    orange: '#ff9030',
    cyan: '#00e5e5',
    pink: '#ff5f8f',
    green: '#00d492',
  },
  
  // Background colors
  background: {
    dark: '#101012',
    card: 'rgba(255,255,255,0.025)',
    cardBorder: 'rgba(255,255,255,0.05)',
  },
  
  // Text colors
  text: {
    primary: 'rgba(255,255,255,0.8)',
    secondary: 'rgba(255,255,255,0.4)',
    tertiary: 'rgba(255,255,255,0.22)',
    dark: '#1b1f24',
  },
} as const;

/**
 * Get color with opacity
 */
export function getColorWithOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Phase-specific colors
 */
export const PHASE_COLORS = {
  1: COLORS.primary.cyan,
  2: COLORS.primary.pink,
  3: COLORS.primary.green,
} as const;

/**
 * Get phase color by phase number
 */
export function getPhaseColor(phase: 1 | 2 | 3): string {
  return PHASE_COLORS[phase];
}

/**
 * Get phase color by phase name (for use in ResultsContent and similar)
 */
export function getPhaseColorByName(phaseName: 'writing' | 'feedback' | 'revision'): string {
  const phaseMap = {
    writing: PHASE_COLORS[1],
    feedback: PHASE_COLORS[2],
    revision: PHASE_COLORS[3],
  };
  return phaseMap[phaseName];
}

/**
 * Common color variants with opacity
 */
export const COLOR_VARIANTS = {
  orange: {
    base: COLORS.primary.orange,
    light: getColorWithOpacity(COLORS.primary.orange, 0.6),
    bg: getColorWithOpacity(COLORS.primary.orange, 0.12),
    border: getColorWithOpacity(COLORS.primary.orange, 0.3),
  },
  cyan: {
    base: COLORS.primary.cyan,
    light: getColorWithOpacity(COLORS.primary.cyan, 0.6),
    bg: getColorWithOpacity(COLORS.primary.cyan, 0.08),
    border: getColorWithOpacity(COLORS.primary.cyan, 0.2),
  },
  pink: {
    base: COLORS.primary.pink,
    light: getColorWithOpacity(COLORS.primary.pink, 0.6),
    bg: getColorWithOpacity(COLORS.primary.pink, 0.15),
    border: getColorWithOpacity(COLORS.primary.pink, 0.3),
  },
  green: {
    base: COLORS.primary.green,
    light: getColorWithOpacity(COLORS.primary.green, 0.6),
    bg: getColorWithOpacity(COLORS.primary.green, 0.1),
    border: getColorWithOpacity(COLORS.primary.green, 0.3),
  },
} as const;

