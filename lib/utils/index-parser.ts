/**
 * Index parsing utilities for batch ranking responses
 * Handles off-by-one errors, bounds checking, and fallback logic
 */

interface BaseSubmission {
  playerId: string;
  playerName: string;
  [key: string]: any;
}

interface RankingWithIndex {
  [key: string]: any;
  playerName?: string;
}

/**
 * Fix index and get submission, with fallback to name matching
 * 
 * @param ranking - Ranking object from AI response
 * @param submissions - Array of submissions to match against
 * @param indexKey - Key to extract index from ranking (e.g., 'evaluatorIndex', 'writerIndex')
 * @param endpointName - Name of endpoint for logging (e.g., 'BATCH RANK FEEDBACK')
 * @returns The matched submission or null if not found
 */
export function fixIndexAndGetSubmission<T extends BaseSubmission>(
  ranking: RankingWithIndex,
  submissions: T[],
  indexKey: string,
  endpointName: string
): T | null {
  let index = ranking[indexKey] !== undefined ? ranking[indexKey] : -1;

  // Fix off-by-one errors (AI sometimes uses 1-based indexing)
  if (index === submissions.length) {
    console.warn(`⚠️ ${endpointName} - AI returned index ${index} for length ${submissions.length}, adjusting to ${index - 1}`);
    index = index - 1;
  }

  // Bounds check
  if (index < 0 || index >= submissions.length) {
    console.error(`❌ ${endpointName} - Index out of bounds: ${index} for length ${submissions.length}`);
    
    // Try to find by player name as fallback
    if (ranking.playerName) {
      const fallback = submissions.find(s => s.playerName === ranking.playerName);
      if (fallback) {
        console.log(`✅ ${endpointName} - Found submission by name fallback: ${ranking.playerName}`);
        return fallback;
      }
    }
    
    return null;
  }

  return submissions[index];
}

/**
 * Map rankings to submissions with index fixing and fallback
 * 
 * @param rankings - Array of rankings from AI response
 * @param submissions - Array of submissions to match against
 * @param indexKey - Key to extract index from ranking
 * @param endpointName - Name of endpoint for logging
 * @param mapper - Function to map ranking + submission to result object
 * @returns Array of mapped results (null entries filtered out)
 */
export function mapRankingsWithIndexFix<T extends BaseSubmission, TResult>(
  rankings: RankingWithIndex[],
  submissions: T[],
  indexKey: string,
  endpointName: string,
  mapper: (ranking: RankingWithIndex, submission: T) => TResult | null
): TResult[] {
  return rankings
    .map((ranking) => {
      const submission = fixIndexAndGetSubmission(ranking, submissions, indexKey, endpointName);
      
      if (!submission) {
        return null;
      }
      
      return mapper(ranking, submission);
    })
    .filter((result): result is TResult => result !== null);
}

