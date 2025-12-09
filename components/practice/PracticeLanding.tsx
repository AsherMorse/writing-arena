/**
 * @fileoverview Practice mode landing page with lesson cards.
 * Shows available lessons, mastery status, and category progress.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePracticeMastery, getCategoryMasterySummary } from '@/lib/hooks/usePracticeMastery';
import { getAvailableLessons, getLessonsByCategory, PRACTICE_LESSONS } from '@/lib/constants/practice-lessons';
import { getUserSkillGaps } from '@/lib/services/skill-gap-tracker';
import { LessonCard } from './LessonCard';
import { LoadingState } from '@/components/shared/LoadingState';

/**
 * @description Practice mode landing page with lesson selection.
 */
export default function PracticeLanding() {
  const { user } = useAuth();
  const {
    masteryStatus,
    isLoading,
    checkLessonMastery,
    checkCanEarnLP,
    getBestScore,
    getAttemptCount,
  } = usePracticeMastery();

  const [recommendedLessons, setRecommendedLessons] = useState<Set<string>>(new Set());
  const [showAllLessons, setShowAllLessons] = useState(false);

  // Fetch recommended lessons from user's skill gaps
  useEffect(() => {
    async function fetchRecommendedLessons() {
      if (!user?.uid) return;

      const skillGaps = await getUserSkillGaps(user.uid);

      // Extract all recommended lessons from active gaps
      const lessons = new Set<string>();
      for (const gapData of Object.values(skillGaps)) {
        if (gapData.status !== 'resolved') {
          gapData.recommendedLessons.forEach((l) => lessons.add(l));
        }
      }
      setRecommendedLessons(lessons);
    }

    fetchRecommendedLessons();
  }, [user?.uid]);

  const availableLessons = getAvailableLessons();

  // Get required lessons (lessons that exist in PRACTICE_LESSONS and are recommended)
  const requiredLessonsList = availableLessons.filter((lesson) =>
    recommendedLessons.has(lesson.id)
  );
  const hasRequiredLessons = requiredLessonsList.length > 0;
  const sentenceLessons = getLessonsByCategory('sentence');
  const paragraphLessons = getLessonsByCategory('paragraph');
  const essayLessons = getLessonsByCategory('essay');

  const sentenceMastery = getCategoryMasterySummary(masteryStatus, 'sentence');

  if (isLoading) {
    return <LoadingState message="Loading practice lessons..." />;
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-xl font-semibold tracking-wide">Practice Studio</span>
          <div className="flex items-center gap-3">
            <Link
              href="/improve"
              className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
            >
              ← Back to improve
            </Link>
            <Link
              href="/dashboard"
              className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-14">
        {/* Hero Section */}
        <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
          <div className="flex flex-col gap-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-3xl">
              📚
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Master Writing Skills</h1>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">
                Practice specific writing techniques through short, focused lessons.
                Score 90%+ to master a skill and earn LP!
              </p>
            </div>

            {/* Category Progress */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                  Sentence Skills
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg text-[#FFD700]">
                    {'★'.repeat(sentenceMastery.mastered)}
                    {'☆'.repeat(sentenceMastery.total - sentenceMastery.mastered)}
                  </span>
                  <span className="text-xs text-[rgba(255,255,255,0.5)]">
                    {sentenceMastery.mastered}/{sentenceMastery.total} mastered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Required Lessons Section */}
        {hasRequiredLessons && (
          <section className="rounded-[14px] border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)] p-6">
            <header className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h2 className="text-xl font-semibold text-amber-400">Required Lessons</h2>
                  <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
                    Complete these lessons to address skill gaps and unlock ranked challenges
                  </p>
                </div>
              </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requiredLessonsList.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isMastered={checkLessonMastery(lesson.id)}
                  bestScore={getBestScore(lesson.id)}
                  attempts={getAttemptCount(lesson.id)}
                  canEarnLP={checkCanEarnLP(lesson.id)}
                  isRecommended={true}
                />
              ))}
            </div>

            {/* Browse All Lessons Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAllLessons(!showAllLessons)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-5 py-2.5 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.08)]"
              >
                {showAllLessons ? 'Hide All Lessons' : 'Browse All Lessons'}
                <span className="text-xs">{showAllLessons ? '↑' : '↓'}</span>
              </button>
            </div>
          </section>
        )}

        {/* Category Sections - show if no required lessons OR if user clicked "Browse All" */}
        {(!hasRequiredLessons || showAllLessons) && (
          <>
            {/* Sentence Skills Section */}
            <section>
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">✏️ Sentence Skills</h2>
                  <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
                    Build strong foundations with sentence-level techniques
                  </p>
                </div>
                <div className="rounded-full bg-[rgba(0,229,229,0.1)] px-3 py-1 text-xs font-medium text-[#00e5e5]">
                  {sentenceMastery.mastered}/{sentenceMastery.total} mastered
                </div>
              </header>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sentenceLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isMastered={checkLessonMastery(lesson.id)}
                    bestScore={getBestScore(lesson.id)}
                    attempts={getAttemptCount(lesson.id)}
                    canEarnLP={checkCanEarnLP(lesson.id)}
                    isRecommended={recommendedLessons.has(lesson.id)}
                  />
                ))}
              </div>
            </section>

            {/* Paragraph Skills Section */}
            {paragraphLessons.length > 0 && (
              <section>
                <header className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">📝 Paragraph Skills</h2>
                    <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
                      Structure and organize your ideas effectively
                    </p>
                  </div>
                  <div className="rounded-full bg-[rgba(0,229,229,0.1)] px-3 py-1 text-xs font-medium text-[#00e5e5]">
                    {getCategoryMasterySummary(masteryStatus, 'paragraph').mastered}/{getCategoryMasterySummary(masteryStatus, 'paragraph').total} mastered
                  </div>
                </header>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paragraphLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isMastered={checkLessonMastery(lesson.id)}
                      bestScore={getBestScore(lesson.id)}
                      attempts={getAttemptCount(lesson.id)}
                      canEarnLP={checkCanEarnLP(lesson.id)}
                      isRecommended={recommendedLessons.has(lesson.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Essay Skills Section */}
            {essayLessons.length > 0 && (
              <section>
                <header className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">📄 Essay Skills</h2>
                    <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
                      Master full essay composition
                    </p>
                  </div>
                  <div className="rounded-full bg-[rgba(0,229,229,0.1)] px-3 py-1 text-xs font-medium text-[#00e5e5]">
                    {getCategoryMasterySummary(masteryStatus, 'essay').mastered}/{getCategoryMasterySummary(masteryStatus, 'essay').total} mastered
                  </div>
                </header>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {essayLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isMastered={checkLessonMastery(lesson.id)}
                      bestScore={getBestScore(lesson.id)}
                      attempts={getAttemptCount(lesson.id)}
                      canEarnLP={checkCanEarnLP(lesson.id)}
                      isRecommended={recommendedLessons.has(lesson.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Info Banner */}
        <section className="rounded-[14px] border border-[rgba(0,229,229,0.15)] bg-[rgba(0,229,229,0.05)] p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium text-[#00e5e5]">How Practice Mode Works</h3>
              <ul className="mt-3 space-y-2 text-sm text-[rgba(255,255,255,0.6)]">
                <li className="flex items-start gap-2">
                  <span className="text-[#00e5e5]">1.</span>
                  <span>
                    <strong>Review</strong> — Learn the concept and analyze AI-generated examples (1 min)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00e5e5]">2.</span>
                  <span>
                    <strong>Write</strong> — Complete the prompt using the target skill (3 min)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00e5e5]">3.</span>
                  <span>
                    <strong>Revise</strong> — Improve your response based on feedback (2 min)
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-[rgba(255,255,255,0.4)]">
                Score 90%+ to master a skill. Mastered skills don&apos;t award LP but can still be practiced.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
