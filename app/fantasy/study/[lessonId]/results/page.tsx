'use client';

import { Suspense, useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLessonMastery } from '@/lib/hooks/usePracticeMastery';
import { getLesson, MASTERY_THRESHOLD } from '@/lib/constants/practice-lessons';
import { GradingRemark } from '@/lib/constants/grader-configs';
import { ParchmentCard } from '../../../_components/ParchmentCard';
import { ParchmentButton } from '../../../_components/ParchmentButton';
import { LoadingOverlay } from '../../../_components/LoadingOverlay';
import { getParchmentTextStyle } from '../../../_components/parchment-styles';

interface StudyResultsData {
  lessonId: string;
  reviewScore: number;
  writeScore: number;
  reviseScore: number;
  compositeScore: number;
  lpEarned: number;
  wordCount: number;
  revisedWordCount: number;
  writeRemarks: GradingRemark[];
  reviseRemarks: GradingRemark[];
}

interface ResultsPageProps {
  params: Promise<{ lessonId: string }>;
}

function ResultsContentInner({ lessonId }: { lessonId: string }) {
  const [results, setResults] = useState<StudyResultsData>({
    lessonId: '',
    reviewScore: 0,
    writeScore: 0,
    reviseScore: 0,
    compositeScore: 0,
    lpEarned: 0,
    wordCount: 0,
    revisedWordCount: 0,
    writeRemarks: [],
    reviseRemarks: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const resultsData = sessionStorage.getItem('fantasyStudyResults');
      if (resultsData) {
        const parsed = JSON.parse(resultsData);
        setResults(prev => ({ ...prev, ...parsed }));
        sessionStorage.removeItem('fantasyStudyResults');
      }
    } catch {
    }
    setIsLoaded(true);
  }, []);

  const {
    reviewScore,
    writeScore,
    reviseScore,
    compositeScore,
    lpEarned,
    wordCount,
    revisedWordCount,
    writeRemarks,
    reviseRemarks,
  } = results;

  const hasRemarks = writeRemarks.length > 0 || reviseRemarks.length > 0;
  const lesson = getLesson(lessonId);
  const { isMastered, bestScore, attempts } = useLessonMastery(lessonId);

  if (!isLoaded) {
    return (
      <div className="relative min-h-screen">
        <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
        <LoadingOverlay />
      </div>
    );
  }

  const achievedMastery = compositeScore >= MASTERY_THRESHOLD;
  const isFirstTimeMastery = achievedMastery && attempts <= 1;
  const isNewBestScore = compositeScore > bestScore;

  function getScoreColor(score: number): string {
    if (score >= 90) return '#2a5d3a';
    if (score >= 70) return '#c9a84c';
    return '#8b4513';
  }

  return (
    <div className="relative min-h-screen">
      <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 min-h-screen">
        <header className="p-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link
              href="/fantasy/study"
              className="font-memento text-sm uppercase tracking-wider"
              style={{ color: 'rgba(245, 230, 184, 0.6)' }}
            >
              ← Back to Study Hall
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

        <main className="mx-auto max-w-4xl space-y-6 px-4 pb-12">
          {isFirstTimeMastery && lesson && (
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: 'rgba(255, 215, 0, 0.2)',
                border: '2px solid rgba(255, 215, 0, 0.5)',
              }}
            >
              <div className="text-5xl">🎉</div>
              <h3
                className="mt-4 font-dutch809 text-2xl"
                style={{ color: '#FFD700', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
              >
                First Time Mastered!
              </h3>
              <p className="mt-2 font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
                You've mastered <span style={{ color: '#f6d493' }}>{lesson.name}</span>
              </p>
              <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
                This lesson will no longer award LP, but you can still practice anytime.
              </p>
            </div>
          )}

          <ParchmentCard>
            <div className="grid gap-6 text-center sm:grid-cols-4">
              <div>
                <div
                  className="font-memento text-xs uppercase tracking-wider"
                  style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  Composite Score
                </div>
                <div
                  className="mt-2 font-dutch809 text-5xl"
                  style={{ color: getScoreColor(compositeScore) }}
                >
                  {compositeScore}
                </div>
                <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  out of 100
                </p>
              </div>

              <div>
                <div
                  className="font-memento text-xs uppercase tracking-wider"
                  style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  Mastery
                </div>
                <div className="mt-2 text-4xl">
                  <span style={{ color: isMastered ? '#FFD700' : 'rgba(45, 45, 45, 0.3)' }}>
                    {isMastered ? '★' : '☆'}
                  </span>
                </div>
                <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  {isMastered ? 'Mastered!' : `Need ${MASTERY_THRESHOLD}%`}
                </p>
              </div>

              <div>
                <div
                  className="font-memento text-xs uppercase tracking-wider"
                  style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  LP Earned
                </div>
                <div
                  className="mt-2 font-dutch809 text-4xl"
                  style={{ color: '#0a5d5d' }}
                >
                  {lpEarned > 0 ? `+${lpEarned}` : '—'}
                </div>
                <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  {lpEarned === 0 ? 'Already mastered' : 'League Points'}
                </p>
              </div>

              <div>
                <div
                  className="font-memento text-xs uppercase tracking-wider"
                  style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  Best Score
                </div>
                <div className="mt-2 font-dutch809 text-4xl" style={getParchmentTextStyle()}>
                  {bestScore}
                </div>
                <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  {isNewBestScore && compositeScore > 0 ? '🎉 New best!' : 'Personal best'}
                </p>
              </div>
            </div>
          </ParchmentCard>

          <ParchmentCard>
            <h2 className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
              Phase Breakdown
            </h2>
            <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
              Composite = 20% Review + 40% Write + 40% Revise
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div
                className="rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>👀</span>
                    <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                      Review
                    </span>
                  </div>
                  <span className="font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>20%</span>
                </div>
                <div
                  className="mt-2 font-dutch809 text-3xl"
                  style={{ color: getScoreColor(reviewScore) }}
                >
                  {reviewScore}
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${reviewScore}%`, background: '#c9a84c' }}
                  />
                </div>
                <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  Example analysis
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✍️</span>
                    <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                      Write
                    </span>
                  </div>
                  <span className="font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>40%</span>
                </div>
                <div
                  className="mt-2 font-dutch809 text-3xl"
                  style={{ color: getScoreColor(writeScore) }}
                >
                  {writeScore}
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${writeScore}%`, background: '#c9a84c' }}
                  />
                </div>
                <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  {wordCount} words
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                      Revise
                    </span>
                  </div>
                  <span className="font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>40%</span>
                </div>
                <div
                  className="mt-2 font-dutch809 text-3xl"
                  style={{ color: getScoreColor(reviseScore) }}
                >
                  {reviseScore}
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${reviseScore}%`, background: '#c9a84c' }}
                  />
                </div>
                <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                  {revisedWordCount} words
                </p>
              </div>
            </div>
          </ParchmentCard>

          {hasRemarks && (
            <ParchmentCard>
              <h2 className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                Feedback
              </h2>
              <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                Tips to improve your writing
              </p>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {writeRemarks.length > 0 && (
                  <div
                    className="rounded-lg p-4"
                    style={{ background: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span>✍️</span>
                      <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                        Write Phase
                      </span>
                    </div>
                    <ul className="mt-3 space-y-3">
                      {writeRemarks.map((remark, idx) => (
                        <li key={idx} className="font-avenir text-sm">
                          <div className="flex items-start gap-2">
                            <span style={{ color: remark.severity === 'error' ? '#8b0000' : '#c9a84c' }}>
                              {remark.severity === 'error' ? '⚠️' : '💡'}
                            </span>
                            <div>
                              <p style={{ color: 'rgba(45, 45, 45, 0.8)' }}>{remark.concreteProblem}</p>
                              <p className="mt-1 text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                                {remark.callToAction}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reviseRemarks.length > 0 && (
                  <div
                    className="rounded-lg p-4"
                    style={{ background: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                        Revise Phase
                      </span>
                    </div>
                    <ul className="mt-3 space-y-3">
                      {reviseRemarks.map((remark, idx) => (
                        <li key={idx} className="font-avenir text-sm">
                          <div className="flex items-start gap-2">
                            <span style={{ color: remark.severity === 'error' ? '#8b0000' : '#c9a84c' }}>
                              {remark.severity === 'error' ? '⚠️' : '💡'}
                            </span>
                            <div>
                              <p style={{ color: 'rgba(45, 45, 45, 0.8)' }}>{remark.concreteProblem}</p>
                              <p className="mt-1 text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                                {remark.callToAction}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ParchmentCard>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ParchmentCard>
              <h3 className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                Lesson
              </h3>
              <p className="mt-1 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                {lesson?.name || 'Unknown'}
              </p>
              <p className="mt-3 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                {lesson?.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 font-avenir text-xs capitalize"
                  style={{ background: 'rgba(0,0,0,0.1)', color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  {lesson?.category}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 font-avenir text-xs"
                  style={{ background: 'rgba(0,0,0,0.1)', color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  Attempt #{attempts}
                </span>
              </div>
            </ParchmentCard>

            <ParchmentCard>
              <h3 className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                Next Steps
              </h3>
              <ul className="mt-3 space-y-2 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                {!isMastered && (
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#c9a84c' }}>→</span>
                    <span>Practice again to reach 90% and master this skill</span>
                  </li>
                )}
                {isMastered && (
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#c9a84c' }}>✓</span>
                    <span>You've mastered this skill! Try another lesson</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span style={{ color: '#c9a84c' }}>💡</span>
                  <span>Review the examples to reinforce your understanding</span>
                </li>
              </ul>
            </ParchmentCard>
          </div>

          {!achievedMastery && (
            <div
              className="rounded-xl p-6"
              style={{
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3
                    className="font-memento text-sm uppercase tracking-wider"
                    style={{ color: '#fbbf24' }}
                  >
                    Keep Going!
                  </h3>
                  <p className="mt-2 font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
                    You need {MASTERY_THRESHOLD - compositeScore} more points to master this skill.
                    Focus on the phase with the lowest score and try again!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/fantasy/study/${lessonId}`}>
              <ParchmentButton variant="default">
                Practice Again
              </ParchmentButton>
            </Link>
            <Link href="/fantasy/study">
              <ParchmentButton variant="default">
                All Lessons
              </ParchmentButton>
            </Link>
            <Link href="/fantasy/ranked">
              <ParchmentButton variant="golden">
                Daily Challenges
              </ParchmentButton>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { lessonId } = use(params);
  
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen">
          <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
          />
          <LoadingOverlay />
        </div>
      }
    >
      <ResultsContentInner lessonId={lessonId} />
    </Suspense>
  );
}
