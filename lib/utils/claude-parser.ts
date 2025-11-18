/**
 * Utilities for parsing Claude API responses
 */

export function parseClaudeJSON<T>(claudeResponse: string): T | null {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Claude response');
      return null;
    }
    
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error('❌ Error parsing Claude JSON:', error);
    return null;
  }
}

export function mapRankingsToPlayers<T extends { playerId?: string }>(
  rankings: any[],
  submissions: Array<{ playerId: string; [key: string]: any }>,
  mapper: (ranking: any, index: number, actualPlayer: typeof submissions[0]) => T
): T[] {
  return rankings.map((ranking, idx) => {
    let writerIndex = idx;
    
    // Extract index from playerId if it's in format "writer_index_X"
    if (ranking.playerId && typeof ranking.playerId === 'string') {
      const match = ranking.playerId.match(/writer_index_(\d+)/);
      if (match) {
        writerIndex = parseInt(match[1]);
      }
    }
    
    const actualPlayer = submissions[writerIndex];
    return mapper(ranking, idx, actualPlayer);
  });
}

