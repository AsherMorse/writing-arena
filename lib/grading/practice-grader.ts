/**
 * @fileoverview Practice mode grader using Claude Sonnet 4.
 * Implements AlphaWrite-style grading with structured output.
 * Supports per-section scoring for cardinal rubric activities.
 */

import Anthropic from '@anthropic-ai/sdk';
import { getGraderConfig, GradingResult, SectionScores } from '@/lib/constants/grader-configs';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
 * @description Build section scores schema for cardinal rubric activities.
 */
function buildSectionScoresSchema(rubricType: CardinalRubricType): object | null {
  if (!rubricType) return null;

  const scoreProperty = {
    type: 'integer',
    minimum: 0,
    maximum: 5,
  };

  if (rubricType === 'spo' || rubricType === 'freeform-paragraph') {
    return {
      type: 'object',
      description: 'Per-section scores (0-5 each) for the rubric categories',
      properties: {
        topicSentence: { ...scoreProperty, description: 'Topic Sentence score (0-5)' },
        supportingDetails: { ...scoreProperty, description: 'Supporting Details & Organization score (0-5)' },
        concludingSentence: { ...scoreProperty, description: 'Concluding Sentence score (0-5)' },
        conventions: { ...scoreProperty, description: 'Conventions score (0-5)' },
      },
      required: ['topicSentence', 'supportingDetails', 'concludingSentence', 'conventions'],
    };
  }

  if (rubricType === 'elaborate') {
    return {
      type: 'object',
      description: 'Per-section scores (0-5 each) for the rubric categories',
      properties: {
        improvements: { ...scoreProperty, description: 'Improvements to Paragraph score (0-5)' },
        conventions: { ...scoreProperty, description: 'Conventions score (0-5)' },
      },
      required: ['improvements', 'conventions'],
    };
  }

  return null;
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

Score levels: 5=Exceptional, 4=Skilled, 3=Proficient, 2=Developing, 1=Beginning, 0=Absent/Incomplete`;
  } else if (rubricType === 'elaborate') {
    rubricInstructions = `

## Section Scoring (Cardinal Rubric)
You must also provide per-section scores (0-5 each) for:
1. **Improvements to Paragraph**: Did the student address the requested improvements from the instructions?
2. **Conventions**: Grammar, spelling, punctuation, and capitalization control.

Score levels: 5=Exceptional, 4=Skilled, 3=Proficient, 2=Developing, 1=Beginning, 0=No improvement`;
  }

  return basePrompt + rubricInstructions;
}

/**
 * @description Grades a practice submission using Claude Sonnet 4.
 * Uses structured output via tool use for reliable JSON responses.
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
  const systemPrompt = addSectionScoringInstructions(baseSystemPrompt, rubricType);
  const userPrompt = buildUserPrompt(question, studentAnswer, config.questionLabel, previousAttempts);

  // Build tool schema - add sectionScores for cardinal rubric activities
  const baseProperties: Record<string, object> = {
    isCorrect: {
      type: 'boolean',
      description: 'Whether the answer meets the activity requirements',
    },
    score: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      description: 'Numerical score from 0-100',
    },
    remarks: {
      type: 'array',
      description: 'Array of feedback items (empty if perfect)',
      items: {
        type: 'object',
        properties: {
          severity: {
            type: 'string',
            enum: ['error', 'nit'],
            description: '"error" for major issues, "nit" for minor issues',
          },
          category: {
            type: 'string',
            description: 'Category of the issue (e.g., "logic", "grammar", "structure")',
          },
          concreteProblem: {
            type: 'string',
            description: 'Brief description of the issue (50-85 characters, friendly tone)',
          },
          callToAction: {
            type: 'string',
            description: 'How to fix it (70-150 characters, friendly tone)',
          },
        },
        required: ['severity', 'concreteProblem', 'callToAction'],
      },
    },
    solution: {
      type: 'string',
      description: 'Corrected version if incorrect, empty string if correct',
    },
  };

  const requiredFields = ['isCorrect', 'score', 'remarks', 'solution'];

  // Add section scores for cardinal rubric activities
  const sectionScoresSchema = buildSectionScoresSchema(rubricType);
  if (sectionScoresSchema) {
    baseProperties.sectionScores = sectionScoresSchema;
    requiredFields.push('sectionScores');
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    tools: [
      {
        name: 'submit_grading_result',
        description: 'Submit the grading result for the student submission',
        input_schema: {
          type: 'object' as const,
          properties: baseProperties,
          required: requiredFields,
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_grading_result' },
  });

  // Extract tool use result
  const toolUseBlock = response.content.find(block => block.type === 'tool_use');
  
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('No grading result returned from Claude');
  }

  const result = toolUseBlock.input as GradingResult;

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

