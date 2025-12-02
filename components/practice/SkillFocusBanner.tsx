/**
 * @fileoverview Skill focus banner for practice sessions.
 * Shows current lesson skill and goal description.
 */

'use client';

import { PracticeLesson, LessonPrompt } from '@/lib/constants/practice-lessons';
import { getGraderConfig } from '@/lib/constants/grader-configs';

interface SkillFocusBannerProps {
  lesson: PracticeLesson;
  currentPrompt?: LessonPrompt | null;
  variant?: 'default' | 'compact';
}

/**
 * @description Banner displaying the current skill focus and goal.
 */
export function SkillFocusBanner({
  lesson,
  currentPrompt,
  variant = 'default',
}: SkillFocusBannerProps) {
  const graderConfig = getGraderConfig(lesson.id);
  const primaryGoal = graderConfig.goalForThisExercise.primaryGoal;

  const categoryIcons = {
    sentence: '✏️',
    paragraph: '📝',
    essay: '📄',
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3">
        <span className="text-lg">{categoryIcons[lesson.category]}</span>
        <div>
          <span className="text-sm font-medium text-white">{lesson.name}</span>
          <span className="ml-2 text-xs text-[rgba(255,255,255,0.4)]">
            {lesson.category} skill
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-2xl">
          {categoryIcons[lesson.category]}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{lesson.name}</h2>
            <span className="rounded-full bg-[rgba(0,229,229,0.1)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#00e5e5]">
              {lesson.category}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
            {primaryGoal}
          </p>
        </div>
      </div>

      {/* Current Prompt Display */}
      {currentPrompt && (
        <div className="mt-5 rounded-[10px] border border-[rgba(0,229,229,0.15)] bg-[rgba(0,229,229,0.05)] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
            Your prompt
          </div>
          <p className="mt-2 text-sm font-medium text-white">
            {currentPrompt.prompt}
            {currentPrompt.nounPhrase && (
              <span className="ml-1 text-[#00e5e5]">&quot;{currentPrompt.nounPhrase}&quot;</span>
            )}
          </p>
          {currentPrompt.hint && (
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">
              💡 {currentPrompt.hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

