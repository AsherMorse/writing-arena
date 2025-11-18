/**
 * Player mapping and transformation utilities
 */

export interface PlayerDisplay {
  name: string;
  avatar: string;
  rank: string;
  userId: string;
  isYou: boolean;
  isAI: boolean;
  wordCount?: number;
  score?: number;
  compositeScore?: number;
  position?: number;
}

/**
 * Map players to display format with consistent structure
 */
export function mapPlayersToDisplay(
  players: Array<{ 
    userId: string; 
    displayName: string; 
    avatar: string; 
    rank: string; 
    isAI: boolean;
    phases?: any;
  }>,
  currentUserId: string,
  wordCounts?: number[]
): PlayerDisplay[] {
  return players.map((player, index) => ({
    name: player.displayName,
    avatar: player.avatar,
    rank: player.rank,
    userId: player.userId,
    isYou: player.userId === currentUserId,
    isAI: player.isAI,
    wordCount: wordCounts?.[index],
  }));
}

/**
 * Map players to party members format (for WaitingForPlayers)
 */
export function mapPlayersToPartyMembers(
  players: Array<{ 
    userId: string; 
    displayName: string; 
    avatar: string; 
    rank: string; 
    isAI: boolean;
  }>,
  currentUserId: string
): Array<{
  name: string;
  userId: string;
  avatar: string;
  rank: string;
  isAI: boolean;
  isYou: boolean;
}> {
  return players.map(player => ({
    name: player.displayName,
    userId: player.userId,
    avatar: player.avatar,
    rank: player.rank,
    isAI: player.isAI,
    isYou: player.userId === currentUserId,
  }));
}

/**
 * Map players with word counts for display
 */
export function mapPlayersWithCounts(
  players: Array<{ 
    userId: string; 
    displayName: string; 
    avatar: string; 
    rank: string; 
    isAI: boolean;
  }>,
  currentUserId: string,
  currentWordCount: number,
  aiWordCounts: number[]
): PlayerDisplay[] {
  return players.map((player, index) => {
    const isYou = player.userId === currentUserId;
    const aiIndex = players.filter((p, i) => i < index && p.isAI).length;
    
    return {
      name: player.displayName,
      avatar: player.avatar,
      rank: player.rank,
      userId: player.userId,
      isYou,
      isAI: player.isAI,
      wordCount: isYou ? currentWordCount : (player.isAI ? aiWordCounts[aiIndex] || 0 : 0),
    };
  });
}

