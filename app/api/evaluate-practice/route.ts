/**
 * @fileoverview API endpoint for evaluating practice mode submissions.
 * Uses Claude Sonnet 4 with AlphaWrite-style grading configs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { gradePracticeSubmission } from '@/lib/grading/practice-grader';

/**
 * @description A previous attempt with content and grading feedback.
 */
interface PreviousAttempt {
  content: string;
  remarks: { severity: string; concreteProblem: string; callToAction: string }[];
}

/**
 * @description Request body for practice evaluation.
 */
interface EvaluatePracticeRequest {
  lessonId: string;
  question: string;
  studentAnswer: string;
  grade?: number;
  previousAttempts?: PreviousAttempt[];
}

/**
 * @description POST handler for evaluating practice submissions.
 * 
 * @example
 * curl -X POST http://localhost:3000/api/evaluate-practice \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "lessonId": "basic-conjunctions",
 *     "question": "The dog barked loudly because _____",
 *     "studentAnswer": "it saw the mailman coming."
 *   }'
 */
export async function POST(request: NextRequest) {
  try {
    const body: EvaluatePracticeRequest = await request.json();

    // Validate required fields
    if (!body.lessonId) {
      return NextResponse.json(
        { error: 'Missing required field: lessonId' },
        { status: 400 }
      );
    }
    if (!body.question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }
    if (!body.studentAnswer) {
      return NextResponse.json(
        { error: 'Missing required field: studentAnswer' },
        { status: 400 }
      );
    }

    // Validate studentAnswer is not empty or whitespace only
    if (body.studentAnswer.trim().length === 0) {
      return NextResponse.json(
        { error: 'Student answer cannot be empty' },
        { status: 400 }
      );
    }

    // Grade the submission
    const result = await gradePracticeSubmission({
      lessonId: body.lessonId,
      question: body.question,
      studentAnswer: body.studentAnswer,
      grade: body.grade,
      previousAttempts: body.previousAttempts,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Practice evaluation error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('No grader config found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          { error: 'Anthropic API key not configured' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to evaluate submission' },
      { status: 500 }
    );
  }
}

