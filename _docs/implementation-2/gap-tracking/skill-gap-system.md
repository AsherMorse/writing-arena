# Skill Gap Tracking & Intervention System

**Last Updated:** December 9, 2025  
**Status:** Core implementation complete ✅

---

## Overview

Adaptive skill gap detection system that:
1. Detects writing weaknesses from graded submissions
2. Tracks gaps over time with recency weighting
3. Blocks ranked access when persistent patterns emerge
4. Routes students to targeted practice (hole-fill mode)
5. Unblocks after gap resolution through lesson mastery

Based on adaptive learning principles similar to Math Academy's mastery system.

---

## Severity Levels

| Score (0-5) | Severity | Essay Equivalent | Meaning |
|-------------|----------|------------------|---------|
| 0-2 | **High** | "No" | Critical gap, needs immediate attention |
| 3 | **Medium** | "Developing" | Significant gap, needs work |
| 4 | **Low** | (not tracked) | Minor improvement area |
| 5 | *(no gap)* | "Yes" | Proficient |

**Note:** Gaps only flagged when score < 4 (below 80%)

---

## Intervention Rules

### High Severity (Scores 0-2)

```
Practice: ✅ RECOMMEND immediately
Ranked:   ❌ BLOCK after 1 occurrence
Must Resolve: Yes
Time Window: 3 days
Recommended Lessons: 3-4 (full suite)
```

**Rationale:** Critical gaps indicate fundamental skill breakdown. Need comprehensive fix from multiple angles.

**Example:** Detail Sentences score 1 → Assign:
- `writing-spos` (structure)
- `eliminate-irrelevant-sentences` (relevance)
- `elaborate-paragraphs` (development)
- `using-transition-words` (coherence)

---

### Medium Severity (Score 3)

```
Practice: 💡 SUGGEST after 1 occurrence
Ranked:   ⚠️  WARN after 2 occurrences
Ranked:   ❌ BLOCK after 3 occurrences
Must Resolve: Yes
Time Window: 5 days
Recommended Lessons: 2 (core skills)
```

**Rationale:** Pattern detection - one-off mistakes vs. persistent weakness. Student shows some understanding, needs focused work.

**Example:** Detail Sentences score 3 → Assign:
- `writing-spos` (main skill)
- `using-transition-words` (coherence)

---

### Low Severity (Score 4)

```
Practice: 💡 SUGGEST after 2 occurrences
Ranked:   ⚠️  WARN after 2 occurrences
Ranked:   ❌ BLOCK after 4 occurrences
Must Resolve: No (can self-correct)
Time Window: 7 days
Recommended Lessons: 1 (targeted refinement)
```

**Rationale:** Minor issues shouldn't block aggressively. Student is nearly proficient, just needs polish.

**Example:** Detail Sentences score 4 → Assign:
- `using-transition-words` (refinement only)

---

## Data Architecture

### Top-Level Collections (Leaderboard Queries)

```
practiceSubmissions/{submissionId}
rankedSubmissions/{submissionId}
  {
    userId: string
    promptId: string
    content: string
    originalScore: number
    revisedScore?: number
    timestamp: Timestamp
    
    // Gap data from grading
    gaps: SkillGap[]
    prioritizedLessons: string[]
    hasSevereGap: boolean
    
    // Grading details
    result: GraderResult | EssayGraderResult
  }
```

**Query examples:**
- Prompt leaderboard: `where('promptId', '==', 'X').orderBy('originalScore', 'desc')`
- Daily ranked: `where('timestamp', '>=', today).orderBy('originalScore', 'desc')`
- User history: `where('userId', '==', uid).orderBy('timestamp', 'desc')`

---

### User Document (Fast Block Checks)

```
users/{uid}
  {
    skillGaps: {
      "Topic Sentence": {
        occurrences: [
          {
            timestamp: Timestamp,
            source: "practice" | "ranked",
            severity: "low" | "medium" | "high",
            score: number,
            submissionId: string
          }
        ],
        recommendedLessons: string[],
        status: "active" | "resolving" | "resolved",
        resolvedBy?: string[],      // Lesson IDs completed
        resolvedAt?: Timestamp
      },
      "Detail Sentences": { ... },
      "Concluding Sentence": { ... },
      "Conventions": { ... }
    }
  }
```

**Key features:**
- ⚡ Single doc read for block checking
- 🕐 Occurrences array with timestamps (auto-expiry via filtering)
- 📊 Tracks practice vs. ranked separately
- ✅ Resolution tracking

---

## Complete Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│  1. STUDENT WRITES & SUBMITS                                   │
│     Practice: /fantasy/practice/paragraph or /essay            │
│     Ranked: /fantasy/ranked (when built)                       │
└────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────┐
│  2. GRADE WITH LLM                                             │
│     POST /fantasy/api/grade                                    │
│     → adaptive-paragraph-grader.ts or adaptive-essay-grader.ts │
│     → Returns scores (0-5 per category) + remarks              │
└────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────┐
│  3. DETECT GAPS (app/fantasy/_lib/grading.ts)                  │
│     For each score < 4:                                        │
│       severity = score 0-2 → "high"                            │
│                  score 3   → "medium"                          │
│                  score 4   → "low"                             │
│       recommendedLessons = CATEGORY_TO_LESSONS[category]       │
│                                                                │
│     Returns: GradeResponse {                                   │
│       gaps: SkillGap[],                                        │
│       prioritizedLessons: string[],                            │
│       hasSevereGap: boolean                                    │
│     }                                                          │
└────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────┐
│  4. SAVE SUBMISSION                                            │
│     practiceSubmissions/{id} or rankedSubmissions/{id}         │
│     → Full submission + gaps + grading result                  │
│     → Enables leaderboard queries                              │
└────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────┐
│  5. UPDATE AGGREGATED GAPS (Atomic)                            │
│     users/{uid}.skillGaps.{criterion}                          │
│     → arrayUnion() to add new occurrence                       │
│     → Keep last 20 occurrences per criterion                   │
│     → Update recommendedLessons if severity changed            │
└────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────┐
│  6. CHECK INTERVENTION (Before ranked match)                   │
│     1. Filter occurrences by time window                       │
│     2. Count ranked occurrences in window                      │
│     3. Apply intervention rules by severity                    │
│     4. Check if status = "resolved" (skip if yes)              │
│                                                                │
│     Returns: {                                                 │
│       blocked: boolean,                                        │
│       requiredLessons: string[],                               │
│       blockingGaps: string[]                                   │
│     }                                                          │
└────────────────────────────────────────────────────────────────┘
                                ↓
                ┌───────────────┴────────────────┐
                │                                │
                ↓                                ↓
┌──────────────────────────┐    ┌──────────────────────────────┐
│  7A. NOT BLOCKED         │    │  7B. BLOCKED                 │
│  → Show recommendations  │    │  → Show required lessons     │
│  → Allow ranked access   │    │  → Block ranked access       │
└──────────────────────────┘    └───────────────┬──────────────┘
                                                │
                                                ↓
                                ┌──────────────────────────────┐
                                │  8. HOLE-FILL MODE           │
                                │  /improve/activities         │
                                │  → Complete required lessons │
                                │  → Achieve 90%+ mastery      │
                                └───────────────┬──────────────┘
                                                │
                                                ↓
                                ┌──────────────────────────────┐
                                │  9. MARK RESOLVED            │
                                │  skillGaps.{criterion}:      │
                                │    status = "resolved"       │
                                │    resolvedBy = [lessonIds]  │
                                └───────────────┬──────────────┘
                                                │
                                                ↓
                                ┌──────────────────────────────┐
                                │  10. UNBLOCKED               │
                                │  Next ranked check:          │
                                │  → Sees status="resolved"    │
                                │  → Allows entry              │
                                │                              │
                                │  If gap reappears:           │
                                │  → Reset to "active"         │
                                └──────────────────────────────┘
```

---

## Implementation Details

### File Structure

```
lib/
├── constants/
│   └── gap-intervention.ts          ← Thresholds, time windows, rules
├── types/
│   └── skill-gaps.ts                ← TypeScript interfaces
└── services/
    └── skill-gap-tracker.ts         ← Core business logic

app/fantasy/_lib/
└── grading.ts                       ← Already detects gaps (done ✅)

lib/grading/
├── paragraph-gap-detection.ts       ← CATEGORY_TO_LESSONS (done ✅)
└── essay-gap-detection.ts           ← ESSAY_CRITERION_ID_TO_LESSONS (done ✅)
```

---

### Key Functions

#### `updateSkillGaps()`
```typescript
async function updateSkillGaps(
  userId: string,
  gaps: SkillGap[],
  source: 'practice' | 'ranked',
  submissionId: string
): Promise<void>
```

**What it does:**
1. For each gap, add occurrence to `users/{uid}.skillGaps.{category}.occurrences`
2. Use `arrayUnion()` for atomic append
3. Trim to last 20 occurrences per criterion
4. Update `recommendedLessons` if needed
5. Set `status` to "active" if was "resolved"

---

#### `checkBlockStatus()`
```typescript
async function checkBlockStatus(
  userId: string
): Promise<{
  blocked: boolean;
  reason?: string;
  blockingGaps: string[];
  requiredLessons: string[];
}>
```

**What it does:**
1. Read `users/{uid}.skillGaps`
2. For each criterion:
   - Filter occurrences by time window
   - Count ranked occurrences in window
   - Skip if `status === "resolved"`
   - Check against intervention rules
3. Return first blocking gap found

---

#### `resolveGap()`
```typescript
async function resolveGap(
  userId: string,
  criterion: string,
  completedLessons: string[]
): Promise<void>
```

**What it does:**
1. Update `users/{uid}.skillGaps.{criterion}`
2. Set `status: "resolved"`
3. Set `resolvedBy: completedLessons`
4. Set `resolvedAt: NOW`

---

#### `getRecentGapCount()`
```typescript
function getRecentGapCount(
  occurrences: GapOccurrence[],
  timeWindowMs: number,
  source?: 'practice' | 'ranked'
): number
```

**What it does:**
1. Filter occurrences by timestamp (within window)
2. Optionally filter by source
3. Return count

---

## Time Window Logic

### Example: Medium Severity Gap (5-day window)

```typescript
const occurrences = [
  { timestamp: "Dec 8, 14:00", source: "ranked", ... },  // ✅ Within window
  { timestamp: "Dec 7, 10:00", source: "ranked", ... },  // ✅ Within window
  { timestamp: "Dec 6, 09:00", source: "practice", ... },// ✅ Within window
  { timestamp: "Dec 2, 15:00", source: "ranked", ... },  // ❌ Outside window (6 days ago)
  { timestamp: "Dec 1, 11:00", source: "ranked", ... },  // ❌ Outside window (7 days ago)
];

const now = new Date("Dec 8, 14:00");
const timeWindow = 5 * 24 * 60 * 60 * 1000; // 5 days

const recentRankedCount = occurrences.filter(o => 
  o.source === "ranked" && 
  (now - o.timestamp) < timeWindow
).length;

// Result: 2 (only the two recent ranked submissions)
// Not blocked yet (needs 3 for medium)
```

---

## Data Lifecycle Example

### Timeline: Student with Topic Sentence Gap

**Dec 1 (Day 1) - First ranked submission**
```typescript
// Submission saved
rankedSubmissions/abc123 = {
  userId: "user123",
  gaps: [{ category: "Topic Sentence", score: 2, severity: "medium", ... }]
}

// User doc updated
users/user123.skillGaps["Topic Sentence"] = {
  occurrences: [
    { timestamp: Dec 1 14:30, source: "ranked", severity: "medium", score: 2 }
  ],
  recommendedLessons: ["make-topic-sentences", "identify-topic-sentence"],
  status: "active"
}

// Block check: rankedCount(5d) = 1 → No block (needs 3)
```

---

**Dec 2 (Day 2) - Practice submission, same gap**
```typescript
// New occurrence added
occurrences: [
  { timestamp: Dec 2 10:00, source: "practice", severity: "medium", score: 2 },
  { timestamp: Dec 1 14:30, source: "ranked", severity: "medium", score: 2 }
]

// Block check: rankedCount(5d) = 1 → Still no block
```

---

**Dec 3 (Day 3) - Another ranked submission, same gap**
```typescript
occurrences: [
  { timestamp: Dec 3 16:00, source: "ranked", severity: "medium", score: 2 },
  { timestamp: Dec 2 10:00, source: "practice", severity: "medium", score: 2 },
  { timestamp: Dec 1 14:30, source: "ranked", severity: "medium", score: 2 }
]

// Block check: rankedCount(5d) = 2 → ⚠️  WARN (show banner)
```

---

**Dec 4 (Day 4) - Third ranked occurrence**
```typescript
occurrences: [
  { timestamp: Dec 4 11:00, source: "ranked", severity: "medium", score: 2 },
  ... 3 previous
]

// Block check: rankedCount(5d) = 3 → ❌ BLOCKED!
// UI: "Complete these lessons to unlock ranked:"
//   → make-topic-sentences
//   → identify-topic-sentence
```

---

**Dec 5 (Day 5) - Student completes lessons**
```typescript
// After completing "make-topic-sentences" with 92% score
skillGaps["Topic Sentence"] = {
  occurrences: [...],  // Preserved for history
  recommendedLessons: [...],
  status: "resolved",
  resolvedBy: ["make-topic-sentences"],
  resolvedAt: Dec 5 15:00
}

// Block check: status="resolved" → ✅ UNBLOCKED
```

---

**Dec 8 (Day 8) - Gap reappears in ranked**
```typescript
// New occurrence added
occurrences: [
  { timestamp: Dec 8 09:00, source: "ranked", severity: "medium", score: 2 },
  // Dec 1, Dec 2 occurrences filtered out (outside 5-day window)
  { timestamp: Dec 3 16:00, source: "ranked", ... },
  { timestamp: Dec 4 11:00, source: "ranked", ... }
]

// Status changes
status: "active"  // Back to active since gap returned

// Block check: rankedCount(5d) = 1 → No block (counting restarts)
```

---

## Severity-Aligned Lesson Mappings

### Philosophy

**Higher severity = More comprehensive intervention**

When a skill is fundamentally broken (high severity), students need multiple lessons covering different aspects of that skill. When nearly proficient (low severity), a single targeted lesson suffices.

### Example: Detail Sentences

| Severity | Score | Lessons | Rationale |
|----------|-------|---------|-----------|
| **High** | 0-2 | `writing-spos`, `elaborate-paragraphs`, `eliminate-irrelevant-sentences`, `using-transition-words` (4 lessons) | Fundamental breakdown - needs structure, development, relevance, and coherence |
| **Medium** | 3 | `writing-spos`, `using-transition-words` (2 lessons) | Shows some understanding - focus on structure and flow |
| **Low** | 4 | `using-transition-words` (1 lesson) | Nearly proficient - just needs polish on coherence |

### Implementation

Mappings are keyed by severity in:
- `lib/grading/paragraph-gap-detection.ts` → `CATEGORY_TO_LESSONS`
- `lib/grading/essay-gap-detection.ts` → `ESSAY_CRITERION_TO_LESSONS` and `ESSAY_CRITERION_ID_TO_LESSONS`

```typescript
const CATEGORY_TO_LESSONS: Record<string, {
  high: string[];
  medium: string[];
  low: string[];
}> = {
  'Topic Sentence': {
    high: ['make-topic-sentences', 'identify-topic-sentence', 'basic-conjunctions', 'write-appositives'],
    medium: ['make-topic-sentences', 'identify-topic-sentence'],
    low: ['make-topic-sentences']
  },
  // ...
}

// Usage
const severity = getSeverity(score);
const lessons = CATEGORY_TO_LESSONS['Topic Sentence'][severity];
```

### Paragraph Lesson Counts

| Category | High (0-2) | Medium (3) | Low (4) |
|----------|-----------|------------|---------|
| Topic Sentence | 4 lessons | 2 lessons | 1 lesson |
| Detail Sentences | 4 lessons | 2 lessons | 1 lesson |
| Concluding Sentence | 3 lessons | 2 lessons | 1 lesson |
| Conventions | 2 lessons | 1 lesson | 1 lesson |

### Essay Lesson Counts

| Criterion | High ("no") | Medium ("developing") | Low (not used) |
|-----------|------------|---------------------|----------------|
| Thesis | 3 lessons | 2 lessons | 1 lesson |
| Topic Sentences | 3 lessons | 2 lessons | 1 lesson |
| Supporting Details | 3 lessons | 2 lessons | 1 lesson |
| Unity | 3 lessons | 2 lessons | 1 lesson |
| Transitions | 2 lessons | 2 lessons | 1 lesson |
| Conclusion | 2 lessons | 1 lesson | 1 lesson |
| Sentence Strategies | 4 lessons | 2 lessons | 1 lesson |
| Conventions | 2 lessons | 1 lesson | 1 lesson |
| Paragraph Count | 0 lessons | 0 lessons | 0 lessons |

**Average blocking burden:**
- High severity: ~3 lessons to complete
- Medium severity: ~2 lessons to complete
- Low severity: ~1 lesson to complete

---

## Technical Implementation

### Constants (`lib/constants/gap-intervention.ts`)

```typescript
export const TIME_WINDOWS = {
  high: 3 * 24 * 60 * 60 * 1000,    // 3 days in ms
  medium: 5 * 24 * 60 * 60 * 1000,  // 5 days
  low: 7 * 24 * 60 * 60 * 1000,     // 7 days
} as const;

export const INTERVENTION_RULES = {
  high: {
    practiceRecommend: 1,
    rankedWarn: 1,
    rankedBlock: 1,
    mustResolve: true,
    timeWindow: TIME_WINDOWS.high,
  },
  medium: {
    practiceRecommend: 1,
    rankedWarn: 2,
    rankedBlock: 3,
    mustResolve: true,
    timeWindow: TIME_WINDOWS.medium,
  },
  low: {
    practiceRecommend: 2,
    rankedWarn: 2,
    rankedBlock: 4,
    mustResolve: false,
    timeWindow: TIME_WINDOWS.low,
  },
} as const;

export const MAX_OCCURRENCES_STORED = 20;
```

---

### Types (`lib/types/skill-gaps.ts`)

```typescript
import type { Timestamp } from 'firebase/firestore';

export type GapSeverity = 'low' | 'medium' | 'high';
export type GapStatus = 'active' | 'resolving' | 'resolved';
export type SubmissionSource = 'practice' | 'ranked';

export interface GapOccurrence {
  timestamp: Timestamp;
  source: SubmissionSource;
  severity: GapSeverity;
  score: number;
  submissionId: string;
}

export interface SkillGapData {
  occurrences: GapOccurrence[];
  recommendedLessons: string[];
  status: GapStatus;
  resolvedBy?: string[];
  resolvedAt?: Timestamp;
}

export interface BlockCheckResult {
  blocked: boolean;
  reason?: 'high_severity' | 'medium_pattern' | 'low_pattern';
  blockingGaps: string[];
  requiredLessons: string[];
  warnings?: string[];
}
```

---

### Service (`lib/services/skill-gap-tracker.ts`)

```typescript
import { db } from '@/lib/config/firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { INTERVENTION_RULES, MAX_OCCURRENCES_STORED } from '@/lib/constants/gap-intervention';
import type { SkillGap } from '@/app/fantasy/_lib/grading';
import type { GapOccurrence, SkillGapData, BlockCheckResult, SubmissionSource } from '@/lib/types/skill-gaps';

/**
 * @description Update user's skill gaps after a graded submission.
 */
export async function updateSkillGaps(
  userId: string,
  gaps: SkillGap[],
  source: SubmissionSource,
  submissionId: string
): Promise<void>;

/**
 * @description Check if user should be blocked from ranked based on gap patterns.
 */
export async function checkBlockStatus(userId: string): Promise<BlockCheckResult>;

/**
 * @description Mark a gap as resolved after completing lessons.
 */
export async function resolveGap(
  userId: string,
  criterion: string,
  completedLessons: string[]
): Promise<void>;

/**
 * @description Get count of recent occurrences within time window.
 */
export function getRecentGapCount(
  occurrences: GapOccurrence[],
  timeWindowMs: number,
  source?: SubmissionSource
): number;
```

---

## Grading Integration Points

### Already Implemented ✅

1. **Gap detection in grading.ts**
   - `detectGapsFromResult()` - Paragraph gaps
   - `detectEssayGaps()` - Essay gaps
   - Returns `SkillGap[]` with `recommendedLessons`

2. **Lesson mappings**
   - `CATEGORY_TO_LESSONS` in `paragraph-gap-detection.ts`
   - `ESSAY_CRITERION_ID_TO_LESSONS` in `essay-gap-detection.ts`

3. **Prioritization**
   - `prioritizeLessons()` - Severity first, TWR tier second
   - Returns sorted `prioritizedLessons[]`

---

### To Implement 🚧

1. **Save submissions** to `practiceSubmissions/rankedSubmissions`
2. **Update user.skillGaps** atomically after each submission
3. **Block check** before allowing ranked matches
4. **Resolution tracking** when lessons completed
5. **UI components** for recommendations and blocking

---

## Query Patterns

### User's Recent Gaps
```typescript
const userDoc = await getDoc(doc(db, 'users', uid));
const { skillGaps } = userDoc.data();

// Fast - 1 doc read
```

---

### Prompt Leaderboard
```typescript
const q = query(
  collection(db, 'practiceSubmissions'),
  where('promptId', '==', promptId),
  orderBy('originalScore', 'desc'),
  limit(100)
);
```

---

### Daily Ranked Leaderboard
```typescript
const q = query(
  collection(db, 'rankedSubmissions'),
  where('timestamp', '>=', startOfToday),
  orderBy('originalScore', 'desc'),
  limit(100)
);
```

---

### User's Submission History
```typescript
const q = query(
  collection(db, 'rankedSubmissions'),
  where('userId', '==', uid),
  orderBy('timestamp', 'desc'),
  limit(50)
);
```

---

## Alignment with Math Academy

### What Matches ✅

1. **Prerequisite gating** - Can't progress with critical gaps
2. **Pattern detection** - Multiple failures trigger intervention
3. **Immediate intervention** - High severity blocks after 1
4. **Mastery requirement** - Must complete lessons to unblock
5. **Recency weighting** - Time windows auto-expire old data

### Differences ⚠️

| Aspect | Our System | Math Academy (likely) |
|--------|------------|---------------------|
| Time windows | 3-7 days | Probably 2-4 days with exponential decay |
| Low severity | Block after 4 | Might not track score=4 as gap |
| Resolution | Track lessons completed | Continuous assessment until mastery |

Our system is **slightly more lenient** but follows the same principles.

---

## Edge Cases

### 1. Gap Severity Changes
```
Submission 1: Topic Sentence score=2 (medium)
Submission 2: Topic Sentence score=1 (high)
```

**Handling:** 
- Store both occurrences with their respective severities
- Use highest severity seen for current status
- Block rules apply to current severity

---

### 2. Gap Resolved but Score Still Low
```
Student completes lessons → status="resolved"
Next submission → Topic Sentence score=3 (medium)
```

**Handling:**
- Gap reappears → `status: "active"`
- Add new occurrence
- Start counting from 1 again
- Shows lesson wasn't fully mastered

---

### 3. Multiple Gaps on Same Submission
```
gaps: [
  { category: "Topic Sentence", severity: "high" },
  { category: "Detail Sentences", severity: "medium" },
  { category: "Conventions", severity: "low" }
]
```

**Handling:**
- Update all three gap entries
- Each tracks independently
- Block on first qualifying gap (high severity wins)
- Show all requiredLessons from blocking gaps

---

### 4. Practice vs Ranked Counts
```
5 practice gaps + 2 ranked gaps = totalCount: 7
```

**Blocking logic:**
- Only `rankedCount` triggers blocks
- `practiceCount` for analytics/recommendations only
- `totalCount` shows overall struggle

---

## UI Integration

### Feedback Page (Post-Submission)

```typescript
const { gaps, prioritizedLessons, hasSevereGap } = gradeResponse;

if (gaps.length > 0) {
  <RecommendedLessons 
    lessons={prioritizedLessons.slice(0, 3)}
    severity={hasSevereGap ? 'high' : 'medium'}
  />
}
```

---

### Ranked Entry Point

```typescript
// Before allowing ranked match
const blockStatus = await checkBlockStatus(userId);

if (blockStatus.blocked) {
  return (
    <BlockedScreen
      reason={blockStatus.reason}
      gaps={blockStatus.blockingGaps}
      requiredLessons={blockStatus.requiredLessons}
    />
  );
}

// Otherwise, show match UI
```

---

### Lesson Completion

```typescript
// After mastering a lesson (score >= 90%)
if (score >= MASTERY_THRESHOLD) {
  await updateMastery(userId, lessonId, score);
  
  // Check if this lesson resolves any active gaps
  const userGaps = await getUserSkillGaps(userId);
  
  for (const [criterion, gapData] of Object.entries(userGaps)) {
    if (
      gapData.status === "active" &&
      gapData.recommendedLessons.includes(lessonId)
    ) {
      // Check if all required lessons completed
      const allCompleted = gapData.recommendedLessons.every(
        lesson => isMastered(userId, lesson)
      );
      
      if (allCompleted) {
        await resolveGap(userId, criterion, gapData.recommendedLessons);
      }
    }
  }
}
```

---

## Next Steps

### Phase 1: Core Infrastructure ✅
- [x] Gap detection in grading.ts
- [x] Lesson mappings exported
- [x] Create `lib/constants/gap-intervention.ts`
- [x] Create `lib/types/skill-gaps.ts`
- [x] Create `lib/services/skill-gap-tracker.ts`

### Phase 2: Storage Integration ✅
- [x] Grading API accepts userId/submissionId for gap tracking
- [x] Update user.skillGaps after each submission (via API route)
- [ ] Test atomic updates

### Phase 3: Block Logic ✅
- [x] Implement `checkBlockStatus()`
- [x] Add block UI to ranked entry
- [x] Add warning banners for approaching blocks

### Phase 4: Resolution Flow ✅
- [x] Implement `resolveGap()`
- [x] Wire up to lesson completion in practice-mastery.ts
- [ ] Test resolution → reappearance cycle

### Phase 5: UI Polish ✅
- [x] Recommended lessons component (`RecommendedLessons.tsx`)
- [ ] Gap progress indicators
- [x] Block screens with lesson links (inline in ranked page)

---

## Design Decisions (Resolved)

1. **Occurrence array limits:** ✅ Keep last 20 per criterion
   - Prevents unbounded growth
   - Covers ~2-3 weeks of frequent submissions

2. **Partial resolution:** ✅ Filter by mastery status in UI
   - No explicit progress tracking needed
   - Show only incomplete lessons: `recommendedLessons.filter(l => !isMastered(l))`
   - Auto-resolve when filtered list becomes empty

3. **Gap severity upgrade:** ✅ Keep accumulating occurrences
   - Don't reset array when severity changes
   - Blocks instantly for high severity (threshold = 1)
   - Old occurrences preserved for context

4. **Cross-category blocks:** ✅ Per-criterion blocking only
   - Each criterion tracks independently
   - No global "N total gaps" threshold
   - Enables targeted intervention

5. **Analytics:** ✅ No resolution rate tracking (YAGNI)
   - Can add later if needed
   - Focus on core functionality first

---

## References

- Gap mappings: `_docs/practice-mode/grader-info/paragraph-criterion-lesson-mapping.md`
- Essay mappings: `_docs/practice-mode/grader-info/essay-criterion-lesson-mapping.md`
- TWR checklists: `docs/9_Reference_Docs/writing-assessment-checklists.md`
- Grading logic: `app/fantasy/_lib/grading.ts`
