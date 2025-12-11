# Rank System Implementation Plan

**Status**: Ready to Implement  
**Date**: December 11, 2025  
**Estimated Time**: 12-16 hours (~2-3 days)

---

## Overview

Replace the Bronze/Silver/Gold rank system with a skill-based Scribe/Scholar/Loremaster system that gates writing modes based on demonstrated mastery.

**Migration Strategy**: No migration — all users reset to Scribe III with 65 LP.

---

## Phase 1: Foundation ✅ COMPLETE
**Goal:** Add new types and utilities without breaking existing code  
**Time:** 1-2 hours

### 1.1 Types (`lib/types/index.ts`)
- [x] Add `SkillLevel = 'scribe' | 'scholar' | 'loremaster'`
- [x] Add `SkillTier = 1 | 2 | 3`
- [x] Add `SubmissionLevel = 'paragraph' | 'essay' | 'essay_passage'`
- [x] Add optional fields to `UserProfile`: `skillLevel?`, `skillTier?`, `tierLP?`
- [x] Keep `currentRank`, `rankLP` temporarily (backward compatibility)

### 1.2 Utilities (`lib/utils/score-calculator.ts`)
- [x] Add `getThreshold(tier: SkillTier): number`
- [x] Add `getEffectiveScore(original: number, revised?: number): number`
- [x] Add `calculateTierLP(effectiveScore: number, threshold: number): number`
- [x] Add `calculatePracticeLP(effectiveScore: number, threshold: number): number`
- [x] Add `getRankDisplayName(level: SkillLevel, tier: SkillTier): string`
- [x] Add `getRequiredMode(level: SkillLevel): SubmissionLevel`
- [x] Add `canAccessModeInRanked(userLevel: SkillLevel, mode: SubmissionLevel): boolean`
- [x] Add `getSkillLevelForMode(mode: SubmissionLevel): SkillLevel` (bonus)
- [x] Add `isHigherLevel(level: SkillLevel, compareTo: SkillLevel): boolean` (bonus)

### 1.3 Constants (`lib/utils/rank-constants.ts` — new file)
- [x] Created with all constants:
```typescript
export const TIER_LP_CAP = 100;
export const TIER_LP_START = 65;
export const LP_MIN = -15;
export const LP_MAX = 20;
export const LP_BASE = 10;
export const REVISION_WEIGHT = 0.1;
export const PRACTICE_LP_MULTIPLIER = 0.25;
export const LESSON_MASTERY_LP = 5;

export const THRESHOLDS = {
  3: 70,  // Tier 3 threshold
  2: 80,  // Tier 2 threshold
  1: 90,  // Tier 1 threshold
} as const;

export const SKILL_LEVELS = ['scribe', 'scholar', 'loremaster'] as const;
export const TIER_DISPLAY = { 1: 'I', 2: 'II', 3: 'III' } as const;
```

---

## Phase 2: Core Logic ✅ COMPLETE
**Goal:** Implement new rank progression system  
**Time:** 3-4 hours

### 2.1 Rank Transitions (`lib/services/rank-system.ts` — new file)
- [x] `promoteRank(level: SkillLevel, tier: SkillTier): { level, tier }`
- [x] `demoteRank(level: SkillLevel, tier: SkillTier): { level, tier }`
- [x] `applyLPChange(currentLevel, currentTier, currentTierLP, lpChange): RankUpdate`
  - Returns `{ newLevel, newTier, newTierLP, change: 'promoted' | 'demoted' | 'none' }`
- [x] `getDefaultRank()` — returns Scribe III, 65 LP (bonus)
- [x] `isMaxRank()`, `isMinRank()` — boundary checks (bonus)

### 2.2 User Profile Updates (`lib/services/user-profile.ts`)
- [x] Add `updateRankAfterRankedSubmission(userId, originalScore, revisedScore?, wordCount?)` — new function
- [x] Add `updateRankAfterPracticeSubmission(userId, originalScore, revisedScore?, wordCount?)` — new function  
- [x] Add `updateRankAfterLessonMastery(userId)` — +5 LP flat
- [x] Update `createUserProfile()` — default to Scribe III, 65 LP
- [x] Update `getUserProfile()` — default missing fields to Scribe III, 65 LP
- [x] Added `RankUpdateResult` interface for return type
- [x] Marked legacy functions with `@deprecated` and renamed imports to `legacyPromoteRank`/`legacyDemoteRank`

---

## Phase 3: Submission Flows ✅ COMPLETE
**Goal:** Wire up new LP logic to ranked and practice  
**Time:** 3-4 hours

### 3.1 Ranked Flow (`app/fantasy/ranked/page.tsx`)
- [x] Import `updateRankAfterRankedSubmission` and `RankUpdateResult`
- [x] Add `rankUpdate` state for UI feedback
- [x] Update `submitWriting()` - creates submission with lpEarned = 0 (LP awarded after revision)
- [x] Update `submitRevision()` - awards tier LP using effective score (90% original + 10% revised)
- [x] **Revision is required** - users must complete revision to earn tier LP
- [x] Fixed `createRankedSubmission` to accept `SubmissionLevel` type

### 3.2 Practice Flow (`app/fantasy/practice/paragraph/page.tsx`)
- [x] Import `updateRankAfterPracticeSubmission`
- [x] Update `submitWriting()` - creates submission with no LP awarded yet
- [x] Update `submitRevision()` - awards tier LP using effective score (90% original + 10% revised)
- [x] **Revision is required** - consistent with ranked mode
- [x] Quarter LP, no negative (handled by function)

### 3.3 Lesson Mastery (`lib/services/practice-mastery.ts`)
- [x] Import `updateRankAfterLessonMastery`
- [x] Call on first mastery (`isFirstMastery` check)
- [x] +5 tier LP bonus on mastery
- [x] Updated `updateRankAfterLessonMastery` to NOT increment `stats.lessonsCompleted` (handled by `updateMastery`)

---

## Phase 4: Mode Locking ✅ COMPLETE
**Goal:** Enforce mode restrictions in ranked  
**Time:** 1-2 hours

### 4.1 Ranked Mode Selection
- [x] Check user's `skillLevel` before allowing mode selection
- [x] Scribe → paragraph only
- [x] Scholar → essay only  
- [x] Loremaster → essay_passage only (shows "Coming Soon" - mode not yet available)
- [x] Show user's rank and mode on prompt screen
- [x] Dynamic timer based on mode (paragraph: 7+2 min, essay: 10+3 min)

### 4.2 Practice Mode Selection
- [x] All modes available regardless of rank (verified - no restrictions in practice)
- [x] Practice landing page shows both Paragraph and Essay options freely

---

## Phase 5: UI Updates ✅ COMPLETE
**Goal:** Display new rank format everywhere  
**Time:** 2-3 hours

### 5.1 High Priority (user-facing)
- [x] `DashboardStats.tsx` — shows "Scribe III" with tierLP/100
- [x] `RankedLanding.tsx` — tier LP progress bar, new skill ladder (Scribe/Scholar/Loremaster)
- [x] `ProfileSettingsModal.tsx` — shows new rank format and tierLP
- [x] `FantasyHomeContent.tsx` — PlayerPanel with new rank display and LP in progress bar

### 5.2 Medium Priority (skipped - old ranked flow)
- [ ] `WritingSessionContent.tsx` — session rank display (legacy flow)
- [ ] `RevisionContent.tsx` — revision phase rank (legacy flow)
- [ ] `MatchmakingContent.tsx` — matchmaking display (legacy flow)

### 5.3 Helper Component (optional)
- [ ] Create `<RankBadge level={} tier={} />` component for consistency

---

## Phase 6: Fallback Handling ✅ COMPLETE
**Goal:** Handle existing users gracefully  
**Time:** 30 min

### 6.1 Default Values
- [x] `getUserProfile()` returns Scribe III, 65 LP if new fields missing (done in Phase 2)
- [x] UI components handle undefined `skillLevel`/`skillTier` gracefully (done in Phase 5)
- [x] Migration script created and run (`scripts/migrate-rank-system.js`) - all 9 users migrated

---

## Phase 7: Testing
**Goal:** Verify correctness  
**Time:** 2-3 hours

### 7.1 Unit Tests
- [ ] `getEffectiveScore()` — weighted calculation (90/10 split)
- [ ] `calculateTierLP()` — all threshold boundaries (+20 to -15)
- [ ] `calculatePracticeLP()` — quarter LP, floor at 0
- [ ] `promoteRank()` — all transitions including cross-level
- [ ] `demoteRank()` — all transitions, floor at Scribe III

### 7.2 Integration Tests
- [ ] Full ranked submission → LP change → rank update
- [ ] Promotion: Scribe I (90%+) → Scholar III
- [ ] Demotion: Scholar III (below 70%) → Scribe I (re-locks essay)
- [ ] Practice: no negative LP possible
- [ ] Lesson mastery: +5 LP applied correctly

### 7.3 Edge Cases
- [ ] Scribe III cannot demote further
- [ ] Loremaster I at 100 LP stays at max
- [ ] Exactly at threshold (70%, 80%, 90%) → +10 LP

---

## Phase 8: Cleanup
**Goal:** Remove deprecated code  
**Time:** 1-2 hours

### 8.1 Remove Old Rank Fields (after stable)
- [ ] Remove `currentRank`, `rankLP` from `UserProfile` type
- [ ] Remove from `createUserProfile()`
- [ ] Remove from `getUserProfile()` parsing

### 8.2 Remove Old Functions
- [ ] Remove or deprecate old `calculateRankedLP()`
- [ ] Remove old `promoteRank()`/`demoteRank()` from `ai-students.ts`
- [ ] Remove `calculateLPChange()`, `calculateXPEarned()`, `calculatePointsEarned()`

### 8.3 Remove Traits System
- [ ] Remove `traits` from `UserProfile` type
- [ ] Remove `traits` from `AIStudent` type
- [ ] Remove default traits from `createUserProfile()`
- [ ] Remove traits loading from `getUserProfile()`
- [ ] Remove `DashboardTraits.tsx` component
- [ ] Remove traits check from `DashboardChecklist.tsx`
- [ ] Remove traits from quick-match `ResultsContent.tsx`
- [ ] Update/remove traits-related tests

---

## File Changes Summary

| File | Action |
|------|--------|
| `lib/types/index.ts` | Add new types |
| `lib/utils/score-calculator.ts` | Add new functions |
| `lib/utils/rank-constants.ts` | **New file** |
| `lib/services/rank-system.ts` | **New file** |
| `lib/services/user-profile.ts` | Update functions |
| `lib/services/practice-mastery.ts` | Add LP on mastery |
| `app/fantasy/ranked/page.tsx` | New LP flow |
| `components/dashboard/DashboardStats.tsx` | UI update |
| `components/ranked/RankedLanding.tsx` | UI update |
| `components/shared/ProfileSettingsModal.tsx` | UI update |
| `components/fantasy/FantasyHomeContent.tsx` | UI update |
| + 6-8 more component files | UI updates |

---

## Recommended Merge Order

1. **Phase 1** → merge to main (no behavior change, just new types/utils)
2. **Phase 2** → merge to main (new service functions, unused yet)
3. **Phase 3 + 4 + 5** → feature branch `feat/rank-system`
4. **Phase 6** → same feature branch
5. **Phase 7** → test thoroughly before merge
6. **Phase 8** → cleanup PR after 1 week stable

---

## Rollback Plan

If issues arise:
1. Revert to reading `currentRank`/`rankLP` fields
2. Old data still exists in Firestore
3. New fields are optional, so old code still works

---

## Success Criteria

- [ ] Users see "Scribe III" rank on first load
- [ ] Ranked mode is locked to current skill level
- [ ] Practice mode allows all modes
- [ ] LP calculation uses effective score (90% original + 10% revised)
- [ ] Promotion at 100 LP, demotion at 0 LP
- [ ] Cross-level transitions work correctly
- [ ] Lesson mastery grants +5 LP
- [ ] No negative LP in practice mode
