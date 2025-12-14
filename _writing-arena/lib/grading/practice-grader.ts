/**
 * @fileoverview Practice mode grader using OpenAI o3-mini.
 * Implements AlphaWrite-style grading with structured JSON output.
 * Supports per-section scoring for cardinal rubric activities.
 */

import OpenAI from 'openai';
import { getGraderConfig, GradingResult, SectionScores } from '@/lib/constants/grader-configs';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @description Cardinal rubric types for activities that need per-section scoring.
 */
type CardinalRubricType = 'spo' | 'elaborate' | 'freeform-paragraph' | null;

/**
 * @description Activities that use cardinal rubric (per-section scoring).
 */
const CARDINAL_RUBRIC_ACTIVITIES: Record<string, CardinalRubricType> = {
  'writing-spos': 'spo',
  'elaborate-paragraphs': 'elaborate',
  'write-freeform-paragraph': 'freeform-paragraph',
};

/**
 * @description Get the cardinal rubric type for a lesson.
 */
function getCardinalRubricType(lessonId: string): CardinalRubricType {
  return CARDINAL_RUBRIC_ACTIVITIES[lessonId] || null;
}

/**
 * @description Get max score for a rubric type.
 */
export function getMaxScoreForRubric(lessonId: string): number {
  const rubricType = getCardinalRubricType(lessonId);
  if (rubricType === 'elaborate') return 10; // 2 sections × 5 points
  if (rubricType === 'spo' || rubricType === 'freeform-paragraph') return 20; // 4 sections × 5 points
  return 100; // Default percentage-based
}

/**
 * @description A previous attempt with content and grading feedback.
 */
export interface PreviousAttempt {
  /** The content the student submitted */
  content: string;
  /** The feedback remarks from grading */
  remarks: { severity: string; concreteProblem: string; callToAction: string }[];
}

/**
 * @description Input parameters for grading a practice submission.
 */
export interface GradePracticeInput {
  /** The lesson being practiced */
  lessonId: string;
  /** The question/prompt shown to the student */
  question: string;
  /** The student's answer */
  studentAnswer: string;
  /** Student's grade level (default: 5) */
  grade?: number;
  /** Previous attempts with their feedback (for retry context) */
  previousAttempts?: PreviousAttempt[];
}

/**
 * @description Add section scoring instructions to the system prompt for cardinal activities.
 */
function addSectionScoringInstructions(basePrompt: string, rubricType: CardinalRubricType): string {
  if (!rubricType) return basePrompt;

  let rubricInstructions = '';

  if (rubricType === 'spo' || rubricType === 'freeform-paragraph') {
    rubricInstructions = `

## Section Scoring (Cardinal Rubric)
You must also provide per-section scores (0-5 each) for:
1. **Topic Sentence (T.S.)**: Does it clearly express the main idea? Uses TWR strategies (sentence type, appositive, subordinating conjunction)?
2. **Supporting Details & Organization**: Are details relevant, logically sequenced, in proper note form?
3. **Concluding Sentence (C.S.)**: Does it reaffirm the main idea and provide closure?
4. **Conventions**: Grammar, spelling, punctuation control in T.S. and C.S. (note form not evaluated).

Score levels: 5=Exceptional, 4=Skilled, 3=Proficient, 2=Developing, 1=Beginning, 0=Absent/Incomplete

Include a "sectionScores" object with keys: topicSentence, supportingDetails, concludingSentence, conventions (each 0-5).`;
  } else if (rubricType === 'elaborate') {
    rubricInstructions = `

## Section Scoring (Cardinal Rubric)
You must also provide per-section scores (0-5 each) for:
1. **Improvements to Paragraph**: Did the student address the requested improvements from the instructions?
2. **Conventions**: Grammar, spelling, punctuation, and capitalization control.

Score levels: 5=Exceptional, 4=Skilled, 3=Proficient, 2=Developing, 1=Beginning, 0=No improvement

Include a "sectionScores" object with keys: improvements, conventions (each 0-5).`;
  }

  return basePrompt + rubricInstructions;
}

/**
 * @description Build JSON output instructions for the system prompt.
 */
function buildJsonInstructions(rubricType: CardinalRubricType): string {
  const baseSchema = `
## Output Format
You MUST respond with valid JSON only. No other text before or after.

{
  "isCorrect": boolean,
  "score": number (0-100),
  "remarks": [
    {
      "severity": "error" | "nit",
      "category": "content" | "grammar" | "structure" | "logic",
      "concreteProblem": "Brief description (50-85 chars, friendly tone)",
      "callToAction": "How to fix it (70-150 chars, friendly tone)"
    }
  ],
  "solution": "Corrected version if incorrect, empty string if correct"${rubricType ? `,
  "sectionScores": { ... }` : ''}
}

Rules:
- If perfect, remarks should be an empty array []
- Limit to 3 most important issues
- "error" = answer is fundamentally wrong, "nit" = minor issue but acceptable
- Use age-appropriate vocabulary`;

  return baseSchema;
}

/**
 * @description Grades a practice submission using OpenAI o3-mini.
 * Uses JSON mode for reliable structured responses.
 * Supports per-section scoring for cardinal rubric activities.
 */
export async function gradePracticeSubmission({
  lessonId,
  question,
  studentAnswer,
  grade = 9,
  previousAttempts = [],
}: GradePracticeInput): Promise<GradingResult> {
  const config = getGraderConfig(lessonId);
  const rubricType = getCardinalRubricType(lessonId);
  const baseSystemPrompt = buildSystemPrompt(config, grade);
  const systemPromptWithScoring = addSectionScoringInstructions(baseSystemPrompt, rubricType);
  const systemPrompt = systemPromptWithScoring + buildJsonInstructions(rubricType);
  const userPrompt = buildUserPrompt(question, studentAnswer, config.questionLabel, previousAttempts);

  const response = await openai.chat.completions.create({
    model: 'o3-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  });

  // Parse JSON response
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No grading result returned from OpenAI');
  }

  let result: GradingResult;
  try {
    result = JSON.parse(content) as GradingResult;
  } catch {
    throw new Error(`Failed to parse grading response: ${content.substring(0, 200)}`);
  }

  // Validate the result structure
  if (typeof result.isCorrect !== 'boolean') {
    throw new Error('Invalid grading result: isCorrect must be boolean');
  }
  if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
    throw new Error('Invalid grading result: score must be 0-100');
  }
  if (!Array.isArray(result.remarks)) {
    throw new Error('Invalid grading result: remarks must be an array');
  }

  // Ensure solution exists
  if (typeof result.solution !== 'string') {
    result.solution = '';
  }

  // For cardinal rubric activities, calculate score from section scores
  if (rubricType && result.sectionScores) {
    const maxScore = getMaxScoreForRubric(lessonId);
    let totalSectionScore = 0;
    
    if (rubricType === 'spo' || rubricType === 'freeform-paragraph') {
      totalSectionScore = 
        (result.sectionScores.topicSentence || 0) +
        (result.sectionScores.supportingDetails || 0) +
        (result.sectionScores.concludingSentence || 0) +
        (result.sectionScores.conventions || 0);
    } else if (rubricType === 'elaborate') {
      totalSectionScore = 
        (result.sectionScores.improvements || 0) +
        (result.sectionScores.conventions || 0);
    }
    
    // Override score with calculated percentage from section scores
    result.score = Math.round((totalSectionScore / maxScore) * 100);
  }

  return result;
}
