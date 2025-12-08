/**
 * @fileoverview Lesson entry page for practice mode.
 * Shows lesson info, mastery status, and start button.
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLesson } from '@/lib/constants/practice-lessons';
import { useLessonMastery } from '@/lib/hooks/usePracticeMastery';
import { getGraderConfig } from '@/lib/constants/grader-configs';
import { MasteryDisplay } from '@/components/practice/MasteryDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = use(params);
  const router = useRouter();
  const lesson = getLesson(lessonId);
  const { isMastered, bestScore, attempts, canEarnLP, isLoading } = useLessonMastery(lessonId);

  if (isLoading) return <LoadingState message="Loading lesson..." />;
  if (!lesson) return <ErrorState error="Lesson not found" />;

  const graderConfig = getGraderConfig(lessonId);
  const totalMinutes = lesson.phaseDurations.reviewPhase + lesson.phaseDurations.writePhase + lesson.phaseDurations.revisePhase;

  const categoryIcons = {
    sentence: '✏️',
    paragraph: '📝',
    essay: '📄',
  };

  function handleStartSession() {
    router.push(`/improve/activities/${lessonId}/session`);
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/improve/activities" className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)] hover:text-white">
            ← Back to lessons
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14">
        {/* Lesson Header */}
        <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
          <div className="flex items-start gap-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-3xl">
              {categoryIcons[lesson.category]}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{lesson.name}</h1>
                <MasteryDisplay isMastered={isMastered} showLabel size="sm" />
              </div>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">
                {lesson.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]">
                  {lesson.category} skill
                </span>
                <span className="rounded-full border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]">
                  ⏱️ {totalMinutes} minutes
                </span>
                {canEarnLP && (
                  <span className="rounded-full border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-3 py-1 text-[#00e5e5]">
                    LP Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Progress */}
        {attempts > 0 && (
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                Best Score
              </div>
              <div className="mt-2 font-mono text-3xl font-medium" style={{ color: bestScore >= 90 ? '#00d492' : bestScore >= 70 ? '#00e5e5' : '#ff9030' }}>
                {bestScore}%
              </div>
            </div>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                Attempts
              </div>
              <div className="mt-2 font-mono text-3xl font-medium">
                {attempts}
              </div>
            </div>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                Status
              </div>
              <div className="mt-2">
                <MasteryDisplay isMastered={isMastered} size="lg" />
              </div>
            </div>
          </section>
        )}

        {/* Goal & Instructions */}
        {/* <section className="mt-6 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="font-semibold">Learning Goal</h2>
          <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">
            {graderConfig.goalForThisExercise.primaryGoal}
          </p>

          <h3 className="mt-6 text-sm font-medium text-[rgba(255,255,255,0.5)]">How it works</h3>
          <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
            {graderConfig.howTheActivityWorks}
          </p>
        </section> */}

        {/* Session Phases - Order: Review → Write → Revise */}
        <section className="mt-6 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="font-semibold">Session Phases</h2>
          <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
            Learn by example first, then practice
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[10px] border border-[rgba(255,144,48,0.15)] bg-[rgba(255,144,48,0.05)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#ff9030]">
                <span>👀</span>
                <span>Phase 1: Review</span>
              </div>
              <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">
                Learn the concept and analyze examples ({lesson.phaseDurations.reviewPhase} min)
              </p>
            </div>
            <div className="rounded-[10px] border border-[rgba(0,229,229,0.15)] bg-[rgba(0,229,229,0.05)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#00e5e5]">
                <span>✍️</span>
                <span>Phase 2: Write</span>
              </div>
              <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">
                Complete the prompt using the target skill ({lesson.phaseDurations.writePhase} min)
              </p>
            </div>
            <div className="rounded-[10px] border border-[rgba(0,212,146,0.15)] bg-[rgba(0,212,146,0.05)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#00d492]">
                <span>✨</span>
                <span>Phase 3: Revise</span>
              </div>
              <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">
                Improve your response ({lesson.phaseDurations.revisePhase} min)
              </p>
            </div>
          </div>
        </section>

        {/* Start Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartSession}
            className="w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-4 text-base font-medium text-[#101012] transition hover:bg-[#33ebeb] sm:w-auto sm:px-16"
          >
            Start Session
          </button>
          <p className="mt-3 text-xs text-[rgba(255,255,255,0.4)]">
            Score 90%+ to master this skill{canEarnLP ? ' and earn LP!' : '.'}
          </p>
        </div>
      </main>
    </div>
  );
}

