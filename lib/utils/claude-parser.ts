/**
 * Utilities for parsing Claude API responses
 */

import { logger } from '@/lib/utils/logger';

const LOG_CONTEXT = 'CLAUDE PARSER';

export function parseClaudeJSON<T>(claudeResponse: string): T | null {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error(LOG_CONTEXT, 'No JSON found in Claude response');
      logger.debug(LOG_CONTEXT, 'Raw Claude response', { responseLength: claudeResponse.length });
      return null;
    }
    
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    logger.error(LOG_CONTEXT, 'Error parsing Claude JSON', error);
    logger.debug(LOG_CONTEXT, 'Parse failure details', {
      responseLength: claudeResponse.length,
      extractedLength: claudeResponse.match(/\{[\s\S]*\}/)?.[0]?.length || 0,
    });
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
    } else if (ranking.rank && typeof ranking.rank === 'number' && ranking.rank <= submissions.length) {
      // Fallback: If no ID match, assume rank corresponds to list order if sorted? 
      // No, rank is quality. We should rely on array index if playerId is missing.
      // writerIndex is already set to idx (array order) by default.
    }

    // Bounds check
    if (writerIndex < 0 || writerIndex >= submissions.length) {
        logger.warn(LOG_CONTEXT, `Index ${writerIndex} out of bounds for mappings, clamping`);
        writerIndex = Math.max(0, Math.min(writerIndex, submissions.length - 1));
    }
    
    const actualPlayer = submissions[writerIndex];
    if (!actualPlayer) {
        logger.error(LOG_CONTEXT, `Could not map ranking to player at index ${writerIndex}`);
        // Return a placeholder or skip? The mapper signature expects an object.
        // We'll return mapper with a dummy object to avoid crash, but this is bad.
        return mapper(ranking, idx, { playerId: 'unknown', playerName: 'Unknown' } as any);
    }

    return mapper(ranking, idx, actualPlayer);
  });
}

