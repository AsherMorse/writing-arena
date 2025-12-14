# Grader Results Page Implementation Plan

> **Status**: ✅ Implementation Complete  
> **Branch**: `improve-section`  
> **Date**: December 3, 2025

---

## Implementation Checklist

### Phase 1: Types & Service Layer
- [x] Create `lib/types/grading-history.ts`
- [x] Create `lib/services/grading-history.ts`

### Phase 2: API Endpoint
- [x] Create `app/api/grade-revision/route.ts`

### Phase 3: Results Page & Components
- [x] Create `app/ranked/results-v2/page.tsx`
- [x] Create `components/ranked/ResultsContentV2.tsx`
- [x] Create `components/ranked/results-v2/ScorecardDisplay.tsx`
- [x] ~~Create `components/ranked/results-v2/ParagraphScorecard.tsx`~~ (included in ScorecardDisplay)
- [x] Create `components/ranked/results-v2/GapDetectionSummary.tsx`
- [x] ~~Create `components/ranked/results-v2/RecommendedLessons.tsx`~~ (included in GapDetectionSummary)
- [x] Create `components/ranked/results-v2/BlockModal.tsx`

### Phase 4: Integration
- [x] Modify `RevisionContent.tsx` to trigger grading on submit
- [x] Update navigation to `/ranked/results-v2`

### Phase 5: Block Flow
- [x] Add block check to `RankedLanding.tsx`
- [x] Add block check to "Play Again" button (in ResultsContentV2)

---

## Overview

Create a new results page (`/ranked/results-v2`) that uses the TWR paragraph/essay grader on Phase 3 revision content, stores grading history in Firestore, and tracks skill gaps for future practice recommendations.

### Goals

1. **New Results Page** - Display detailed TWR scorecard with category breakdowns
2. **Persistent Storage** - Track grading history in user profile for pattern analysis
3. **Gap Detection** - Identify skill gaps and recommend practice lessons
4. **Block Flow** - Prevent users with severe/accumulated gaps from playing ranked until they complete practice

---

## Design Decisions

| Question | Decision |
|----------|----------|
| Page location | `/ranked/results-v2/page.tsx` (parallel to current) |
| Toggle location | Header on writing page (hardcoded to paragraph for now) |
| Grading phase | Phase 3 (revision) only |
| Storage location | `users/{userId}/gradingHistory/` |
| Paragraph severity | Score ≤2 out of 5 = severe |
| Essay severity | Any "No" score = severe |
| Accumulated threshold | 3+ medium gaps per criterion (all-time) |
| Block locations | Ranked landing page + "Play Again" button |
| Block UI | Modal with lesson redirect |
| Scope | Ranked matches only |

---

## Files to Create

### 1. New Results Page

**File**: `app/ranked/results-v2/page.tsx`

Simple page wrapper (mirrors current results page structure).

```tsx
import { Suspense } from 'react';
import ResultsContentV2 from '@/components/ranked/ResultsContentV2';

export default function RankedResultsV2Page() {
  return (
    <Suspense fallback={<LoadingState variant="analyzing" />}>
      <ResultsContentV2 />
    </Suspense>
  );
}
```

---

### 2. New Results Content Component

**File**: `components/ranked/ResultsContentV2.tsx`

Main component that adapts current `ResultsContent.tsx` with:
- Fetches grading result from history on mount
- Displays TWR scorecard (paragraph or essay format)
- Shows gap detection results with severity indicators
- Shows recommended lessons with links to `/practice/[lessonId]`
- Keeps existing rankings, LP change, and XP display

---

### 3. Scorecard Display Components

**Directory**: `components/ranked/results-v2/`

| File | Purpose |
|------|---------|
| `ScorecardDisplay.tsx` | Main wrapper that switches between paragraph/essay |
| `ParagraphScorecard.tsx` | 4-category display with 0-5 score bars |
| `EssayCriteriaList.tsx` | Yes/Developing/No criteria list |
| `GapDetectionSummary.tsx` | Gaps with severity badges + lesson recommendations |
| `RecommendedLessons.tsx` | Links to `/practice/[lessonId]` with CTAs |
| `BlockModal.tsx` | Modal shown when user is blocked from ranked |

---

### 4. Grading History Service

**File**: `lib/services/grading-history.ts`

```typescript
/**
 * @fileoverview Service for storing and retrieving grading history.
 * Tracks skill gaps over time for practice recommendations.
 */

/**
 * @description Save a grading result to the user's history.
 */
export async function saveGradingResult(
  userId: string,
  result: GradingHistoryEntry
): Promise<string>;

/**
 * @description Fetch all grading history for a user.
 */
export async function getGradingHistory(
  userId: string,
  limit?: number
): Promise<GradingHistoryEntry[]>;

/**
 * @description Get the most recent grading result for a match.
 */
export async function getGradingResultByMatch(
  userId: string,
  matchId: string
): Promise<GradingHistoryEntry | null>;

/**
 * @description Aggregate gaps per criterion across all history.
 */
export async function getAccumulatedGaps(
  userId: string
): Promise<AccumulatedGap[]>;

/**
 * @description Check if user is blocked from ranked matches.
 */
export async function checkBlockStatus(
  userId: string
): Promise<BlockStatus>;

/**
 * @description Mark gaps as resolved after completing practice.
 */
export async function resolveGaps(
  userId: string,
  criterion: string
): Promise<void>;
```

---

### 5. Grading History Types

**File**: `lib/types/grading-history.ts`

```typescript
/**
 * @fileoverview Type definitions for grading history storage.
 */

import type { Timestamp } from 'firebase/firestore';
import type { ParagraphScorecard, SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssayScorecard, EssaySkillGap } from '@/lib/grading/essay-rubrics';

/**
 * @description Single grading history entry stored per session.
 */
export interface GradingHistoryEntry {
  id: string;
  timestamp: Timestamp;
  matchId: string;
  phase: 1 | 3;
  graderType: 'paragraph' | 'essay';
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  hasSevereGap: boolean;
  writingContent: string;
}

/**
 * @description Aggregated gap data for pattern detection.
 */
export interface AccumulatedGap {
  criterion: string;
  count: number;
  severity: 'high' | 'medium';
  recommendedLessons: string[];
  lastOccurrence: Timestamp;
}

/**
 * @description Result of block status check.
 */
export interface BlockStatus {
  isBlocked: boolean;
  reason: 'severe_gap' | 'accumulated_gaps' | null;
  blockingCriteria: string[];
  requiredLessons: string[];
}

/**
 * @description Input for grading API.
 */
export interface GradeRevisionInput {
  matchId: string;
  userId: string;
  content: string;
  prompt: string;
  graderType: 'paragraph' | 'essay';
  gradeLevel?: number;
}

/**
 * @description Response from grading API.
 */
export interface GradeRevisionResponse {
  success: boolean;
  gradingId: string;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  hasSevereGap: boolean;
  blockStatus: BlockStatus;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}
```

---

### 6. API Endpoint for Grading + Storage

**File**: `app/api/grade-revision/route.ts`

```typescript
/**
 * @fileoverview API endpoint that grades revision content and stores results.
 * 
 * POST /api/grade-revision
 * Body: { matchId, userId, content, prompt, graderType, gradeLevel? }
 * Returns: GradeRevisionResponse
 */

export async function POST(request: NextRequest) {
  // 1. Parse and validate request body
  // 2. Call gradeParagraph() or gradeEssay() based on graderType
  // 3. Run gap detection (detectGapsFromScorecard or detectGapsFromEssayScorecard)
  // 4. Determine if there's a severe gap
  // 5. Save to users/{userId}/gradingHistory/
  // 6. Check accumulated gaps for block status
  // 7. Return full result + block status
}
```

---

## Files to Modify

### 1. RevisionContent.tsx

**Location**: `components/ranked/RevisionContent.tsx`

Add grading call after successful Phase 3 submit:

```typescript
// In handleSubmit or useBatchRankingSubmission callback
const gradeResponse = await fetch('/api/grade-revision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    matchId,
    userId: user.uid,
    content: revisedContent,
    prompt: sessionConfig?.prompt || '',
    graderType: 'paragraph', // hardcoded for now
  }),
});

// Store grading ID for results page to fetch
const { gradingId } = await gradeResponse.json();
setSessionStorage('lastGradingId', gradingId);
```

---

### 2. Navigation to results-v2

**Location**: `components/ranked/RevisionContent.tsx`

Change navigation target:

```typescript
// Before
router.push(buildResultsURL({ ... }));

// After
router.push(`/ranked/results-v2?matchId=${matchId}`);
```

---

### 3. RankedLanding.tsx

**Location**: `components/ranked/RankedLanding.tsx`

Add block check before "Start Match":

```typescript
import { checkBlockStatus } from '@/lib/services/grading-history';

const handleStartMatch = async () => {
  if (!user) return;
  
  const blockStatus = await checkBlockStatus(user.uid);
  if (blockStatus.isBlocked) {
    setBlockModalData(blockStatus);
    setShowBlockModal(true);
    return;
  }
  
  // Continue with normal match start flow
  // ...
};
```

---

### 4. ResultsContentV2.tsx - "Play Again" button

Add same block check:

```typescript
const handlePlayAgain = async () => {
  const blockStatus = await checkBlockStatus(user.uid);
  if (blockStatus.isBlocked) {
    setBlockModalData(blockStatus);
    setShowBlockModal(true);
    return;
  }
  
  router.push('/ranked');
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RANKED MATCH FLOW                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User submits Phase 3 revision                                   │
│  (RevisionContent.tsx → handleSubmit)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/grade-revision                                        │
│  { matchId, userId, content, prompt, graderType: 'paragraph' }  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  API calls gradeParagraph(content, prompt, 'expository')        │
│  → Returns ParagraphGradingResult                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  API calls detectGapsFromScorecard(scorecard)                   │
│  → Returns GapDetectionResult                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  API saves to Firestore:                                         │
│  users/{userId}/gradingHistory/{gradingId}                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  API checks accumulated gaps → returns BlockStatus               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Navigate to /ranked/results-v2?matchId=xxx                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ResultsContentV2 fetches grading result from history           │
│  → Displays scorecard + gaps + lessons + rankings + LP/XP       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User clicks "Play Again"                                        │
│  → Check blockStatus                                             │
│  → If blocked: show modal → redirect to /practice               │
│  → If not blocked: navigate to /ranked                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Firestore Structure

### Grading History Collection

**Path**: `users/{userId}/gradingHistory/{gradingId}`

```json
{
  "timestamp": "2025-12-03T10:30:00Z",
  "matchId": "match-abc123",
  "phase": 3,
  "graderType": "paragraph",
  "scorecard": {
    "rubricId": "expository",
    "categories": [
      {
        "title": "Topic Sentence",
        "score": 4,
        "maxScore": 5,
        "feedback": "Clear topic sentence that introduces the main idea..."
      },
      {
        "title": "Detail Sentences",
        "score": 2,
        "maxScore": 5,
        "feedback": "Supporting details need more development..."
      },
      {
        "title": "Concluding Sentence",
        "score": 3,
        "maxScore": 5,
        "feedback": "Conclusion restates the topic but could be stronger..."
      },
      {
        "title": "Conventions",
        "score": 5,
        "maxScore": 5,
        "feedback": "Excellent grammar and mechanics throughout."
      }
    ],
    "totalScore": 14,
    "maxScore": 20,
    "percentageScore": 70
  },
  "gaps": [
    {
      "category": "Detail Sentences",
      "score": 2,
      "maxScore": 5,
      "severity": "high",
      "recommendedLessons": [
        "writing-spos",
        "eliminate-irrelevant-sentences",
        "elaborate-paragraphs"
      ],
      "feedback": "Supporting details need more development..."
    }
  ],
  "hasSevereGap": true,
  "writingContent": "The student's revised paragraph text..."
}
```

---

## Block Logic

```typescript
/**
 * @description Check if user should be blocked from ranked matches.
 */
async function checkBlockStatus(userId: string): Promise<BlockStatus> {
  const history = await getGradingHistory(userId);
  
  if (history.length === 0) {
    return { isBlocked: false, reason: null, blockingCriteria: [], requiredLessons: [] };
  }
  
  // Check for severe gaps in latest session
  const latest = history[0];
  if (latest.hasSevereGap) {
    const severeGaps = latest.gaps.filter(g => g.severity === 'high');
    return {
      isBlocked: true,
      reason: 'severe_gap',
      blockingCriteria: severeGaps.map(g => g.category || g.criterion),
      requiredLessons: getUniqueRecommendedLessons(severeGaps),
    };
  }
  
  // Check for accumulated gaps (3+ medium per criterion)
  const accumulated = aggregateGapsByCriterion(history);
  const accumulatedBlocks = accumulated.filter(g => g.count >= 3);
  
  if (accumulatedBlocks.length > 0) {
    return {
      isBlocked: true,
      reason: 'accumulated_gaps',
      blockingCriteria: accumulatedBlocks.map(g => g.criterion),
      requiredLessons: getUniqueRecommendedLessons(accumulatedBlocks),
    };
  }
  
  return { isBlocked: false, reason: null, blockingCriteria: [], requiredLessons: [] };
}

/**
 * @description Aggregate medium gaps by criterion across history.
 */
function aggregateGapsByCriterion(history: GradingHistoryEntry[]): AccumulatedGap[] {
  const gapCounts = new Map<string, AccumulatedGap>();
  
  for (const entry of history) {
    for (const gap of entry.gaps) {
      if (gap.severity !== 'medium') continue;
      
      const criterion = gap.category || gap.criterion;
      const existing = gapCounts.get(criterion);
      
      if (existing) {
        existing.count++;
        // Keep most recent occurrence
        if (entry.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = entry.timestamp;
          existing.recommendedLessons = gap.recommendedLessons;
        }
      } else {
        gapCounts.set(criterion, {
          criterion,
          count: 1,
          severity: 'medium',
          recommendedLessons: gap.recommendedLessons,
          lastOccurrence: entry.timestamp,
        });
      }
    }
  }
  
  return Array.from(gapCounts.values());
}
```

---

## UI Components

### Paragraph Scorecard Display

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 TWR Writing Assessment                                       │
│                                                                  │
│  Topic Sentence       ████████░░░░░░░░  4/5   ✓                 │
│  Detail Sentences     ████░░░░░░░░░░░░  2/5   ⚠️ Needs Work     │
│  Concluding Sentence  ██████░░░░░░░░░░  3/5                     │
│  Conventions          ██████████░░░░░░  5/5   ✓                 │
│                                                                  │
│  ─────────────────────────────────────────────────              │
│  Overall Score: 70% (14/20)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Gap Detection Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Areas to Improve                                             │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⚠️ HIGH PRIORITY: Detail Sentences (2/5)                  │  │
│  │                                                            │  │
│  │  "Your paragraph needs more supporting details to fully   │  │
│  │   develop the main idea. Try using the because/but/so     │  │
│  │   strategy to expand your sentences."                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📚 Recommended Practice:                                        │
│                                                                  │
│  ┌────────────────────────────────┐  ┌────────────────────────┐ │
│  │  Writing SPOs                  │  │  Eliminate Irrelevant  │ │
│  │  Build strong supporting       │  │  Focus your paragraphs │ │
│  │  details                       │  │                        │ │
│  │                   [Start →]    │  │           [Start →]    │ │
│  └────────────────────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Block Modal

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    🚫 Practice Required                          │
│                                                                  │
│  Before you can play another ranked match, you need to          │
│  strengthen your writing skills in these areas:                 │
│                                                                  │
│  • Detail Sentences                                              │
│  • Topic Sentence (accumulated)                                  │
│                                                                  │
│  Complete the recommended practice lessons to unlock            │
│  ranked matches again.                                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Go to Practice                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                    [Maybe Later]                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Phase 1: Types & Service Layer
1. `lib/types/grading-history.ts` - Type definitions
2. `lib/services/grading-history.ts` - Firestore operations

### Phase 2: API Endpoint
3. `app/api/grade-revision/route.ts` - Grading + storage endpoint

### Phase 3: Results Page
4. `app/ranked/results-v2/page.tsx` - Page wrapper
5. `components/ranked/ResultsContentV2.tsx` - Main content
6. `components/ranked/results-v2/ScorecardDisplay.tsx`
7. `components/ranked/results-v2/ParagraphScorecard.tsx`
8. `components/ranked/results-v2/GapDetectionSummary.tsx`
9. `components/ranked/results-v2/RecommendedLessons.tsx`
10. `components/ranked/results-v2/BlockModal.tsx`

### Phase 4: Integration
11. Modify `components/ranked/RevisionContent.tsx` - Trigger grading on submit
12. Update navigation to go to `/ranked/results-v2`

### Phase 5: Block Flow
13. Modify `components/ranked/RankedLanding.tsx` - Block check before start
14. Add block check to "Play Again" button

---

## Testing Checklist

- [ ] Paragraph grading returns correct scorecard structure
- [ ] Gap detection identifies severe gaps (score ≤2)
- [ ] Grading history saves to Firestore correctly
- [ ] Results page displays scorecard with score bars
- [ ] Results page shows gap summary with severity
- [ ] Recommended lessons link to correct practice pages
- [ ] Block modal appears for severe gaps
- [ ] Block modal appears for accumulated gaps (3+)
- [ ] User can navigate to practice from block modal
- [ ] Rankings and LP/XP still display correctly
- [ ] "Play Again" checks block status before navigating

---

## Future Enhancements

1. **Essay Grader Support** - Add toggle and support for essay grading
2. **Phase 1 Grading** - Grade initial writing to compare improvement
3. **Pattern Analysis** - Show improvement trends over time
4. **Lesson Completion Tracking** - Clear gaps after completing practice
5. **Severity Tuning** - Adjust thresholds based on grade level

