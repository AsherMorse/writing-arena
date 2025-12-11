'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { usePracticeMastery, getCategoryMasterySummary } from '@/lib/hooks/usePracticeMastery';
import { getAvailableLessons, getLessonsByCategory, PracticeLesson } from '@/lib/constants/practice-lessons';
import { getStudyRecommendations, type StudyRecommendations } from '@/lib/services/skill-gap-tracker';
import { ParchmentCard } from '../_components/ParchmentCard';
import { getParchmentTextStyle } from '../_components/parchment-styles';
import { LoadingOverlay } from '../_components/LoadingOverlay';

function FantasyLessonCard({
  lesson,
  isMastered,
  bestScore,
  attempts,
  canEarnLP,
  recommendationType,
}: {
  lesson: PracticeLesson;
  isMastered: boolean;
  bestScore: number;
  attempts: number;
  canEarnLP: boolean;
  recommendationType?: 'required' | 'suggested';
}) {
  const isComingSoon = lesson.status === 'coming-soon';
  const totalMinutes = lesson.phaseDurations.reviewPhase + lesson.phaseDurations.writePhase + lesson.phaseDurations.revisePhase;

  const categoryIcons = {
    sentence: '✏️',
    paragraph: '📝',
    essay: '📄',
  };

  const badgeStyles = {
    required: { background: '#ef4444', color: '#fff', label: 'Required' },
    suggested: { background: '#fbbf24', color: '#1a1208', label: 'Suggested' },
  };

  return (
    <div className="relative">
      {recommendationType && (
        <span
          className="absolute -right-2 -top-2 z-20 rounded-full px-2 py-0.5 text-xs font-bold shadow-md"
          style={{ 
            background: badgeStyles[recommendationType].background, 
            color: badgeStyles[recommendationType].color 
          }}
        >
          {badgeStyles[recommendationType].label}
        </span>
      )}
      <ParchmentCard variant={isComingSoon ? 'light' : recommendationType ? 'golden' : 'default'}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{categoryIcons[lesson.category]}</span>
            <div>
              <h3
                className="font-memento text-lg uppercase tracking-wide"
                style={getParchmentTextStyle()}
              >
                {lesson.name}
              </h3>
              <p
                className="font-avenir text-xs capitalize"
                style={{ color: 'rgba(45, 45, 45, 0.6)' }}
              >
                {lesson.category} skill
              </p>
            </div>
          </div>
          {!isComingSoon && (
            <span className="text-xl" style={{ color: isMastered ? '#FFD700' : 'rgba(45, 45, 45, 0.3)' }}>
              {isMastered ? '★' : '☆'}
            </span>
          )}
        </div>

        <p
          className="mt-3 font-avenir text-sm leading-relaxed"
          style={{ color: 'rgba(45, 45, 45, 0.7)' }}
        >
          {lesson.description}
        </p>

        {!isComingSoon && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className="rounded-full px-2 py-0.5 font-avenir"
              style={{ background: 'rgba(0,0,0,0.1)', color: 'rgba(45, 45, 45, 0.7)' }}
            >
              ⏱️ {totalMinutes} min
            </span>
            {attempts > 0 && (
              <span
                className="rounded-full px-2 py-0.5 font-avenir"
                style={{ background: 'rgba(0,0,0,0.1)', color: 'rgba(45, 45, 45, 0.7)' }}
              >
                Best: {bestScore}%
              </span>
            )}
            {canEarnLP && (
              <span
                className="rounded-full px-2 py-0.5 font-avenir"
                style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#8b7355' }}
              >
                LP Available
              </span>
            )}
          </div>
        )}

        <div className="mt-4">
          {isComingSoon ? (
            <div
              className="rounded-lg py-2 text-center font-memento text-sm uppercase tracking-wider"
              style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(45, 45, 45, 0.4)' }}
            >
              Coming Soon
            </div>
          ) : (
            <Link
              href={`/fantasy/study/${lesson.id}`}
              className="block w-full rounded-lg py-2 text-center font-memento text-sm uppercase tracking-wider transition hover:brightness-105"
              style={{
                background: 'linear-gradient(180deg, #c9a84c 0%, #a68b3d 100%)',
                border: '2px solid #2a1f14',
                color: '#2d2d2d',
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)',
              }}
            >
              {attempts > 0 ? 'Practice Again' : 'Start Lesson'}
            </Link>
          )}
        </div>
      </ParchmentCard>
    </div>
  );
}

export default function StudyPage() {
  const { user } = useAuth();
  const {
    masteryStatus,
    isLoading,
    checkLessonMastery,
    checkCanEarnLP,
    getBestScore,
    getAttemptCount,
  } = usePracticeMastery();

  const [studyRecs, setStudyRecs] = useState<StudyRecommendations | null>(null);
  const [showAllLessons, setShowAllLessons] = useState(false);

  useEffect(() => {
    async function fetchStudyRecommendations() {
      if (!user?.uid) return;
      const recs = await getStudyRecommendations(user.uid);
      setStudyRecs(recs);
    }

    fetchStudyRecommendations();
  }, [user?.uid]);

  const availableLessons = getAvailableLessons();
  
  // Only truly blocking lessons are "required"
  const requiredLessonsList = availableLessons.filter((lesson) =>
    studyRecs?.requiredLessons.includes(lesson.id)
  );
  const hasRequiredLessons = requiredLessonsList.length > 0 && studyRecs?.isBlocked;
  
  // Suggested lessons (meet practiceRecommend threshold but not blocking)
  const suggestedLessonsList = availableLessons.filter((lesson) =>
    studyRecs?.suggestedLessons.includes(lesson.id)
  );
  const hasSuggestedLessons = suggestedLessonsList.length > 0;
  const sentenceLessons = getLessonsByCategory('sentence');
  const paragraphLessons = getLessonsByCategory('paragraph');
  const essayLessons = getLessonsByCategory('essay');

  const sentenceMastery = getCategoryMasterySummary(masteryStatus, 'sentence');

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

  return (
    <div className="relative min-h-screen">
      <Image src="/images/backgrounds/study-2.webp" alt="" fill className="object-cover" priority />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 min-h-screen">
        <header className="p-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link
              href="/fantasy/home"
              className="font-memento text-sm uppercase tracking-wider"
              style={{ color: 'rgba(245, 230, 184, 0.6)' }}
            >
              ← Back
            </Link>
            <Link
              href="/fantasy/home"
              className="font-memento text-sm uppercase tracking-wider"
              style={{ color: 'rgba(245, 230, 184, 0.6)' }}
            >
              Home
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-8 px-4 pb-12">
          <section className="text-center">
            <h1
              className="font-dutch809 text-4xl"
              style={{ color: '#f6d493', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
            >
              Study Hall
            </h1>
            <p className="mt-2 font-avenir text-lg" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
              Master writing skills through focused lessons. Score 90%+ to earn mastery!
            </p>

            <div className="mt-4 inline-block">
              <ParchmentCard>
                <div className="flex items-center gap-4 px-2">
                  <div>
                    <div
                      className="font-memento text-xs uppercase tracking-wider"
                      style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                    >
                      Sentence Skills
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg" style={{ color: '#FFD700' }}>
                        {'★'.repeat(sentenceMastery.mastered)}
                        {'☆'.repeat(sentenceMastery.total - sentenceMastery.mastered)}
                      </span>
                      <span className="font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
                        {sentenceMastery.mastered}/{sentenceMastery.total} mastered
                      </span>
                    </div>
                  </div>
                </div>
              </ParchmentCard>
            </div>
          </section>

          {/* Required Lessons - Only shown when user is BLOCKED from ranked */}
          {hasRequiredLessons && (
            <section>
              <div
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">🚫</span>
                  <div>
                    <h2
                      className="font-memento text-xl uppercase tracking-wider"
                      style={{ color: '#ef4444' }}
                    >
                      Required Lessons
                    </h2>
                    <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
                      Complete these to unlock ranked challenges
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {requiredLessonsList.map((lesson) => (
                    <FantasyLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isMastered={checkLessonMastery(lesson.id)}
                      bestScore={getBestScore(lesson.id)}
                      attempts={getAttemptCount(lesson.id)}
                      canEarnLP={checkCanEarnLP(lesson.id)}
                      recommendationType="required"
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Suggested Lessons - Shown when practiceRecommend threshold met but not blocking */}
          {hasSuggestedLessons && (
            <section>
              <div
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h2
                      className="font-memento text-xl uppercase tracking-wider"
                      style={{ color: '#fbbf24' }}
                    >
                      Recommended Lessons
                    </h2>
                    <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
                      Address skill gaps before they affect your ranked progress
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestedLessonsList.map((lesson) => (
                    <FantasyLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isMastered={checkLessonMastery(lesson.id)}
                      bestScore={getBestScore(lesson.id)}
                      attempts={getAttemptCount(lesson.id)}
                      canEarnLP={checkCanEarnLP(lesson.id)}
                      recommendationType="suggested"
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Browse All toggle - shown when there are recommendations */}
          {(hasRequiredLessons || hasSuggestedLessons) && (
            <div className="text-center">
              <button
                onClick={() => setShowAllLessons(!showAllLessons)}
                className="font-avenir text-sm transition hover:underline"
                style={{ color: 'rgba(245, 230, 184, 0.6)' }}
              >
                {showAllLessons ? '↑ Hide All Lessons' : '↓ Browse All Lessons'}
              </button>
            </div>
          )}

          {((!hasRequiredLessons && !hasSuggestedLessons) || showAllLessons) && (
            <>
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2
                      className="font-memento text-xl uppercase tracking-wider"
                      style={{ color: 'rgba(245, 230, 184, 0.9)' }}
                    >
                      ✏️ Sentence Skills
                    </h2>
                    <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
                      Build strong foundations with sentence-level techniques
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 font-avenir text-xs"
                    style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#c9a84c' }}
                  >
                    {sentenceMastery.mastered}/{sentenceMastery.total} mastered
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sentenceLessons.map((lesson) => (
                    <FantasyLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isMastered={checkLessonMastery(lesson.id)}
                      bestScore={getBestScore(lesson.id)}
                      attempts={getAttemptCount(lesson.id)}
                      canEarnLP={checkCanEarnLP(lesson.id)}
                      recommendationType={
                        studyRecs?.requiredLessons.includes(lesson.id) ? 'required' :
                        studyRecs?.suggestedLessons.includes(lesson.id) ? 'suggested' :
                        undefined
                      }
                    />
                  ))}
                </div>
              </section>

              {paragraphLessons.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2
                        className="font-memento text-xl uppercase tracking-wider"
                        style={{ color: 'rgba(245, 230, 184, 0.9)' }}
                      >
                        📝 Paragraph Skills
                      </h2>
                      <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
                        Structure and organize your ideas effectively
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 font-avenir text-xs"
                      style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#c9a84c' }}
                    >
                      {getCategoryMasterySummary(masteryStatus, 'paragraph').mastered}/
                      {getCategoryMasterySummary(masteryStatus, 'paragraph').total} mastered
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {paragraphLessons.map((lesson) => (
                      <FantasyLessonCard
                        key={lesson.id}
                        lesson={lesson}
                        isMastered={checkLessonMastery(lesson.id)}
                        bestScore={getBestScore(lesson.id)}
                        attempts={getAttemptCount(lesson.id)}
                        canEarnLP={checkCanEarnLP(lesson.id)}
                        recommendationType={
                          studyRecs?.requiredLessons.includes(lesson.id) ? 'required' :
                          studyRecs?.suggestedLessons.includes(lesson.id) ? 'suggested' :
                          undefined
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {essayLessons.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2
                        className="font-memento text-xl uppercase tracking-wider"
                        style={{ color: 'rgba(245, 230, 184, 0.9)' }}
                      >
                        📄 Essay Skills
                      </h2>
                      <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
                        Master full essay composition
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 font-avenir text-xs"
                      style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#c9a84c' }}
                    >
                      {getCategoryMasterySummary(masteryStatus, 'essay').mastered}/
                      {getCategoryMasterySummary(masteryStatus, 'essay').total} mastered
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {essayLessons.map((lesson) => (
                      <FantasyLessonCard
                        key={lesson.id}
                        lesson={lesson}
                        isMastered={checkLessonMastery(lesson.id)}
                        bestScore={getBestScore(lesson.id)}
                        attempts={getAttemptCount(lesson.id)}
                        canEarnLP={checkCanEarnLP(lesson.id)}
                        recommendationType={
                          studyRecs?.requiredLessons.includes(lesson.id) ? 'required' :
                          studyRecs?.suggestedLessons.includes(lesson.id) ? 'suggested' :
                          undefined
                        }
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <section>
            <ParchmentCard>
              <div className="flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                    How Study Hall Works
                  </h3>
                  <ul className="mt-3 space-y-2 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#c9a84c' }}>1.</span>
                      <span><strong>Review</strong> — Learn the concept and analyze examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#c9a84c' }}>2.</span>
                      <span><strong>Write</strong> — Complete the prompt using the target skill</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#c9a84c' }}>3.</span>
                      <span><strong>Revise</strong> — Improve your response based on feedback</span>
                    </li>
                  </ul>
                  <p className="mt-3 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                    Score 90%+ to master a skill. Mastered skills don't award LP but can still be practiced.
                  </p>
                </div>
              </div>
            </ParchmentCard>
          </section>
        </main>
      </div>
    </div>
  );
}
