# Implementation Plan: Address Learning Science Concerns

**Created:** December 2024  
**Status:** Ready for Implementation  
**Estimated Timeline:** 3-4 weeks

---

## Overview

This plan addresses the critical learning science concerns identified in the feedback review by:
1. Increasing phase durations to 10-15 minutes total
2. Reducing peer review questions from 5 to 3
3. Implementing rank-based difficulty scaling

---

## Phase 1: Critical Timing & Peer Review Changes (Week 1-2)

### Task 1.1: Update Phase Duration Constants

**Priority:** 🔴 Critical  
**Estimated Time:** 1 hour  
**Files to Modify:**

#### 1.1.1 Update `lib/constants/scoring.ts`

**Current:**
```typescript
PHASE1_DURATION: 120,  // 2 minutes
PHASE2_DURATION: 90,   // 1.5 minutes
PHASE3_DURATION: 90,   // 1.5 minutes
```

**Change to:**
```typescript
PHASE1_DURATION: 240,  // 4 minutes
PHASE2_DURATION: 180,  // 3 minutes
PHASE3_DURATION: 180,  // 3 minutes
```

**Impact:** All components using `SCORING.PHASE1_DURATION`, etc. will automatically use new timings.

**Testing:**
- [ ] Verify timer displays correctly in Phase 1
- [ ] Verify timer displays correctly in Phase 2
- [ ] Verify timer displays correctly in Phase 3
- [ ] Verify auto-submit triggers at correct times

---

### Task 1.2: Update Session Orchestrator (Cloud Function)

**Priority:** 🔴 Critical  
**Estimated Time:** 30 minutes  
**Files to Modify:**

#### 1.2.1 Update `functions/session-orchestrator.ts`

**Current (lines 92, 107):**
```typescript
updates['config.phaseDuration'] = 90; // Phase 2 is 1.5 minutes
updates['config.phaseDuration'] = 90; // Phase 3 is 1.5 minutes
```

**Change to:**
```typescript
updates['config.phaseDuration'] = 180; // Phase 2 is 3 minutes
updates['config.phaseDuration'] = 180; // Phase 3 is 3 minutes
```

**Also update Phase 1 initialization** (if hardcoded elsewhere):
- Check `lib/services/session-manager.ts` for `startSession` function
- Ensure Phase 1 uses 240 seconds

**Testing:**
- [ ] Deploy cloud function
- [ ] Test phase transitions in real session
- [ ] Verify Firestore updates have correct phaseDuration
- [ ] Verify timing syncs correctly between server and client

---

### Task 1.3: Update Matchmaking to Use New Phase 1 Duration

**Priority:** 🔴 Critical  
**Estimated Time:** 15 minutes  
**Files to Modify:**

#### 1.3.1 Update `components/ranked/MatchmakingContent.tsx`

**Current (line 509):**
```typescript
await startSession(
  currentSessionId,
  randomPrompt.id,
  randomPrompt.type,
  SCORING.PHASE1_DURATION  // Should already use constant, verify
);
```

**Action:** Verify this uses `SCORING.PHASE1_DURATION` constant (should already be correct).

**Testing:**
- [ ] Start new ranked match
- [ ] Verify Phase 1 timer starts at 4:00
- [ ] Verify countdown and progress bar work correctly

---

### Task 1.4: Reduce Peer Review Questions from 5 to 3

**Priority:** 🔴 Critical  
**Estimated Time:** 4-6 hours  
**Files to Modify:**

#### 1.4.1 Update `components/ranked/PeerFeedbackContent.tsx`

**Current State Object (lines 99-105):**
```typescript
const [responses, setResponses] = useState({
  clarity: '',
  strengths: '',
  improvements: '',
  organization: '',
  engagement: ''
});
```

**Change to:**
```typescript
const [responses, setResponses] = useState({
  mainIdea: '',      // Renamed from clarity
  strength: '',      // Renamed from strengths (singular)
  suggestion: ''     // Renamed from improvements
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
- [ ] Verify form renders 3 questions
- [ ] Verify state updates correctly
- [ ] Verify validation works
- [ ] Verify submission includes correct fields

---

#### 1.4.2 Update Validation Logic

**Files to Modify:**

**`lib/utils/validation.ts` or `lib/utils/submission-validation.ts`**

Find `isFormComplete` or `validateFeedbackSubmission` function:

**Current (if exists):**
```typescript
export function validateFeedbackSubmission(responses: any): boolean {
  return responses.clarity?.length >= 50 &&
         responses.strengths?.length >= 50 &&
         responses.improvements?.length >= 50 &&
         responses.organization?.length >= 50 &&
         responses.engagement?.length >= 50;
}
```

**Change to:**
```typescript
export function validateFeedbackSubmission(responses: any): boolean {
  return responses.mainIdea?.length >= 50 &&
         responses.strength?.length >= 50 &&
         responses.suggestion?.length >= 50;
}
```

**Testing:**
- [ ] Verify validation passes with 3 complete responses
- [ ] Verify validation fails with incomplete responses
- [ ] Test edge cases (empty strings, whitespace)

---

#### 1.4.3 Update Feedback Validator Component

**Files to Modify:**

**`components/shared/FeedbackValidator.tsx`**

Update to check 3 fields instead of 5:

**Current:**
```typescript
const fields = ['clarity', 'strengths', 'improvements', 'organization', 'engagement'];
```

**Change to:**
```typescript
const fields = ['mainIdea', 'strength', 'suggestion'];
```

**Testing:**
- [ ] Verify validator shows correct field count
- [ ] Verify progress updates correctly
- [ ] Verify completion message appears

---

#### 1.4.4 Update API Endpoints

**Files to Modify:**

**`app/api/evaluate-peer-feedback/route.ts`**

**Current (lines 32-43):**
```typescript
function generatePeerFeedbackPrompt(responses: any, peerWriting: string): string {
  return `You are evaluating the quality of peer feedback provided by a student.

PEER'S WRITING THAT WAS EVALUATED:
${peerWriting}

STUDENT'S PEER FEEDBACK:
1. Main idea clarity: ${responses.clarity}
2. Strengths noted: ${responses.strengths}
3. Improvements suggested: ${responses.improvements}
4. Organization feedback: ${responses.organization}
5. Engagement feedback: ${responses.engagement}
```

**Change to:**
```typescript
function generatePeerFeedbackPrompt(responses: any, peerWriting: string): string {
  return `You are evaluating the quality of peer feedback provided by a student.

PEER'S WRITING THAT WAS EVALUATED:
${peerWriting}

STUDENT'S PEER FEEDBACK:
1. Main idea: ${responses.mainIdea}
2. One strength: ${responses.strength}
3. One specific suggestion: ${responses.suggestion}
```

**Update prompt evaluation criteria** to focus on the 3 questions.

**Testing:**
- [ ] Test API endpoint with new response format
- [ ] Verify scoring logic works correctly
- [ ] Verify error handling for missing fields

---

**`app/api/batch-rank-feedback/route.ts`**

**Current:** Uses `getPhase2PeerFeedbackPrompt` from `lib/prompts/grading-prompts.ts`

**Action:** Update prompt function (see Task 1.4.5)

**Testing:**
- [ ] Test batch ranking with new format
- [ ] Verify rankings are correct
- [ ] Verify scores are reasonable

---

**`app/api/generate-ai-feedback/route.ts`**

**Current:** Generates AI feedback with 5 responses

**Change to:** Generate 3 responses (mainIdea, strength, suggestion)

**Find the response structure and update:**

**Current:**
```typescript
responses: {
  clarity: string,
  strengths: string,
  improvements: string,
  organization: string,
  engagement: string
}
```

**Change to:**
```typescript
responses: {
  mainIdea: string,
  strength: string,
  suggestion: string
}
```

**Update AI prompt** to generate only 3 responses.

**Testing:**
- [ ] Verify AI generates 3 responses
- [ ] Verify responses are high quality
- [ ] Verify format matches user submission format

---

#### 1.4.5 Update Prompt Functions

**Files to Modify:**

**`lib/prompts/grading-prompts.ts`**

**Current `getPhase2PeerFeedbackPrompt` (lines 109-171):**

**Change response structure:**
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

**Testing:**
- [ ] Test prompt generation with new format
- [ ] Verify AI evaluation works correctly
- [ ] Verify scoring is fair and accurate

---

**`lib/utils/twr-prompts.ts`**

**Find `generateTWRPeerFeedbackPrompt` function and update similarly:**

**Change response structure to:**
```typescript
responses: {
  mainIdea: string,
  strength: string,
  suggestion: string
}
```

**Testing:**
- [ ] Verify TWR prompt works with new format
- [ ] Test TWR evaluation logic

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

**Priority:** 🟡 Medium  
**Estimated Time:** 2-3 hours  

#### 1.6.1 Handle Existing Sessions

**Issue:** Sessions in progress may have old 5-question format.

**Solution Options:**

**Option A: Graceful Degradation**
- Check if responses have old format (clarity, strengths, etc.)
- Convert to new format if possible
- Use empty strings for missing fields

**Option B: Force Migration**
- Mark old sessions as "legacy"
- Show message to users
- Prevent new submissions with old format

**Option C: Dual Support (Recommended)**
- Support both formats temporarily
- Convert old to new on read
- Write always uses new format

**Implementation (Option C):**

**Create migration utility: `lib/utils/feedback-migration.ts`:**

```typescript
export interface OldFeedbackFormat {
  clarity?: string;
  strengths?: string;
  improvements?: string;
  organization?: string;
  engagement?: string;
}

export interface NewFeedbackFormat {
  mainIdea: string;
  strength: string;
  suggestion: string;
}

export function migrateFeedbackFormat(
  oldResponses: OldFeedbackFormat | NewFeedbackFormat
): NewFeedbackFormat {
  // If already new format, return as-is
  if ('mainIdea' in oldResponses) {
    return oldResponses as NewFeedbackFormat;
  }
  
  // Convert old format to new
  const old = oldResponses as OldFeedbackFormat;
  return {
    mainIdea: old.clarity || '',
    strength: old.strengths || old.organization || '', // Combine if needed
    suggestion: old.improvements || old.engagement || '',
  };
}
```

**Update components to use migration:**
- `PeerFeedbackContent.tsx`: Migrate on load
- API endpoints: Migrate before processing

**Testing:**
- [ ] Test with old format data
- [ ] Test with new format data
- [ ] Test with mixed data
- [ ] Verify no data loss

---

## Phase 2: Rank-Based Difficulty Scaling (Week 3-4)

### Task 2.1: Create Rank-Based Timing Configuration

**Priority:** 🟡 Medium  
**Estimated Time:** 2-3 hours  
**Files to Create/Modify:**

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

- [ ] **Task 1.1:** Update phase duration constants
- [ ] **Task 1.2:** Update session orchestrator
- [ ] **Task 1.3:** Verify matchmaking uses constants
- [ ] **Task 1.4.1:** Update PeerFeedbackContent state and UI
- [ ] **Task 1.4.2:** Update validation logic
- [ ] **Task 1.4.3:** Update FeedbackValidator component
- [ ] **Task 1.4.4:** Update API endpoints
- [ ] **Task 1.4.5:** Update prompt functions
- [ ] **Task 1.5:** Update documentation
- [ ] **Task 1.6:** Implement backward compatibility

### Phase 2: Rank-Based Scaling (Week 3-4)

- [ ] **Task 2.1:** Create rank timing configuration
- [ ] **Task 2.2:** Update session creation
- [ ] **Task 2.3:** Create prompt complexity system (optional)

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
- ✅ All phases use new durations (4/3/3 minutes)
- ✅ Peer review uses 3 questions
- ✅ No breaking changes for existing sessions
- ✅ All tests pass

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

| Week | Phase | Key Deliverables |
|------|-------|----------------|
| **Week 1** | Phase 1 (Part 1) | Timing constants updated, UI changes started |
| **Week 2** | Phase 1 (Part 2) | API updates, migration, documentation |
| **Week 3** | Phase 2 | Rank-based timing implemented |
| **Week 4** | Phase 3 | Testing, validation, bug fixes |

**Total Estimated Time:** 3-4 weeks  
**Critical Path:** Phase 1 must be completed before Phase 2

---

## Next Steps

1. **Review this plan** with team
2. **Prioritize tasks** based on resources
3. **Create GitHub issues** for each task
4. **Assign owners** to tasks
5. **Begin implementation** with Phase 1, Task 1.1

---

## Questions & Decisions Needed

1. **Backward Compatibility:** Should we support old format indefinitely or force migration after X weeks?
2. **Rank-Based Timing:** Should we use average rank of group or leader's rank?
3. **Prompt Complexity:** Should we filter prompts by rank or just add guidance?
4. **Feature Flag:** Should we use feature flags for gradual rollout?

---

## Appendix: File Change Summary

### Files to Modify:
- `lib/constants/scoring.ts`
- `functions/session-orchestrator.ts`
- `components/ranked/PeerFeedbackContent.tsx`
- `components/ranked/MatchmakingContent.tsx`
- `lib/utils/submission-validation.ts`
- `components/shared/FeedbackValidator.tsx`
- `app/api/evaluate-peer-feedback/route.ts`
- `app/api/batch-rank-feedback/route.ts`
- `app/api/generate-ai-feedback/route.ts`
- `lib/prompts/grading-prompts.ts`
- `lib/utils/twr-prompts.ts`
- `docs/7_Features/THREE_PHASE_BATTLE_SYSTEM.md`
- `README.md`

### Files to Create:
- `lib/utils/feedback-migration.ts`
- `lib/constants/rank-timing.ts`
- `lib/prompts/rank-prompts.ts`
- `__tests__/lib/constants/rank-timing.test.ts`
- `__tests__/lib/utils/feedback-migration.test.ts`

### Estimated Total Changes:
- **~15 files modified**
- **~5 files created**
- **~500-800 lines changed**
- **~200-300 lines added**


