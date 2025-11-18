/**
 * Player ranking and sorting utilities
 */

export interface RankablePlayer {
  isYou?: boolean;
  userId?: string;
  compositeScore?: number;
  score?: number;
  [key: string]: any;
}

/**
 * Rank players by score and assign positions
 */
export function rankPlayers<T extends RankablePlayer>(
  players: T[],
  scoreKey: 'compositeScore' | 'score' = 'compositeScore'
): Array<T & { position: number }> {
  return players
    .sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
    .map((player, index) => ({ ...player, position: index + 1 }));
}

/**
 * Get player's rank from ranked players array
 */
export function getPlayerRank<T extends RankablePlayer>(
  players: Array<T & { position: number }>,
  userId?: string
): number {
  const player = players.find(p => p.isYou || p.userId === userId);
  return player?.position || players.length;
}

/**
 * Find player in ranked array
 */
export function findPlayerInRankings<T extends RankablePlayer>(
  players: Array<T & { position: number }>,
  userId?: string
): (T & { position: number }) | undefined {
  return players.find(p => p.isYou || p.userId === userId);
}

