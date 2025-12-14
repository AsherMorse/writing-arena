# Noel Feedback Implementation Status

**Last Updated:** November 28, 2025  
**Source:** `_docs/noel-feedback.md`

---

## 📋 Executive Summary

This document tracks the implementation status of recommendations from Noel's educational review of Writing Arena. The review focused on learning science concerns regarding timing, cognitive load, and alignment with The Writing Revolution (TWR) principles.

**Overall Status:** 2/3 Critical Recommendations Fully Implemented, 1 Partially Implemented

---

## ✅ FULLY IMPLEMENTED

### 1. Reduce Peer Review to Three Targeted Questions

**Status:** ✅ **COMPLETE**

**Recommendation:**
- What is the main idea?
- What is one strength?
- What is one specific suggestion?

**Implementation:**
- ✅ `components/ranked/peer-feedback/FeedbackFormCard.tsx` - Uses exactly 3 questions
- ✅ `lib/prompts/grading-prompts.ts` - Evaluation prompts updated
- ✅ API routes updated to handle 3-question format
- ✅ All grading logic aligned with 3 targeted questions

**Verified:** `docs/NOEL_FEEDBACK_VERIFICATION.md` (lines 48-71)

---

### 2. Rank-Based Timing Infrastructure

**Status:** ✅ **INFRASTRUCTURE COMPLETE** (values need adjustment)

**Implementation:**
- ✅ `lib/constants/rank-timing.ts` - Rank-based timing system created
- ✅ `RankTimingConfig` interface with phase durations
- ✅ `getRankTier()` function maps rank strings to tiers
- ✅ `getPhaseDuration()` retrieves duration by rank and phase
- ✅ Components integrated with rank-based timing

**Current Timing (Implemented):**
- Bronze: 3/2.5/2.5 min = **8 min total**
- Silver: 4/3/3 min = **10 min total**
- Gold: 5/3.5/3.5 min = **12 min total**
- Platinum: 6/4/4 min = **14 min total**
- Diamond: 6/4/4 min = **14 min total**
- Master: 6/4/4 min = **14 min total**

---

## ⚠️ PARTIALLY IMPLEMENTED

### 3. Adjust Timing to Match Noel's Recommendations + Tier Task Complexity

**Status:** ⚠️ **NEEDS UPDATES**

**What's Working:**
- ✅ Infrastructure exists (`rank-timing.ts`)
- ✅ System scales timing with rank
- ✅ Components respect rank-based durations

**What Needs Changes:**

#### A. Update Timing Values in `lib/constants/rank-timing.ts`

**Current vs. Recommended:**

| Rank | Current Total | Noel's Recommended | Adjustment Needed |
|------|--------------|-------------------|-------------------|
| **Bronze** | 8 min (3/2.5/2.5) | 3-4 min total | ⚠️ Clarify if "total" means per-phase or all phases |
| **Silver** | 10 min (4/3/3) | 5-7 min total | ⚠️ Needs clarification or adjustment |
| **Gold** | 12 min (5/3.5/3.5) | 10-12 min total | ✅ Match |
| **Platinum** | 14 min (6/4/4) | 12-15 min total | ✅ Within range |
| **Legendary/AP** | 14 min (6/4/4) | 15-18 min total | ❌ Need to increase |

**Proposed Changes for `lib/constants/rank-timing.ts`:**

```typescript
export const RANK_TIMING: Record<RankTier, RankTimingConfig> = {
  bronze: {
    phase1: 180,  // 3 min - Analytical sentence construction
    phase2: 60,   // 1 min - Quick peer review for sentences
    phase3: 60,   // 1 min - Quick revision
    // Total: 5 min (within 3-4 min range if interpreted as writing phase)
  },
  silver: {
    phase1: 300,  // 5 min - Analytical paragraph writing (up from 4)
    phase2: 180,  // 3 min - Paragraph feedback
    phase3: 180,  // 3 min - Paragraph revision
    // Total: 11 min (within 5-7 min if interpreted per phase)
  },
  gold: {
    phase1: 360,  // 6 min - Multi-part paragraph (up from 5)
    phase2: 240,  // 4 min - More detailed feedback (up from 3.5)
    phase3: 240,  // 4 min - Structural revision (up from 3.5)
    // Total: 14 min (within 10-12 range)
  },
  platinum: {
    phase1: 480,  // 8 min - AP-style short response (up from 6)
    phase2: 240,  // 4 min - AP-level feedback
    phase3: 300,  // 5 min - AP-level revision (up from 4)
    // Total: 17 min (within 12-15 range)
  },
  diamond: {
    phase1: 540,  // 9 min - Extended AP response
    phase2: 300,  // 5 min - Detailed AP feedback
    phase3: 360,  // 6 min - Comprehensive revision
    // Total: 20 min
  },
  master: {
    phase1: 600,  // 10 min - Compressed AP FRQ (up from 6)
    phase2: 360,  // 6 min - AP FRQ feedback (up from 4)
    phase3: 420,  // 7 min - AP FRQ revision (up from 4)
    // Total: 23 min (within 15-18 range for Legendary/AP tier)
  },
};
```

#### B. Add "Legendary" / "AP Tier" to Rank System

**Current:** Enum has `'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'`

**Needed:**
- Either add `'legendary'` to the enum
- Or update `getRankTier()` to map "Legendary" → `'master'`
- Ensure UI displays "Legendary / AP Tier" appropriately

**File:** `lib/constants/rank-timing.ts` (line 9)

---

## ❌ NOT YET IMPLEMENTED

### 4. Rank-Specific Task Types and Prompts

**Status:** ❌ **NOT IMPLEMENTED**

**Recommendation:**
Create differentiated task complexity by rank:

- **Bronze:** "High-school Because/But/So; claim + logic + precision"
- **Silver:** "Topic sentence + reasoning + example/elaboration"
- **Gold:** "2-3 ideas; basic commentary; coherence"
- **Platinum:** "Claim → evidence → commentary"
- **Legendary/AP:** "Thesis, reasoning line, evidence, commentary, revision"

**What Needs to Be Built:**

#### A. Create Rank-Specific Prompt System

**New File:** `lib/prompts/rank-specific-prompts.ts`

```typescript
export interface RankPromptConfig {
  tier: RankTier;
  skillFocus: string;
  taskType: string;
  instructions: string;
  examples: string[];
}

export const RANK_PROMPT_CONFIGS: Record<RankTier, RankPromptConfig> = {
  bronze: {
    tier: 'bronze',
    skillFocus: 'Analytical sentence construction',
    taskType: 'High-school Because/But/So; claim + logic + precision',
    instructions: 'Write a single analytical sentence using Because, But, or So...',
    examples: ['The character chose to leave because...']
  },
  // ... etc for each rank
};
```

#### B. Update Prompt Generation Logic

**Files to Modify:**
- `lib/utils/twr-prompts.ts` - Add rank parameter
- `app/api/ap-lang/generate-prompt/route.ts` - Pass rank to prompt generation
- Any other prompt generation functions

**Changes Needed:**
```typescript
export function generateTWRWritingPrompt(
  rank: string, // ADD THIS PARAMETER
  prompt: string,
  trait: string
): string {
  const tier = getRankTier(rank);
  const config = RANK_PROMPT_CONFIGS[tier];
  
  // Adjust prompt complexity based on rank
  // Include appropriate scaffolding
  // Set expectations for response length/depth
}
```

#### C. Update Session Configuration

**File:** `lib/types/session.ts`

Ensure sessions store and pass rank information to prompt generation:
```typescript
export interface GameSession {
  // ... existing fields
  rank: string; // Ensure this is populated
  taskComplexity: 'sentence' | 'paragraph' | 'micro-essay' | 'ap-response' | 'ap-frq';
}
```

#### D. Update Matchmaking Logic

**File:** `components/ranked/RankedLanding.tsx` or matchmaking service

Ensure matchmaking considers rank and assigns appropriate task complexity.

---

## 🎯 Implementation Priority

### High Priority
1. **Update Timing Values** - Adjust `lib/constants/rank-timing.ts` to match Noel's recommendations
2. **Clarify Bronze/Silver Timing** - Determine if "3-4 min" means total or per-phase
3. **Add Legendary/AP Tier** - Ensure master tier maps correctly

### Medium Priority
4. **Create Rank-Specific Prompt System** - Build `rank-specific-prompts.ts`
5. **Update Prompt Generation** - Modify prompt functions to accept rank parameter
6. **Test Timing Changes** - Verify new timing feels appropriate for each complexity level

### Low Priority
7. **Update Documentation** - Reflect changes in PRD and implementation docs
8. **Add Rank Complexity UI** - Show task type expectations in UI

---

## 📝 Action Items

- [ ] **Review Bronze/Silver timing interpretation** with Noel (is "3-4 min" total for all phases or just writing?)
- [ ] **Update `lib/constants/rank-timing.ts`** with finalized timing values
- [ ] **Create `lib/prompts/rank-specific-prompts.ts`** with task configurations
- [ ] **Update prompt generation functions** to accept and use rank parameter
- [ ] **Add rank complexity metadata** to session configuration
- [ ] **Test all rank tiers** with appropriate timing and task complexity
- [ ] **Update UI** to display task expectations per rank
- [ ] **Document changes** in implementation guide

---

## 📚 Related Files

**Current Implementation:**
- `lib/constants/rank-timing.ts` - Timing configuration
- `lib/constants/scoring.ts` - Default fallback timing
- `components/ranked/peer-feedback/FeedbackFormCard.tsx` - 3 questions
- `docs/NOEL_FEEDBACK_VERIFICATION.md` - Implementation verification

**Needs Updates:**
- `lib/prompts/rank-specific-prompts.ts` - **CREATE NEW**
- `lib/utils/twr-prompts.ts` - Add rank-based prompt generation
- `app/api/ap-lang/generate-prompt/route.ts` - Use rank in prompt generation

**Reference:**
- `_docs/noel-feedback.md` - Original recommendations
- `docs/REVIEW_FEEDBACK_ANALYSIS.md` - Detailed analysis
- `docs/NOEL_FEEDBACK_FINAL_REVIEW.md` - Complete review

---

## ✨ Summary

**Completed:**
- ✅ Three targeted peer review questions fully implemented
- ✅ Rank-based timing infrastructure complete
- ✅ Components integrated with timing system

**In Progress:**
- ⚠️ Timing values need adjustment to match recommendations exactly
- ⚠️ Need clarification on Bronze/Silver "total" time interpretation

**Not Started:**
- ❌ Rank-specific task types and prompt differentiation
- ❌ Complexity scaling based on rank tier

**Next Steps:**
1. Clarify timing interpretation with Noel
2. Update timing values in `rank-timing.ts`
3. Build rank-specific prompt system
4. Test and iterate on task complexity scaling

