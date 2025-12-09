/**
 * @fileoverview Grading API route for paragraph and essay submissions.
 * Optionally tracks skill gaps when userId and submissionId are provided.
 */

import { NextRequest, NextResponse } from 'next/server';
import { gradeWriting, gradeEssay, type WritingType } from '../../_lib/grading';
import { updateSkillGaps } from '@/lib/services/skill-gap-tracker';
import type { SubmissionSource } from '@/lib/types/skill-gaps';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const type: WritingType = body.type === 'essay' ? 'essay' : 'paragraph';

    // Optional gap tracking params
    const userId: string | undefined = body.userId;
    const submissionId: string | undefined = body.submissionId;
    const source: SubmissionSource = body.source === 'ranked' ? 'ranked' : 'practice';

    if (type === 'essay') {
      const response = await gradeEssay({
        content: body.content,
        prompt: body.prompt,
        type: 'essay',
        gradeLevel: body.gradeLevel,
        previousResult: body.previousResult,
        previousContent: body.previousContent,
      });

      // Track skill gaps if user context provided
      if (userId && submissionId && response.gaps.length > 0) {
        try {
          await updateSkillGaps(userId, response.gaps, source, submissionId);
        } catch (gapError) {
          // Log but don't fail the request if gap tracking fails
          console.error('Failed to update skill gaps:', gapError);
        }
      }

      return NextResponse.json(response);
    }

    const response = await gradeWriting({
      content: body.content,
      prompt: body.prompt,
      type,
      gradeLevel: body.gradeLevel,
      previousResult: body.previousResult,
      previousContent: body.previousContent,
    });

    // Track skill gaps if user context provided
    if (userId && submissionId && response.gaps.length > 0) {
      try {
        await updateSkillGaps(userId, response.gaps, source, submissionId);
      } catch (gapError) {
        // Log but don't fail the request if gap tracking fails
        console.error('Failed to update skill gaps:', gapError);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Grading failed' },
      { status: 500 }
    );
  }
}
