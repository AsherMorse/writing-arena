/**
 * Firestore Service
 * 
 * Re-exports for backward compatibility
 * 
 * @deprecated Import from specific service modules instead:
 * - lib/services/user-profile.ts
 * - lib/services/writing-sessions.ts
 * - lib/services/conversations.ts
 */

// Re-export user profile operations
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserStatsAfterSession,
  deleteUserProfile,
} from './user-profile';

// Re-export writing session operations
export {
  saveWritingSession,
  getUserSessions,
  getCompletedRankedMatches,
  countCompletedRankedMatches,
  type WritingSession,
} from './writing-sessions';

// Re-export conversation operations
export {
  saveImproveConversation,
  updateImproveConversation,
  getImproveConversations,
  getImproveConversation,
  type ImproveConversation,
} from './conversations';
