import { getMatchRankings } from './firestore-match-state';
import { calculateCompositeScore } from './score-calculator';
import { roundScore } from './math-utils';

/** Default rank strings for fallback */
const DEFAULT_RANKS = ['Silver II', 'Silver III', 'Gold I', 'Silver IV'];

/**
 * @description Convert a numeric skill level to a rank string.
 * Handles cases where rank is stored as a number (1-7) instead of a string.
 */
function normalizeRank(rank: unknown, fallbackIndex: number): string {
  // If it's already a valid rank string, return it
  if (typeof rank === 'string' && rank.includes(' ')) {
    return rank;
  }
  
  // If it's a number, convert to rank string
  if (typeof rank === 'number') {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
    const divisions = ['IV', 'III', 'II', 'I'];
    
    // Map numeric ranks to tier/division (1 = Bronze IV, 5 = Silver IV, etc.)
    const tierIndex = Math.min(Math.floor((rank - 1) / 4), tiers.length - 1);
    const divisionIndex = (rank - 1) % 4;
    
    return `${tiers[Math.max(0, tierIndex)]} ${divisions[Math.max(0, Math.min(3, divisionIndex))]}`;
  }
  
  // Fallback to default ranks
  return DEFAULT_RANKS[fallbackIndex % DEFAULT_RANKS.length];
}

/**
 * Fetch all phase rankings for a match
 * 
 * @param matchId - Match ID to fetch rankings for
 * @returns Object with phase rankings arrays
 */
export async function fetchAllPhaseRankings(matchId: string): Promise<{
  phase1: any[];
  phase2: any[];
  phase3: any[];
}> {
  try {
    const [phase1Rankings, phase2Rankings, phase3Rankings] = await Promise.all([
      getMatchRankings(matchId, 1),
      getMatchRankings(matchId, 2),
      getMatchRankings(matchId, 3),
    ]);
    
    return {
      phase1: phase1Rankings || [],
      phase2: phase2Rankings || [],
      phase3: phase3Rankings || [],
    };
  } catch (error) {
    // Use console.error for now - logger can be added later if needed
    console.error('❌ RANKINGS FETCHER - Failed to fetch phase rankings:', error);
    return {
      phase1: [],
      phase2: [],
      phase3: [],
    };
  }
}

/**
 * Merge AI player data across phases
 * 
 * @param phase1Rankings - Phase 1 rankings
 * @param phase2Rankings - Phase 2 rankings
 * @param phase3Rankings - Phase 3 rankings
 * @returns Array of merged AI player data
 */
export function mergeAIPlayerDataAcrossPhases(
  phase1Rankings: any[],
  phase2Rankings: any[],
  phase3Rankings: any[]
): Array<{
  name: string;
  avatar: string;
  rank: string;
  userId: string;
  phase1: number | null;
  phase2: number | null;
  phase3: number | null;
  wordCount: number | null;
}> {
  const aiPlayerData = phase1Rankings.filter((r: any) => r.isAI);
  
  return aiPlayerData.map((p1: any, idx: number) => {
    const p2 = phase2Rankings.find((r: any) => r.playerId === p1.playerId);
    const p3 = phase3Rankings.find((r: any) => r.playerId === p1.playerId);
    
    // Only use scores from LLM evaluation - never random fallbacks
    // If score is missing, use null to indicate data not available
    const phase2Score = p2?.score ?? null;
    const phase3Score = p3?.score ?? null;
    
    // Get wordCount from phase1 ranking if available, otherwise null
    const wordCount = p1.wordCount ?? null;
    
    return {
      name: p1.playerName,
      avatar: ['🎯', '📖', '✨', '🏅'][idx % 4],
      rank: normalizeRank(p1.rank, idx),
      userId: p1.playerId,
      phase1: p1.score, // Always from LLM
      phase2: phase2Score, // From LLM or null if missing
      phase3: phase3Score, // From LLM or null if missing
      wordCount: wordCount, // From LLM data or null
    };
  });
}

/**
 * Filter AI players to include those with at least phase 1 scores
 * Missing phase scores default to 0
 * 
 * @param aiPlayers - Array of AI player data
 * @returns Array of valid AI players with defaults for missing scores
 */
export function filterValidAIPlayers(
  aiPlayers: Array<{
    phase1: number | null;
    phase2: number | null;
    phase3: number | null;
    [key: string]: any;
  }>
): Array<{
  phase1: number;
  phase2: number;
  phase3: number;
  [key: string]: any;
}> {
  return aiPlayers
    .filter(player => player.phase1 !== null && player.phase1 !== undefined)
    .map(player => ({
      ...player,
      phase1: player.phase1 ?? 0,
      phase2: player.phase2 ?? 0,
      phase3: player.phase3 ?? 0,
    }));
}

/**
 * Transform AI players and user data into display format for results
 * 
 * @param validAIPlayers - Array of valid AI players with all phase scores
 * @param userData - User's phase scores and metadata
 * @returns Array of player objects ready for ranking display
 */
export function transformPlayersForResults(
  validAIPlayers: Array<{
    name: string;
    avatar: string;
    rank: string;
    userId: string;
    phase1: number;
    phase2: number;
    phase3: number;
    wordCount: number | null;
  }>,
  userData: {
    phase1: number;
    phase2: number;
    phase3: number;
    wordCount: number;
    revisedWordCount: number;
  }
): Array<{
  name: string;
  avatar: string;
  rank: string;
  userId?: string;
  phase1: number;
  phase2: number;
  phase3: number;
  compositeScore: number;
  wordCount: number | null;
  revisedWordCount?: number;
  isYou: boolean;
  position: number;
}> {
  const userCompositeScore = calculateCompositeScore(userData.phase1, userData.phase2, userData.phase3);
  
  const userPlayer = {
    name: 'You',
    avatar: '🌿',
    rank: 'Silver III',
    phase1: roundScore(userData.phase1),
    phase2: roundScore(userData.phase2),
    phase3: roundScore(userData.phase3),
    compositeScore: userCompositeScore,
    wordCount: userData.wordCount,
    revisedWordCount: userData.revisedWordCount,
    isYou: true,
    position: 0,
  };
  
  const aiPlayersDisplay = validAIPlayers.map(player => ({
    name: player.name,
    avatar: player.avatar,
    rank: player.rank,
    userId: player.userId,
    phase1: player.phase1,
    phase2: player.phase2,
    phase3: player.phase3,
    wordCount: player.wordCount,
    compositeScore: calculateCompositeScore(player.phase1, player.phase2, player.phase3),
    isYou: false,
    position: 0,
  }));
  
  return [userPlayer, ...aiPlayersDisplay];
}

