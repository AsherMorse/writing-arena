# Practice Activities: Grading Implementation Status

> Consolidated documentation for grading system implementation.
> 
> **Last Updated**: December 8, 2024

---

## Activity Summary (23 Activities)

### Cardinal Rubric Activities (Per-Section Scoring) ✅ COMPLETE

These activities use per-section 0-5 scoring with `GradingSidebar` display.

| Activity | Lesson ID | Rubric | Sections | Max Score |
|----------|-----------|--------|----------|-----------|
| Writing SPOs | `writing-spos` | single-paragraph-outline | T.S., S.D., C.S., Conventions | 20 |
| Elaborate Paragraphs | `elaborate-paragraphs` | elaborated-paragraph | Improvements, Conventions | 10 |
| Write Free-Form Paragraph | `write-freeform-paragraph` | single-paragraph | T.S., S.D., C.S., Conventions | 20 |

### Adaptive Grader Activities (20 activities) ✅ COMPLETE

These activities use `{ isCorrect, remarks[] }` without section scores.

| Tier | Activities |
|------|------------|
| **Sentence** (5) | `fragment-or-sentence`, `basic-conjunctions`, `write-appositives`, `subordinating-conjunctions`, `kernel-expansion` |
| **Paragraph** (9) | `make-topic-sentences`, `identify-topic-sentence`, `eliminate-irrelevant-sentences`, `using-transition-words`, `finishing-transition-words`, `write-cs-from-details`, `write-ts-from-details` |
| **Essay** (8) | `distinguish-g-s-t`, `write-s-from-g-t`, `write-g-s-from-t`, `craft-conclusion-from-gst`, `write-introductory-sentences`, `write-t-from-topic`, `match-details-pro-con`, `pre-transition-outline` |

---

## Grading Methods

### Method 1: Cardinal Rubric (Per-Section Scoring)

**Used for**: Full paragraph/outline writing activities  
**Returns**: Per-section scores (0-5 each) + overall percentage  
**UI**: `GradingSidebar` displays section breakdown

```typescript
interface SectionScores {
  topicSentence?: number;      // 0-5
  supportingDetails?: number;  // 0-5
  concludingSentence?: number; // 0-5
  conventions?: number;        // 0-5
  improvements?: number;       // 0-5 (elaborate-paragraphs only)
}
```

**Activities**: `writing-spos`, `elaborate-paragraphs`, `write-freeform-paragraph`

### Method 2: Adaptive Grader (Remarks-Based)

**Used for**: Sentence-level skills, identification tasks, TWR exercises  
**Returns**: `{ isCorrect, remarks[] }` with severity levels  
**UI**: Blocking feedback panel with retry

```typescript
interface GradingResult {
  isCorrect: boolean;
  score: number;
  remarks: GradingRemark[];
  solution: string;
  sectionScores?: SectionScores; // Only for cardinal activities
}
```

**Activities**: All 20 other activities

---

## Implementation Components

### Key Files

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Grading Types | `lib/constants/grader-configs/types.ts` | `GradingResult`, `SectionScores`, `GradingRemark` |
| Practice Grader | `lib/grading/practice-grader.ts` | Claude Sonnet 4 grading with structured output |
| Grader Configs | `lib/constants/grader-configs/*.ts` | Activity-specific grading criteria (23 files) |
| Grading Sidebar | `components/practice/GradingSidebar.tsx` | Per-section score display |
| Session Content | `components/practice/PracticeSessionContent.tsx` | Main session with grading integration |

### Grading Flow

```
Student Submits
     ↓
gradePracticeSubmission()
     ↓
├─ Is cardinal rubric activity?
│   ├─ YES → Add sectionScores to tool schema
│   │        Claude returns section scores (0-5 each)
│   │        Calculate overall score from sections
│   │        Display GradingSidebar
│   │
│   └─ NO → Standard adaptive grader
│           Claude returns isCorrect + remarks[]
│           Display blocking feedback if errors
     ↓
Check hasBlockingErrors(remarks)
     ↓
├─ Has errors → Block, show feedback, allow retry
└─ No errors → Advance to next phase
```

---

## Data Persistence

### What Gets Stored in Firebase

**Location**: `users/{uid}/practiceMastery/{lessonId}`

Persistent data for mastery tracking and LP calculation:

| Field | Type | Description |
|-------|------|-------------|
| `mastered` | boolean | True when score >= 90% (mastery threshold) |
| `bestScore` | number | Highest score achieved across all attempts |
| `lastScore` | number | Most recent score |
| `completedAt` | Timestamp | First attempt timestamp |
| `masteredAt` | Timestamp | When mastery achieved (if applicable) |
| `attempts` | number | Total attempts count |

### What Is NOT Stored

Ephemeral session data (displayed once on results page, then discarded):

- **Section scores** — Per-section 0-5 scores from cardinal rubric activities
- **Grading remarks** — Individual feedback items (errors, nits, suggestions)
- **Student submissions** — Full text of what student wrote
- **Phase scores** — Breakdown of review/write/revise scores (only composite stored)
- **Word counts** — Writing metrics
- **Previous attempts data** — Historical attempt content and feedback
- **Revision history** — Multiple drafts within a session

**Why not stored?** Only final composite score matters for progression and mastery tracking. Detailed grading data shown on results page via `sessionStorage` (temporary client-side storage), then cleared.

### Data Flow: Session to Storage

```
1. Session Complete
   └─ PracticeSessionContent.tsx
      ├─ Calculate composite score (review 20% + write 40% + revise 40%)
      └─ recordAttempt(compositeScore)
         └─ lib/services/practice-mastery.ts
            ├─ calculateLPForSession() → Determine LP based on score + mastery
            ├─ updateMastery() → Update Firebase with new score/attempts
            └─ Return { lpEarned, newStatus }

2. Store Detailed Results (Temporary)
   └─ sessionStorage.setItem('practiceResults', {
        lessonId, scores, remarks, sectionScores, lpEarned, wordCounts
      })
   └─ Navigate to results page

3. Results Page Display
   └─ PracticeResultsContent.tsx
      ├─ Read from sessionStorage (client-side)
      ├─ useLessonMastery() → Fetch mastery status from Firebase
      ├─ Display: scores, feedback, LP earned, mastery badge
      └─ sessionStorage.removeItem() → Clear temporary data
```

### LP (Learning Points) Calculation

```typescript
// Only awarded if lesson NOT mastered
calculatePracticeLP(score: number, alreadyMastered: boolean) {
  if (alreadyMastered) return 0;
  
  if (score >= 95) return 15;
  if (score >= 90) return 12;
  if (score >= 80) return 8;
  if (score >= 70) return 5;
  return 0;
}
```

---

## Feature Implementation Status

### ✅ Completed Features

| Feature | Description |
|---------|-------------|
| **Adaptive Grader** | All 20 activities use `grader-configs/*.ts` with remarks-based feedback |
| **Cardinal Rubric** | 3 activities have per-section 0-5 scoring |
| **Blocking + Retry** | Errors block advancement, students can edit and retry |
| **Previous Attempts** | Grader receives attempt history for context-aware feedback |
| **GradingSidebar** | Visual display of section scores with progress bars |
| **Structured Editors** | `SPOEditor` and `PTOEditor` for outline activities |

### 🔜 Future Enhancements (Nice to Have)

| Feature | Description |
|---------|-------------|
| Per-Section Categories | Group feedback by section (topic-sentence, sd-1, etc.) |
| Inspiration Toggle | Show hints/examples like AlphaWrite |
| "I Disagree" Button | Student grading disputes |

---

## Section Score Details

### SPO / Freeform Paragraph Rubric (20 points)

| Section | Max | Criteria |
|---------|-----|----------|
| Topic Sentence | 5 | Clear main idea, TWR strategy, precise word choice |
| Supporting Details | 5 | Relevant, logically sequenced, note form |
| Concluding Sentence | 5 | Reaffirms main idea, provides closure |
| Conventions | 5 | Grammar, spelling, punctuation (T.S. & C.S. only) |

### Elaborate Paragraph Rubric (10 points)

| Section | Max | Criteria |
|---------|-----|----------|
| Improvements | 5 | Addresses instructions, enhances original paragraph |
| Conventions | 5 | Grammar, spelling, punctuation control |

### Score Levels

| Score | Level | Color |
|-------|-------|-------|
| 5 | Exceptional | Green |
| 4 | Skilled | Green |
| 3 | Proficient | Cyan |
| 2 | Developing | Orange |
| 1 | Beginning | Pink |
| 0 | Absent/Incomplete | Pink |

---

## Quick Reference

### Adding a New Cardinal Rubric Activity

1. Add lesson to `CARDINAL_RUBRIC_ACTIVITIES` in `practice-grader.ts`
2. Add lesson to `CARDINAL_RUBRIC_ACTIVITIES` in `PracticeSessionContent.tsx`
3. Create grader config with appropriate criteria
4. Add lesson definition with prompts

### Checking if Activity Uses Cardinal Rubric

```typescript
// In practice-grader.ts
const CARDINAL_RUBRIC_ACTIVITIES = {
  'writing-spos': 'spo',
  'elaborate-paragraphs': 'elaborate',
  'write-freeform-paragraph': 'freeform-paragraph',
};
```

---

## Related Documentation

- `practice-activities-guide.md` — Master reference for all activities, setup, and import status
