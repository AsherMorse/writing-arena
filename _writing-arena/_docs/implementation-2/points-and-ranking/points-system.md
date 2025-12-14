# Points System Consolidation

**Status**: In Progress  
**Date**: December 10, 2025

---

## Overview

We've consolidated from a three-currency system (LP, XP, Points) to a **single-currency LP system** to simplify progression and enable daily leaderboards.

---

## Previous System (DEPRECATED)

| Currency | Purpose | Source |
|----------|---------|--------|
| **LP** | Rank progression (100 LP → rank up) | Ranked matches (placement-based: +35/-15) |
| **XP** | Character progression, cosmetics | Ranked matches only |
| **Points** | Unclear purpose | Ranked matches |

**Problems:**
- Three overlapping currencies with unclear purposes
- No daily leaderboard tracking
- Points/XP were redundant with LP

---

## New System (Current)

### Single Currency: LP (League Points)

| Purpose | How It Works |
|---------|--------------|
| **Rank Progression** | Cumulative LP on user profile (100 LP → rank up) |
| **Daily Leaderboard** | Sum of `lpEarned` from today's submissions |

### LP Calculation (Score-Based)

```typescript
// From lib/utils/score-calculator.ts
export function calculateRankedLP(score: number): number {
  if (score === 100) return 20;   // Perfect
  if (score >= 90) return 15;     // Excellent
  if (score >= 80) return 12;     // Good
  if (score >= 70) return 8;      // Passing
  if (score >= 60) return 5;      // Needs work
  return 2;                       // Incomplete
}
```

**Key Changes:**
- LP is now **score-based** (not placement-based)
- Always positive (encourages unlimited play)
- Same calculation for daily leaderboard + rank progression

---

## Schema Changes

### RankedSubmission

```typescript
export interface RankedSubmission {
  id: string;
  userId: string;
  promptId: string;
  
  // NEW FIELDS (temporarily optional for migration)
  level?: 'paragraph' | 'essay';  // For split leaderboards
  lpEarned?: number;               // Score-based LP (2-20)
  
  originalContent: string;
  originalScore: number;
  originalFeedback: Record<string, unknown>;
  revisedContent?: string;
  revisedScore?: number;
  revisedFeedback?: Record<string, unknown>;
  submittedAt: Timestamp;
  completedAt?: Timestamp;
}
```

### UserProfile

```typescript
export interface UserProfile {
  // LP tracking
  rankLP: number;           // Rank progress (0-100, resets on rank up)
  totalLP: number;          // NEW: Lifetime LP earned (never resets)
  currentRank: string;      // 'Bronze III', 'Silver II', etc.
  
  // REMOVED FIELDS:
  // totalPoints: number;    // ✅ Removed
  // totalXP: number;        // ✅ Removed
  // characterLevel: number; // ✅ Removed
}
```

---

## Daily Leaderboard Query

### Paragraph Leaderboard
```typescript
const submissions = query(
  collection(db, 'rankedSubmissions'),
  where('level', '==', 'paragraph'),
  where('submittedAt', '>=', startOfToday),
);

// Group by userId, sum lpEarned
```

### Essay Leaderboard
```typescript
const submissions = query(
  collection(db, 'rankedSubmissions'),
  where('level', '==', 'essay'),
  where('submittedAt', '>=', startOfToday),
);

// Group by userId, sum lpEarned
```

---

## Implementation Status

### ✅ Completed
- [x] Add `level` + `lpEarned` to `RankedSubmission` type (optional)
- [x] Add `totalLP` to `UserProfile` type
- [x] Add `calculateRankedLP()` utility function
- [x] Update `createRankedSubmission()` to accept new fields
- [x] Update `updateRankedSubmission()` to accept new fields
- [x] Update ranked page to calculate and pass LP
- [x] Remove `totalPoints`/`totalXP` from `UserProfile` type
- [x] Update `createUserProfile()` to use totalLP
- [x] Add `updateUserStatsAfterRanked()` for ranked LP tracking
- [x] Update `DailyChampions` to query by daily LP sum
- [x] Update `PlayerPanel` to show Daily LP and Total LP
- [x] Deprecate `updateUserStatsAfterSession()` (marked with @deprecated)
- [x] Update UI to show LP instead of Points/XP (Header, ProfileSettings, Dashboard)

### ⏳ In Progress
- [ ] Backfill existing submissions with `level` field
- [ ] Make `level` + `lpEarned` required (after migration)

### 📝 Future
- [ ] Add historical leaderboard (weekly, monthly)
- [ ] Track LP earned per day for analytics

---

## Migration Strategy

### Phase 1: Additive (Current)
- New fields are **optional**
- Old submissions still work without `level`/`lpEarned`
- New submissions include both fields

### Phase 2: Backfill
- Script to add `level` to existing submissions (lookup from prompt)
- Calculate `lpEarned` from `originalScore`/`revisedScore`

### Phase 3: Required
- Make fields non-optional
- Remove XP/Points from all services
- Launch daily leaderboard

---

## Benefits

1. **Simpler Mental Model**
   - One number to track: LP
   - Same number used for both progression and competition

2. **Encourages Play**
   - LP always positive (no losses)
   - Want more LP? Play more battles

3. **Fair Competition**
   - Daily leaderboard = skill + volume
   - Good writers who play a lot → top of leaderboard
   - Bad writers can't game it (low scores = low LP)

4. **Clean Separation**
   - Lessons give LP (for rank progression)
   - Ranked gives LP (for rank + leaderboard)
   - Practice gives LP (for rank only, if we add it)

---

## Related Files

- `lib/types/index.ts` - Type definitions
- `lib/services/ranked-submissions.ts` - Submission CRUD
- `lib/utils/score-calculator.ts` - LP calculation
- `app/fantasy/ranked/page.tsx` - Ranked battle flow
- `lib/services/user-profile.ts` - User profile management

---

## Why Pure Sum Works for Daily Leaderboard

**Question:** Won't grinders dominate over skilled writers?

**Answer:** No, because of the **skill gap blocking system**:

| Scenario | What Happens |
|----------|--------------|
| Student writes 20 battles at 60% | Gets blocked multiple times → Must complete lessons → Gets unblocked → Repeats |
| Student writes 5 battles at 95% | Earns 75 LP easily, no blocking |

**20 battles at 60% (40 LP) means:**
- 20 paragraphs written (massive practice!)
- Multiple blocking events (forced skill improvement)
- Multiple lesson completions (targeted learning)
- Tons of AI feedback cycles
- Result: **Productive volume, not mindless grinding**

**5 battles at 95% (75 LP) still beats them** because quality matters more than quantity.

### LP Earned Examples

| Battles | Avg Score | LP Each | Total Daily LP |
|---------|-----------|---------|----------------|
| 1 | 100% | 20 | **20 LP** |
| 3 | 90% | 15 | **45 LP** |
| 5 | 80% | 12 | **60 LP** |
| 10 | 70% | 8 | **80 LP** |
| 20 | 60% | 5 | **100 LP** (with blocking!) |

**Skill still wins**, but effort is rewarded.

---

**Next Steps:**
1. ✅ ~~Remove XP/Points from user-profile service~~ Done
2. ✅ ~~Update UI to show LP only~~ Done
3. ✅ ~~Build daily leaderboard component~~ Done (DailyChampions)
4. ⏳ Run migration script for existing data
5. ⏳ Make `level` + `lpEarned` required fields
