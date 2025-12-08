/**
 * @fileoverview Practice mode grader using Claude Sonnet 4.
 * Implements AlphaWrite-style grading with structured output.
 */

import Anthropic from '@anthropic-ai/sdk';
import { getGraderConfig, GradingResult } from '@/lib/constants/grader-configs';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
 * @description Grades a practice submission using Claude Sonnet 4.
 * Uses structured output via tool use for reliable JSON responses.
 */
export async function gradePracticeSubmission({
  lessonId,
  question,
  studentAnswer,
  grade = 9,
  previousAttempts = [],
}: GradePracticeInput): Promise<GradingResult> {
  const config = getGraderConfig(lessonId);
  const systemPrompt = buildSystemPrompt(config, grade);
  const userPrompt = buildUserPrompt(question, studentAnswer, config.questionLabel, previousAttempts);

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
          properties: {
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
          },
          required: ['isCorrect', 'score', 'remarks', 'solution'],
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

  return result;
}

