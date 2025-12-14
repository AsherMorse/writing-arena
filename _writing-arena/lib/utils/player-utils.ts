/**
 * Player utility functions
 */

/**
 * Get player avatar with fallback logic
 */
export function getPlayerAvatar(
  avatar: string | null | undefined,
  isAI: boolean = false,
  fallback: string = '👤'
): string {
  if (avatar && typeof avatar === 'string') {
    return avatar;
  }
  
  if (isAI) {
    return '🤖';
  }
  
  return fallback;
}

/**
 * Get player display name with fallback
 */
export function getPlayerDisplayName(
  displayName: string | null | undefined,
  fallback: string = 'Unknown Player'
): string {
  return displayName || fallback;
}

/**
 * Get player rank with fallback
 */
export function getPlayerRank(
  rank: string | null | undefined,
  fallback: string = 'Silver III'
): string {
  return rank || fallback;
}

/**
 * Normalize player avatar (handles old object format)
 */
export function normalizePlayerAvatar(avatar: any): string {
  if (typeof avatar === 'string') {
    return avatar;
  }
  
  if (avatar && typeof avatar === 'object' && avatar.emoji) {
    return avatar.emoji;
  }
  
  return '🌿';
}

/**
 * Player display data structure
 */
export interface PlayerDisplayData {
  name: string;
  avatar: string;
  rank: string;
  userId: string;
  isYou: boolean;
  isAI: boolean;
  wordCount?: number;
}

/**
 * Party member data structure
 */
export interface PartyMemberData {
  name: string;
  userId: string;
  avatar: string;
  rank: string;
  isAI: boolean;
  isYou: boolean;
}

/**
 * Map players to display format with word counts
 */
export function mapPlayersToDisplay(
  players: Array<{
    userId: string;
    displayName: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>,
  userId: string | undefined,
  wordCount: number,
  aiWordCounts: number[]
): PlayerDisplayData[] {
  return players.map((player, index) => {
    const isYou = player.userId === userId;
    const aiIndex = players.filter((p, i) => i < index && p.isAI).length;
    return {
      name: player.displayName,
      avatar: player.avatar,
      rank: player.rank,
      userId: player.userId,
      isYou,
      isAI: player.isAI,
      wordCount: isYou ? wordCount : (player.isAI ? aiWordCounts[aiIndex] || 0 : 0),
    };
  });
}

/**
 * Map players to party member format
 */
export function mapPlayersToPartyMembers(
  players: Array<{
    userId: string;
    displayName: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>,
  userId: string | undefined
): PartyMemberData[] {
  return players.map(p => ({
    name: p.displayName,
    userId: p.userId,
    avatar: p.avatar,
    rank: p.rank,
    isAI: p.isAI,
    isYou: p.userId === userId,
  }));
}

