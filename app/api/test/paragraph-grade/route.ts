/**
 * @fileoverview Test endpoint for paragraph grading.
 * POST /api/test/paragraph-grade
 * 
 * Use this endpoint to validate paragraph grading before integrating into ranked matches.
 */

import { NextRequest, NextResponse } from 'next/server';
import { gradeParagraph, normalizeToRankedScore, getAvailableRubricTypes } from '@/lib/grading/paragraph-grading';
import { detectGapsFromScorecard, getTopRecommendedLessons } from '@/lib/grading/paragraph-gap-detection';
import type { ParagraphRubricType } from '@/lib/grading/paragraph-rubrics';

/**
 * @description POST handler for testing paragraph grading.
 * 
 * Request body:
 * {
 *   "paragraph": "Student's paragraph text",
 *   "prompt": "The writing prompt",
 *   "rubricType": "expository" | "argumentative" | "opinion" | "pro-con" (optional, defaults to expository),
 *   "gradeLevel": number (optional, e.g., 7 for 7th grade)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "grading": {
 *     "scorecard": { ... },
 *     "strengths": [...],
 *     "improvements": [...],
 *     "overallFeedback": "..."
 *   },
 *   "normalizedScore": 0-100,
 *   "gaps": {
 *     "hasGaps": boolean,
 *     "gaps": [...],
 *     "prioritizedLessons": [...]
 *   },
 *   "recommendedLessons": [...top 3 lessons],
 *   "metadata": {
 *     "rubricType": "expository",
 *     "availableRubricTypes": [...]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paragraph, prompt, rubricType = 'expository', gradeLevel } = body;

    // Validate required fields
    if (!paragraph || typeof paragraph !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "paragraph" field' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "prompt" field' },
        { status: 400 }
      );
    }

    // Validate rubric type
    const validTypes = getAvailableRubricTypes();
    if (!validTypes.includes(rubricType as ParagraphRubricType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid rubricType. Must be one of: ${validTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    console.log(`📝 TEST PARAGRAPH GRADE - Rubric: ${rubricType}, Grade: ${gradeLevel || 'not specified'}`);
    console.log(`📝 TEST PARAGRAPH GRADE - Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`📝 TEST PARAGRAPH GRADE - Paragraph length: ${paragraph.length} chars`);

    // Grade the paragraph
    const grading = await gradeParagraph({
      paragraph,
      prompt,
      rubricType: rubricType as ParagraphRubricType,
      gradeLevel,
    });

    // Detect skill gaps
    const gapResult = detectGapsFromScorecard(grading.scorecard);
    const recommendedLessons = getTopRecommendedLessons(gapResult, 3);

    // Normalize score to 0-100 for ranked match compatibility
    const normalizedScore = normalizeToRankedScore(
      grading.scorecard.totalScore,
      grading.scorecard.maxScore
    );

    console.log(`✅ TEST PARAGRAPH GRADE - Score: ${grading.scorecard.totalScore}/${grading.scorecard.maxScore} (${normalizedScore}%)`);
    console.log(`✅ TEST PARAGRAPH GRADE - Gaps found: ${gapResult.hasGaps}, Lessons: ${recommendedLessons.join(', ')}`);

    return NextResponse.json({
      success: true,
      grading,
      normalizedScore,
      gaps: gapResult,
      recommendedLessons,
      metadata: {
        rubricType,
        gradeLevel: gradeLevel || null,
        availableRubricTypes: validTypes,
      },
    });
  } catch (error) {
    console.error('❌ TEST PARAGRAPH GRADE - Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * @description GET handler to check endpoint status and available options.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/test/paragraph-grade',
    availableRubricTypes: getAvailableRubricTypes(),
    usage: {
      method: 'POST',
      body: {
        paragraph: 'string (required) - The student paragraph to grade',
        prompt: 'string (required) - The writing prompt',
        rubricType: 'string (optional) - One of: expository, argumentative, opinion, pro-con. Default: expository',
        gradeLevel: 'number (optional) - Student grade level (e.g., 7 for 7th grade)',
      },
    },
  });
}

