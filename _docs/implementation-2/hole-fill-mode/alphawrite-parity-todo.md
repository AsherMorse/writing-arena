# AlphaWrite Parity: Practice Activities TODO

## Overview
This document tracks what's needed to bring our practice activities to feature parity with AlphaWrite.

---

## 1. Review Phase Formatting (Quick Fix)

**File**: `components/practice/PracticeReviewPhase.tsx`

- [x] Add `whitespace-pre-line` to the **question** paragraph (line ~234)
- [x] Add `whitespace-pre-line` to the **answer** paragraph (line ~240)

**Affected lessons** (have multi-line content):
- `pre-transition-outline`
- `distinguish-g-s-t`
- `write-g-s-from-t`
- `craft-conclusion-from-gst`
- `match-details-pro-con`
- `writing-spos`

---

## 1b. ExampleSidebar Formatting (Quick Fix)

**File**: `components/practice/ExampleSidebar.tsx`

- [x] Add `whitespace-pre-line` to positive example text (line ~71)
- [x] Add `whitespace-pre-line` to negative example text (line ~88)

---

## 2. Structured Editor (Major Feature) ✅ DONE

**Problem**: Our Write phase uses a single freeform `<textarea>`. AlphaWrite uses structured form inputs with labeled fields.

**File**: `components/practice/PracticeSessionContent.tsx` (or new component)

### For SPO Activities (`writing-spos`)
- [x] Create `SPOEditor` component with:
  - T.S. (Topic Sentence) input field
  - SD1, SD2, SD3 supporting detail fields with dashed underlines
  - C.S. (Concluding Sentence) input field
- [x] Store structured data: `{ ts: string, sd: string[], cs: string }`

### For Pre-Transition Outline (`pre-transition-outline`)
- [x] Create `PTOEditor` component with:
  - Thesis Statement field
  - Paragraph 1: T.S. + SD1, SD2, SD3
  - Paragraph 2: T.S. + SD1, SD2, SD3
  - Concluding Statement field
- [x] Store structured data matching AlphaWrite schema

### For Other Essay Activities
- [x] Determine which activities need structured vs freeform editors
- [x] Map lesson ID → editor type (via `LESSON_EDITOR_MAP` in PracticeSessionContent.tsx)

---

## 3. Remove Timer

**Problem**: AlphaWrite doesn't have timed phases. Our timer creates pressure that doesn't match the original.

**Files to update**:
- [x] `components/practice/PracticeSessionContent.tsx` - remove timer display
- [x] `components/practice/PracticeReviewPhase.tsx` - remove timer display
- [x] `lib/hooks/usePracticeLesson.ts` - timer still runs but is not displayed/enforced
- [ ] `lib/constants/practice-lessons.ts` - consider removing `phaseDurations` (optional cleanup)

**Decision**: Keep phases but remove time limits. ✅ DONE

---

## 4. Blocking Grading with Retry Loop (Core Feature) ✅ Phase 1 DONE

**Problem**: Currently we auto-advance to Revise phase after Write phase. AlphaWrite blocks advancement if the answer has errors and lets students retry.

**How AlphaWrite works**:
1. Student submits → Grader returns `{ isCorrect, score, remarks[], solution }`
2. If `remarks` has any `severity: 'error'` → Block advancement, show feedback
3. Student edits and resubmits (unlimited retries)
4. Only advance when `isCorrect: true` (no errors, nits are OK)

**File**: `components/practice/PracticeSessionContent.tsx`

### Phase 1: Blocking Logic ✅ DONE
- [x] Add state: `attemptCount`, `blockingRemarks`, `blockingSolution`, `isBlocked`
- [x] Add `hasBlockingErrors()` helper to check for severity: 'error'
- [x] Modify `handlePhaseComplete` to check for blocking errors
- [x] If blocked: show inline feedback + "Try Again" button, stay in Write phase
- [x] If passed: advance to Revise phase normally
- [x] Implement `handleRetry()` to clear blocking state and let student edit

### Phase 2: Previous Attempts Tracking (Enhancement) ✅ DONE
- [x] Add `previousAttempts` state: `{ content: string, remarks: GradingRemark[] }[]`
- [x] On blocked submission, push current content + remarks to history
- [x] Pass `previousAttempts` to grading API request body
- [x] Update `app/api/evaluate-practice/route.ts` to accept `previousAttempts`
- [x] Update `lib/grading/prompt-builder.ts` to include attempt history in prompt
- [x] Prompt addition shows attempt number, previous content, and feedback given

**Value**: AI knows what student already tried, avoids repetitive feedback

### Phase 3: Per-Section Categories (Enhancement)
- [ ] Update prompt for structured activities to return section-specific `category`
- [ ] Categories: `topic-sentence`, `sd-1`, `sd-2`, `sd-3`, `concluding-sentence`, `thesis`, etc.
- [ ] Display feedback grouped by section in the editor UI

---

## 5. Per-Section Grading (Only for Cardinal Rubric Activities)

**Context**: After analyzing AlphaWrite's codebase (see `alphawrite-grading-methods.md`), only 2 imported activities use per-section scoring:

### Activities That Need Per-Section Scoring

**1. `writing-spos`** (Cardinal Rubric: `single-paragraph-outline-rubric`)
- Topic Sentence (T.S.): 0-5
- Supporting Details & Organization: 0-5
- Concluding Sentence (C.S.): 0-5
- Conventions: 0-5

**2. `elaborate-paragraphs`** (Cardinal Rubric: `elaborated-paragraph-rubric`)
- Improvements to Paragraph: 0-5
- Conventions: 0-5

### Implementation Tasks

- [ ] Add `sectionScores` field to `GradingResult` type (optional)
- [ ] Update `practice-grader.ts` tool schema to request section scores
- [ ] Map `lessonId` → whether to request section scores
- [ ] Create `GradingSidebar` component to display section scores
- [ ] Wire up sidebar for `writing-spos` and `elaborate-paragraphs` only

### Other Activities (No Changes Needed)

All 20 other imported activities use **Adaptive Grader**:
- ✅ Already use activity-specific `grader.config.ts`
- ✅ Already have blocking + retry
- ✅ Return `{ isCorrect, remarks[] }` (no section scores)
- ✅ Match AlphaWrite's behavior perfectly

---

## 6. Inspiration Feature (Nice to Have)

AlphaWrite has an "Inspiration" toggle that shows hints/examples.

- [ ] Design inspiration content per lesson
- [ ] Add toggle to editor UI
- [ ] Show/hide inspiration panel

---

## 7. Additional UI Polish

- [ ] "I Disagree" button (AlphaWrite has this for grading disputes)
- [ ] Match AlphaWrite's color scheme (green progress bars, etc.)
- [ ] "Finish activity" button styling

---

## Priority Order

1. ~~**Review phase formatting** - 5 min fix, affects 6+ lessons~~ ✅ DONE
2. ~~**Remove timer** - Simple removal, improves UX~~ ✅ DONE
3. ~~**Structured editor for SPO** - Core feature parity~~ ✅ DONE
4. ~~**Structured editor for PTO** - Core feature parity~~ ✅ DONE
5. ~~**Blocking grading with retry loop (Phase 1)** - Core blocking behavior~~ ✅ DONE
6. ~~**Previous attempts tracking (Phase 2)** - Better retry feedback~~ ✅ DONE
7. **Per-section scoring for SPO** - Add 4-section breakdown 🔜 NEXT
8. **Per-section scoring for Elaborate** - Add 2-section breakdown
9. **Per-section grading sidebar** - Display scores in UI
10. **Inspiration/polish** - Nice to have

---

## Reference: Key File Paths

### Our Implementation
- `components/practice/PracticeSessionContent.tsx` - Main session component with editor routing
- `components/practice/SPOEditor.tsx` - Structured editor for Single Paragraph Outline
- `components/practice/PTOEditor.tsx` - Structured editor for Pre-Transition Outline
- `components/practice/PracticeReviewPhase.tsx` - Review phase with question/answer display
- `lib/hooks/usePracticeLesson.ts` - Timer and phase logic
- `lib/constants/practice-lessons.ts` - Lesson definitions
- `lib/constants/practice-examples/` - Review examples data (essay-examples.ts, paragraph-examples.ts, etc.)

### Grading Implementation
- `app/api/evaluate-practice/route.ts` - API endpoint for grading
- `lib/grading/practice-grader.ts` - Claude Sonnet 4 grader with structured output
- `lib/grading/prompt-builder.ts` - System/user prompt construction
- `lib/constants/grader-configs/` - Activity-specific grading configs (one per lesson)
- `lib/constants/grader-configs/types.ts` - `GradingResult`, `GradingRemark`, `ActivityGraderConfig`

### AlphaWrite Source
Located at: `_alphawrite/alphawrite-2/packages/edu-core/src/activities/`

Key files per activity:
- `schema.ts` - Form data types (shows field structure)
- `service.ts` - Grading logic
- `grader.config.ts` - Grading criteria (Adaptive Grader only)
- `data/seed.json` - Prompts/topics

### Analysis Documents
- `alphawrite-grading-methods.md` - **NEW!** Comprehensive analysis of which grading method each activity uses
- `alphawrite-activity-comparison.md` - List of imported vs not-imported activities

---

## AlphaWrite Schemas (Copy for Reference)

### SPO Schema (Single Paragraph Outline)
From `_alphawrite/alphawrite-2/packages/edu-core/src/curriculum/single-paragraph-outline.ts`:

```typescript
// SPO = { ts: string, sd: string[], cs: string }
export const SPO = z.object({
  ts: z.string().describe('Topic Sentence'),
  sd: z.array(z.string()).min(1).describe('Supporting Details'),
  cs: z.string().describe('Concluding Sentence'),
});
```

### PTO Schema (Pre-Transition Outline)
```typescript
// PTO = { topic, thesisStatement, paragraphOutlines: [{ ts, sd[] }], concludingStatement }
const PTOParagraph = SPO.omit({ cs: true }); // { ts: string, sd: string[] }

export const PTO = z.object({
  topic: z.string().describe('Essay Topic'),
  thesisStatement: z.string().describe('Thesis Statement'),
  paragraphOutlines: z.array(PTOParagraph).describe('Paragraph Outlines'),
  concludingStatement: z.string().describe('Concluding Statement'),
});
```

---

## Current State Summary

**Review Phase**: ✅ Has `whitespace-pre-line` CSS for proper line breaks in multi-line examples.

**Write Phase**: 
- ✅ `writing-spos` lesson uses `SPOEditor` with structured fields (TS, SD1-3, CS)
- ✅ `pre-transition-outline` lesson uses `PTOEditor` with thesis, paragraphs, and conclusion
- Other lessons use freeform `<textarea>` (appropriate for their activity type)

**Timer**: ✅ Removed from UI. Phases still exist but no time pressure.

**Grading**: 
- ✅ Grader configs exist for all 22 imported activities (`lib/constants/grader-configs/`)
- ✅ Practice grader uses Claude Sonnet 4 with structured output
- ✅ Returns `{ isCorrect, score, remarks[], solution }` with severity levels
- ✅ Blocking behavior: Errors block advancement with inline feedback
- ✅ Retry loop: "Edit & Try Again" button clears blocking state
- ✅ Attempt counter tracks retry count
- ✅ Previous attempts tracked and sent to grader for context
- ❌ Missing per-section scores for `writing-spos` and `elaborate-paragraphs`
- 🔜 Next: Add per-section scoring to match AlphaWrite's cardinal rubrics

**Grading Method Analysis**:
- ✅ Analyzed all 22 imported activities (see `alphawrite-grading-methods.md`)
- ✅ 20 activities use Adaptive Grader (no section scores) - already correct!
- 🔜 2 activities need Cardinal Rubric (per-section scores) - need implementation

---

## Implementation Details: Blocking Grading (Phase 1)

### State Variables (PracticeSessionContent.tsx)
```typescript
const [isBlocked, setIsBlocked] = useState(false);
const [blockingRemarks, setBlockingRemarks] = useState<GradingRemark[]>([]);
const [blockingSolution, setBlockingSolution] = useState<string>('');
const [attemptCount, setAttemptCount] = useState(0);
```

### Logic Flow
1. Student submits in Write phase → `handlePhaseComplete()` fires
2. `attemptCount` increments
3. Grading API called → returns `{ score, remarks, solution }`
4. Check `hasBlockingErrors(remarks)` → looks for `severity: 'error'`
5. If errors: Set `isBlocked=true`, store `blockingRemarks`, stay in Write phase
6. If no errors (nits OK): Clear blocking state, advance to Revise phase
7. On "Edit & Try Again" click: `handleRetry()` clears blocking state

### UI Components
- Blocking feedback panel shows error remarks with icons
- Collapsible "Show example solution" section
- Attempt counter badge
- "Edit & Try Again" button to dismiss and continue editing

---

## Implementation Details: Previous Attempts Tracking (Phase 2)

### State Variables (PracticeSessionContent.tsx)
```typescript
const [previousAttempts, setPreviousAttempts] = useState<
  { content: string; remarks: GradingRemark[] }[]
>([]);
```

### Logic Flow
1. Student submits → grading returns with errors → blocked
2. Current content + remarks pushed to `previousAttempts` array
3. Student edits and resubmits
4. `gradeSubmission()` passes `previousAttempts` to API
5. Prompt builder includes attempt history context for AI

### Prompt Context (prompt-builder.ts)
```
## Previous Attempts
The student has attempted this 2 time(s) before...

### Attempt 1
**Submitted**: [content]
**Feedback given**:
- [error] Missing topic sentence
- [nit] Capitalize proper nouns

### Current Attempt (3)
Student Answer: [new content]
```

### Files Changed
- `lib/grading/practice-grader.ts` - Added `PreviousAttempt` type, accepts in input
- `lib/grading/prompt-builder.ts` - Builds attempt history into user prompt
- `app/api/evaluate-practice/route.ts` - Accepts `previousAttempts` in request body
- `components/practice/PracticeSessionContent.tsx` - Tracks attempts, passes to API
