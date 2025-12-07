# Practice Lesson Setup Guide

> How to add new practice lessons by extracting content from AlphaWrite.

**Status**: Tier 1 & 2 Complete, Tier 3 Pending  
**Last Updated**: December 7, 2024

---

## Overview

Each practice lesson requires **4 types of content** to be fully functional:

| Content Type | File Location | Purpose |
|--------------|---------------|---------|
| **Grader Config** | `lib/constants/grader-configs/{slug}.ts` | Tells AI how to evaluate student writing |
| **Quiz Examples** | `lib/constants/practice-examples/{tier}-examples.ts` | Review phase: students evaluate these |
| **Writing Prompts** | `lib/constants/practice-lessons/{tier}-lessons.ts` | Write phase: students respond to these |
| **Lesson Metadata** | `lib/constants/practice-lessons/{tier}-lessons.ts` | Name, description, category, status |

---

## File Structure

The lesson and example files are organized by tier for maintainability:

```
lib/constants/
├── practice-lessons/
│   ├── types.ts                 # Type definitions
│   ├── sentence-lessons.ts      # Tier 1: 5 sentence-level lessons
│   ├── paragraph-lessons.ts     # Tier 2: 9 paragraph-level lessons
│   ├── essay-lessons.ts         # Tier 3: 6 essay-level lessons
│   └── index.ts                 # Re-exports all + helper functions
├── practice-lessons.ts          # Re-exports from directory (backwards compat)
│
├── practice-examples/
│   ├── types.ts                 # Type definitions
│   ├── sentence-examples.ts     # Tier 1 review examples
│   ├── paragraph-examples.ts    # Tier 2 review examples
│   ├── essay-examples.ts        # Tier 3 review examples (TODO)
│   └── index.ts                 # Re-exports all + helper functions
└── practice-examples.ts         # Re-exports from directory (backwards compat)
```

---

## Content Sources (AlphaWrite)

All content can be extracted from the AlphaWrite repository:

```
_alphawrite/alphawrite-2/packages/edu-core/src/activities/
├── {activity-id}/
│   ├── grader.config.ts      → Grader config
│   ├── evals/test-data.ts    → Quiz examples (correct/incorrect)
│   ├── data/*.json           → Writing prompts
│   └── generator.prompts.ts  → Additional prompt templates
```

---

## Lesson Content Checklist

### ✅ Sentence Lessons (Tier 1) — COMPLETE

| Slug | Grader Config | Quiz Examples | Prompts | Status |
|------|---------------|---------------|---------|--------|
| `basic-conjunctions` | ✅ | ✅ | ✅ | available |
| `write-appositives` | ✅ | ✅ | ✅ | available |
| `subordinating-conjunctions` | ✅ | ✅ | ✅ | available |
| `kernel-expansion` | ✅ | ✅ | ✅ | available |
| `fragment-or-sentence` | ✅ | ✅ | ✅ | available |

### ✅ Paragraph Lessons (Tier 2) — COMPLETE

| Slug | Grader Config | Quiz Examples | Prompts | Status |
|------|---------------|---------------|---------|--------|
| `make-topic-sentences` | ✅ | ✅ | ✅ | available |
| `identify-topic-sentence` | ✅ | ✅ | ✅ | available |
| `writing-spos` | ✅ | ✅ | ✅ | available |
| `eliminate-irrelevant-sentences` | ✅ | ✅ | ✅ | available |
| `elaborate-paragraphs` | ✅ | ✅ | ✅ | available |
| `using-transition-words` | ✅ | ✅ | ✅ | available |
| `finishing-transition-words` | ✅ | ✅ | ✅ | available |
| `write-cs-from-details` | ✅ | ✅ | ✅ | available |
| `write-ts-from-details` | ✅ | ✅ | ✅ | available |

### ❌ Essay Lessons (Tier 3) — TODO

| Slug | Grader Config | Quiz Examples | Prompts | Status |
|------|---------------|---------------|---------|--------|
| `distinguish-g-s-t` | ✅ | ❌ | ❌ | coming-soon |
| `write-g-s-from-t` | ✅ | ❌ | ❌ | coming-soon |
| `write-introductory-sentences` | ✅ | ❌ | ❌ | coming-soon |
| `craft-conclusion-from-gst` | ✅ | ❌ | ❌ | coming-soon |
| `write-t-from-topic` | ✅ | ❌ | ❌ | coming-soon |
| `match-details-pro-con` | ✅ | ❌ | ❌ | coming-soon |

---

## Adding Tier 3 (Essay) Lessons

### Step 1: Add Quiz Examples

**File to edit**: `lib/constants/practice-examples/essay-examples.ts`

**AlphaWrite source files**:
```
_alphawrite/alphawrite-2/packages/edu-core/src/activities/
├── 34-distinguish-g-s-t/evals/test-data.ts
├── 36-write-g-s-from-t/evals/test-data.ts
├── 37-craft-conclusion-from-gst/evals/test-data.ts
├── 38-write-introductory-sentences/evals/test-data.ts
├── 39-write-t-from-topic/evals/test-data.ts
└── 40-match-details-pro-con/evals/test-data.ts
```

**Pattern to follow** (see `sentence-examples.ts` or `paragraph-examples.ts`):

```typescript
export const DISTINGUISH_GST_EXAMPLES: ReviewExample[] = [
  // 3-4 CORRECT examples
  {
    question: 'Label this as General, Specific, or Thesis: "..."',
    answer: 'This is a Thesis statement because...',
    isCorrect: true,
    explanation: 'Explains why this is the correct label.',
    topic: 'writing',
  },
  // 2-3 INCORRECT examples
  {
    question: 'Label this as General, Specific, or Thesis: "..."',
    answer: 'This is General.',
    isCorrect: false,
    explanation: 'Incorrect - this is actually a Thesis because...',
    topic: 'writing',
  },
];

// Update the ESSAY_EXAMPLES map at the bottom
export const ESSAY_EXAMPLES: Record<string, ReviewExample[]> = {
  'distinguish-g-s-t': DISTINGUISH_GST_EXAMPLES,
  // ... add other essay lesson examples
};
```

### Step 2: Add Writing Prompts

**File to edit**: `lib/constants/practice-lessons/essay-lessons.ts`

**AlphaWrite source files**:
```
_alphawrite/alphawrite-2/packages/edu-core/src/activities/
├── 34-distinguish-g-s-t/data/seed.json
├── 36-write-g-s-from-t/data/seed.json
├── 37-craft-conclusion-from-gst/data/seed.json
├── 38-write-introductory-sentences/data/seed.json
├── 39-write-t-from-topic/data/seed.json
└── 40-match-details-pro-con/data/seed.json
```

**Pattern to follow** (see existing lessons in `paragraph-lessons.ts`):

```typescript
'distinguish-g-s-t': {
  id: 'distinguish-g-s-t',
  name: 'Distinguish GST Statements',
  description: 'Identify General, Specific, and Thesis statements in introductions.',
  category: 'essay',
  status: 'available',  // Change from 'coming-soon'
  phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
  instruction: 'Label each sentence as General, Specific, or Thesis.',
  prompts: [
    {
      id: 'gst-1',
      prompt: 'Label these sentences: "Many people enjoy music. Jazz originated in New Orleans. Jazz music combines African rhythms with European harmonies to create a unique American art form."',
      hint: 'General = broad statement, Specific = narrowing detail, Thesis = main argument.',
    },
    // ... 4-5 more prompts
  ],
  exampleResponse: {
    prompt: 'Label: "Dogs are popular pets. Golden retrievers are friendly. Golden retrievers make excellent family pets because of their gentle temperament."',
    response: 'General: "Dogs are popular pets." Specific: "Golden retrievers are friendly." Thesis: "Golden retrievers make excellent family pets because of their gentle temperament."',
    explanation: 'The sentences progress from broad (all dogs) to narrow (golden retrievers) to argumentative (why they\'re good family pets).',
  },
},
```

### Step 3: Update Index Export (if needed)

**File**: `lib/constants/practice-examples/index.ts`

Add exports for the new example arrays:

```typescript
export {
  DISTINGUISH_GST_EXAMPLES,
  WRITE_GS_FROM_T_EXAMPLES,
  WRITE_INTRODUCTORY_SENTENCES_EXAMPLES,
  CRAFT_CONCLUSION_FROM_GST_EXAMPLES,
  WRITE_T_FROM_TOPIC_EXAMPLES,
  MATCH_DETAILS_PRO_CON_EXAMPLES,
} from './essay-examples';
```

---

## AlphaWrite Activity ID → Slug Mapping

| AlphaWrite Activity | Our Slug | Tier |
|---------------------|----------|------|
| `02-fragment-or-sentence` | `fragment-or-sentence` | Sentence |
| `11-basic-conjunctions` | `basic-conjunctions` | Sentence |
| `13-write-appositives` | `write-appositives` | Sentence |
| `14-subordinating-conjunctions` | `subordinating-conjunctions` | Sentence |
| `16-kernel-expansion` | `kernel-expansion` | Sentence |
| `19-identify-topic-sentence` | `identify-topic-sentence` | Paragraph |
| `22-eliminate-irrelevant-sentences` | `eliminate-irrelevant-sentences` | Paragraph |
| `23-write-ts-from-details` | `write-ts-from-details` | Paragraph |
| `24-write-cs-from-details` | `write-cs-from-details` | Paragraph |
| `25-make-topic-sentences` | `make-topic-sentences` | Paragraph |
| `28-writing-spos` | `writing-spos` | Paragraph |
| `30-elaborate-paragraphs` | `elaborate-paragraphs` | Paragraph |
| `31-using-transition-words` | `using-transition-words` | Paragraph |
| `32-finishing-transition-words` | `finishing-transition-words` | Paragraph |
| `34-distinguish-g-s-t` | `distinguish-g-s-t` | Essay |
| `36-write-g-s-from-t` | `write-g-s-from-t` | Essay |
| `37-craft-conclusion-from-gst` | `craft-conclusion-from-gst` | Essay |
| `38-write-introductory-sentences` | `write-introductory-sentences` | Essay |
| `39-write-t-from-topic` | `write-t-from-topic` | Essay |
| `40-match-details-pro-con` | `match-details-pro-con` | Essay |

---

## How Content Flows at Runtime

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REVIEW PHASE (1 min)                        │
├─────────────────────────────────────────────────────────────────────┤
│  buildReviewSequence(lessonId)                                      │
│    ├─ getGraderConfig(lessonId)                                     │
│    │   └─ Creates instruction cards from:                           │
│    │      • howTheActivityWorks → "How this works" card             │
│    │      • importantPrinciplesForGrading → "Key rules" card        │
│    │                                                                │
│    └─ getRandomReviewExamples(lessonId)                             │
│        └─ Returns mix of correct/incorrect examples                 │
│           Student evaluates each: "Is this correct?"                │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         WRITE PHASE (3 min)                         │
├─────────────────────────────────────────────────────────────────────┤
│  getRandomPrompt(lessonId)                                          │
│    └─ Returns one prompt from PRACTICE_LESSONS[lessonId].prompts    │
│                                                                     │
│  Student writes response                                            │
│                                                                     │
│  gradePracticeSubmission({ lessonId, content, prompt })             │
│    ├─ getGraderConfig(lessonId)                                     │
│    ├─ buildSystemPrompt(config) → Creates AI prompt                 │
│    └─ Claude Sonnet 4 → Returns score + feedback                    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        REVISE PHASE (2 min)                         │
├─────────────────────────────────────────────────────────────────────┤
│  Student sees:                                                      │
│    • Original response with score                                   │
│    • AI feedback (from writeRemarks)                                │
│    • Sidebar example for reference                                  │
│                                                                     │
│  Student revises their response                                     │
│  Same grading flow as Write phase                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Verification

After adding content for a lesson:

1. Change `status: 'coming-soon'` → `status: 'available'`
2. Run the dev server: `npm run dev`
3. Navigate to `/practice` and verify the lesson appears
4. Start a practice session and verify:
   - Review phase shows instruction cards + examples
   - Write phase shows prompts
   - Grading returns scores and feedback

---

## Quick Reference for New Chat

To continue with Tier 3 essay lessons in a new chat, use this prompt:

```
Follow the plan in @_docs/implementation-2/practice-lesson-setup.md to add 
quiz examples and writing prompts for Tier 3 essay lessons.

Files to edit:
- lib/constants/practice-examples/essay-examples.ts (add ReviewExample arrays)
- lib/constants/practice-lessons/essay-lessons.ts (add prompts, change status)
- lib/constants/practice-examples/index.ts (add exports if needed)

AlphaWrite sources:
- _alphawrite/alphawrite-2/packages/edu-core/src/activities/34-distinguish-g-s-t/
- _alphawrite/alphawrite-2/packages/edu-core/src/activities/36-write-g-s-from-t/
- _alphawrite/alphawrite-2/packages/edu-core/src/activities/37-craft-conclusion-from-gst/
- _alphawrite/alphawrite-2/packages/edu-core/src/activities/38-write-introductory-sentences/
- _alphawrite/alphawrite-2/packages/edu-core/src/activities/39-write-t-from-topic/
- _alphawrite/alphawrite-2/packages/edu-core/src/activities/40-match-details-pro-con/

Follow the same pattern as sentence-examples.ts and paragraph-examples.ts.
```

---

## References

- [PRACTICE_MODE_DECISIONS.md](../_docs/practice-mode/PRACTICE_MODE_DECISIONS.md) — Architecture decisions
- [PRACTICE_MODE_IMPLEMENTATION.md](../_docs/practice-mode/PRACTICE_MODE_IMPLEMENTATION.md) — Full checklist
- [AlphaWrite Integration Analysis](../_docs/curriculum/alphawrite/alphawrite-integration-analysis.md) — Coverage mapping
- [AlphaWrite Grader Configs](../_docs/curriculum/alphawrite/alphawrite-activities-with-grader-config.md) — Extracted configs
