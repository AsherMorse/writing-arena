# Essay & Paragraph Grader Extraction Guide

> How to extract AlphaWrite's categorical rubric assessment system for grading paragraphs and essays in another application.

## Overview

AlphaWrite has a sophisticated essay/paragraph grading system that:
- Evaluates writing against TWR (The Writing Revolution) rubrics
- Supports 7 essay types and grades 3-12
- Returns a scorecard with Yes/Developing/No for each criterion
- Provides detailed feedback and improvement suggestions
- Can assess single paragraphs or full multi-paragraph essays

This guide covers extracting and adapting this system for:
- **Diagnostic use**: Identify skill gaps → recommend remediation activities
- **Full grading**: Provide comprehensive feedback to students

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Your Application                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐                                                  │
│   │  Student     │                                                  │
│   │  Submission  │                                                  │
│   │  (essay or   │                                                  │
│   │  paragraph)  │                                                  │
│   └──────┬───────┘                                                  │
│          │                                                          │
│          v                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐   │
│   │  Rubric      │ -> │  Prompt      │ -> │  Claude o1/o3-mini│   │
│   │  Selector    │    │  Generator   │    │                   │   │
│   └──────────────┘    └──────────────┘    └─────────┬─────────┘   │
│                                                      │              │
│                                                      v              │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │                      Scorecard                                │ │
│   │  ┌─────────────────────────────┬──────────┬─────────────────┐│ │
│   │  │ Criterion                   │ Score    │ Feedback        ││ │
│   │  ├─────────────────────────────┼──────────┼─────────────────┤│ │
│   │  │ Topic sentences             │ Yes      │                 ││ │
│   │  │ Supporting details          │ Developing│ Need more...   ││ │
│   │  │ Thesis statement            │ No       │ Missing thesis  ││ │
│   │  │ Transitions                 │ Yes      │                 ││ │
│   │  │ ...                         │ ...      │ ...             ││ │
│   │  └─────────────────────────────┴──────────┴─────────────────┘│ │
│   └──────────────────────────────────────────────────────────────┘ │
│          │                              │                           │
│          v                              v                           │
│   ┌──────────────┐              ┌──────────────┐                   │
│   │  Diagnostic  │              │  Full        │                   │
│   │  (skill gaps │              │  Feedback    │                   │
│   │  + activity  │              │  (student-   │                   │
│   │  recs)       │              │  facing)     │                   │
│   └──────────────┘              └──────────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Files to Copy

### Core Assessment Files

```
packages/edu-core/src/grading/categorical-rubric/
├── assessment.ts              # Main runAssessment() function
├── assessment.prompts.ts      # Prompt generation
├── utils.ts                   # Rubric selection, validation
├── scoring.ts                 # Scorecard computation
├── formatters.ts              # Output formatting
├── matchers.ts                # Response parsing
├── index.ts                   # Exports
│
├── rubrics/
│   ├── composition-rubric.ts  # Full essay criteria (~600 lines)
│   ├── draft-rubric.ts        # Draft-stage criteria
│   ├── outline-rubric.ts      # Outline criteria
│   └── utils.ts               # Rubric preparation
│
└── types/
    ├── index.ts               # Main type exports
    ├── rubric.ts              # TextStructure, SubcriterionSchema
    ├── criterion-schema.ts    # CriterionNameSchema
    ├── scorecard.ts           # Scorecard types
    ├── single-paragraph.ts    # Single paragraph types
    └── models.ts              # LLM model config
```

### Supporting Files

```
packages/edu-core/src/curriculum/grades.ts        # GradeLevel enum
packages/edu-core/src/compositions/tutoring/types/phases/index.ts  # WritingPhase
```

### Dependencies

```
@anthropic-ai/sdk    # For Claude API calls
zod                  # Schema validation
lodash               # Utility functions (cloneDeep, etc.)
common-tags          # Template literals (stripIndents)
```

---

## Configuration

### Model Options

| Model | Provider | Use Case | Cost |
|-------|----------|----------|------|
| `o1` | OpenAI (via OpenRouter) | High accuracy, slower | $$$ |
| `o3-mini` | OpenAI | Good balance | $$ |
| `gpt-4o` | OpenAI | Faster, slightly less accurate | $ |
| `claude-sonnet-4` | Anthropic | Alternative | $$ |

### Reasoning Effort

```typescript
reasoningEffort: 'low' | 'medium' | 'high'
```
- `low`: Faster, good for simple essays
- `medium`: Balanced (recommended for diagnostic)
- `high`: Most thorough, use for final assessments

---

## Input Parameters

### Submission Interface

```typescript
interface Submission {
  // REQUIRED
  type: TextStructure;        // Essay type
  gradeLevel: GradeLevel;     // 0-12 (K-12)
  writingPhase: WritingPhase; // What phase are we assessing?
  
  // CONDITIONAL (based on writingPhase)
  essay?: string;             // Full essay text (for ASSESSMENT, DRAFT, REVISE, POLISH)
  outline?: Outline;          // Structured outline (for OUTLINE, DRAFT)
  
  // OPTIONAL
  prompt?: CompositionPrompt; // Writing prompt details
  title?: string;             // Essay title
}
```

### Essay Types (TextStructure)

```typescript
type TextStructure = 
  // Expository
  | 'Expository'        // Informational essay
  | 'Problem/Solution'  // Problem/Solution essay
  
  // Argumentative
  | 'Argumentative'     // Debate-style with counterclaims (9-12)
  | 'Opinion'           // Personal stance with reasons
  | 'Pro/Con'           // Balanced both-sides analysis
  
  // Narrative
  | 'Narrative'         // TWR-style factual narrative
  | 'Story';            // Creative/fictional narrative
```

### Grade Levels

```typescript
enum GradeLevel {
  _6 = 6,   // Middle school
  _7 = 7,
  _8 = 8,
  _9 = 9,   // High school
  _10 = 10,
  _11 = 11,
  _12 = 12,
}
```

### Writing Phases

```typescript
enum WritingPhase {
  OUTLINE,     // Assessing an outline
  DRAFT,       // Assessing a draft (needs outline + essay)
  ASSESSMENT,  // Final essay assessment (essay only)
  REVISE,      // Revision phase
  POLISH,      // Editing phase
}
```

---

## Usage Examples

### Example 1: Assess a Full Essay (Diagnostic + Feedback)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { buildGradingPrompt, parseGradingResponse } from './grading';
import { compositionRubric } from './rubrics/composition-rubric';

const anthropic = new Anthropic();

async function assessEssay({
  essayText,
  essayType,
  gradeLevel,
}: {
  essayText: string;
  essayType: TextStructure;
  gradeLevel: number;
}) {
  // 1. Select and prepare rubric
  const rubric = prepareRubric({
    baseRubric: compositionRubric,
    essayType,
    gradeLevel,
  });
  
  // 2. Build the grading prompt
  const systemPrompt = buildGradingSystemPrompt(rubric, gradeLevel, essayType);
  const userPrompt = buildGradingUserPrompt(essayText);
  
  // 3. Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',  // or 'claude-3-5-sonnet-20241022'
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  
  // 4. Parse response into scorecard
  const scorecard = parseGradingResponse(response);
  
  // 5. Generate diagnostic + feedback
  return {
    scorecard,
    weakAreas: identifyWeakAreas(scorecard),
    recommendedActivities: mapToActivities(scorecard),
    feedback: generateStudentFeedback(scorecard, essayType),
  };
}
```

### Example 2: Assess a Single Paragraph

```typescript
async function assessParagraph({
  paragraphText,
  gradeLevel,
}: {
  paragraphText: string;
  gradeLevel: number;
}) {
  // Use the single paragraph rubric
  const rubric = singleParagraphRubric;
  
  const systemPrompt = buildParagraphGradingPrompt(rubric, gradeLevel);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ 
      role: 'user', 
      content: `Evaluate this paragraph:\n\n${paragraphText}` 
    }],
  });
  
  return parseGradingResponse(response);
}
```

### Example 3: Quick Diagnostic (Skill Gap Detection)

```typescript
async function diagnoseSkillGaps(essayText: string, grade: number) {
  const result = await assessEssay({
    essayText,
    essayType: 'Expository',  // Default, or detect automatically
    gradeLevel: grade,
  });
  
  // Filter for weak areas
  const skillGaps = result.scorecard
    .filter(criterion => criterion.score !== 'Yes')
    .map(criterion => ({
      skill: criterion.name,
      severity: criterion.score === 'No' ? 'major' : 'minor',
      feedback: criterion.feedback,
      recommendedActivity: CRITERION_TO_ACTIVITY[criterion.name],
    }));
  
  return skillGaps;
}
```

---

## Rubric Criteria

### Full Essay Criteria (Grades 6-12)

| Criterion | Applicable Grades | Essay Types |
|-----------|-------------------|-------------|
| Each body paragraph has a topic sentence | 6-12 | All |
| Supporting details support topic sentence | 6-12 | All |
| Developed thesis statement | 6-12 | All |
| Each body paragraph supports thesis | 6-12 | All |
| Used sentence strategies | 6-12 | All |
| Used transitions correctly | 6-12 | All |
| Composed effective introduction (GST) | **7-12** | All |
| Composed effective conclusion (TSG) | **7-12** | All |
| Edited for (fragments, run-ons, etc.) | 6-12 | All |
| Minimum paragraph count | 6-12 | All |
| Addressed opposing view/counterclaim | **9-12** | Argumentative only |
| Used credible evidence | 6-12 | Argumentative, Expository |
| Presented both sides fairly | 6-12 | Pro/Con only |
| Clear reasoning from evidence to claim | **9-12** | Argumentative only |

### Single Paragraph Criteria

| Criterion | Description |
|-----------|-------------|
| Paragraph has a topic sentence | Clear main idea |
| Each sentence supports topic sentence | Relevance check |
| Paragraph has a concluding sentence | Wrap-up present |
| Sequenced details correctly | Logical flow |
| Included 3-4 supporting details | Sufficient depth |

---

## Criteria → Activity Mapping

Use this table to recommend AlphaWrite activities based on scorecard results:

| Criterion | Score | Recommended Activity | Slug |
|-----------|-------|---------------------|------|
| **Topic sentence issues** | No/Developing | Identify Topic Sentence | `identify-topic-sentence` |
| **Topic sentence issues** | No/Developing | Make Topic Sentences | `make-topic-sentences` |
| **Supporting details weak** | No/Developing | Eliminate Irrelevant Sentences | `eliminate-irrelevant-sentences` |
| **Supporting details weak** | No/Developing | Writing SPOs | `writing-spos` |
| **Thesis underdeveloped** | No/Developing | Distinguish GST | `distinguish-g-s-t` |
| **Thesis underdeveloped** | No/Developing | Write Thesis from Topic | `write-t-from-topic` |
| **Sentence strategies missing** | No/Developing | Kernel Expansion | `kernel-expansion` |
| **Sentence strategies missing** | No/Developing | Write Appositives | `write-appositives` |
| **Sentence strategies missing** | No/Developing | Basic Conjunctions | `basic-conjunctions` |
| **Sentence strategies missing** | No/Developing | Subordinating Conjunctions | `subordinating-conjunctions` |
| **Transitions weak** | No/Developing | Using Transition Words | `using-transition-words` |
| **Transitions weak** | No/Developing | Finishing Transition Words | `finishing-transition-words` |
| **Introduction issues** | No/Developing | Write Introductory Sentences | `write-introductory-sentences` |
| **Introduction issues** | No/Developing | Write G,S from T | `write-g-s-from-t` |
| **Conclusion issues** | No/Developing | Craft Conclusion from GST | `craft-conclusion-from-gst` |
| **Fragments detected** | No/Developing | Fragment or Sentence | `fragment-or-sentence` |
| **Run-ons detected** | No/Developing | *(No direct activity)* | — |
| **Concluding sentence weak** | No/Developing | Write CS from Details | `write-cs-from-details` |

### Mapping Function

```typescript
const CRITERION_TO_ACTIVITY: Record<string, string[]> = {
  'Each body paragraph has a topic sentence': [
    'identify-topic-sentence',
    'make-topic-sentences',
  ],
  'Supporting details in each body paragraph support the topic sentence': [
    'eliminate-irrelevant-sentences',
    'writing-spos',
  ],
  'Developed thesis statement': [
    'distinguish-g-s-t',
    'write-t-from-topic',
  ],
  'Used sentence strategies': [
    'kernel-expansion',
    'write-appositives',
    'basic-conjunctions',
    'subordinating-conjunctions',
  ],
  'Used transitions correctly': [
    'using-transition-words',
    'finishing-transition-words',
  ],
  'Composed effective introduction': [
    'write-introductory-sentences',
    'write-g-s-from-t',
  ],
  'Composed effective conclusion': [
    'craft-conclusion-from-gst',
  ],
  'Edited for': [
    'fragment-or-sentence',
  ],
  'Composed effective concluding sentence': [
    'write-cs-from-details',
  ],
};

function mapToActivities(scorecard: Scorecard): ActivityRecommendation[] {
  return scorecard
    .filter(criterion => criterion.score !== 'Yes')
    .flatMap(criterion => {
      const activities = CRITERION_TO_ACTIVITY[criterion.name] || [];
      return activities.map(slug => ({
        criterion: criterion.name,
        activitySlug: slug,
        severity: criterion.score === 'No' ? 'high' : 'medium',
        deepLink: `/practice/{grade}/2/${slug}`,
      }));
    });
}
```

---

## Grade-Level Adjustments

### Grades 6-8 (Middle School)

```typescript
// Criteria NOT applied at this level:
// - Composed effective introduction (starts at grade 7)
// - Composed effective conclusion (starts at grade 7)
// - Addressed Opposing View/Counterclaim (starts at grade 9)
// - Clear reasoning from evidence to claim (starts at grade 9)

// Expectations:
// - Minimum 4 paragraphs
// - At least 3 supporting details per paragraph
// - Basic transitions expected
```

### Grades 9-12 (High School)

```typescript
// All criteria applied
// Additional criteria:
// - Addressed Opposing View/Counterclaim (Argumentative essays)
// - Clear reasoning from evidence to claim (Argumentative essays)

// Expectations:
// - Minimum 5 paragraphs
// - Robust, credible evidence required
// - At most 1 editing error
// - Advanced transitions expected
```

---

## Essay Type Specific Guidance

The rubric provides type-specific guidance that gets injected into prompts:

### Expository
> "Provide factual evidence, examples, and data relevant to the main idea."

### Argumentative
> "Must address an opposing viewpoint with rebuttal or concession."
> "Provide factual or textual evidence, data, or references. Personal examples alone are not sufficient."

### Opinion
> "Can rely on personal anecdotes or subjective examples. Factual evidence welcome but not required."

### Pro/Con
> "Present both sides fairly without implying one side is superior."

### Narrative (TWR-style)
> "Present events, steps, or stages in logical chronological sequence."
> "Focus on academic content rather than creative elements."

### Story (Creative)
> "Use descriptive details, dialogue, character development, and personal reflection."
> "Traditional factual evidence is not required."

---

## Output Formats

### Scorecard Structure

```typescript
interface ScorecardEntry {
  criterion: string;           // Criterion name
  score: 'Yes' | 'Developing' | 'No';
  feedback?: string;           // Specific feedback for this criterion
  subcriteria?: {              // For criteria with subcriteria
    name: string;
    present: boolean;
  }[];
  spans?: {                    // Text locations (if applicable)
    start: number;
    end: number;
    text: string;
  }[];
}

type Scorecard = ScorecardEntry[];
```

### Diagnostic Output

```typescript
interface DiagnosticResult {
  overallScore: number;        // 0-100
  letterGrade: string;         // A, B, C, D, F
  
  strengths: string[];         // Criteria scored 'Yes'
  weaknesses: {
    criterion: string;
    severity: 'major' | 'minor';
    feedback: string;
  }[];
  
  recommendedActivities: {
    activitySlug: string;
    activityName: string;
    reason: string;
    deepLink: string;
  }[];
}
```

---

## Simplified Implementation

If you want a lighter-weight version without all the AlphaWrite machinery:

### Minimal Diagnostic Prompt

```typescript
const DIAGNOSTIC_PROMPT = `
You are an expert writing coach evaluating student essays.

Analyze this essay for the following skill areas and rate each as:
- "Yes" = Skill demonstrated well
- "Developing" = Partially demonstrated, needs work
- "No" = Not demonstrated or major issues

## Criteria to Evaluate

1. **Topic Sentences**: Does each body paragraph have a clear topic sentence?
2. **Supporting Details**: Do details support and develop the topic sentence?
3. **Thesis Statement**: Is there a clear, developed thesis in the introduction?
4. **Paragraph Unity**: Does each paragraph support the thesis?
5. **Sentence Variety**: Does the essay use varied sentence structures (conjunctions, appositives, expansion)?
6. **Transitions**: Are transition words used correctly between ideas?
7. **Introduction Structure**: Does intro follow GST pattern (General→Specific→Thesis)?
8. **Conclusion Structure**: Does conclusion follow TSG pattern (Thesis→Specific→General)?
9. **Editing**: Are there fragments, run-ons, spelling, or grammar issues?

## Output Format

Return JSON:
{
  "criteria": [
    {
      "name": "Topic Sentences",
      "score": "Yes" | "Developing" | "No",
      "feedback": "Specific feedback if not Yes"
    },
    ...
  ],
  "overallFeedback": "2-3 sentences of encouragement and top priority improvement"
}

## Essay Type: {essayType}
## Grade Level: {gradeLevel}

---

ESSAY:
{essayText}
`;
```

---

## Migration Checklist

- [ ] Copy rubric files from `categorical-rubric/rubrics/`
- [ ] Copy type definitions from `categorical-rubric/types/`
- [ ] Copy assessment logic from `categorical-rubric/assessment.ts`
- [ ] Set up Anthropic SDK
- [ ] Implement prompt builder for your use case
- [ ] Implement response parser
- [ ] Add criteria→activity mapping
- [ ] Test with sample essays at different grade levels
- [ ] Test with different essay types

---

## References

### Source Files
- Assessment: `packages/edu-core/src/grading/categorical-rubric/assessment.ts`
- Composition Rubric: `packages/edu-core/src/grading/categorical-rubric/rubrics/composition-rubric.ts`
- Types: `packages/edu-core/src/grading/categorical-rubric/types/`

### AlphaWrite Activities
- Activity Manifest: `packages/edu-core/src/activities/manifest.ts`
- Deep-link format: `https://alphawrite.alpha.school/practice/{grade}/2/{slug}`

### Related Documentation
- Grader Extraction Guide: `_docs/grader-extraction-guide.md`
- Integration Analysis: `_docs/alphawrite-integration-analysis.md`

