/**
 * @fileoverview Grading API route for paragraph and essay submissions.
 * Returns grading results with detected skill gaps for client-side tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { gradeWriting, gradeEssay, type WritingType } from '@/app/_lib/grading';

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

    if (type === 'essay') {
      const response = await gradeEssay({
        content: body.content,
        prompt: body.prompt,
        type: 'essay',
        gradeLevel: body.gradeLevel,
        previousResult: body.previousResult,
        previousContent: body.previousContent,
      });

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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Grading failed' },
      { status: 500 }
    );
  }
}
