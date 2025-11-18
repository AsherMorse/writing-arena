/**
 * Score color and styling utilities
 */

/**
 * Get text color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-200';
  if (score >= 75) return 'text-blue-200';
  if (score >= 60) return 'text-yellow-200';
  return 'text-orange-200';
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500/20';
  if (score >= 75) return 'bg-blue-500/20';
  if (score >= 60) return 'bg-yellow-500/20';
  return 'bg-orange-500/20';
}

/**
 * Get border color class based on score
 */
export function getScoreBorderColor(score: number): string {
  if (score >= 90) return 'border-emerald-400/50';
  if (score >= 75) return 'border-blue-400/50';
  if (score >= 60) return 'border-yellow-400/50';
  return 'border-orange-400/50';
}

