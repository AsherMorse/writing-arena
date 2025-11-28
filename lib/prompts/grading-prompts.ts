/**
 * Centralized Grading Prompts
 * 
 * Re-exports for backward compatibility
 * 
 * @deprecated Import from specific prompt modules instead:
 * - lib/prompts/phase1-writing.ts
 * - lib/prompts/phase2-peer-feedback.ts
 * - lib/prompts/phase3-revision.ts
 * - lib/prompts/ap-lang.ts
 */

// Re-export Phase 1 prompts
export {
  getPhase1WritingPrompt,
} from './phase1-writing';

// Re-export Phase 2 prompts
export {
  getPhase2PeerFeedbackPrompt,
} from './phase2-peer-feedback';

// Re-export Phase 3 prompts
export {
  getPhase3RevisionPrompt,
} from './phase3-revision';

// Re-export AP Lang prompts
export {
  getAPLangArgumentPrompt,
  getAPLangRhetoricalAnalysisPrompt,
  getAPLangSynthesisPrompt,
} from './ap-lang';
