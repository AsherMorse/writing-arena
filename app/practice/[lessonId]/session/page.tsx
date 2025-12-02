/**
 * @fileoverview Practice session page for a specific lesson.
 * Renders the 3-phase practice session flow.
 */

'use client';

import { use } from 'react';
import PracticeSessionContent from '@/components/practice/PracticeSessionContent';

interface SessionPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function PracticeLessonSessionPage({ params }: SessionPageProps) {
  const { lessonId } = use(params);

  return <PracticeSessionContent lessonId={lessonId} />;
}

