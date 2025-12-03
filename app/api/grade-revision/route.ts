/**
 * @fileoverview API endpoint for grading revision content using TWR rubrics.
 * Grades Phase 3 revision, detects skill gaps, and stores results in history.
 *
 * POST /api/grade-revision
 * Body: { matchId, userId, content, prompt, graderType, gradeLevel? }
 * Returns: GradeRevisionResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { gradeParagraph } from '@/lib/grading/paragraph-grading';
import { gradeEssay } from '@/lib/grading/essay-grading';
import { detectGapsFromScorecard } from '@/lib/grading/paragraph-gap-detection';
import { detectGapsFromEssayScorecard } from '@/lib/grading/essay-gap-detection';
import {
  saveGradingResult,
  checkBlockStatus,
} from '@/lib/services/grading-history';
import type {
  GradeRevisionInput,
  GradeRevisionResponse,
  GraderType,
} from '@/lib/types/grading-history';
import type { ParagraphScorecard, SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssayScorecard, EssaySkillGap } from '@/lib/grading/essay-rubrics';

/**
 * @description Validate the request body.
 */
function validateRequestBody(body: unknown): {
  valid: boolean;
  error?: string;
  input?: GradeRevisionInput;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const data = body as Record<string, unknown>;

  if (!data.matchId || typeof data.matchId !== 'string') {
    return { valid: false, error: 'matchId is required and must be a string' };
  }

  if (!data.userId || typeof data.userId !== 'string') {
    return { valid: false, error: 'userId is required and must be a string' };
  }

  if (!data.content || typeof data.content !== 'string') {
    return { valid: false, error: 'content is required and must be a string' };
  }

  if (!data.prompt || typeof data.prompt !== 'string') {
    return { valid: false, error: 'prompt is required and must be a string' };
  }

  const graderType = data.graderType as GraderType;
  if (!graderType || !['paragraph', 'essay'].includes(graderType)) {
    return {
      valid: false,
      error: 'graderType is required and must be "paragraph" or "essay"',
    };
  }

  // Grade level is optional but must be valid if provided (for essay grading)
  if (data.gradeLevel !== undefined) {
    const gradeLevel = Number(data.gradeLevel);
    if (isNaN(gradeLevel) || gradeLevel < 6 || gradeLevel > 12) {
      return {
        valid: false,
        error: 'gradeLevel must be a number between 6 and 12',
      };
    }
  }

  return {
    valid: true,
    input: {
      matchId: data.matchId as string,
      userId: data.userId as string,
      content: data.content as string,
      prompt: data.prompt as string,
      graderType,
      gradeLevel: data.gradeLevel ? Number(data.gradeLevel) : undefined,
    },
  };
}

/**
 * @description Determine if scorecard has a severe gap.
 * Paragraph: any category score ≤2
 * Essay: any criterion with "No" score
 */
function hasSevereGap(
  graderType: GraderType,
  gaps: SkillGap[] | EssaySkillGap[]
): boolean {
  return gaps.some((gap) => gap.severity === 'high');
}

/**
 * @description POST handler for grading revision content.
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

    const { matchId, userId, content, prompt, graderType, gradeLevel } =
      validation.input;

    console.log(`📝 GRADE REVISION - Type: ${graderType}, Match: ${matchId}`);

    let scorecard: ParagraphScorecard | EssayScorecard;
    let gaps: SkillGap[] | EssaySkillGap[];
    let strengths: string[];
    let improvements: string[];
    let overallFeedback: string;

    // Grade based on grader type
    if (graderType === 'paragraph') {
      const result = await gradeParagraph({
        paragraph: content,
        prompt,
        rubricType: 'expository', // Default to expository for now
        gradeLevel,
      });

      scorecard = result.scorecard;
      strengths = result.strengths;
      improvements = result.improvements;
      overallFeedback = result.overallFeedback;

      // Detect gaps
      const gapResult = detectGapsFromScorecard(result.scorecard);
      gaps = gapResult.gaps;
    } else {
      // Essay grading requires grade level
      const effectiveGradeLevel = gradeLevel || 8; // Default to grade 8

      const result = await gradeEssay({
        essay: content,
        prompt,
        essayType: 'Expository', // Default to Expository for now
        gradeLevel: effectiveGradeLevel,
      });

      scorecard = result.scorecard;
      strengths = result.strengths;
      improvements = result.improvements;
      overallFeedback = result.overallFeedback;

      // Detect gaps
      const gapResult = detectGapsFromEssayScorecard(result.scorecard);
      gaps = gapResult.gaps;
    }

    // Determine if there's a severe gap
    const severeGap = hasSevereGap(graderType, gaps);

    // Save to grading history
    const gradingId = await saveGradingResult(userId, {
      matchId,
      phase: 3, // Phase 3 revision
      graderType,
      scorecard,
      gaps,
      hasSevereGap: severeGap,
      writingContent: content,
      prompt,
    });

    // Check block status (includes accumulated gaps)
    const blockStatus = await checkBlockStatus(userId);

    console.log(
      `✅ GRADE REVISION - Score: ${scorecard.percentageScore}%, Severe Gap: ${severeGap}, Blocked: ${blockStatus.isBlocked}`
    );

    const response: GradeRevisionResponse = {
      success: true,
      gradingId,
      scorecard,
      gaps,
      hasSevereGap: severeGap,
      blockStatus,
      strengths,
      improvements,
      overallFeedback,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ GRADE REVISION - Error:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to grade revision',
      },
      { status: 500 }
    );
  }
}

