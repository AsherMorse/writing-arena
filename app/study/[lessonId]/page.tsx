'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getLesson } from '@/lib/constants/practice-lessons';
import { useLessonMastery } from '@/lib/hooks/usePracticeMastery';
import { ParchmentCard } from '@/app/_components/ParchmentCard';
import { ParchmentButton } from '@/app/_components/ParchmentButton';
import { getParchmentTextStyle } from '@/app/_components/parchment-styles';
import { LoadingOverlay } from '@/app/_components/LoadingOverlay';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = use(params);
  const router = useRouter();
  const lesson = getLesson(lessonId);
  const { isMastered, bestScore, attempts, canEarnLP, isLoading } = useLessonMastery(lessonId);

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <Image src="/images/backgrounds/study-2.webp" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
        <LoadingOverlay />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="relative min-h-screen">
        <Image src="/images/backgrounds/study-2.webp" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
          <ParchmentCard>
            <div className="text-center">
              <h1 className="font-memento text-xl uppercase tracking-wider" style={getParchmentTextStyle()}>
                Lesson Not Found
              </h1>
              <p className="mt-2 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
                This lesson doesn't exist or has been removed.
              </p>
              <div className="mt-4">
                <Link
                  href="/study"
                  className="font-memento text-sm uppercase tracking-wider"
                  style={{ color: '#c9a84c' }}
                >
                  ← Back to Study Hall
                </Link>
              </div>
            </div>
          </ParchmentCard>
        </div>
      </div>
    );
  }

  const totalMinutes = lesson.phaseDurations.reviewPhase + lesson.phaseDurations.writePhase + lesson.phaseDurations.revisePhase;

  const categoryIcons = {
    sentence: '✏️',
    paragraph: '📝',
    essay: '📄',
  };

  function handleStartSession() {
    router.push(`/study/${lessonId}/session`);
  }

  return (
    <div className="relative min-h-screen">
      <Image src="/images/backgrounds/study-2.webp" alt="" fill className="object-cover" priority />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 min-h-screen">
        <header className="p-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link
              href="/study"
              className="font-memento text-sm uppercase tracking-wider"
              style={{ color: 'rgba(245, 230, 184, 0.6)' }}
            >
              ← Back to lessons
            </Link>
            <Link
              href="/home"
              className="font-memento text-sm uppercase tracking-wider"
              style={{ color: 'rgba(245, 230, 184, 0.6)' }}
            >
              Home
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
          <ParchmentCard>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{categoryIcons[lesson.category]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1
                    className="font-memento text-2xl uppercase tracking-wider"
                    style={getParchmentTextStyle()}
                  >
                    {lesson.name}
                  </h1>
                  <span className="text-2xl" style={{ color: isMastered ? '#FFD700' : 'rgba(45, 45, 45, 0.3)' }}>
                    {isMastered ? '★' : '☆'}
                  </span>
                  {isMastered && (
                    <span className="font-avenir text-xs" style={{ color: '#b8860b' }}>
                      Mastered
                    </span>
                  )}
                </div>
                <p className="mt-2 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                  {lesson.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="rounded-full px-3 py-1 font-avenir capitalize"
                    style={{ background: 'rgba(0,0,0,0.1)', color: 'rgba(45, 45, 45, 0.7)' }}
                  >
                    {lesson.category} skill
                  </span>
                  <span
                    className="rounded-full px-3 py-1 font-avenir"
                    style={{ background: 'rgba(0,0,0,0.1)', color: 'rgba(45, 45, 45, 0.7)' }}
                  >
                    ⏱️ {totalMinutes} minutes
                  </span>
                  {canEarnLP && (
                    <span
                      className="rounded-full px-3 py-1 font-avenir"
                      style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#8b7355' }}
                    >
                      LP Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ParchmentCard>

          {attempts > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <ParchmentCard>
                <div className="text-center">
                  <div
                    className="font-memento text-xs uppercase tracking-wider"
                    style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                  >
                    Best Score
                  </div>
                  <div
                    className="mt-2 font-dutch809 text-4xl"
                    style={{
                      color: bestScore >= 90 ? '#2a5d3a' : bestScore >= 70 ? '#c9a84c' : '#8b4513',
                    }}
                  >
                    {bestScore}%
                  </div>
                </div>
              </ParchmentCard>
              <ParchmentCard>
                <div className="text-center">
                  <div
                    className="font-memento text-xs uppercase tracking-wider"
                    style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                  >
                    Attempts
                  </div>
                  <div className="mt-2 font-dutch809 text-4xl" style={getParchmentTextStyle()}>
                    {attempts}
                  </div>
                </div>
              </ParchmentCard>
              <ParchmentCard>
                <div className="text-center">
                  <div
                    className="font-memento text-xs uppercase tracking-wider"
                    style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                  >
                    Status
                  </div>
                  <div className="mt-2 text-3xl">
                    {isMastered ? (
                      <span style={{ color: '#FFD700' }}>★ Mastered</span>
                    ) : (
                      <span style={{ color: 'rgba(45, 45, 45, 0.4)' }}>☆ In Progress</span>
                    )}
                  </div>
                </div>
              </ParchmentCard>
            </div>
          )}

          <ParchmentCard>
            <h2 className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
              Session Phases
            </h2>
            <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
              Learn by example first, then practice
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div
                className="rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-2 font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                  <span>👀</span>
                  <span>Review</span>
                </div>
                <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
                  Learn the concept and analyze examples ({lesson.phaseDurations.reviewPhase} min)
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-2 font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                  <span>✍️</span>
                  <span>Write</span>
                </div>
                <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
                  Complete the prompt using the target skill ({lesson.phaseDurations.writePhase} min)
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-2 font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                  <span>✨</span>
                  <span>Revise</span>
                </div>
                <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
                  Improve your response ({lesson.phaseDurations.revisePhase} min)
                </p>
              </div>
            </div>
          </ParchmentCard>

          <div className="text-center">
            <ParchmentButton onClick={handleStartSession} variant="golden" className="px-16">
              Start Session
            </ParchmentButton>
            <p className="mt-3 font-avenir text-xs" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
              Score 90%+ to master this skill{canEarnLP ? ' and earn LP!' : '.'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
