/**
 * @fileoverview Component to display recommended lessons based on skill gaps.
 * Shows after grading to guide students to targeted practice.
 */

'use client';

import { useRouter } from 'next/navigation';
import { FantasyButton } from '@/components/fantasy';
import { getLessonDisplayName } from '@/lib/constants/lesson-display-names';

interface RecommendedLessonsProps {
  /** Array of lesson IDs to recommend */
  lessons: string[];
  /** Whether there's a severe gap (changes styling/messaging) */
  hasSevereGap?: boolean;
  /** Maximum number of lessons to display */
  maxDisplay?: number;
  /** Whether to show the practice button */
  showPracticeButton?: boolean;
}

/**
 * @description Component to display recommended lessons based on detected gaps.
 */
export function RecommendedLessons({
  lessons,
  hasSevereGap = false,
  maxDisplay = 3,
  showPracticeButton = true,
}: RecommendedLessonsProps) {
  const router = useRouter();

  if (lessons.length === 0) return null;

  const displayedLessons = lessons.slice(0, maxDisplay);
  const remainingCount = lessons.length - maxDisplay;

  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: hasSevereGap
          ? 'rgba(239, 68, 68, 0.15)'
          : 'rgba(251, 191, 36, 0.15)',
        border: `1px solid ${hasSevereGap ? 'rgba(239, 68, 68, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4
            className="font-memento text-xs uppercase tracking-wider mb-2"
            style={{
              color: hasSevereGap
                ? 'rgba(239, 68, 68, 0.9)'
                : 'rgba(251, 191, 36, 0.9)',
            }}
          >
            {hasSevereGap ? '⚠️ Practice Recommended' : '💡 Suggested Practice'}
          </h4>
          <p
            className="font-avenir text-sm mb-3"
            style={{ color: 'rgba(245, 230, 184, 0.7)' }}
          >
            {hasSevereGap
              ? 'Critical skills need work. Complete these lessons to improve:'
              : 'These lessons can help strengthen your writing:'}
          </p>
          <div className="space-y-1">
            {displayedLessons.map((lessonId) => (
              <div
                key={lessonId}
                className="font-avenir text-sm"
                style={{ color: 'rgba(245, 230, 184, 0.9)' }}
              >
                • {getLessonDisplayName(lessonId)}
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className="font-avenir text-xs"
                style={{ color: 'rgba(245, 230, 184, 0.5)' }}
              >
                +{remainingCount} more
              </div>
            )}
          </div>
        </div>
        {showPracticeButton && (
          <FantasyButton
            onClick={() => router.push('/improve/activities')}
            variant="secondary"
            size="small"
          >
            Practice
          </FantasyButton>
        )}
      </div>
    </div>
  );
}
