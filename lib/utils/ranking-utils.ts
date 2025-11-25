export interface RankablePlayer {
  isYou?: boolean;
  userId?: string;
  compositeScore?: number;
  score?: number;
  [key: string]: any;
}

export function rankPlayers<T extends RankablePlayer>(
  players: T[],
  scoreKey: 'compositeScore' | 'score' = 'compositeScore'
): Array<T & { position: number }> {
  return players
    .sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
    .map((player, index) => ({ ...player, position: index + 1 }));
}

export function getPlayerRank<T extends RankablePlayer>(
  players: Array<T & { position: number }>,
  userId?: string
): number {
  const player = players.find(p => p.isYou || p.userId === userId);
  return player?.position || players.length;
}

