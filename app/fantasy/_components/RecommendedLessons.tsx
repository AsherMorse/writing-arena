/**
 * @fileoverview Component to display recommended lessons based on skill gaps.
 * Shows after grading to guide students to targeted practice.
 */

'use client';

import { useRouter } from 'next/navigation';
import { ParchmentCard } from './ParchmentCard';
import { ParchmentButton } from './ParchmentButton';
import { getParchmentTextStyle } from './parchment-styles';
import { getLessonDisplayName } from '@/lib/constants/lesson-display-names';
import { FantasyButton } from '@/components/fantasy/FantasyButton';

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

  const textStyle = getParchmentTextStyle();
  const accentColor = hasSevereGap ? '#b91c1c' : '#b45309';

  return (
    <ParchmentCard variant="default" borderRadius="lg">
      <h4
        className="font-memento text-sm uppercase tracking-widest mb-3 pb-2 border-b"
        style={{ color: accentColor, borderColor: 'rgba(139, 99, 52, 0.3)' }}
      >
        {hasSevereGap ? '⚠️ Practice Recommended' : 'Suggested Practice'}
      </h4>
      <div className="flex items-start gap-3 pt-1">
        <div className="flex-1">
          <p
            className="font-avenir text-sm mb-3"
            style={{ ...textStyle, opacity: 0.8 }}
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
                style={textStyle}
              >
                • {getLessonDisplayName(lessonId)}
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className="font-avenir text-xs"
                style={{ ...textStyle, opacity: 0.6 }}
              >
                +{remainingCount} more
              </div>
            )}
          </div>
        </div>
        {showPracticeButton && (
          <ParchmentButton
          onClick={() => router.push('/fantasy/study')} variant="golden">
              Practice
            </ParchmentButton>
          )}
        </div>
      </ParchmentCard>
    );
}
