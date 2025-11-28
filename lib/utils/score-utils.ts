/**
 * Score color utilities
 * Provides consistent score-based color calculations across the app
 */

/**
 * Get Tailwind CSS class for score color
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-200';
  if (score >= 75) return 'text-blue-200';
  if (score >= 60) return 'text-yellow-200';
  return 'text-orange-200';
}

/**
 * Get hex color code for score (for inline styles)
 * Uses same thresholds as getScoreColor for consistency
 */
export function getScoreColorHex(score: number): string {
  if (score >= 90) return '#00d492'; // emerald
  if (score >= 75) return '#00e5e5'; // cyan/blue
  if (score >= 60) return '#ff9030'; // orange
  return '#ff5f8f'; // pink
}

/**
 * Get background color class for score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500/20';
  if (score >= 75) return 'bg-blue-500/20';
  if (score >= 60) return 'bg-yellow-500/20';
  return 'bg-orange-500/20';
}

