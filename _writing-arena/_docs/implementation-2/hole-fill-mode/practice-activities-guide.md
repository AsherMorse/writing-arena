# Practice Activities Guide

> Master reference for all practice activities: status, setup, and implementation.
>
> **Last Updated**: December 8, 2024

---

## Quick Stats

| Category | Count |
|----------|-------|
| **Imported Activities** | 23 |
| **Not Yet Imported** | 20 |
| **Cardinal Rubric** (per-section scoring) | 3 |
| **Adaptive Grader** (remarks-based) | 20 |

---

## Imported Activities (23)

### Sentence Level — Tier 1 (5 activities) ✅ COMPLETE

| # | Lesson ID | Grader | Quiz | Prompts |
|---|-----------|--------|------|---------|
| 02 | `fragment-or-sentence` | ✅ | ✅ | ✅ |
| 11 | `basic-conjunctions` | ✅ | ✅ | ✅ |
| 13 | `write-appositives` | ✅ | ✅ | ✅ |
| 14 | `subordinating-conjunctions` | ✅ | ✅ | ✅ |
| 16 | `kernel-expansion` | ✅ | ✅ | ✅ |

### Paragraph Level — Tier 2 (10 activities) ✅ COMPLETE

| # | Lesson ID | Grader | Quiz | Prompts | Grading Method |
|---|-----------|--------|------|---------|----------------|
| 19 | `identify-topic-sentence` | ✅ | ✅ | ✅ | Adaptive |
| 22 | `eliminate-irrelevant-sentences` | ✅ | ✅ | ✅ | Adaptive |
| 23 | `write-ts-from-details` | ✅ | ✅ | ✅ | Adaptive |
| 24 | `write-cs-from-details` | ✅ | ✅ | ✅ | Adaptive |
| 25 | `make-topic-sentences` | ✅ | ✅ | ✅ | Adaptive |
| 28 | `writing-spos` | ✅ | ✅ | ✅ | **Cardinal** (4 sections) |
| 30 | `elaborate-paragraphs` | ✅ | ✅ | ✅ | **Cardinal** (2 sections) |
| 31 | `using-transition-words` | ✅ | ✅ | ✅ | Adaptive |
| 32 | `finishing-transition-words` | ✅ | ✅ | ✅ | Adaptive |
| 33 | `write-freeform-paragraph` | ✅ | ❌ | ✅ | **Cardinal** (4 sections) |

### Essay Level — Tier 3 (8 activities) — GRADERS DONE, CONTENT TODO

| # | Lesson ID | Grader | Quiz | Prompts | Status |
|---|-----------|--------|------|---------|--------|
| 34 | `distinguish-g-s-t` | ✅ | ❌ | ❌ | coming-soon |
| 35 | `write-s-from-g-t` | ✅ | ❌ | ❌ | coming-soon |
| 36 | `write-g-s-from-t` | ✅ | ❌ | ❌ | coming-soon |
| 37 | `craft-conclusion-from-gst` | ✅ | ❌ | ❌ | coming-soon |
| 38 | `write-introductory-sentences` | ✅ | ❌ | ❌ | coming-soon |
| 39 | `write-t-from-topic` | ✅ | ❌ | ❌ | coming-soon |
| 40 | `match-details-pro-con` | ✅ | ❌ | ❌ | coming-soon |
| 50 | `pre-transition-outline` | ✅ | ❌ | ❌ | coming-soon |

---

## Not Yet Imported (20)

### Sentence Level

| # | Activity | Description | Priority |
|---|----------|-------------|----------|
| 04 | unscramble-sentences | Put scrambled words in correct order | Low |
| 05 | identify-sentence-type | Identify declarative/interrogative/etc. | Low |
| 06 | change-sentence-type | Convert between sentence types | Low |
| 07 | write-sentence-type | Write a specific sentence type | Low |
| 08 | write-sentence-about-picture | Describe an image | Low |
| 09 | expository-writing-terms | Learn writing vocabulary | Low |
| 10 | vivid-vocabulary | Replace bland words with vivid ones | **High** |
| 12 | identify-appositives | Find appositives in sentences | Low |
| 13A | brainstorm-appositives | Generate appositive ideas | Low |
| 15 | combine-sentences | Join two sentences into one | **High** |
| 17 | kernel-expansion-scaffolds | Guided sentence expansion | Low |

### Paragraph Level

| # | Activity | Description | Priority |
|---|----------|-------------|----------|
| 20 | topic-brainstorm | Generate ideas for a topic | Medium |
| 21 | topic-sentence-matching | Match topic sentences to paragraphs | Low |
| 21C | identify-ts-and-sequence-details | Find TS and order details | Low |
| 26 | use-three-strategies | Improve topic sentences with strategies | **High** |
| 27 | turn-paragraph-into-spo | Extract outline from paragraph | **High** |
| 29 | turn-outline-into-draft | Convert outline to paragraph | **High** |

### Note-Taking Skills

| # | Activity | Description | Priority |
|---|----------|-------------|----------|
| 120 | identify-keywords | Find key words in text | Low |
| 121 | convert-sentence-to-notes | Turn sentences into notes | Low |
| 122 | convert-notes-to-sentence | Turn notes into sentences | Low |

---

## High-Value Activities to Add Next

1. **26-use-three-strategies** — Revising weak sentences (revision skills)
2. **29-turn-outline-into-draft** — Key paragraph writing skill
3. **27-turn-paragraph-into-spo** — Reverse extraction skill
4. **10-vivid-vocabulary** — Word choice improvement
5. **15-combine-sentences** — Sentence fluency

---

## Custom Activities (Not in AlphaWrite)

These skills aren't covered by AlphaWrite but are needed:

| Proposed Slug | Description | Build Effort |
|---------------|-------------|--------------|
| `fix-agreement-errors` | Fix tense/number agreement | 🔨 Full build |
| `revise-weak-sentences` | Strengthen vague sentences | 🔧 Adapt from #26 |
| `eliminate-repetition` | Remove redundant content | 🔨 Full build |
| `revise-paragraph` | Fix multiple error types | 🔧 Adapt from #30 |

---

## How to Add a New Lesson

### Required Content (4 pieces)

| Content Type | File Location | Purpose |
|--------------|---------------|---------|
| **Grader Config** | `lib/constants/grader-configs/{slug}.ts` | AI evaluation criteria |
| **Quiz Examples** | `lib/constants/practice-examples/{tier}-examples.ts` | Review phase content |
| **Writing Prompts** | `lib/constants/practice-lessons/{tier}-lessons.ts` | Write phase prompts |
| **Lesson Metadata** | `lib/constants/practice-lessons/{tier}-lessons.ts` | Name, description, status |

### File Structure

```
lib/constants/
├── grader-configs/
│   ├── types.ts                 # GradingResult, SectionScores types
│   ├── index.ts                 # Export all configs + getGraderConfig()
│   └── {lesson-slug}.ts         # One file per activity (23 files)
│
├── practice-lessons/
│   ├── types.ts                 # PracticeLesson, LessonPrompt types
│   ├── sentence-lessons.ts      # Tier 1 (5 lessons)
│   ├── paragraph-lessons.ts     # Tier 2 (10 lessons)
│   ├── essay-lessons.ts         # Tier 3 (8 lessons)
│   └── index.ts                 # Re-exports + helpers
│
└── practice-examples/
    ├── types.ts                 # ReviewExample type
    ├── sentence-examples.ts     # Tier 1 review examples
    ├── paragraph-examples.ts    # Tier 2 review examples
    ├── essay-examples.ts        # Tier 3 review examples (TODO)
    └── index.ts                 # Re-exports + helpers
```

### AlphaWrite Source Files

```
_alphawrite/alphawrite-2/packages/edu-core/src/activities/{##-activity-slug}/
├── grader.config.ts      → Grader config criteria
├── evals/test-data.ts    → Quiz examples (correct/incorrect)
├── data/seed.json        → Writing prompts
├── schema.ts             → Form data types
└── index.ts              → Activity metadata
```

---

## Step-by-Step: Add Tier 3 Essay Lessons

### Step 1: Add Quiz Examples

**File**: `lib/constants/practice-examples/essay-examples.ts`

```typescript
export const DISTINGUISH_GST_EXAMPLES: ReviewExample[] = [
  {
    question: 'Label this as General, Specific, or Thesis: "..."',
    answer: 'This is a Thesis statement because...',
    isCorrect: true,
    explanation: 'Explains why this is correct.',
    topic: 'writing',
  },
  // Add 3-4 correct, 2-3 incorrect examples
];

export const ESSAY_EXAMPLES: Record<string, ReviewExample[]> = {
  'distinguish-g-s-t': DISTINGUISH_GST_EXAMPLES,
  // ... add other essay lesson examples
};
```

### Step 2: Add Writing Prompts

**File**: `lib/constants/practice-lessons/essay-lessons.ts`

```typescript
'distinguish-g-s-t': {
  id: 'distinguish-g-s-t',
  name: 'Distinguish GST Statements',
  description: 'Identify General, Specific, and Thesis statements.',
  category: 'essay',
  status: 'available',  // Change from 'coming-soon'
  phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
  instruction: 'Label each sentence as General, Specific, or Thesis.',
  prompts: [
    {
      id: 'gst-1',
      prompt: 'Label these sentences: "..."',
      hint: 'General = broad, Specific = narrow, Thesis = argument.',
    },
    // Add 4-5 prompts
  ],
  exampleResponse: { prompt: '...', response: '...', explanation: '...' },
},
```

### Step 3: Update Exports (if needed)

**File**: `lib/constants/practice-examples/index.ts`

```typescript
export { ESSAY_EXAMPLES } from './essay-examples';
```

### Step 4: Verify

1. Change `status: 'coming-soon'` → `status: 'available'`
2. Run `npm run dev`
3. Navigate to `/practice` and test the lesson

---

## Runtime Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REVIEW PHASE                                 │
├─────────────────────────────────────────────────────────────────────┤
│  buildReviewSequence(lessonId)                                      │
│    ├─ getGraderConfig() → instruction cards                         │
│    └─ getRandomReviewExamples() → student evaluates                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         WRITE PHASE                                  │
├─────────────────────────────────────────────────────────────────────┤
│  getRandomPrompt(lessonId) → student writes                         │
│  gradePracticeSubmission()                                          │
│    ├─ Cardinal? → section scores (0-5 each)                         │
│    └─ Adaptive? → isCorrect + remarks[]                             │
│  If errors → Block, show feedback, allow retry                      │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        REVISE PHASE                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Student sees original + feedback                                   │
│  Student revises → same grading flow                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference for New Chat

```
Add quiz examples and writing prompts for Tier 3 essay lessons.

Files to edit:
- lib/constants/practice-examples/essay-examples.ts
- lib/constants/practice-lessons/essay-lessons.ts

AlphaWrite sources:
- _alphawrite/.../activities/34-distinguish-g-s-t/
- _alphawrite/.../activities/35-write-s-from-g-t/
- _alphawrite/.../activities/36-write-g-s-from-t/
- _alphawrite/.../activities/37-craft-conclusion-from-gst/
- _alphawrite/.../activities/38-write-introductory-sentences/
- _alphawrite/.../activities/39-write-t-from-topic/
- _alphawrite/.../activities/40-match-details-pro-con/
- _alphawrite/.../activities/50-pre-transition-outline/

Follow patterns in sentence-examples.ts and paragraph-lessons.ts.
```

---

## Related Documentation

- `grading-implementation-status.md` — Grading system details (Cardinal vs Adaptive)
