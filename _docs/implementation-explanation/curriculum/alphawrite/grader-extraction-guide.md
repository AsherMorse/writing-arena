# AlphaWrite Grader Extraction Guide

> How to port AlphaWrite's AI grading system to a separate codebase.

## Overview

AlphaWrite uses Claude Sonnet 4 to grade student writing submissions. The grading system consists of:

1. **Activity-specific grader configs** — Define grading rules, examples, and feedback templates
2. **Prompt template** — Constructs the system prompt from configs
3. **Response schema** — Structured JSON output from the LLM

This guide covers extracting and adapting these components for use in another application.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Grader       │ -> │ Prompt       │ -> │ Claude    │ │
│  │ Config       │    │ Builder      │    │ Sonnet 4  │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                                      │        │
│         │            ┌──────────────┐          │        │
│         └───────────>│ Response     │<─────────┘        │
│                      │ Parser       │                   │
│                      └──────────────┘                   │
│                             │                           │
│                             v                           │
│                      { isCorrect, remarks, solution }   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Model Configuration

| Setting | Value |
|---------|-------|
| **Model** | `claude-sonnet-4-20250514` (via Anthropic or OpenRouter) |
| **Provider** | OpenRouter (`anthropic/claude-sonnet-4`) or Anthropic direct |
| **Temperature** | Default (not specified, uses model default) |
| **Output** | Structured JSON via tool use or JSON mode |

---

## Files to Extract

### Core Files (One-Time)

| Source File | Purpose | Approx Lines |
|-------------|---------|--------------|
| `packages/edu-core/src/grading/adaptive-grader/prompt.ts` | System prompt builder | 250 |
| `packages/edu-core/src/grading/adaptive-grader/types.ts` | Response schemas | 100 |
| `packages/edu-core/src/grading/adaptive-grader/global-config.ts` | Grade-level adjustments | 50 |

### Per-Activity Configs

| Activity | Config File |
|----------|-------------|
| Because/But/So | `src/activities/11-basic-conjunctions/grader.config.ts` |
| Identify Appositives | `src/activities/12-identify-appositives/grader.config.ts` |
| Write Appositives | `src/activities/13-write-appositives/grader.config.ts` |
| Subordinating Conjunctions | `src/activities/14-subordinating-conjunctions/grader.config.ts` |
| Fragment or Sentence | `src/activities/02-fragment-or-sentence/grader.config.ts` |
| Kernel Expansion | `src/activities/16-kernel-expansion/grader.config.ts` |
| Identify Topic Sentence | `src/activities/19-identify-topic-sentence/grader.config.ts` |
| Using Transition Words | `src/activities/31-using-transition-words/grader.config.ts` |

---

## Grader Config Structure

Each activity has a config like this:

```typescript
interface ActivityGraderConfig {
  nameOfActivity: string;
  
  goalForThisExercise: {
    primaryGoal: string;
    secondaryGoals: string[];
  };
  
  howTheActivityWorks: string;
  
  gradeAppropriateConsiderations: {
    level1: string;  // Grades 3-4
    level2: string;  // Grades 5-6
  };
  
  importantPrinciplesForGrading: string[];
  
  commonMistakesToAnticipate: Array<{
    mistake: string;
    explanation: string;
    example: string;
  }>;
  
  positiveExamples: Array<{
    example: string;
    explainer: string;
  }>;
  
  negativeExamples: Array<{
    example: string;
    explainer: string;
  }>;
  
  questionLabel?: string;  // e.g., "Fragment", "Sentence Stem"
  
  formatRequirements?: Array<{
    requirement: string;
    correctExample: string;
    incorrectExample: string;
  }>;
  
  feedbackPromptOverrides?: {
    concreteProblem?: string;
    callToAction?: string;
  };
}
```

---

## Response Schema

The LLM returns structured JSON:

```typescript
interface GradingResult {
  isCorrect: boolean;
  
  remarks: Array<{
    type: 'issue';
    severity: 'error' | 'nit';
    category: string;
    concreteProblem: string;  // What's wrong
    callToAction: string;     // How to fix it
  }>;
  
  solution: string;  // Corrected answer (markdown)
}
```

**Severity levels:**
- `error` — Fundamental problem, answer is incorrect
- `nit` — Minor issue, answer is acceptable but could be improved

---

## Simplified Implementation

### 1. Define Your Grader Config

```typescript
// grader-configs/basic-conjunctions.ts
export const basicConjunctionsConfig = {
  nameOfActivity: 'Because, But, So',
  
  goalForThisExercise: {
    primaryGoal: "Develop students' analytical thinking by having them express relationships using basic conjunctions.",
    secondaryGoals: [
      'Practice expressing cause-effect relationships',
      'Learn to show contrasts and changes of direction',
    ],
  },
  
  howTheActivityWorks: `Students complete a sentence stem ending with "because", "but", or "so".`,
  
  importantPrinciplesForGrading: [
    "'because' must explain why something is true",
    "'but' must show a clear change of direction or contrast",
    "'so' must connect to a logical consequence",
  ],
  
  positiveExamples: [
    {
      example: "Stem: 'Forests are important because _____'. Answer: 'they produce oxygen.'",
      explainer: 'Shows clear cause-and-effect relationship.',
    },
  ],
  
  negativeExamples: [
    {
      example: "Stem: 'The book was interesting, but _____'. Answer: 'my dog likes to run.'",
      explainer: 'Introduces unrelated topic instead of showing contrast.',
    },
  ],
  
  feedbackPromptOverrides: {
    concreteProblem: 'In a warm, friendly tone, point out what was wrong.',
    callToAction: 'In a warm, friendly tone, explain how to fix it.',
  },
};
```

### 2. Build the System Prompt

```typescript
// grading/prompt-builder.ts
export function buildSystemPrompt(config: ActivityGraderConfig, grade: number): string {
  return `
You are an expert writing coach using principles from "The Writing Revolution".
Your job is to evaluate a student's submission and provide helpful feedback.

## Activity: ${config.nameOfActivity}

**Primary Goal**: ${config.goalForThisExercise.primaryGoal}

**How it works**: ${config.howTheActivityWorks}

## Grading Principles
${config.importantPrinciplesForGrading.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Positive Examples
${config.positiveExamples.map(e => `- ${e.example}\n  Why it's correct: ${e.explainer}`).join('\n\n')}

## Negative Examples
${config.negativeExamples.map(e => `- ${e.example}\n  Why it's wrong: ${e.explainer}`).join('\n\n')}

## Grade Level
The student is in grade ${grade}. Adjust expectations accordingly.
- For grades 3-4: Be lenient on complex grammar, focus on core concept
- For grades 5-6: Expect more sophistication

## Output Format
Return a JSON object with this structure:
{
  "isCorrect": boolean,
  "remarks": [
    {
      "type": "issue",
      "severity": "error" | "nit",
      "category": "content" | "grammar" | "structure",
      "concreteProblem": "What's wrong (warm, friendly tone)",
      "callToAction": "How to fix it (warm, friendly tone)"
    }
  ],
  "solution": "Corrected answer if incorrect, empty string if correct"
}

Rules:
- If perfect, remarks should be an empty array
- Limit to 3 most important issues
- Use age-appropriate vocabulary
- "error" = answer is wrong, "nit" = minor issue but acceptable

Return ONLY valid JSON, no other text.
`.trim();
}
```

### 3. Call the LLM

```typescript
// grading/grader.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function gradeSubmission({
  activitySlug,
  question,
  studentAnswer,
  grade,
}: {
  activitySlug: string;
  question: string;
  studentAnswer: string;
  grade: number;
}): Promise<GradingResult> {
  const config = getGraderConfig(activitySlug);
  const systemPrompt = buildSystemPrompt(config, grade);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${config.questionLabel || 'Question'}: ${question}\n\nStudent Answer: ${studentAnswer}`,
      },
    ],
    system: systemPrompt,
  });
  
  // Parse JSON response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }
  
  return JSON.parse(content.text) as GradingResult;
}
```

### 4. Use Structured Output (Recommended)

For more reliable JSON, use Anthropic's tool use:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [...],
  system: systemPrompt,
  tools: [
    {
      name: 'submit_grading_result',
      description: 'Submit the grading result',
      input_schema: {
        type: 'object',
        properties: {
          isCorrect: { type: 'boolean' },
          remarks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['issue'] },
                severity: { type: 'string', enum: ['error', 'nit'] },
                category: { type: 'string' },
                concreteProblem: { type: 'string' },
                callToAction: { type: 'string' },
              },
              required: ['type', 'severity', 'category', 'concreteProblem', 'callToAction'],
            },
          },
          solution: { type: 'string' },
        },
        required: ['isCorrect', 'remarks', 'solution'],
      },
    },
  ],
  tool_choice: { type: 'tool', name: 'submit_grading_result' },
});
```

---

## Activity-to-Lesson Mapping

For the target curriculum:

| Lesson | Activity Slug | Grader Config |
|--------|---------------|---------------|
| Because/But/So | `basic-conjunctions` | `11-basic-conjunctions/grader.config.ts` |
| Appositive | `identify-appositives`, `write-appositives` | Two configs |
| Sentence Expansion | `kernel-expansion` | `16-kernel-expansion/grader.config.ts` |
| Subordinating Conjunction | `subordinating-conjunctions` | `14-subordinating-conjunctions/grader.config.ts` |
| Fragment/Run-on | `fragment-or-sentence` | `02-fragment-or-sentence/grader.config.ts` |
| Topic Sentence | `identify-topic-sentence` | `19-identify-topic-sentence/grader.config.ts` |
| Internal Transitions | `using-transition-words` | `31-using-transition-words/grader.config.ts` |

---

## Cost Estimation

| Model | Input | Output | Est. Cost per Grading |
|-------|-------|--------|----------------------|
| Claude Sonnet 4 | $3/1M tokens | $15/1M tokens | ~$0.01-0.03 |

Typical grading call: ~1,500 input tokens, ~300 output tokens.

---

## Testing

Before deploying, test with known inputs:

```typescript
// Example test case from AlphaWrite
const testCase = {
  question: "The dog is big, so _____",
  studentAnswer: "so big!",
  expectedResult: {
    isCorrect: false,
    remarkSeverity: 'error',
    // Using 'so' as intensifier instead of showing result
  },
};
```

AlphaWrite has extensive test cases in:
```
packages/edu-core/src/activities/*/evals/test-data.ts
```

---

## Migration Checklist

- [ ] Extract grader configs for target activities
- [ ] Implement simplified prompt builder
- [ ] Set up Anthropic SDK with API key
- [ ] Implement grading function with structured output
- [ ] Port relevant test cases
- [ ] Test with real student submissions
- [ ] Add error handling and fallbacks

---

## References

- **Original grading code**: `packages/edu-core/src/grading/adaptive-grader/`
- **Activity configs**: `packages/edu-core/src/activities/*/grader.config.ts`
- **Test data**: `packages/edu-core/src/activities/*/evals/test-data.ts`
- **Anthropic docs**: https://docs.anthropic.com/claude/docs

