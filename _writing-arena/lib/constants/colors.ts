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
 * Tailwind CSS class helpers for common colors
 * Use these instead of hardcoded color values in className props
 */
export const COLOR_CLASSES = {
  // Phase colors
  phase1: {
    text: 'text-[#00e5e5]',
    bg: 'bg-[#00e5e5]',
    border: 'border-[#00e5e5]',
    bgOpacity: (opacity: number) => `bg-[rgba(0,229,229,${opacity})]`,
    borderOpacity: (opacity: number) => `border-[rgba(0,229,229,${opacity})]`,
  },
  phase2: {
    text: 'text-[#ff5f8f]',
    bg: 'bg-[#ff5f8f]',
    border: 'border-[#ff5f8f]',
    bgOpacity: (opacity: number) => `bg-[rgba(255,95,143,${opacity})]`,
    borderOpacity: (opacity: number) => `border-[rgba(255,95,143,${opacity})]`,
  },
  phase3: {
    text: 'text-[#00d492]',
    bg: 'bg-[#00d492]',
    border: 'border-[#00d492]',
    bgOpacity: (opacity: number) => `bg-[rgba(0,212,146,${opacity})]`,
    borderOpacity: (opacity: number) => `border-[rgba(0,212,146,${opacity})]`,
  },
  // Accent colors
  orange: {
    text: 'text-[#ff9030]',
    bg: 'bg-[#ff9030]',
    border: 'border-[#ff9030]',
    bgOpacity: (opacity: number) => `bg-[rgba(255,144,48,${opacity})]`,
    borderOpacity: (opacity: number) => `border-[rgba(255,144,48,${opacity})]`,
  },
  // Background colors
  background: {
    dark: 'bg-[#101012]',
    card: 'bg-[rgba(255,255,255,0.025)]',
    cardBorder: 'border-[rgba(255,255,255,0.05)]',
  },
  // Text colors
  text: {
    primary: 'text-[rgba(255,255,255,0.8)]',
    secondary: 'text-[rgba(255,255,255,0.4)]',
    tertiary: 'text-[rgba(255,255,255,0.22)]',
  },
} as const;

/**
 * Get Tailwind class for phase color by phase number
 */
export function getPhaseColorClass(phase: 1 | 2 | 3, type: 'text' | 'bg' | 'border' = 'text'): string {
  const phaseColors = {
    1: COLOR_CLASSES.phase1,
    2: COLOR_CLASSES.phase2,
    3: COLOR_CLASSES.phase3,
  };
  return phaseColors[phase][type];
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

