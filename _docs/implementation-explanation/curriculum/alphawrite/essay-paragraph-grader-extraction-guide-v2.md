# Essay & Paragraph Grader Extraction Guide v2

> Complete technical guide for extracting AlphaWrite's categorical rubric assessment system for grading paragraphs and essays.

**Version**: 2.0  
**Date**: December 3, 2024  
**Based on**: AlphaWrite `packages/edu-core/src/grading/categorical-rubric/`

---

## Overview

AlphaWrite has a sophisticated essay/paragraph grading system that:
- Evaluates writing against TWR (The Writing Revolution) rubrics
- Supports 7 essay types and grades 3-12
- Returns a scorecard with Yes/Developing/No for each criterion
- Provides detailed feedback with text spans (highlighting)
- Can assess single paragraphs or full multi-paragraph essays
- Uses **two-stage LLM process**: O1 for grading → structured parsing

This guide covers extracting and adapting this system for:
- **Diagnostic use**: Identify skill gaps → recommend remediation activities
- **Full grading**: Provide comprehensive feedback to students
- **Gap detection**: Map scorecard results to practice lessons

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AlphaWrite System                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐                                                  │
│   │  Student     │                                                  │
│   │  Submission  │                                                  │
│   │  {           │                                                  │
│   │   essay,     │                                                  │
│   │   gradeLevel,│                                                  │
│   │   type,      │                                                  │
│   │   phase      │                                                  │
│   │  }           │                                                  │
│   └──────┬───────┘                                                  │
│          │                                                          │
│          v                                                          │
│   ┌──────────────────────┐                                         │
│   │  getRubricPackage()  │ ← Selects & prepares rubric             │
│   └──────┬───────────────┘                                         │
│          │                                                          │
│          v                                                          │
│   ┌──────────────────────────┐                                     │
│   │ generateInitialGrading   │                                     │
│   │ Prompt()                 │                                     │
│   └──────┬───────────────────┘                                     │
│          │                                                          │
│          v                                                          │
│   ┌─────────────────────────────────────┐                          │
│   │  O1 / O3-mini (OpenAI)              │                          │
│   │  "Grade this essay..."              │                          │
│   └──────┬──────────────────────────────┘                          │
│          │                                                          │
│          v                                                          │
│   ┌─────────────────────────────────────┐                          │
│   │  ScorecardIntermediate              │                          │
│   │  {                                  │                          │
│   │    criterion: "Topic sentences",    │                          │
│   │    score: "Developing",             │                          │
│   │    feedback: "...",                 │                          │
│   │    examplesOfWhereToImprove: [      │                          │
│   │      { substringOfInterest: "...",  │                          │
│   │        explanation: "..." }          │                          │
│   │    ]                                │                          │
│   │  }                                  │                          │
│   └──────┬──────────────────────────────┘                          │
│          │                                                          │
│          v                                                          │
│   ┌─────────────────────────────────────┐                          │
│   │  finishScorecard()                  │                          │
│   │  - Locate spans in essay text       │                          │
│   │  - Add startIndex/endIndex          │                          │
│   │  - Add highlightId for UI           │                          │
│   └──────┬──────────────────────────────┘                          │
│          │                                                          │
│          v                                                          │
│   ┌─────────────────────────────────────┐                          │
│   │  Scorecard (final)                  │                          │
│   │  {                                  │                          │
│   │    criterion: "Topic sentences",    │                          │
│   │    score: "Developing",             │                          │
│   │    examplesOfWhereToImprove: [      │                          │
│   │      { substringOfInterest: "...",  │                          │
│   │        explanation: "...",           │                          │
│   │        startIndex: 42,               │                          │
│   │        endIndex: 87 }                │                          │
│   │    ]                                │                          │
│   │  }                                  │                          │
│   └──────┬──────────────────────────────┘                          │
│          │                                                          │
│          ├─────────────────┬────────────────────┐                  │
│          v                 v                    v                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│   │  Diagnostic  │  │  UI Feedback │  │  Gap         │           │
│   │  Report      │  │  (highlighted│  │  Detection   │           │
│   │              │  │  spans)      │  │              │           │
│   └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Complete File List

### Core Assessment Files

```
_alphawrite/alphawrite-2/packages/edu-core/src/grading/categorical-rubric/
├── assessment.ts              # Main runAssessment() function ⭐
├── assessment.prompts.ts      # Prompt generation (generateInitialGradingPrompt, generateRevisionGradingPrompt) ⭐
├── assessment.cases.ts        # Test cases
├── assessment.test.ts         # Tests
├── utils.ts                   # getRubricPackage(), validateAssessmentParams() ⭐
├── scoring.ts                 # Score computation utilities
├── formatters.ts              # Output formatting
├── matchers.ts                # Text span matching/highlighting
├── synopsis.ts                # Synopsis generation
├── index.ts                   # Main exports ⭐
│
├── rubrics/
│   ├── composition-rubric.ts  # Full essay criteria (~626 lines) ⭐
│   ├── draft-rubric.ts        # Draft-stage criteria
│   ├── outline-rubric.ts      # Outline criteria
│   ├── utils.ts               # getPreparedRubric() - filters rubric by grade/type ⭐
│   └── index.ts               # Rubric exports
│
├── types/
│   ├── index.ts               # Main type exports & Submission schema ⭐
│   ├── rubric.ts              # TextStructureSchema, RubricTypeSchema
│   ├── criterion-schema.ts    # CriterionNameSchema (all criterion names)
│   ├── scorecard.ts           # ScorecardIntermediateSchema, ScorecardSchema ⭐
│   ├── span.ts                # SpanSchema, LocatedSpanSchema
│   ├── single-paragraph.ts    # Single paragraph types
│   ├── models.ts              # ValidModel type, VALID_MODELS array
│   ├── score.ts               # Score computation types
│   ├── synopsis.ts            # Synopsis types
│   ├── mappings.ts            # Grade/type mappings
│   └── outline.ts             # Outline structure types
│
├── submission-type-classifier.ts        # Auto-detect essay type
├── submission-type-classifier.prompts.ts
│
├── services/
│   └── grading.ts             # Higher-level grading service
│
└── evals/                     # Test data & validation
    ├── composition/
    ├── outline/
    └── model-essays/
```

**⭐ = Essential files for extraction**

### Supporting Files (From Other Packages)

```
packages/edu-core/src/
├── curriculum/
│   └── grades.ts              # GradeLevel enum (_3 through _12)
│
└── compositions/tutoring/types/
    └── phases/
        └── index.ts           # WritingPhase enum
```

### Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.x.x",     // For Claude API (optional, uses OpenRouter)
  "openai": "^4.x.x",                 // For O1/O3-mini/GPT-4o
  "zod": "^3.x.x",                    // Schema validation
  "lodash": "^4.x.x",                 // cloneDeep
  "common-tags": "^1.x.x"             // stripIndents
}
```

---

## Core API: `runAssessment()`

### Function Signature

```typescript
async function runAssessment({
  submission,
  snapshot,
  model = 'o1',
  reasoningEffort = 'low',
}: RunAssessmentParams): Promise<RunAssessmentResponse>
```

### Input Parameters

```typescript
interface RunAssessmentParams {
  submission: Submission;           // Student's work to grade
  snapshot?: AssessmentSnapshot;    // Previous messages (for revisions)
  model?: ValidModel;               // LLM model to use
  reasoningEffort?: 'low' | 'medium' | 'high';  // O1 reasoning effort
}

interface Submission {
  // REQUIRED
  type: TextStructure;              // Essay type: 'Expository' | 'Argumentative' | etc.
  gradeLevel: GradeLevel;           // 3-12 (enum: _3, _4, ..., _12)
  writingPhase: WritingPhase;       // OUTLINE | DRAFT | ASSESSMENT | REVISE | POLISH
  
  // CONDITIONAL (based on writingPhase)
  essay?: string;                   // Full essay text
  outline?: Outline;                // Structured outline (SPO, MPO, TO, PTO)
  
  // OPTIONAL
  prompt?: CompositionPrompt;       // { topic, audience?, purpose? }
  title?: string;                   // Essay title
}
```

### Output

```typescript
interface RunAssessmentResponse {
  scorecard: Scorecard;             // Final graded rubric with spans
  snapshot: AssessmentSnapshot;     // Conversation history for revisions
}

type Scorecard = {
  name: RubricType;                 // e.g., "Composition"
  criteria: Array<{
    criterion: string;              // e.g., "Each body paragraph has a topic sentence"
    optionChosen: 'Yes' | 'Developing' | 'No';
    explanationOfOptionChosen: string;
    examplesOfWhereToImprove: LocatedSpan[];
    examplesOfGreatResults: LocatedSpan[];
  }>;
}

interface LocatedSpan {
  substringOfInterest: string;      // The actual text (or "N/A")
  explanationOfSubstring: string;   // Why this text matters
  startIndex?: number;              // Character position in essay
  endIndex?: number;                // End position
  highlightId?: string;             // UI highlighting identifier
}
```

---

## Two-Stage Processing Pattern

AlphaWrite uses a **two-stage LLM process** for grading:

### Stage 1: Grading with O1/O3-mini

```typescript
// 1. Generate prompt from rubric
const prompt = generateInitialGradingPrompt(submission, rubricPackage);

// 2. Call O1 with structured output (Zod schema)
const scorecardIntermediate = await generate({
  provider: 'openai',
  model: 'o1',
  reasoningEffort: 'low',
  useSeed: true,
  messages: [{ role: 'user', content: prompt }],
  structure: ScorecardIntermediateSchema,  // ← Zod schema for validation
});

// Output: { criterion, score, feedback, examples[] } - NO indices yet
```

### Stage 2: Post-Processing with `finishScorecard()`

```typescript
// 3. Locate text spans and add indices
const finalScorecard = finishScorecard({
  scorecardIntermediate,
  submission,
  shouldProcessOutlineOrEssay: 'essay',
});

// Output: Same structure but examplesOfWhereToImprove/examplesOfGreatResults
//         now have startIndex, endIndex, highlightId added
```

**Why two stages?**
1. **O1 identifies** feedback without needing to know exact character positions
2. **Post-processing locates** the text for UI highlighting
3. **Cleaner prompts** - LLM doesn't worry about indices

---

## Model Options

```typescript
type ValidModel = 
  | 'o1'                    // Most accurate, expensive, slow
  | 'o3-mini'               // Good balance (recommended)
  | 'gpt-4o'                // Faster, cheaper, slightly less accurate
  | 'gpt-4o-mini'           // Cheapest, good for parsing
  | 'anthropic/claude-sonnet-4';  // Alternative via OpenRouter

const VALID_MODELS = [
  'o1', 'o1-mini', 'o1-preview', 
  'o3-mini',
  'gpt-4o', 'gpt-4o-mini',
  'anthropic/claude-sonnet-4',
];
```

**Reasoning Effort** (O1/O3 only):
- `'low'`: Faster, good for simple essays
- `'medium'`: Balanced (recommended)
- `'high'`: Most thorough, slowest

---

## Rubric System

### Rubric Selection Logic (`getRubricPackage()`)

```typescript
// Automatically selects rubric based on writingPhase
function getRubricPackage(submission: Submission): RubricPackage {
  const baseRubric = getBaseRubric(submission);
  const preparedRubric = getPreparedRubric({ baseRubric, submission });
  const preparedRubricString = JSON.stringify(preparedRubric, null, 2);
  
  return { baseRubric, preparedRubric, preparedRubricString };
}

// Selection logic:
WritingPhase.OUTLINE   → outlineRubric (based on outline.type)
WritingPhase.DRAFT     → draftRubric
WritingPhase.REVISE    → compositionRubric
WritingPhase.ASSESSMENT → compositionRubric
```

### Rubric Preparation (`getPreparedRubric()`)

Filters criteria based on:
1. **Grade level**: Remove criteria not applicable to student's grade
2. **Essay type**: Add type-specific guidance (Argumentative, Narrative, etc.)
3. **Outline type**: Filter by outline type if applicable

```typescript
// Example: Grade 7 Argumentative essay
// - Includes "Composed effective introduction" (starts at grade 7)
// - EXCLUDES "Addressed opposing view" (starts at grade 9)
// - Adds Argumentative-specific guidance to all criteria
```

---

## Full Essay Rubric Criteria

From `composition-rubric.ts` (626 lines):

| Criterion | Grades | Essay Types | Subcriteria |
|-----------|--------|-------------|-------------|
| **Composition follows outline** | 4-12 | All (except "No Outline") | - |
| **Each body paragraph has a topic sentence** | 3-12 | All | - |
| **Supporting details support topic sentence** | 4-12 | All | - |
| **Developed thesis statement** | 4-12 | All | - |
| **Each body paragraph supports thesis** | 4-12 | All | - |
| **Used sentence strategies** | 4-12 | All | • sentence expansion<br>• conjunctions<br>• appositives |
| **Used transitions correctly** | 4-12 | All | - |
| **Composed effective introduction** | **7-12** | All | • general statement<br>• specific statement<br>• thesis statement |
| **Composed effective conclusion** | **7-12** | All | • rephrased thesis<br>• specific statement<br>• general statement |
| **Edited for** | 4-12 | All | • fragments<br>• run-ons<br>• spelling<br>• capitalization<br>• tense agreement<br>• number agreement<br>• repetition |
| **Minimum paragraph count** | 4-12 | All | - |
| **Addressed opposing view/counterclaim** | **9-12** | Argumentative only | - |
| **Used credible and relevant evidence** | 5-12 | Argumentative, Expository | - |
| **Presented both sides fairly** | 5-12 | Pro/Con only | - |
| **Clear reasoning from evidence to claim** | **9-12** | Argumentative only | - |
| **Composed effective concluding sentence** | 4-6 | All (Pre-TO, TO, No Outline) | - |

**Total**: 15 criteria, dynamically filtered based on grade/type

---

## Essay Type-Specific Guidance

Each criterion has guidance per essay type:

### Argumentative (9-12)
```typescript
{
  criterion: "Used credible and relevant evidence",
  compositionTypeSpecificGuidance: {
    Argumentative: "Must use factual or textual evidence, data, or references. Personal examples alone are not sufficient."
  }
}
```

### Opinion (All grades)
```typescript
{
  criterion: "Used credible and relevant evidence",
  compositionTypeSpecificGuidance: {
    Opinion: "Can rely on personal anecdotes or subjective examples. Factual evidence welcome but not required."
  }
}
```

### Narrative (TWR-style academic)
```typescript
{
  criterion: "Each body paragraph supports thesis",
  compositionTypeSpecificGuidance: {
    Narrative: "Present events, steps, or stages in logical chronological sequence. Focus on academic content rather than creative elements."
  }
}
```

### Story (Creative writing)
```typescript
{
  criterion: "Used credible and relevant evidence",
  compositionTypeSpecificGuidance: {
    Story: "Use descriptive details, dialogue, character development. Traditional factual evidence is not required."
  }
}
```

**All 7 types**: Expository, Problem/Solution, Argumentative, Opinion, Pro/Con, Narrative, Story

---

## Implementation Examples

### Example 1: Basic Essay Assessment

```typescript
import { runAssessment } from '@alphawrite/categorical-rubric';
import { WritingPhase, GradeLevel, TextStructure } from '@alphawrite/types';

async function gradeEssay(essayText: string) {
  const result = await runAssessment({
    submission: {
      essay: essayText,
      type: 'Argumentative',
      gradeLevel: 9,  // GradeLevel._9
      writingPhase: WritingPhase.ASSESSMENT,
    },
    model: 'o3-mini',
    reasoningEffort: 'medium',
  });
  
  return result.scorecard;
}

// Output:
// {
//   name: "Composition",
//   criteria: [
//     {
//       criterion: "Each body paragraph has a topic sentence",
//       optionChosen: "Yes",
//       explanationOfOptionChosen: "All body paragraphs begin with clear topic sentences...",
//       examplesOfGreatResults: [
//         {
//           substringOfInterest: "Technology has revolutionized modern communication.",
//           explanationOfSubstring: "This topic sentence clearly introduces the paragraph's focus",
//           startIndex: 142,
//           endIndex: 199
//         }
//       ],
//       examplesOfWhereToImprove: []
//     },
//     {
//       criterion: "Addressed Opposing View/Counterclaim",
//       optionChosen: "No",
//       explanationOfOptionChosen: "The essay does not acknowledge any opposing viewpoint...",
//       examplesOfWhereToImprove: [
//         {
//           substringOfInterest: "N/A",
//           explanationOfSubstring: "Add a paragraph addressing why some might disagree with your position"
//         }
//       ],
//       examplesOfGreatResults: []
//     },
//     // ... more criteria
//   ]
// }
```

### Example 2: Gap Detection for Practice Mode

```typescript
async function detectSkillGaps(essayText: string, gradeLevel: number) {
  const result = await runAssessment({
    submission: {
      essay: essayText,
      type: 'Expository',
      gradeLevel,
      writingPhase: WritingPhase.ASSESSMENT,
    },
    model: 'o3-mini',
    reasoningEffort: 'low',  // Faster for diagnostic
  });
  
  // Extract gaps from scorecard
  const gaps = result.scorecard.criteria
    .filter(c => c.optionChosen !== 'Yes')
    .map(c => ({
      criterion: c.criterion,
      severity: c.optionChosen === 'No' ? 'major' : 'minor',
      feedback: c.explanationOfOptionChosen,
      examples: c.examplesOfWhereToImprove,
      // Map to practice lessons
      recommendedLessons: CRITERION_TO_LESSON_MAP[c.criterion] || [],
    }));
  
  return gaps;
}

// Output:
// [
//   {
//     criterion: "Used sentence strategies",
//     severity: "major",
//     feedback: "The essay lacks sentence variety. Most sentences are simple...",
//     examples: [
//       {
//         substringOfInterest: "The dog ran. It was fast. It jumped.",
//         explanationOfSubstring: "Combine these choppy sentences",
//         startIndex: 245,
//         endIndex: 289
//       }
//     ],
//     recommendedLessons: ['basic-conjunctions', 'write-appositives', 'kernel-expansion']
//   }
// ]
```

### Example 3: Revision Flow (Multi-turn)

```typescript
// First submission
const firstAttempt = await runAssessment({
  submission: {
    essay: "My first draft...",
    type: 'Opinion',
    gradeLevel: 8,
    writingPhase: WritingPhase.DRAFT,
  },
});

// Student revises based on feedback
const revisedEssay = "My revised draft with improvements...";

// Second submission - includes conversation history
const secondAttempt = await runAssessment({
  submission: {
    essay: revisedEssay,
    type: 'Opinion',
    gradeLevel: 8,
    writingPhase: WritingPhase.REVISE,
  },
  snapshot: firstAttempt.snapshot,  // ← Includes previous messages
});

// Second grading will note improvements made
```

---

## Criteria → Practice Lesson Mapping

For gap detection, map rubric criteria to practice lessons:

```typescript
const CRITERION_TO_LESSON_MAP: Record<string, string[]> = {
  // SENTENCE-LEVEL
  'Used sentence strategies': [
    'basic-conjunctions',       // Because/But/So
    'write-appositives',        // Descriptive phrases
    'kernel-expansion',         // Sentence expansion
    'subordinating-conjunctions', // Although/Since/While
  ],
  
  // PARAGRAPH-LEVEL
  'Each body paragraph has a topic sentence': [
    'identify-topic-sentence',
    'make-topic-sentences',
  ],
  'Supporting details in each body paragraph support the topic sentence': [
    'eliminate-irrelevant-sentences',
    'writing-spos',
  ],
  'Used transitions correctly': [
    'using-transition-words',
    'finishing-transition-words',
  ],
  'Composed effective concluding sentence': [
    'write-cs-from-details',
  ],
  
  // ESSAY-LEVEL
  'Developed thesis statement': [
    'distinguish-g-s-t',
    'write-t-from-topic',
  ],
  'Composed effective introduction': [
    'write-introductory-sentences',
    'write-g-s-from-t',
  ],
  'Composed effective conclusion': [
    'craft-conclusion-from-gst',
  ],
  
  // EDITING
  'Edited for': [
    'fragment-or-sentence',
    // Note: No run-on activity in AlphaWrite
  ],
};

function mapScorecardToLessons(scorecard: Scorecard): LessonRecommendation[] {
  return scorecard.criteria
    .filter(c => c.optionChosen !== 'Yes')
    .flatMap(c => {
      const lessons = CRITERION_TO_LESSON_MAP[c.criterion] || [];
      return lessons.map(lessonId => ({
        lessonId,
        criterion: c.criterion,
        severity: c.optionChosen === 'No' ? 'high' : 'medium',
        reason: c.explanationOfOptionChosen,
      }));
    });
}
```

---

## Grade-Level Filtering

Criteria are automatically filtered based on grade:

### Grades 6-8 (Middle School)

```typescript
// EXCLUDED criteria (too advanced):
// - "Composed effective introduction" (starts at grade 7)
// - "Composed effective conclusion" (starts at grade 7)
// - "Addressed opposing view/counterclaim" (starts at grade 9)
// - "Clear reasoning from evidence to claim" (starts at grade 9)

// INCLUDED criteria expectations:
// - Minimum 4 paragraphs
// - At least 3 supporting details per paragraph
// - Basic transitions (Then, Next, Finally)
// - At least 1 sentence strategy
// - 2-3 minor mechanical errors allowed
```

### Grades 9-12 (High School)

```typescript
// ALL criteria applied including:
// - Addressed opposing view/counterclaim (Argumentative)
// - Clear reasoning from evidence to claim (Argumentative)

// HIGHER expectations:
// - Minimum 5 paragraphs
// - Robust evidence required (not personal anecdotes)
// - Advanced transitions (nonetheless, meanwhile, furthermore)
// - Multiple varied sentence strategies
// - At most 1 editing error
```

---

## Prompt Generation

### Initial Grading Prompt Structure

```typescript
function generateInitialGradingPrompt(
  submission: Submission,
  rubricPackage: RubricPackage
): string {
  return `You are a grader of activities from The Writing Revolution. 
Grade the following ${describeSubmission()} submission that a ${ordinal(gradeLevel)} student submitted.

**Guidance on "Yes," "Developing," and "No":**

- **Yes**: Work fully matches criterion with clarity and consistency
- **Developing**: Partial or inconsistent fulfillment
- **No**: Does not meet criterion or element is missing

**Guidance on examples:**
- If "Developing" or "Yes": Include ≥1 example of where student did well
- If "No" or "Developing": Include ≥1 example of where to improve
- If "Yes": Still include examples of where to improve further!

**Output format:**
${outputFormatString}

**Rubric:**
${preparedRubricString}

**Student submission:**
${submissionString}`;
}
```

### Revision Grading Prompt

```typescript
function generateRevisionGradingPrompt(submission: Submission): string {
  return `The student just revised their submission. 
Grade the revised submission using the same rubric. 
Make note of where the student's submission has improved 
and give examples of where students can further improve.

${submissionString}`;
}
```

**Key difference**: Revision prompts are shorter, LLM has conversation context

---

## Practical Extraction Strategies

### Option A: Full Extraction (Most Accurate)

Copy the entire `categorical-rubric/` folder:

**Pros:**
- Battle-tested code
- Handles edge cases
- Grade/type filtering built-in
- Text span highlighting

**Cons:**
- ~3,000 lines of code
- Many dependencies
- Might be overkill

**File Count**: ~30 files

---

### Option B: Simplified Extraction (Recommended)

Extract just the rubric criteria + build your own prompt:

```typescript
import { criteria } from '@alphawrite/categorical-rubric/rubrics/composition-rubric';
import { getPreparedRubric } from '@alphawrite/categorical-rubric/rubrics/utils';

async function simpleEssayGrader(essay: string, grade: number) {
  // 1. Prepare rubric
  const preparedRubric = getPreparedRubric({
    baseRubric: { name: 'Composition', criteria },
    submission: {
      essay,
      type: 'Expository',
      gradeLevel: grade,
      writingPhase: WritingPhase.ASSESSMENT,
    },
  });
  
  // 2. Build simple prompt
  const prompt = buildSimplePrompt(essay, preparedRubric, grade);
  
  // 3. Call LLM directly
  const response = await openai.chat.completions.create({
    model: 'o3-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  
  // 4. Parse JSON
  const scorecard = JSON.parse(response.choices[0].message.content);
  
  return scorecard;
}

function buildSimplePrompt(essay: string, rubric: any, grade: number): string {
  return `Grade this ${grade}th grade essay against TWR criteria.

For each criterion, rate as Yes/Developing/No and explain.

Criteria:
${JSON.stringify(rubric.criteria.map(c => c.criterion), null, 2)}

Essay:
${essay}

Return JSON:
{
  "criteria": [
    {
      "criterion": "Each body paragraph has a topic sentence",
      "score": "Yes" | "Developing" | "No",
      "feedback": "Explanation..."
    }
  ]
}`;
}
```

**Pros:**
- Much simpler (~100 lines)
- No AlphaWrite dependencies
- Easy to customize

**Cons:**
- No automatic grade filtering
- No text span highlighting
- No type-specific guidance injection

---

### Option C: Prompt-Only Approach (Fastest)

Use the rubric criteria as a checklist in your existing grading system:

```typescript
// Add to your existing TWR grading prompt
const TWR_ESSAY_CHECKLIST = `
EVALUATE AGAINST TWR ESSAY CRITERIA:

**PARAGRAPH STRUCTURE:**
✓ Each body paragraph has a topic sentence
✓ Supporting details support topic sentence
✓ Each body paragraph supports thesis statement

**ESSAY STRUCTURE:**
✓ Developed thesis statement
✓ Effective introduction (General → Specific → Thesis)
✓ Effective conclusion (Thesis → Specific → General)

**SENTENCE STRATEGIES:**
✓ Sentence expansion (because/but/so)
✓ Appositives
✓ Subordinating conjunctions

**ORGANIZATION:**
✓ Used transitions correctly
✓ Minimum paragraph count (4-5 depending on grade)

**EDITING:**
✓ No fragments or run-ons
✓ Correct spelling, capitalization, agreement

For each criterion, note in your improvements[] if missing.
`;
```

Then map `improvements[]` to lessons using keyword detection (your current approach).

---

## Gap Detection Integration

### Full Scorecard → Practice Lessons

```typescript
interface GapDetectionResult {
  skillGaps: Array<{
    lessonId: string;
    criterion: string;
    severity: 'high' | 'medium';
    evidence: string;
    exampleFromEssay?: string;
  }>;
  
  recommendedPath: string[];  // Ordered by severity
}

function detectGapsFromScorecard(
  scorecard: Scorecard,
  userId: string
): GapDetectionResult {
  const gaps: any[] = [];
  
  scorecard.criteria.forEach(criterion => {
    if (criterion.optionChosen === 'Yes') return;
    
    const severity = criterion.optionChosen === 'No' ? 'high' : 'medium';
    const lessons = CRITERION_TO_LESSON_MAP[criterion.criterion] || [];
    
    lessons.forEach(lessonId => {
      // Get example text if available
      const example = criterion.examplesOfWhereToImprove[0];
      
      gaps.push({
        lessonId,
        criterion: criterion.criterion,
        severity,
        evidence: criterion.explanationOfOptionChosen,
        exampleFromEssay: example?.substringOfInterest !== 'N/A' 
          ? example?.substringOfInterest 
          : undefined,
      });
    });
  });
  
  // Sort by severity, prioritize sentence-level skills
  const recommendedPath = gaps
    .sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'high' ? -1 : 1;
      // Sentence skills first (basic-conjunctions, appositives, etc.)
      const sentenceLessons = ['basic-conjunctions', 'write-appositives', 'kernel-expansion'];
      const aIsSentence = sentenceLessons.includes(a.lessonId);
      const bIsSentence = sentenceLessons.includes(b.lessonId);
      if (aIsSentence && !bIsSentence) return -1;
      if (!aIsSentence && bIsSentence) return 1;
      return 0;
    })
    .map(g => g.lessonId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx);  // Dedupe
  
  return { skillGaps: gaps, recommendedPath };
}
```

---

## Key Type Definitions

### Scorecard Schemas

```typescript
// Stage 1: From O1 (no indices)
const ScorecardIntermediateSchema = z.object({
  name: z.enum([...]),
  criteria: z.array(z.object({
    criterion: CriterionNameSchema,
    optionChosen: z.enum(['Yes', 'Developing', 'No']),
    explanationOfOptionChosen: z.string(),
    examplesOfWhereToImprove: z.array(SpanSchema),
    examplesOfGreatResults: z.array(SpanSchema),
  })),
});

// Stage 2: After finishScorecard() (with indices)
const ScorecardSchema = ScorecardIntermediateSchema.extend({
  criteria: z.array(z.object({
    criterion: CriterionNameSchema,
    optionChosen: z.enum(['Yes', 'Developing', 'No']),
    explanationOfOptionChosen: z.string(),
    examplesOfWhereToImprove: z.array(LocatedSpanSchema),  // ← Changed
    examplesOfGreatResults: z.array(LocatedSpanSchema),    // ← Changed
  })),
});

// Span types
const SpanSchema = z.object({
  substringOfInterest: z.string(),      // The text (or "N/A")
  explanationOfSubstring: z.string(),   // Why it matters
});

const LocatedSpanSchema = SpanSchema.extend({
  startIndex: z.number().optional(),    // Character position
  endIndex: z.number().optional(),
  highlightId: z.string().optional(),   // For UI highlighting
});
```

### Text Structure Types

```typescript
const TextStructureSchema = z.enum([
  // Expository
  'Expository',
  'Problem/Solution',
  
  // Argumentative
  'Argumentative',      // Formal argument with counterclaim (9-12)
  'Opinion',            // Personal stance with reasons
  'Pro/Con',            // Balanced analysis
  
  // Narrative
  'Narrative',          // TWR academic narrative (factual)
  'Story',              // Creative/fictional narrative
]);

type TextStructure = z.infer<typeof TextStructureSchema>;
```

---

## Migration Strategies

### For Your Writing App (Gap Detection)

**Recommendation**: Use **Option C** (Prompt-Only) for now:

1. ✅ You already have TWR grading prompts working
2. ✅ You already generate `improvements[]` with TWR strategy keywords
3. ✅ Just need better keyword→lesson mapping

**Implementation**:
```typescript
// In lib/services/skill-gaps.ts
export function detectGapsFromRankedFeedback(
  improvements: string[],
  traitFeedback: Record<string, string>
): SkillGap[] {
  const gaps: SkillGap[] = [];
  
  // Parse improvements for TWR keywords
  improvements.forEach(improvement => {
    const lessonMatches = matchImprovementToLesson(improvement);
    lessonMatches.forEach(lessonId => {
      gaps.push({
        lessonId,
        source: 'ranked-match',
        detectedAt: Date.now(),
        evidence: improvement,
      });
    });
  });
  
  return gaps;
}

function matchImprovementToLesson(improvement: string): string[] {
  const lower = improvement.toLowerCase();
  const matches: string[] = [];
  
  if (lower.includes('because') || lower.includes('but') || lower.includes('so')) {
    matches.push('basic-conjunctions');
  }
  if (lower.includes('appositive')) {
    matches.push('write-appositives');
  }
  if (lower.includes('transition')) {
    matches.push('internal-transitions');
  }
  if (lower.includes('subordinating conjunction') || lower.includes('although') || lower.includes('since')) {
    matches.push('subordinating-conjunctions');
  }
  if (lower.includes('topic sentence')) {
    matches.push('topic-sentence');
  }
  if (lower.includes('combine') || lower.includes('expansion')) {
    matches.push('kernel-expansion');
  }
  
  return matches;
}
```

**Later** (V2): Consider full extraction for richer diagnostics.

---

### For Full Essay Grading Feature

If you want to add an "Essay Grader" mode to your app:

1. **Copy** the complete categorical-rubric folder
2. **Adapt** types to your Firebase schema
3. **Test** with sample essays at each grade level
4. **Build UI** to display Yes/Developing/No per criterion

**Estimated effort**: 2-3 days with testing

---

## Comparison: AlphaWrite vs Your Current System

| Aspect | Your Ranked Grader | AlphaWrite Essay Grader |
|--------|-------------------|-------------------------|
| **Scope** | Short-form (2-min writing) | Full essays (multi-paragraph) |
| **Criteria** | 10 TWR strategies | 15 detailed criteria |
| **Output** | `strengths[]` + `improvements[]` | Yes/Developing/No per criterion |
| **Model** | Claude Sonnet 4 | O1/O3-mini |
| **Scoring** | 0-100 points | Categorical (Y/D/N) |
| **Text Highlighting** | No | Yes (startIndex/endIndex) |
| **Revisions** | Single-shot | Multi-turn with history |
| **Grade Filtering** | Manual | Automatic |
| **Essay Types** | Generic | 7 types with specific guidance |

---

## Cost Analysis

### Per Assessment Cost Estimates

| Model | Input | Output | Est. Cost/Essay |
|-------|-------|--------|-----------------|
| O1 | ~3-5K tokens | ~2-3K tokens | $0.30-0.50 |
| O3-mini | ~3-5K tokens | ~2-3K tokens | $0.03-0.08 |
| GPT-4o | ~3-5K tokens | ~2-3K tokens | $0.01-0.03 |
| Claude Sonnet 4 | ~3-5K tokens | ~2-3K tokens | $0.02-0.05 |

**For gap detection** (diagnostic mode): Use O3-mini or GPT-4o  
**For student-facing grading**: Use O1 for highest quality

---

## Testing

AlphaWrite includes comprehensive test suites:

```
evals/
├── composition/
│   ├── composition.cases.ts     # Test essays
│   └── composition.eval.ts      # Validation logic
├── model-essays/
│   └── datasets/
│       ├── test_6-8_20250110.csv
│       ├── test_9-10_20250110.csv
│       └── test_11-12_20250110.csv
```

**Test data includes**:
- 50+ graded essays across grades 6-12
- Multiple essay types
- Known edge cases

---

## Implementation Checklist

### Minimal (Gap Detection Only)
- [ ] Copy `composition-rubric.ts` criteria list
- [ ] Create `CRITERION_TO_LESSON_MAP`
- [ ] Build keyword matcher from your existing `improvements[]`
- [ ] Test with sample ranked match feedback
- [ ] Integrate into `ResultsImprovements.tsx`

**Estimated time**: 2-3 hours

---

### Medium (Diagnostic API)
- [ ] Copy `rubrics/` folder
- [ ] Copy `types/` folder (all 11 files)
- [ ] Copy `utils.ts` (getRubricPackage, validateAssessmentParams)
- [ ] Copy `assessment.prompts.ts`
- [ ] Build simplified `runAssessment()` wrapper
- [ ] Create `/api/diagnose-essay` endpoint
- [ ] Test with sample essays
- [ ] Add to Improve mode

**Estimated time**: 1-2 days

---

### Full (Complete Essay Grader)
- [ ] Copy entire `categorical-rubric/` folder
- [ ] Install dependencies (OpenAI SDK, Zod, etc.)
- [ ] Copy supporting types (GradeLevel, WritingPhase, etc.)
- [ ] Adapt to your Firebase schema
- [ ] Build UI for scorecard display
- [ ] Add revision flow support
- [ ] Comprehensive testing
- [ ] Deploy and monitor costs

**Estimated time**: 3-5 days

---

## Key Differences from Sentence-Level Graders

| Aspect | Sentence Graders (Adaptive) | Essay Grader (Categorical) |
|--------|----------------------------|----------------------------|
| **Scope** | Single skill per activity | Full essay evaluation |
| **Config Format** | `ActivityGraderConfig` | `EssayRubric` |
| **Scoring** | Binary (correct/incorrect) | Ternary (Yes/Developing/No) |
| **Output** | `{ isCorrect, remarks[], solution }` | `{ scorecard[], snapshot }` |
| **Model** | Claude Sonnet 4 | O1/O3-mini |
| **Feedback** | `concreteProblem` + `callToAction` | `explanationOfOptionChosen` + examples |
| **Use Case** | Practice lesson grading | Full essay assessment |
| **Grade Levels** | Level 1 (3-5) / Level 2 (6+) | Detailed per criterion (3-12) |

**When to use each:**
- **Adaptive grader**: Practice mode (discrete skills)
- **Categorical rubric**: Essay mode, diagnostics, comprehensive assessment

---

## References

### Source Files (AlphaWrite)
- **Main entry**: `packages/edu-core/src/grading/categorical-rubric/assessment.ts`
- **Composition rubric**: `packages/edu-core/src/grading/categorical-rubric/rubrics/composition-rubric.ts`
- **Types**: `packages/edu-core/src/grading/categorical-rubric/types/index.ts`
- **Prompts**: `packages/edu-core/src/grading/categorical-rubric/assessment.prompts.ts`
- **README**: `packages/edu-core/src/grading/categorical-rubric/README.md`

### Related Documentation
- [Grader Extraction Guide](./grader-extraction-guide.md) - Sentence-level graders
- [AlphaWrite Integration Analysis](./alphawrite-integration-analysis.md) - Activity coverage
- [Practice Mode MVP](../../practice-mode/PRACTICE_MODE_MVP_ALPHAWRITE.md) - Practice implementation

### External Resources
- TWR Book (Appendix p.315): Essay rubrics
- [TWR Single Paragraph Rubric](https://www.thewritingrevolution.org/twr_sd/single-paragraph-rubric/)

---

## Next Steps

**For your writing app gap detection:**

1. **Option C** is the fastest path - just improve keyword matching
2. **Then V2**: Consider Option B for richer diagnostics in Improve mode
3. **Future**: Option A if you want full essay grading feature

**Immediate action** (today):
- Build `GAP_TO_LESSON_MAP` with better keyword patterns
- Update `ResultsImprovements.tsx` to link to practice lessons
- Test with real ranked match feedback

See [PRACTICE_MODE_IMPLEMENTATION.md](../../practice-mode/PRACTICE_MODE_IMPLEMENTATION.md) Phase 4 for gap detection implementation plan.

