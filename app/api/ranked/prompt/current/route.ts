import { NextRequest, NextResponse } from 'next/server';
import { getUserRankedProgress } from '@/lib/services/ranked-progress';
import { getPromptBySequence, getMaxSequenceNumber } from '@/lib/services/ranked-prompts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const progress = await getUserRankedProgress(userId);
    const maxSequence = await getMaxSequenceNumber('paragraph');

    if (maxSequence === 0) {
      return NextResponse.json({
        prompt: null,
        completed: false,
        noPromptsAvailable: true,
        currentSequence: progress.currentPromptSequence,
        maxSequence: 0,
      });
    }

    if (progress.currentPromptSequence > maxSequence) {
      return NextResponse.json({
        prompt: null,
        completed: true,
        noPromptsAvailable: false,
        currentSequence: progress.currentPromptSequence,
        maxSequence,
      });
    }

    const prompt = await getPromptBySequence(progress.currentPromptSequence, 'paragraph');

    if (!prompt) {
      return NextResponse.json({
        prompt: null,
        completed: false,
        noPromptsAvailable: true,
        currentSequence: progress.currentPromptSequence,
        maxSequence,
      });
    }

    return NextResponse.json({
      prompt,
      completed: false,
      noPromptsAvailable: false,
      currentSequence: progress.currentPromptSequence,
      maxSequence,
    });
  } catch (error) {
    console.error('Error fetching current prompt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}
