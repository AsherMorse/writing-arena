/**
 * @fileoverview Test endpoint for essay grading with TWR categorical rubrics.
 * POST: Grade an essay and return scorecard with gap detection
 * GET: Return available essay types and usage information
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  gradeEssay,
  normalizeToRankedScore,
  getAvailableEssayTypesForGrading,
  getCriteriaCount,
} from '@/lib/grading/essay-grading';
import {
  detectGapsFromEssayScorecard,
  getTopRecommendedLessons,
  getGapSummary,
} from '@/lib/grading/essay-gap-detection';
import type { EssayType, EssayGradingInput } from '@/lib/grading/essay-rubrics';

/**
 * @description Handle GET requests - return available essay types and usage info.
 */
export async function GET() {
  const essayTypes = getAvailableEssayTypesForGrading();

  // Get criteria counts for sample combinations
  const sampleCriteriaCounts = [
    { grade: 6, type: 'Expository' as EssayType, count: getCriteriaCount(6, 'Expository') },
    { grade: 9, type: 'Argumentative' as EssayType, count: getCriteriaCount(9, 'Argumentative') },
    { grade: 9, type: 'Pro/Con' as EssayType, count: getCriteriaCount(9, 'Pro/Con') },
    { grade: 12, type: 'Argumentative' as EssayType, count: getCriteriaCount(12, 'Argumentative') },
  ];

  return NextResponse.json({
    endpoint: '/api/test/essay-grade',
    description: 'Grade essays using TWR categorical rubrics (Yes/Developing/No)',
    availableEssayTypes: essayTypes,
    supportedGradeLevels: { min: 6, max: 12 },
    sampleCriteriaCounts,
    usage: {
      method: 'POST',
      body: {
        essay: 'string (required) - Full essay text to grade',
        prompt: 'string (required) - Writing prompt the student responded to',
        essayType: `string (optional, default: "Expository") - One of: ${essayTypes.join(', ')}`,
        gradeLevel: 'number (required) - Student grade level (6-12)',
      },
      example: {
        essay:
          'Technology has transformed education in many ways. First, students can now access information instantly through the internet...',
        prompt: 'Write an essay about how technology has changed education.',
        essayType: 'Argumentative',
        gradeLevel: 9,
      },
    },
    response: {
      success: 'boolean',
      grading: {
        scorecard: 'Object with criteria, each scored Yes/Developing/No',
        strengths: 'Array of 3-5 strengths with TWR strategy references',
        improvements: 'Array of 3-5 improvements with suggested revisions',
        overallFeedback: 'Brief overall assessment',
      },
      normalizedScore: 'Number (0-100) for ranked match compatibility',
      gaps: 'Gap detection result with recommended lessons',
      recommendedLessons: 'Top 3 practice lessons based on gaps',
    },
  });
}

/**
 * @description Validate POST request body.
 */
function validateRequestBody(body: unknown): {
  valid: boolean;
  error?: string;
  input?: EssayGradingInput;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { essay, prompt, essayType, gradeLevel } = body as Record<string, unknown>;

  if (!essay || typeof essay !== 'string' || essay.trim().length === 0) {
    return { valid: false, error: 'essay is required and must be a non-empty string' };
  }

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { valid: false, error: 'prompt is required and must be a non-empty string' };
  }

  if (typeof gradeLevel !== 'number' || gradeLevel < 6 || gradeLevel > 12) {
    return {
      valid: false,
      error: 'gradeLevel is required and must be a number between 6 and 12',
    };
  }

  const validEssayTypes = getAvailableEssayTypesForGrading();
  if (essayType && !validEssayTypes.includes(essayType as EssayType)) {
    return {
      valid: false,
      error: `essayType must be one of: ${validEssayTypes.join(', ')}`,
    };
  }

  return {
    valid: true,
    input: {
      essay: essay as string,
      prompt: prompt as string,
      essayType: (essayType as EssayType) || 'Expository',
      gradeLevel: gradeLevel as number,
    },
  };
}

/**
 * @description Handle POST requests - grade an essay.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequestBody(body);

    if (!validation.valid || !validation.input) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { input } = validation;

    console.log(`📝 Essay grading request: ${input.essayType} essay, grade ${input.gradeLevel}`);

    // Grade the essay
    const grading = await gradeEssay(input);

    // Get normalized score for ranked match compatibility
    const normalizedScore = normalizeToRankedScore(grading.scorecard);

    // Detect skill gaps
    const gaps = detectGapsFromEssayScorecard(grading.scorecard);
    const gapSummary = getGapSummary(gaps);

    // Get top recommended lessons
    const recommendedLessons = getTopRecommendedLessons(gaps, 3);

    return NextResponse.json({
      success: true,
      grading,
      normalizedScore,
      gaps: {
        ...gaps,
        summary: gapSummary,
      },
      recommendedLessons,
      metadata: {
        essayType: input.essayType,
        gradeLevel: input.gradeLevel,
        criteriaCount: grading.scorecard.criteria.length,
        availableEssayTypes: getAvailableEssayTypesForGrading(),
      },
    });
  } catch (error) {
    console.error('Essay grading error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

