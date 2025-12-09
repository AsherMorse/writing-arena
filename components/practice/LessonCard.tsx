/**
 * @fileoverview Lesson card component for practice mode.
 * Displays lesson info, mastery status, and start button.
 */

'use client';

import Link from 'next/link';
import { PracticeLesson } from '@/lib/constants/practice-lessons';
import { MasteryDisplay } from './MasteryDisplay';

interface LessonCardProps {
  lesson: PracticeLesson;
  isMastered: boolean;
  bestScore: number;
  attempts: number;
  canEarnLP: boolean;
  /** Whether this lesson is recommended based on skill gaps */
  isRecommended?: boolean;
}

/**
 * @description Card component for displaying a practice lesson.
 */
export function LessonCard({
  lesson,
  isMastered,
  bestScore,
  attempts,
  canEarnLP,
  isRecommended = false,
}: LessonCardProps) {
  const isComingSoon = lesson.status === 'coming-soon';
  const totalMinutes = lesson.phaseDurations.reviewPhase + lesson.phaseDurations.writePhase + lesson.phaseDurations.revisePhase;

  const categoryIcons = {
    sentence: '✏️',
    paragraph: '📝',
    essay: '📄',
  };

  /**
   * @description Get border/background classes based on card state.
   */
  function getCardStyles(): string {
    if (isComingSoon) {
      return 'border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)]';
    }
    if (isRecommended) {
      return 'border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.08)] hover:border-[rgba(251,191,36,0.6)] hover:bg-[rgba(251,191,36,0.12)]';
    }
    return 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] hover:border-[rgba(0,229,229,0.2)] hover:bg-[rgba(0,229,229,0.03)]';
  }

  return (
    <div
      className={`group relative rounded-[14px] border ${getCardStyles()} p-6 transition-all`}
    >
      {/* Required Badge */}
      {isRecommended && (
        <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black shadow-md">
          Required
        </span>
      )}

      {/* Header: Icon + Title + Mastery */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.05)] text-xl ${
              isComingSoon ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-[#101012]'
            }`}
          >
            {categoryIcons[lesson.category]}
          </span>
          <div>
            <h3
              className={`font-medium ${
                isComingSoon ? 'text-[rgba(255,255,255,0.3)]' : 'text-white'
              }`}
            >
              {lesson.name}
            </h3>
            <p
              className={`mt-1 text-xs capitalize ${
                isComingSoon ? 'text-[rgba(255,255,255,0.15)]' : 'text-[rgba(255,255,255,0.4)]'
              }`}
            >
              {lesson.category} skill
            </p>
          </div>
        </div>

        {!isComingSoon && <MasteryDisplay isMastered={isMastered} size="sm" />}
      </div>

      {/* Description */}
      <p
        className={`mt-4 text-sm leading-relaxed ${
          isComingSoon ? 'text-[rgba(255,255,255,0.2)]' : 'text-[rgba(255,255,255,0.5)]'
        }`}
      >
        {lesson.description}
      </p>

      {/* Stats Row */}
      {!isComingSoon && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]">
            ⏱️ {totalMinutes} min
          </span>
          {attempts > 0 && (
            <span className="rounded-full border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]">
              Best: {bestScore}%
            </span>
          )}
          {canEarnLP && (
            <span className="rounded-full border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-3 py-1 text-[#00e5e5]">
              LP Available
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-5">
        {isComingSoon ? (
          <div className="rounded-[10px] border border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-center text-sm text-[rgba(255,255,255,0.2)]">
            Coming soon
          </div>
        ) : (
          <Link
            href={`/improve/activities/${lesson.id}`}
            className="block w-full rounded-[10px] border border-[#00e5e5] bg-transparent px-4 py-2.5 text-center text-sm font-medium text-[#00e5e5] transition hover:bg-[rgba(0,229,229,0.1)]"
          >
            {attempts > 0 ? 'Practice Again' : 'Start Lesson'}
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * @description Compact lesson card for dashboard widgets.
 */
export function LessonCardCompact({
  lesson,
  isMastered,
}: {
  lesson: PracticeLesson;
  isMastered: boolean;
}) {
  const isComingSoon = lesson.status === 'coming-soon';

  return (
    <Link
      href={isComingSoon ? '#' : `/improve/activities/${lesson.id}`}
      className={`flex items-center justify-between rounded-[10px] border px-4 py-3 transition ${
        isComingSoon
          ? 'cursor-not-allowed border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)]'
          : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] hover:border-[rgba(0,229,229,0.2)]'
      }`}
    >
      <span className={isComingSoon ? 'text-[rgba(255,255,255,0.3)]' : ''}>
        {lesson.name}
      </span>
      {!isComingSoon && <MasteryDisplay isMastered={isMastered} size="sm" />}
    </Link>
  );
}

