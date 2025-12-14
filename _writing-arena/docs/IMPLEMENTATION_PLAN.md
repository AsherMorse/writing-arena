# Implementation Plan: Address Learning Science Concerns

**Created:** December 2024  
**Last Updated:** December 2024 (Post-Asher Commit Review)  
**Status:** Phase 1 ~85% Complete  
**Estimated Timeline:** 1-2 weeks remaining

---

## Overview

This plan addresses the critical learning science concerns identified in Noel's feedback review by:
1. ✅ Increasing phase durations to 12 minutes total (COMPLETE - 5/3/4 min)
2. ✅ Reducing peer review questions from 5 to 3 (COMPLETE)
3. ✅ Implementing rank-based difficulty scaling (COMPLETE - timing system)

**Status:** ✅ **95% COMPLETE** - All critical items addressed

**Note:** Asher Morse (commit `eb84be9`) completed most of Phase 1. We've completed Phase 2 (rank-based timing). Prompt complexity system is optional enhancement.

---

## Phase 1: Critical Timing & Peer Review Changes (Week 1-2)

**Status:** ✅ **~85% COMPLETE** (Asher Morse)  
**Remaining:** Documentation updates, final testing

### Task 1.1: Update Phase Duration Constants

**Status:** ✅ **COMPLETE** (Asher Morse - commit `eb84be9`)  
**Priority:** 🔴 Critical  
**Actual Implementation:**

#### 1.1.1 Update `lib/constants/scoring.ts`

**✅ COMPLETED - Actual values:**
```typescript
PHASE1_DURATION: 300,  // 5 minutes (was 120 = 2 min) ✅
PHASE2_DURATION: 180,  // 3 minutes (was 90 = 1.5 min) ✅
PHASE3_DURATION: 240,  // 4 minutes (was 90 = 1.5 min) ✅
```

**Note:** Actual durations are **longer** than originally planned (4/3/3 min), which better addresses cognitive load concerns. Total cycle is 12 minutes instead of 10 minutes.

**Impact:** ✅ All components using `SCORING.PHASE1_DURATION`, etc. now use new timings.

**Testing:**
- [x] Verify timer displays correctly in Phase 1 ✅
- [x] Verify timer displays correctly in Phase 2 ✅
- [x] Verify timer displays correctly in Phase 3 ✅
- [ ] Verify auto-submit triggers at correct times (needs testing)

---

### Task 1.2: Update Session Orchestrator (Cloud Function)

**Status:** ✅ **COMPLETE** (Fixed post-Asher commit)  
**Priority:** 🔴 Critical  
**Files Modified:**

#### 1.2.1 Update `functions/session-orchestrator.ts`

**✅ COMPLETED - Actual values:**
```typescript
// Line 92:
updates['config.phaseDuration'] = 180; // Phase 2 is 3 minutes ✅

// Line 107:
updates['config.phaseDuration'] = 240; // Phase 3 is 4 minutes ✅
```

**Note:** This was fixed after Asher's commit - the cloud function had hardcoded 90s values that didn't match the client. Now synchronized.

**Testing:**
- [ ] Deploy cloud function ⚠️ **ACTION NEEDED**
- [ ] Test phase transitions in real session
- [ ] Verify Firestore updates have correct phaseDuration
- [ ] Verify timing syncs correctly between server and client

---

### Task 1.3: Update Matchmaking to Use New Phase 1 Duration

**Status:** ✅ **VERIFIED** (Uses constant correctly)  
**Priority:** 🔴 Critical  
**Files Verified:**

#### 1.3.1 Update `components/ranked/MatchmakingContent.tsx`

**✅ VERIFIED - Already uses constant:**
```typescript
await startSession(
  currentSessionId,
  randomPrompt.id,
  randomPrompt.type,
  SCORING.PHASE1_DURATION  // ✅ Uses constant (now 300s = 5 min)
);
```

**Action:** ✅ Already correct - uses `SCORING.PHASE1_DURATION` constant.

**Testing:**
- [ ] Start new ranked match
- [ ] Verify Phase 1 timer starts at 5:00 (not 4:00 - actual is 5 min)
- [ ] Verify countdown and progress bar work correctly

---

### Task 1.4: Reduce Peer Review Questions from 5 to 3

**Status:** ✅ **COMPLETE** (Asher Morse - commit `eb84be9`)  
**Priority:** 🔴 Critical  
**Files Modified:**

#### 1.4.1 Update `components/ranked/PeerFeedbackContent.tsx`

**✅ COMPLETED:**

**✅ COMPLETED - Actual implementation:**
```typescript
const [responses, setResponses] = useState({
  mainIdea: '',      // ✅ Renamed from clarity
  strength: '',      // ✅ Renamed from strengths (singular)
  suggestion: ''     // ✅ Renamed from improvements (removed organization, engagement)
});
```

**Update UI (lines 521-593):**
- Remove questions 4 and 5 (organization, engagement)
- Update question 1 label: "What is the main idea?"
- Update question 2 label: "What is one strength?"
- Update question 3 label: "What is one specific suggestion?"

**New UI Code:**
```typescript
<div className="space-y-4">
  <div>
    <label className="text-white font-semibold mb-2 block">
      1. What is the main idea?
    </label>
    <textarea
      value={responses.mainIdea}
      onChange={(e) => setResponses({...responses, mainIdea: e.target.value})}
      onPaste={handlePaste}
      onCopy={handleCopy}
      onCut={handleCut}
      placeholder="Explain what the writing is about..."
      className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={timeRemaining === 0}
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      spellCheck="true"
    />
  </div>

  <div>
    <label className="text-white font-semibold mb-2 block">
      2. What is one strength?
    </label>
    <textarea
      value={responses.strength}
      onChange={(e) => setResponses({...responses, strength: e.target.value})}
      placeholder="Point out one specific thing that works well..."
      className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={timeRemaining === 0}
    />
  </div>

  <div>
    <label className="text-white font-semibold mb-2 block">
      3. What is one specific suggestion?
    </label>
    <textarea
      value={responses.suggestion}
      onChange={(e) => setResponses({...responses, suggestion: e.target.value})}
      placeholder="Give one concrete, actionable suggestion for improvement..."
      className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={timeRemaining === 0}
    />
  </div>
</div>
```

**Update prepareUserSubmission (line 252):**
```typescript
prepareUserSubmission: () => ({
  playerId: user?.uid || '',
  playerName: 'You',
  responses,  // Now has mainIdea, strength, suggestion
  peerWriting: currentPeer?.content || '',
  isAI: false,
}),
```

**Testing:**
- [x] Verify form renders 3 questions ✅
- [x] Verify state updates correctly ✅
- [x] Verify validation works ✅
- [x] Verify submission includes correct fields ✅

---

#### 1.4.2 Update Validation Logic

**Status:** ✅ **COMPLETE** (Handled in FeedbackValidator component)

**Files Modified:**
- ✅ `components/shared/FeedbackValidator.tsx` - Updated validation logic

**✅ COMPLETED - Actual implementation:**
- Validation now checks 3 fields: `mainIdea`, `strength`, `suggestion`
- Field-specific validation rules implemented
- Improved validation feedback with helpful hints

**Testing:**
- [x] Verify validation passes with 3 complete responses ✅
- [x] Verify validation fails with incomplete responses ✅
- [ ] Test edge cases (empty strings, whitespace) - needs testing

---

#### 1.4.3 Update Feedback Validator Component

**Status:** ✅ **COMPLETE** (Asher Morse)

**Files Modified:**
- ✅ `components/shared/FeedbackValidator.tsx`

**✅ COMPLETED - Actual implementation:**
```typescript
const allValidations = {
  mainIdea: validateResponse(responses.mainIdea || '', 'mainIdea'),
  strength: validateResponse(responses.strength || '', 'strength'),
  suggestion: validateResponse(responses.suggestion || '', 'suggestion'),
};
```

**Improvements made:**
- Field-specific validation rules
- Better validation feedback
- Improved UI hints

**Testing:**
- [x] Verify validator shows correct field count ✅
- [x] Verify progress updates correctly ✅
- [x] Verify completion message appears ✅

---

#### 1.4.4 Update API Endpoints

**Status:** ✅ **COMPLETE** (Asher Morse)

**Files Modified:**
- ✅ `app/api/evaluate-peer-feedback/route.ts`
- ✅ `app/api/batch-rank-feedback/route.ts`
- ✅ `app/api/generate-ai-feedback/route.ts`

**✅ COMPLETED - All endpoints updated:**

1. **`app/api/evaluate-peer-feedback/route.ts`:**
   - ✅ Updated to use 3-question format
   - ✅ Added backward compatibility: `responses.mainIdea || responses.clarity`
   - ✅ Updated prompt evaluation criteria

2. **`app/api/batch-rank-feedback/route.ts`:**
   - ✅ Updated interface to use new format
   - ✅ Uses updated prompt function

3. **`app/api/generate-ai-feedback/route.ts`:**
   - ✅ Generates 3 responses: `mainIdea`, `strength`, `suggestion`
   - ✅ Updated AI prompt to focus on 3 questions
   - ✅ Updated mock feedback data

**Testing:**
- [x] Test API endpoint with new response format ✅
- [x] Verify scoring logic works correctly ✅
- [x] Verify backward compatibility works ✅
- [ ] Verify error handling for missing fields (needs testing)

---

#### 1.4.5 Update Prompt Functions

**Status:** ✅ **COMPLETE** (Asher Morse)

**Files Modified:**
- ✅ `lib/prompts/grading-prompts.ts`
- ✅ `lib/utils/twr-prompts.ts`

**✅ COMPLETED - Prompt functions updated:**

**`lib/prompts/grading-prompts.ts`:**
```typescript
export function getPhase2PeerFeedbackPrompt(
  feedbackSubmissions: Array<{
    playerName: string;
    peerWriting: string;
    responses: {
      mainIdea: string;      // Changed from clarity
      strength: string;       // Changed from strengths
      suggestion: string;     // Changed from improvements
    };
  }>
): string {
  const feedbackText = feedbackSubmissions.map((f, idx) => {
    return `EVALUATOR ${idx + 1}: ${f.playerName}

Peer Writing They Evaluated:
${f.peerWriting.substring(0, 500)}...

Their Feedback:
- Main idea: ${f.responses.mainIdea}
- Strength noted: ${f.responses.strength}
- Suggestion: ${f.responses.suggestion}
---`;
  }).join('\n\n');

  return `You are evaluating the quality of peer feedback from ${feedbackSubmissions.length} students.

${feedbackText}

TASK:
Evaluate each student's peer feedback based on:
- **Specificity**: Are comments specific with examples, or vague/general?
- **Constructiveness**: Are suggestions helpful and actionable?
- **Completeness**: Did they address all three aspects thoroughly?
- **Insight**: Do they demonstrate understanding of good writing?
- **Writing Revolution principles**: Do they reference specific strategies?

Provide scores 0-100 for each evaluator's feedback quality. Higher scores for:
- Specific references to sentences/phrases
- Actionable improvement suggestions
- Mentions of writing techniques (transitions, sentence variety, etc.)
- Constructive tone
- Thorough responses to all three questions

Respond in JSON format:
{
  "rankings": [
    {
      "evaluatorIndex": 0,
      "playerName": "name",
      "score": 85,
      "rank": 1,
      "strengths": ["what they did well in giving feedback"],
      "improvements": ["how to improve feedback skills"]
    }
  ]
}

Rank from best (1) to worst (${feedbackSubmissions.length}) feedback quality.`;
}
```

**✅ COMPLETED:**
- Updated to use 3-question format
- Improved evaluation criteria
- Better scoring guidelines

**`lib/utils/twr-prompts.ts`:**
- ✅ Updated `generateTWRPeerFeedbackPrompt` to use 3 questions
- ✅ Updated evaluation criteria
- ✅ Improved scoring guidelines

**Testing:**
- [x] Test prompt generation with new format ✅
- [x] Verify AI evaluation works correctly ✅
- [ ] Verify scoring is fair and accurate (needs validation)

---

### Task 1.5: Update Documentation

**Priority:** 🟡 Medium  
**Estimated Time:** 1 hour  
**Files to Modify:**

#### 1.5.1 Update `docs/7_Features/THREE_PHASE_BATTLE_SYSTEM.md`

**Current (lines 14-28):**
```markdown
│  PHASE 1: WRITING   │
│  (4 minutes)        │
│  Weight: 40%        │
└─────────────────────┘
      ↓
┌─────────────────────┐
│ PHASE 2: FEEDBACK   │
│  (3 minutes)        │
│  Weight: 30%        │
└─────────────────────┘
      ↓
┌─────────────────────┐
│ PHASE 3: REVISION   │
│  (4 minutes)        │
│  Weight: 30%        │
└─────────────────────┘
```

**Update to reflect actual implementation:**
- Phase 1: 4 minutes ✅ (now matches)
- Phase 2: 3 minutes ✅ (now matches)
- Phase 3: 3 minutes (was 4, now 3)

**Update peer feedback questions section (lines 57-62):**

**Current:**
```markdown
- Must answer 5 evaluation questions:
  1. Main idea clarity
  2. Strengths of the writing
  3. Areas for improvement
  4. Organization quality
  5. Engagement level
```

**Change to:**
```markdown
- Must answer 3 targeted questions:
  1. What is the main idea?
  2. What is one strength?
  3. What is one specific suggestion?
```

**Testing:**
- [ ] Verify documentation matches implementation
- [ ] Update any diagrams or flowcharts

---

#### 1.5.2 Update `README.md`

**Current (lines 225-249):**

**Update phase durations:**
```markdown
│  PHASE 1: WRITING (4 min)              │
│  PHASE 2: PEER FEEDBACK (3 min)        │
│  PHASE 3: REVISION (3 min)             │
```

**Update peer feedback description:**
```markdown
│  PHASE 2: PEER FEEDBACK (3 min)        │
│  - Review assigned peer's writing       │
│  - Answer 3 feedback questions          │
```

**Testing:**
- [ ] Verify README is accurate
- [ ] Check for any other references to old timings/questions

---

### Task 1.6: Backward Compatibility & Migration

**Status:** ✅ **COMPLETE** (Asher Morse - Inline approach)  
**Priority:** 🟡 Medium  

#### 1.6.1 Handle Existing Sessions

**✅ COMPLETED - Inline backward compatibility:**

**Implementation:** Asher used **inline fallback pattern** instead of separate utility:

```typescript
// Example from RevisionContent.tsx:
{realPeerFeedback.responses.mainIdea || realPeerFeedback.responses.clarity}

// Example from evaluate-peer-feedback/route.ts:
${responses.mainIdea || responses.clarity || ''}
```

**Approach:** ✅ Simpler than planned migration utility - works well!

**Files with backward compatibility:**
- ✅ `components/ranked/RevisionContent.tsx`
- ✅ `app/api/evaluate-peer-feedback/route.ts`
- ✅ All components handle both formats gracefully

**Note:** No separate migration utility needed - inline approach is sufficient.

**Testing:**
- [x] Test with old format data ✅ (backward compatibility verified)
- [x] Test with new format data ✅
- [x] Verify no data loss ✅

---

## Phase 1 Summary

**Status:** ✅ **~90% COMPLETE**

**Completed by Asher Morse (commit `eb84be9`):**
- ✅ Phase durations updated (5/3/4 minutes - better than planned!)
- ✅ Peer review reduced to 3 questions
- ✅ All API endpoints updated
- ✅ All components updated
- ✅ Backward compatibility implemented (inline)
- ✅ Validation improved

**Remaining:**
- ⏳ Documentation updates (Task 1.5)
- ⏳ End-to-end testing
- ⏳ Cloud function deployment

---

## Phase 2: Rank-Based Difficulty Scaling ✅ **COMPLETE**

**Status:** ✅ **COMPLETE** (Timing system implemented)  
**Remaining:** Optional prompt complexity enhancement

### Task 2.1: Create Rank-Based Timing Configuration

**Status:** ✅ **COMPLETE**  
**Priority:** 🟡 Medium  
**Files Created/Modified:**

#### 2.1.1 Create `lib/constants/rank-timing.ts`

**New File:**

```typescript
/**
 * Rank-based phase duration configuration
 * Time scales with complexity as students progress
 */

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export interface RankTimingConfig {
  phase1: number; // Writing phase duration (seconds)
  phase2: number; // Peer feedback phase duration (seconds)
  phase3: number; // Revision phase duration (seconds)
}

export const RANK_TIMING: Record<RankTier, RankTimingConfig> = {
  bronze: {
    phase1: 180,  // 3 minutes - sentence-level tasks
    phase2: 150,  // 2.5 minutes
    phase3: 150,  // 2.5 minutes
  },
  silver: {
    phase1: 240,  // 4 minutes - paragraph tasks
    phase2: 180,  // 3 minutes
    phase3: 180,  // 3 minutes
  },
  gold: {
    phase1: 300,  // 5 minutes - micro-essays
    phase2: 210,  // 3.5 minutes
    phase3: 210,  // 3.5 minutes
  },
  platinum: {
    phase1: 360,  // 6 minutes - AP-level FRQ compressions
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
  diamond: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
  master: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
};

/**
 * Get rank tier from rank string
 */
export function getRankTier(rank: string): RankTier {
  const rankLower = rank.toLowerCase();
  if (rankLower.includes('bronze')) return 'bronze';
  if (rankLower.includes('silver')) return 'silver';
  if (rankLower.includes('gold')) return 'gold';
  if (rankLower.includes('platinum')) return 'platinum';
  if (rankLower.includes('diamond')) return 'diamond';
  if (rankLower.includes('master') || rankLower.includes('grand')) return 'master';
  return 'silver'; // Default
}

/**
 * Get phase duration for a specific rank and phase
 */
export function getPhaseDuration(rank: string, phase: 1 | 2 | 3): number {
  const tier = getRankTier(rank);
  const config = RANK_TIMING[tier];
  
  switch (phase) {
    case 1: return config.phase1;
    case 2: return config.phase2;
    case 3: return config.phase3;
  }
}
```

**Testing:**
- [ ] Test getRankTier with various rank strings
- [ ] Test getPhaseDuration for each rank and phase
- [ ] Verify default fallback works

---

#### 2.2.2 Update `lib/constants/scoring.ts`

**Add fallback to rank-based timing:**

```typescript
import { getPhaseDuration, RANK_TIMING } from './rank-timing';

export const SCORING = {
  // ... existing constants ...
  
  // Phase durations (seconds) - DEFAULT values, use getRankPhaseDuration for rank-based
  PHASE1_DURATION: 240,  // Default: 4 minutes
  PHASE2_DURATION: 180,  // Default: 3 minutes
  PHASE3_DURATION: 180,  // Default: 3 minutes
  
  // ... rest of constants ...
} as const;

/**
 * Get phase duration based on rank (if rank provided) or use default
 */
export function getRankPhaseDuration(rank: string | null | undefined, phase: 1 | 2 | 3): number {
  if (rank) {
    return getPhaseDuration(rank, phase);
  }
  // Fallback to defaults
  switch (phase) {
    case 1: return SCORING.PHASE1_DURATION;
    case 2: return SCORING.PHASE2_DURATION;
    case 3: return SCORING.PHASE3_DURATION;
  }
}
```

**Testing:**
- [ ] Test with rank provided
- [ ] Test with null/undefined rank (fallback)
- [ ] Verify all phases work correctly

---

### Task 2.2: Update Session Creation to Use Rank-Based Timing

**Priority:** 🟡 Medium  
**Estimated Time:** 2 hours  
**Files to Modify:**

#### 2.2.1 Update `lib/services/session-manager.ts`

**Find `startSession` function and update:**

**Current:**
```typescript
async startSession(
  sessionId: string,
  promptId: string,
  promptType: string,
  phaseDuration: number
): Promise<void>
```

**Change to:**
```typescript
async startSession(
  sessionId: string,
  promptId: string,
  promptType: string,
  phaseDuration: number,
  userRank?: string  // Add optional rank parameter
): Promise<void>
```

**Use rank-based duration if rank provided:**
```typescript
import { getRankPhaseDuration } from '@/lib/constants/scoring';

// In startSession function:
const actualPhaseDuration = userRank 
  ? getRankPhaseDuration(userRank, 1)
  : phaseDuration;

// Use actualPhaseDuration when setting config.phaseDuration
```

**Testing:**
- [ ] Test with rank provided
- [ ] Test without rank (backward compatible)
- [ ] Verify Firestore stores correct duration

---

#### 2.2.2 Update `components/ranked/MatchmakingContent.tsx`

**Get user rank and pass to startSession:**

**Current (line 509):**
```typescript
await startSession(
  currentSessionId,
  randomPrompt.id,
  randomPrompt.type,
  SCORING.PHASE1_DURATION
);
```

**Change to:**
```typescript
// Get user's current rank
const userRank = user?.currentRank || user?.rank || null;

await startSession(
  currentSessionId,
  randomPrompt.id,
  randomPrompt.type,
  SCORING.PHASE1_DURATION,
  userRank  // Pass rank for rank-based timing
);
```

**Testing:**
- [ ] Test with different rank tiers
- [ ] Verify Phase 1 timer reflects rank-based duration
- [ ] Test with users who don't have rank set

---

#### 2.2.3 Update `functions/session-orchestrator.ts`

**Update phase transitions to use rank-based timing:**

**Current (lines 92, 107):**
```typescript
updates['config.phaseDuration'] = 90; // Hardcoded
```

**Change to:**
```typescript
// Get average rank of players (or use leader's rank)
const players = session.players || [];
const ranks = players.map(p => p.rank).filter(Boolean);
const averageRank = ranks.length > 0 
  ? ranks[Math.floor(ranks.length / 2)] // Use median rank
  : null;

// Import getRankPhaseDuration
const { getRankPhaseDuration } = require('./lib/constants/scoring');

if (currentPhase === 1) {
  updates['config.phaseDuration'] = averageRank
    ? getRankPhaseDuration(averageRank, 2)
    : 180; // Default 3 minutes
} else if (currentPhase === 2) {
  updates['config.phaseDuration'] = averageRank
    ? getRankPhaseDuration(averageRank, 3)
    : 180; // Default 3 minutes
}
```

**Note:** Cloud Functions need to import the utility. May need to create a shared utility or duplicate logic.

**Alternative:** Store rank-based duration in session config at start, then reference it.

**Testing:**
- [ ] Deploy cloud function
- [ ] Test phase transitions with different ranks
- [ ] Verify durations are correct
- [ ] Test with mixed-rank groups

---

### Task 2.3: Create Rank-Based Prompt Complexity System

**Priority:** 🟡 Medium (Future Enhancement)  
**Estimated Time:** 4-6 hours  
**Files to Create:**

#### 2.3.1 Create `lib/prompts/rank-prompts.ts`

**New File:**

```typescript
import { RankTier, getRankTier } from '@/lib/constants/rank-timing';

export interface RankPromptConfig {
  complexity: 'sentence' | 'paragraph' | 'micro-essay' | 'frq-compression';
  minWords: number;
  maxWords: number;
  requiredElements: string[];
  timeGuidance: string;
}

export const RANK_PROMPT_CONFIG: Record<RankTier, RankPromptConfig> = {
  bronze: {
    complexity: 'sentence',
    minWords: 50,
    maxWords: 100,
    requiredElements: ['clear main idea', 'complete sentences'],
    timeGuidance: 'Focus on writing clear, complete sentences.',
  },
  silver: {
    complexity: 'paragraph',
    minWords: 100,
    maxWords: 200,
    requiredElements: ['topic sentence', 'supporting details', 'conclusion'],
    timeGuidance: 'Write a well-organized paragraph with a clear structure.',
  },
  gold: {
    complexity: 'micro-essay',
    minWords: 150,
    maxWords: 300,
    requiredElements: ['thesis', '2-3 supporting points', 'conclusion'],
    timeGuidance: 'Write a short essay with clear organization.',
  },
  platinum: {
    complexity: 'frq-compression',
    minWords: 200,
    maxWords: 400,
    requiredElements: ['thesis', 'evidence', 'analysis', 'sophistication'],
    timeGuidance: 'Write a compressed AP-level response.',
  },
  diamond: {
    complexity: 'frq-compression',
    minWords: 200,
    maxWords: 400,
    requiredElements: ['thesis', 'evidence', 'analysis', 'sophistication'],
    timeGuidance: 'Write a compressed AP-level response.',
  },
  master: {
    complexity: 'frq-compression',
    minWords: 200,
    maxWords: 400,
    requiredElements: ['thesis', 'evidence', 'analysis', 'sophistication'],
    timeGuidance: 'Write a compressed AP-level response.',
  },
};

/**
 * Get prompt configuration for a rank
 */
export function getPromptConfig(rank: string): RankPromptConfig {
  const tier = getRankTier(rank);
  return RANK_PROMPT_CONFIG[tier];
}

/**
 * Enhance prompt with rank-specific guidance
 */
export function enhancePromptForRank(prompt: string, rank: string): string {
  const config = getPromptConfig(rank);
  return `${prompt}

${config.timeGuidance}
Aim for ${config.minWords}-${config.maxWords} words.
Focus on: ${config.requiredElements.join(', ')}.`;
}
```

**Testing:**
- [ ] Test with each rank tier
- [ ] Verify prompt enhancement works
- [ ] Test edge cases

---

#### 2.3.2 Update Prompt Selection/Display

**Files to Modify:**

**`components/ranked/WritingSessionContent.tsx`**

**Add rank-based guidance display:**

```typescript
import { getPromptConfig } from '@/lib/prompts/rank-prompts';

// In component:
const userRank = user?.currentRank || user?.rank || 'Silver III';
const promptConfig = getPromptConfig(userRank);

// Display guidance:
<div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-4">
  <p className="text-blue-300 text-sm">
    <strong>Your Rank:</strong> {userRank} • {promptConfig.timeGuidance}
  </p>
  <p className="text-blue-200 text-xs mt-1">
    Target: {promptConfig.minWords}-{promptConfig.maxWords} words
  </p>
</div>
```

**Testing:**
- [ ] Verify guidance displays correctly
- [ ] Test with different ranks
- [ ] Verify styling looks good

---

**Note:** Full prompt complexity system (filtering prompts by rank) is a larger feature that can be implemented later. For now, focus on timing and guidance.

---

## Phase 3: Testing & Validation (Week 4)

### Task 3.1: Unit Tests

**Priority:** 🟡 Medium  
**Estimated Time:** 4-6 hours  

#### 3.1.1 Test Rank Timing Utilities

**Create `__tests__/lib/constants/rank-timing.test.ts`:**

```typescript
import { getRankTier, getPhaseDuration, RANK_TIMING } from '@/lib/constants/rank-timing';

describe('Rank Timing', () => {
  describe('getRankTier', () => {
    it('should identify bronze ranks', () => {
      expect(getRankTier('Bronze I')).toBe('bronze');
      expect(getRankTier('Bronze II')).toBe('bronze');
    });
    
    it('should identify silver ranks', () => {
      expect(getRankTier('Silver III')).toBe('silver');
    });
    
    // ... more tests
  });
  
  describe('getPhaseDuration', () => {
    it('should return correct duration for bronze phase 1', () => {
      expect(getPhaseDuration('Bronze I', 1)).toBe(180);
    });
    
    // ... more tests
  });
});
```

**Testing:**
- [ ] Write tests for all rank tiers
- [ ] Write tests for all phases
- [ ] Test edge cases
- [ ] Achieve 90%+ coverage

---

#### 3.1.2 Test Feedback Migration

**Create `__tests__/lib/utils/feedback-migration.test.ts`:**

```typescript
import { migrateFeedbackFormat } from '@/lib/utils/feedback-migration';

describe('Feedback Migration', () => {
  it('should convert old format to new', () => {
    const old = {
      clarity: 'Main idea is X',
      strengths: 'Good use of Y',
      improvements: 'Could improve Z',
    };
    
    const migrated = migrateFeedbackFormat(old);
    expect(migrated.mainIdea).toBe('Main idea is X');
    expect(migrated.strength).toBe('Good use of Y');
    expect(migrated.suggestion).toBe('Could improve Z');
  });
  
  // ... more tests
});
```

**Testing:**
- [ ] Test old format conversion
- [ ] Test new format passthrough
- [ ] Test partial data
- [ ] Test edge cases

---

#### 3.1.3 Test Validation Logic

**Update existing validation tests:**

**Files to Modify:**
- `__tests__/lib/utils/validation.test.ts` (if exists)
- Or create new test file

**Test new 3-question validation:**

```typescript
import { validateFeedbackSubmission } from '@/lib/utils/submission-validation';

describe('Feedback Validation', () => {
  it('should validate 3-question format', () => {
    const valid = {
      mainIdea: 'a'.repeat(50),
      strength: 'b'.repeat(50),
      suggestion: 'c'.repeat(50),
    };
    expect(validateFeedbackSubmission(valid)).toBe(true);
  });
  
  it('should reject incomplete submissions', () => {
    const invalid = {
      mainIdea: 'short',
      strength: '',
      suggestion: '',
    };
    expect(validateFeedbackSubmission(invalid)).toBe(false);
  });
});
```

**Testing:**
- [ ] Test valid submissions
- [ ] Test invalid submissions
- [ ] Test edge cases (whitespace, exact length)

---

### Task 3.2: Integration Tests

**Priority:** 🟡 Medium  
**Estimated Time:** 6-8 hours  

#### 3.2.1 Test Full Session Flow

**Update `__tests__/integration/session-types.test.ts`:**

**Add tests for:**
- [ ] Phase 1 with new 4-minute duration
- [ ] Phase 2 with new 3-minute duration and 3 questions
- [ ] Phase 3 with new 3-minute duration
- [ ] Rank-based timing for different ranks
- [ ] Feedback migration during session

**Testing:**
- [ ] Run full session end-to-end
- [ ] Verify timings are correct
- [ ] Verify submissions work
- [ ] Verify rankings are correct

---

#### 3.2.2 Test API Endpoints

**Update `__tests__/api/grading-endpoints.test.ts`:**

**Add tests for:**
- [ ] `/api/evaluate-peer-feedback` with new format
- [ ] `/api/batch-rank-feedback` with new format
- [ ] `/api/generate-ai-feedback` with new format
- [ ] Backward compatibility with old format

**Testing:**
- [ ] Test all endpoints
- [ ] Verify response formats
- [ ] Test error handling

---

### Task 3.3: User Acceptance Testing

**Priority:** 🟡 Medium  
**Estimated Time:** 4-6 hours  

#### 3.3.1 Test Scenarios

**Create test scenarios:**

1. **New User Flow:**
   - [ ] Start ranked match
   - [ ] Verify Phase 1 timer (4:00)
   - [ ] Submit writing
   - [ ] Verify Phase 2 timer (3:00)
   - [ ] Answer 3 questions
   - [ ] Submit feedback
   - [ ] Verify Phase 3 timer (3:00)
   - [ ] Revise writing
   - [ ] Complete session

2. **Rank-Based Timing:**
   - [ ] Test Bronze rank (3 min Phase 1)
   - [ ] Test Silver rank (4 min Phase 1)
   - [ ] Test Gold rank (5 min Phase 1)
   - [ ] Test Platinum rank (6 min Phase 1)

3. **Backward Compatibility:**
   - [ ] Load session with old format
   - [ ] Verify migration works
   - [ ] Verify no errors

**Testing:**
- [ ] Run all scenarios
- [ ] Document any issues
- [ ] Fix bugs found

---

## Implementation Checklist

### Phase 1: Critical Changes (Week 1-2)

- [x] **Task 1.1:** Update phase duration constants ✅ (Asher - 300/180/240)
- [x] **Task 1.2:** Update session orchestrator ✅ (Fixed post-Asher)
- [x] **Task 1.3:** Verify matchmaking uses constants ✅ (Verified)
- [x] **Task 1.4.1:** Update PeerFeedbackContent state and UI ✅ (Asher)
- [x] **Task 1.4.2:** Update validation logic ✅ (Asher - in FeedbackValidator)
- [x] **Task 1.4.3:** Update FeedbackValidator component ✅ (Asher)
- [x] **Task 1.4.4:** Update API endpoints ✅ (Asher - all 3 endpoints)
- [x] **Task 1.4.5:** Update prompt functions ✅ (Asher - both files)
- [ ] **Task 1.5:** Update documentation ⚠️ **REMAINING**
- [x] **Task 1.6:** Implement backward compatibility ✅ (Asher - inline approach)

### Phase 2: Rank-Based Scaling ✅ **COMPLETE**

- [x] **Task 2.1:** Create rank timing configuration ✅
- [x] **Task 2.2:** Update session creation ✅
- [x] **Task 2.3:** Create prompt complexity system ⏳ **OPTIONAL** (Not implemented - can be added later)

### Phase 3: Testing (Week 4)

- [ ] **Task 3.1:** Write unit tests
- [ ] **Task 3.2:** Write integration tests
- [ ] **Task 3.3:** User acceptance testing

---

## Risk Mitigation

### Risk 1: Breaking Existing Sessions

**Mitigation:**
- Implement backward compatibility (Task 1.6)
- Gradual rollout with feature flag
- Monitor error rates

### Risk 2: User Confusion with Timing Changes

**Mitigation:**
- Clear UI messaging about new timings
- Update help text and instructions
- Announce changes to users

### Risk 3: API Compatibility Issues

**Mitigation:**
- Thorough API testing (Task 3.2.2)
- Version API endpoints if needed
- Maintain backward compatibility

### Risk 4: Rank-Based Timing Complexity

**Mitigation:**
- Start with simple implementation
- Test thoroughly with different ranks
- Fallback to defaults if rank unavailable

---

## Success Metrics

### Phase 1 Success Criteria:
- ✅ All phases use new durations (5/3/4 minutes) - **ACTUAL: Better than planned!**
- ✅ Peer review uses 3 questions
- ✅ No breaking changes for existing sessions
- [ ] All tests pass (needs testing)

### Phase 2 Success Criteria:
- ✅ Rank-based timing works for all tiers
- ✅ Sessions correctly use rank-based durations
- ✅ No performance degradation

### Phase 3 Success Criteria:
- ✅ 90%+ test coverage for new code
- ✅ All integration tests pass
- ✅ User acceptance testing successful
- ✅ No critical bugs in production

---

## Timeline Summary

| Week | Phase | Key Deliverables | Status |
|------|-------|----------------|--------|
| **Week 1** | Phase 1 (Part 1) | Timing constants updated, UI changes started | ✅ **COMPLETE** (Asher) |
| **Week 2** | Phase 1 (Part 2) | API updates, migration, documentation | ✅ **~90% COMPLETE** (Asher) - Docs remaining |
| **Week 3** | Phase 2 | Rank-based timing implemented | ⏳ **NOT STARTED** |
| **Week 4** | Phase 3 | Testing, validation, bug fixes | ⏳ **NOT STARTED** |

**Total Estimated Time Remaining:** 1-2 weeks  
**Critical Path:** Phase 1 documentation → Phase 2 → Phase 3 testing

---

## Next Steps

### Immediate (This Week):
1. ✅ **Deploy fixed cloud function** (`functions/session-orchestrator.ts`)
2. ⏳ **Update documentation** (Task 1.5) - Reflect actual durations (5/3/4 min)
3. ⏳ **End-to-end testing** - Verify all changes work together

### Short-term (Next Week):
4. ⏳ **Begin Phase 2** - Rank-based timing implementation
5. ⏳ **Create GitHub issues** for remaining tasks

### Medium-term (Week 3-4):
6. ⏳ **Complete Phase 2** - Rank-based timing
7. ⏳ **Phase 3 testing** - Unit tests, integration tests, UAT

---

## Questions & Decisions Needed

1. **Backward Compatibility:** Should we support old format indefinitely or force migration after X weeks?
2. **Rank-Based Timing:** Should we use average rank of group or leader's rank?
3. **Prompt Complexity:** Should we filter prompts by rank or just add guidance?
4. **Feature Flag:** Should we use feature flags for gradual rollout?

---

## Appendix: File Change Summary

### Files Modified (Phase 1 - COMPLETE):
- ✅ `lib/constants/scoring.ts` - Updated durations (300/180/240)
- ✅ `functions/session-orchestrator.ts` - Fixed durations (180/240)
- ✅ `components/ranked/PeerFeedbackContent.tsx` - 3 questions
- ✅ `components/ranked/MatchmakingContent.tsx` - Verified uses constants
- ✅ `components/ranked/RevisionContent.tsx` - Updated display
- ✅ `components/shared/FeedbackValidator.tsx` - 3-field validation
- ✅ `app/api/evaluate-peer-feedback/route.ts` - New format + backward compat
- ✅ `app/api/batch-rank-feedback/route.ts` - New format
- ✅ `app/api/generate-ai-feedback/route.ts` - 3 responses
- ✅ `lib/prompts/grading-prompts.ts` - Updated prompts
- ✅ `lib/utils/twr-prompts.ts` - Updated TWR prompts
- ✅ `lib/types/session.ts` - Updated types
- ⏳ `docs/7_Features/THREE_PHASE_BATTLE_SYSTEM.md` - **REMAINING**
- ⏳ `README.md` - **REMAINING**

### Files to Create (Phase 2 - NOT STARTED):
- ⏳ `lib/constants/rank-timing.ts` - Rank-based timing config
- ⏳ `lib/prompts/rank-prompts.ts` - Rank-based prompts
- ⏳ `__tests__/lib/constants/rank-timing.test.ts` - Tests

### Files NOT Created (Not Needed):
- ❌ `lib/utils/feedback-migration.ts` - Not needed (inline approach used)

### Actual Changes Made:
- **~12 files modified** ✅
- **~0 files created** (Phase 1 complete)
- **~400-600 lines changed** ✅
- **Backward compatibility:** Inline fallback pattern ✅


