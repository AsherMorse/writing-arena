/**
 * Rank and medal utilities
 */

/**
 * Get medal emoji for rank position
 */
export function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

/**
 * Get color class for rank position
 */
export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-orange-400';
  return 'text-white/60';
}

/**
 * Get background color class for rank position
 */
export function getRankBgColor(rank: number): string {
  if (rank === 1) return 'bg-yellow-500/20';
  if (rank === 2) return 'bg-gray-500/20';
  if (rank === 3) return 'bg-orange-500/20';
  return 'bg-white/5';
}

