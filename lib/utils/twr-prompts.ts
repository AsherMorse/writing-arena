/**
 * The Writing Revolution (TWR) Aligned Prompts
 * 
 * Re-exports for backward compatibility
 * 
 * @deprecated Import from specific prompt modules instead:
 * - lib/prompts/twr-writing.ts
 * - lib/prompts/twr-feedback.ts
 * - lib/prompts/twr-peer-feedback.ts
 * - lib/prompts/twr-revision.ts
 * - lib/prompts/twr-common.ts
 */

// Re-export writing prompts
export {
  generateTWRWritingPrompt,
  generateTWRBatchRankingPrompt,
} from '@/lib/prompts/twr-writing';

// Re-export feedback prompts
export {
  generateTWRFeedbackPrompt,
} from '@/lib/prompts/twr-feedback';

// Re-export peer feedback prompts
export {
  generateTWRPeerFeedbackPrompt,
} from '@/lib/prompts/twr-peer-feedback';

// Re-export revision prompts
export {
  generateTWRRevisionPrompt,
} from '@/lib/prompts/twr-revision';

// Re-export common constants and utilities
export {
  TWR_STRATEGIES,
  validateTWRFeedback,
  TWR_ANALYSIS_CRITERIA,
  TWR_GRADING_RUBRIC,
  TWR_FEEDBACK_REQUIREMENTS,
} from '@/lib/prompts/twr-common';
