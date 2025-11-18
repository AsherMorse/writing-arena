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

