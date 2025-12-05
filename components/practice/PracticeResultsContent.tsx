/**
 * @fileoverview Results content for practice sessions.
 * Displays phase scores, composite score, mastery status, and LP earned.
 *
 * Phase order: Review → Write → Revise
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLessonMastery } from '@/lib/hooks/usePracticeMastery';
import { getLesson, MASTERY_THRESHOLD } from '@/lib/constants/practice-lessons';
import { GradingRemark } from '@/lib/constants/grader-configs';
import { MasteryDisplay, MasteryCelebration } from './MasteryDisplay';
import { LoadingState } from '@/components/shared/LoadingState';
import { ResultsLayout } from '@/components/shared/ResultsLayout';

/**
 * @description Results data structure from session storage.
 */
interface PracticeResultsData {
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

function PracticeResultsContentInner() {
  // State to hold results (loaded from session storage on client)
  const [results, setResults] = useState<PracticeResultsData>({
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

  // Read from session storage on client mount (sessionStorage doesn't exist during SSR)
  useEffect(() => {
    try {
      const resultsData = sessionStorage.getItem('practiceResults');
      if (resultsData) {
        const parsed = JSON.parse(resultsData);
        setResults(prev => ({ ...prev, ...parsed }));
        // Clear after reading to avoid stale data
        sessionStorage.removeItem('practiceResults');
      }
    } catch {
      // Invalid JSON or no data, use defaults
    }
    setIsLoaded(true);
  }, []);

  const {
    lessonId,
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

  // Hooks must be called unconditionally (before any early returns)
  const lesson = getLesson(lessonId);
  const { isMastered, bestScore, attempts } = useLessonMastery(lessonId);

  // Show loading until session storage is read
  if (!isLoaded) {
    return <LoadingState message="Loading results..." />;
  }

  const achievedMastery = compositeScore >= MASTERY_THRESHOLD;
  const isFirstTimeMastery = achievedMastery && attempts <= 1;
  const isNewBestScore = compositeScore > bestScore;

  /**
   * @description Get color based on score.
   */
  function getScoreColor(score: number): string {
    if (score >= 90) return '#00d492';
    if (score >= 80) return '#00e5e5';
    if (score >= 70) return '#ff9030';
    return '#ff5f8f';
  }

  const actions = (
    <>
      <Link
        href={`/improve/activities/${lessonId}`}
        className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-center text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
      >
        Practice Again
      </Link>
      <Link
        href="/improve/activities"
        className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-8 py-3 text-center text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
      >
        All Lessons
      </Link>
      <Link
        href="/dashboard"
        className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-8 py-3 text-center text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
      >
        Dashboard
      </Link>
    </>
  );

  return (
    <ResultsLayout actions={actions}>
      {/* First-time Mastery Celebration */}
      {isFirstTimeMastery && lesson && (
        <MasteryCelebration lessonName={lesson.name} />
      )}

      {/* Main Score Section */}
      <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
        <div className="grid gap-6 text-center sm:grid-cols-4">
          {/* Composite Score */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
              Composite Score
            </div>
            <div
              className="mt-3 font-mono text-5xl font-semibold"
              style={{ color: getScoreColor(compositeScore) }}
            >
              {compositeScore}
            </div>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">out of 100</p>
          </div>

          {/* Mastery Status */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
              Mastery
            </div>
            <div className="mt-3 flex justify-center">
              <MasteryDisplay isMastered={isMastered} size="lg" animate={isFirstTimeMastery} />
            </div>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
              {isMastered ? 'Mastered!' : `Need ${MASTERY_THRESHOLD}%`}
            </p>
          </div>

          {/* LP Earned */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
              LP Earned
            </div>
            <div className="mt-3 font-mono text-4xl font-medium text-[#00e5e5]">
              {lpEarned > 0 ? `+${lpEarned}` : '—'}
            </div>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
              {lpEarned === 0 ? 'Already mastered' : 'League Points'}
            </p>
          </div>

          {/* Best Score */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
              Best Score
            </div>
            <div className="mt-3 font-mono text-4xl font-medium">
              {bestScore}
            </div>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
              {isNewBestScore && compositeScore > 0 ? '🎉 New best!' : 'Personal best'}
            </p>
          </div>
        </div>
      </section>

      {/* Phase Breakdown - Order: Review → Write → Revise */}
      <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
        <h2 className="font-semibold">Phase Breakdown</h2>
        <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
          Composite = 20% Review + 40% Write + 40% Revise
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {/* Phase 1: Review */}
          <div className="rounded-[10px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">👀</span>
                <span className="text-sm font-medium text-[#ff9030]">Review</span>
              </div>
              <span className="text-xs text-[rgba(255,255,255,0.4)]">20%</span>
            </div>
            <div
              className="mt-3 font-mono text-3xl font-semibold"
              style={{ color: getScoreColor(reviewScore) }}
            >
              {reviewScore}
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]">
              <div
                className="h-full rounded-full bg-[#ff9030]"
                style={{ width: `${reviewScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">Example analysis</p>
          </div>

          {/* Phase 2: Write */}
          <div className="rounded-[10px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">✍️</span>
                <span className="text-sm font-medium text-[#00e5e5]">Write</span>
              </div>
              <span className="text-xs text-[rgba(255,255,255,0.4)]">40%</span>
            </div>
            <div
              className="mt-3 font-mono text-3xl font-semibold"
              style={{ color: getScoreColor(writeScore) }}
            >
              {writeScore}
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]">
              <div
                className="h-full rounded-full bg-[#00e5e5]"
                style={{ width: `${writeScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">{wordCount} words</p>
          </div>

          {/* Phase 3: Revise */}
          <div className="rounded-[10px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="text-sm font-medium text-[#00d492]">Revise</span>
              </div>
              <span className="text-xs text-[rgba(255,255,255,0.4)]">40%</span>
            </div>
            <div
              className="mt-3 font-mono text-3xl font-semibold"
              style={{ color: getScoreColor(reviseScore) }}
            >
              {reviseScore}
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]">
              <div
                className="h-full rounded-full bg-[#00d492]"
                style={{ width: `${reviseScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">{revisedWordCount} words</p>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      {hasRemarks && (
        <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
          <h2 className="font-semibold">Feedback</h2>
          <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
            Tips to improve your writing
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Write Phase Feedback */}
            {writeRemarks.length > 0 && (
              <div className="rounded-[10px] border border-[rgba(0,229,229,0.15)] bg-[rgba(0,229,229,0.05)] p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  <span className="text-sm font-medium text-[#00e5e5]">Write Phase</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {writeRemarks.map((remark, idx) => (
                    <li key={idx} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className={remark.severity === 'error' ? 'text-[#ff5f8f]' : 'text-[#ff9030]'}>
                          {remark.severity === 'error' ? '⚠️' : '💡'}
                        </span>
                        <div>
                          <p className="text-[rgba(255,255,255,0.7)]">{remark.concreteProblem}</p>
                          <p className="mt-1 text-xs text-[rgba(255,255,255,0.5)]">{remark.callToAction}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Revise Phase Feedback */}
            {reviseRemarks.length > 0 && (
              <div className="rounded-[10px] border border-[rgba(0,212,146,0.15)] bg-[rgba(0,212,146,0.05)] p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-medium text-[#00d492]">Revise Phase</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {reviseRemarks.map((remark, idx) => (
                    <li key={idx} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className={remark.severity === 'error' ? 'text-[#ff5f8f]' : 'text-[#ff9030]'}>
                          {remark.severity === 'error' ? '⚠️' : '💡'}
                        </span>
                        <div>
                          <p className="text-[rgba(255,255,255,0.7)]">{remark.concreteProblem}</p>
                          <p className="mt-1 text-xs text-[rgba(255,255,255,0.5)]">{remark.callToAction}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </section>
      )}

      {/* Lesson Info & Next Steps */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Lesson Info */}
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h3 className="font-medium">Lesson</h3>
          <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
            {lesson?.name || 'Unknown'}
          </p>
          <p className="mt-3 text-sm text-[rgba(255,255,255,0.6)]">
            {lesson?.description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] uppercase text-[rgba(255,255,255,0.4)]">
              {lesson?.category}
            </span>
            <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-[rgba(255,255,255,0.4)]">
              Attempt #{attempts}
            </span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h3 className="font-medium">Next Steps</h3>
          <ul className="mt-4 space-y-3 text-sm text-[rgba(255,255,255,0.6)]">
            {!isMastered && (
              <li className="flex items-start gap-2">
                <span className="text-[#00e5e5]">→</span>
                <span>Practice again to reach 90% and master this skill</span>
              </li>
            )}
            {isMastered && (
              <li className="flex items-start gap-2">
                <span className="text-[#00d492]">✓</span>
                <span>You&apos;ve mastered this skill! Try another lesson</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-[#ff9030]">💡</span>
              <span>Review the examples to reinforce your understanding</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Mastery Progress Tip */}
      {!achievedMastery && (
        <section className="rounded-[14px] border border-[rgba(255,144,48,0.15)] bg-[rgba(255,144,48,0.05)] p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-medium text-[#ff9030]">Keep Going!</h3>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
                You need {MASTERY_THRESHOLD - compositeScore} more points to master this skill.
                Focus on the phase with the lowest score and try again!
              </p>
            </div>
          </div>
        </section>
      )}
    </ResultsLayout>
  );
}

/**
 * @description Practice results page with Suspense boundary.
 */
export default function PracticeResultsContent() {
  return (
    <Suspense fallback={<LoadingState message="Loading results..." />}>
      <PracticeResultsContentInner />
    </Suspense>
  );
}

