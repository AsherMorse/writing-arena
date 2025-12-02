/**
 * @fileoverview Practice session content with 3-phase flow.
 * Handles Review → Write → Revise phases for practice lessons.
 *
 * Phase order follows "I Do, We Do, You Do" pedagogy:
 * 1. Review Phase - Students see examples and evaluate them (I Do)
 * 2. Write Phase - Students write independently (You Do)
 * 3. Revise Phase - Students improve based on feedback (You Do Better)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  usePracticeLesson,
  formatTimeRemaining,
  getPhaseName,
  getPhaseNumber,
} from '@/lib/hooks/usePracticeLesson';
import { useLessonMastery } from '@/lib/hooks/usePracticeMastery';
import { buildReviewSequence } from '@/lib/constants/practice-examples';
import { countWords } from '@/lib/utils/text-utils';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { SkillFocusBanner } from './SkillFocusBanner';
import { ExampleSidebar } from './ExampleSidebar';
import { PracticeReviewPhase } from './PracticeReviewPhase';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { GradingResult, GradingRemark } from '@/lib/constants/grader-configs';

interface PracticeSessionContentProps {
  lessonId: string;
}

/** Session phases using semantic names */
type SessionPhase = 'ready' | 'reviewPhase' | 'writePhase' | 'revisePhase' | 'submitting' | 'complete';

interface ReviewFeedback {
  exampleIndex: number;
  userSaidCorrect: boolean;
  actuallyCorrect: boolean;
  isAccurate: boolean;
}

/**
 * @description Main practice session component with 3-phase flow.
 */
export default function PracticeSessionContent({ lessonId }: PracticeSessionContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    lesson,
    currentPrompt,
    reviewExamples,
    currentPhase,
    timeRemaining,
    isTimerRunning,
    isLoading,
    error,
    startSession,
    nextPhase,
    pauseTimer,
  } = usePracticeLesson(lessonId);

  const { recordAttempt } = useLessonMastery(lessonId);

  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('ready');
  const [writingContent, setWritingContent] = useState('');
  const [revisedContent, setRevisedContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [revisedWordCount, setRevisedWordCount] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState<ReviewFeedback[]>([]);
  // Scores and feedback stored for display during revision phase
  const [writeScore, setWriteScore] = useState<number | null>(null);
  const [writeRemarks, setWriteRemarks] = useState<GradingRemark[]>([]);
  const [reviseRemarks, setReviseRemarks] = useState<GradingRemark[]>([]);
  const [isGrading, setIsGrading] = useState(false);

  const debouncedContent = useDebounce(writingContent, 300);
  const debouncedRevisedContent = useDebounce(revisedContent, 300);
  const { showPasteWarning, handlePaste, handleCut } = usePastePrevention({ warningDuration: 2500 });

  // Memoize review sequence (instruction cards + examples) so they don't regenerate on every timer tick
  const reviewItems = useMemo(
    () => buildReviewSequence(lessonId, 3),
    [lessonId]
  );

  // Update word counts
  useEffect(() => {
    setWordCount(countWords(debouncedContent));
  }, [debouncedContent]);

  useEffect(() => {
    setRevisedWordCount(countWords(debouncedRevisedContent));
  }, [debouncedRevisedContent]);

  // Handle time running out
  useEffect(() => {
    if (timeRemaining === 0 && isTimerRunning === false && sessionPhase !== 'ready') {
      handlePhaseComplete();
    }
  }, [timeRemaining, isTimerRunning, sessionPhase]);

  /**
   * @description Start the practice session.
   * Session begins with Review phase (I Do).
   */
  function handleStart() {
    setSessionPhase('reviewPhase');
    startSession();
  }

  /**
   * @description Handle phase completion and transitions.
   * Order: review → write → revise
   */
  async function handlePhaseComplete() {
    if (sessionPhase === 'reviewPhase') {
      // Review complete → Move to Write phase
      setSessionPhase('writePhase');
      nextPhase();
    } else if (sessionPhase === 'writePhase') {
      // Write complete → Grade writing, then move to Revise phase
      setIsGrading(true);
      try {
        const result = await gradeSubmission(writingContent);
        setWriteScore(result.score);
        setWriteRemarks(result.remarks);
      } catch (error) {
        // TEMPORARY: Debug logging for grading failures
        console.error('[DEBUG] Write phase grading failed:', error);
        setWriteScore(0); // Don't reward failed grading
        setWriteRemarks([]);
      }
      setIsGrading(false);

      // Pre-fill revised content with original
      setRevisedContent(writingContent);
      setSessionPhase('revisePhase');
      nextPhase();
    } else if (sessionPhase === 'revisePhase') {
      // Revise complete → Submit session
      await handleSubmitSession();
    }
  }

  /**
   * @description Handle review phase completion.
   */
  function handleReviewComplete(feedback: ReviewFeedback[]) {
    setReviewFeedback(feedback);
    handlePhaseComplete();
  }

  /**
   * @description Grade a submission using the API.
   * Returns full grading result including score and remarks.
   */
  async function gradeSubmission(content: string): Promise<GradingResult> {
    const emptyResult: GradingResult = { isCorrect: false, score: 0, remarks: [], solution: '' };

    if (!currentPrompt || !content.trim()) {
      // TEMPORARY: Debug logging
      console.log('[DEBUG] gradeSubmission early return - no prompt or empty content', {
        hasPrompt: !!currentPrompt,
        contentLength: content.trim().length,
      });
      return emptyResult;
    }

    const requestBody = {
      lessonId,
      question: currentPrompt.prompt + (currentPrompt.nounPhrase || ''),
      studentAnswer: content,
    };

    // TEMPORARY: Debug logging for grading request
    console.log('[DEBUG] Grading request:', requestBody);

    const response = await fetch('/api/evaluate-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // TEMPORARY: Debug logging for failed response
      console.error('[DEBUG] Grading API error:', response.status, response.statusText);
      throw new Error('Grading failed');
    }

    const data = await response.json() as GradingResult;

    // TEMPORARY: Debug logging for grading response
    console.log('[DEBUG] Grading response:', data);

    return {
      isCorrect: data.isCorrect ?? false,
      score: data.score ?? 0,
      remarks: data.remarks ?? [],
      solution: data.solution ?? '',
    };
  }

  /**
   * @description Submit the complete session.
   */
  async function handleSubmitSession() {
    setSessionPhase('submitting');

    try {
      // Grade revised content
      let reviseScore = 0;
      let reviseRemarksLocal: GradingRemark[] = [];
      try {
        const result = await gradeSubmission(revisedContent);
        reviseScore = result.score;
        reviseRemarksLocal = result.remarks;
        setReviseRemarks(result.remarks);
      } catch (error) {
        // TEMPORARY: Debug logging for grading failures
        console.error('[DEBUG] Revise phase grading failed:', error);
        reviseScore = 0; // Don't reward failed grading
        reviseRemarksLocal = [];
      }

      // Calculate review score (% of correct assessments)
      const reviewScore = reviewFeedback.length > 0
        ? Math.round((reviewFeedback.filter(f => f.isAccurate).length / reviewFeedback.length) * 100)
        : 0;

      // Calculate composite score (review 20%, write 40%, revise 40%)
      const compositeScore = Math.round(
        (reviewScore ?? 0) * 0.2 + (writeScore ?? 0) * 0.4 + (reviseScore ?? 0) * 0.4
      );

      // Record attempt and get LP
      let lpEarned = 0;
      if (user) {
        const result = await recordAttempt(compositeScore);
        lpEarned = result.lpEarned;
      }

      // Navigate to results with semantic param names
      const params = new URLSearchParams({
        lessonId,
        reviewScore: String(reviewScore ?? 0),
        writeScore: String(writeScore ?? 0),
        reviseScore: String(reviseScore ?? 0),
        compositeScore: String(compositeScore ?? 0),
        lpEarned: String(lpEarned ?? 0),
        wordCount: String(wordCount ?? 0),
        revisedWordCount: String(revisedWordCount ?? 0),
        writeRemarks: JSON.stringify(writeRemarks),
        reviseRemarks: JSON.stringify(reviseRemarksLocal),
      });

      router.push(`/practice/${lessonId}/results?${params.toString()}`);
    } catch (err) {
      console.error('Session submission failed:', err);
      // Navigate with default scores on error
      router.push(`/practice/${lessonId}/results?lessonId=${lessonId}&compositeScore=0&lpEarned=0`);
    }
  }

  /**
   * @description Manual submit button handler.
   */
  function handleManualSubmit() {
    pauseTimer();
    handlePhaseComplete();
  }

  // Loading and error states
  if (isLoading) return <LoadingState message="Loading lesson..." />;
  if (error || !lesson) return <ErrorState error={error || 'Lesson not found'} />;

  // Ready state (before starting)
  if (sessionPhase === 'ready') {
    return (
      <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16">
          <section className="w-full rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-4xl">
              ✏️
            </div>
            <h1 className="mt-6 text-2xl font-semibold">{lesson.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
              {lesson.description}
            </p>

            {/* Prompt Preview */}
            {currentPrompt && (
              <div className="mt-6 rounded-[10px] border border-[rgba(0,229,229,0.15)] bg-[rgba(0,229,229,0.05)] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                  Your prompt
                </div>
                <p className="mt-2 text-sm font-medium text-white">
                  {currentPrompt.prompt}
                  {currentPrompt.nounPhrase && (
                    <span className="text-[#00e5e5]"> &quot;{currentPrompt.nounPhrase}&quot;</span>
                  )}
                </p>
              </div>
            )}

            {/* Phase Info - Order: Review → Write → Revise */}
            <div className="mt-6 grid gap-4 text-sm text-[rgba(255,255,255,0.5)] sm:grid-cols-3">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                👀 Review ({lesson.phaseDurations.reviewPhase} min)
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                ✍️ Write ({lesson.phaseDurations.writePhase} min)
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                ✨ Revise ({lesson.phaseDurations.revisePhase} min)
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-8 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
            >
              Start Practice
            </button>
          </section>
        </main>
      </div>
    );
  }

  // Submitting state
  if (sessionPhase === 'submitting' || isGrading) {
    return <LoadingState message={isGrading ? 'Grading your response...' : 'Submitting session...'} />;
  }

  // Phase colors (semantic names)
  const phaseColors = {
    reviewPhase: '#ff9030',  // Orange for review
    writePhase: '#00e5e5',   // Cyan for write
    revisePhase: '#00d492',  // Green for revise
  };
  const currentPhaseColor = phaseColors[sessionPhase as keyof typeof phaseColors] || '#00e5e5';

  // Review Phase (first phase)
  if (sessionPhase === 'reviewPhase') {
    return (
      <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <SkillFocusBanner lesson={lesson} variant="compact" />
          <div className="mt-6">
            <PracticeReviewPhase
              reviewItems={reviewItems}
              onComplete={handleReviewComplete}
              timeRemaining={timeRemaining}
            />
          </div>
        </main>
      </div>
    );
  }

  // Write & Revise phases: Writing UI
  const isRevisionPhase = sessionPhase === 'revisePhase';
  const currentContent = isRevisionPhase ? revisedContent : writingContent;
  const setCurrentContent = isRevisionPhase ? setRevisedContent : setWritingContent;
  const currentWordCount = isRevisionPhase ? revisedWordCount : wordCount;

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium"
              style={{ color: currentPhaseColor }}
            >
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                Phase {getPhaseNumber(currentPhase)}: {getPhaseName(currentPhase)}
              </div>
              <p className="text-sm font-medium" style={{ color: currentPhaseColor }}>
                {isRevisionPhase ? 'Improve your response' : lesson.instruction}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]">
              <span className="font-medium">{currentWordCount}</span> words
            </div>
            <button
              onClick={handleManualSubmit}
              className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-6 py-2 font-medium text-[#101012] transition hover:bg-[#33ebeb]"
            >
              Submit
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mx-auto h-[6px] max-w-6xl rounded-[3px] bg-[rgba(255,255,255,0.05)]">
          <div
            className="h-full rounded-[3px] transition-all"
            style={{
              width: `${(timeRemaining / (lesson.phaseDurations[currentPhase as keyof typeof lesson.phaseDurations] * 60)) * 100}%`,
              background: currentPhaseColor,
            }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Main Writing Area */}
          <div className="space-y-6">
            <SkillFocusBanner lesson={lesson} currentPrompt={currentPrompt} />

            {/* Writing Editor */}
            <div className="relative rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-white p-8 text-[#1b1f24] shadow-xl">
              <textarea
                value={currentContent}
                onChange={e => setCurrentContent(e.target.value)}
                onPaste={handlePaste}
                onCut={handleCut}
                placeholder={isRevisionPhase ? 'Revise your response here...' : 'Start writing here...'}
                className="h-[400px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
                autoFocus
              />
              {showPasteWarning && (
                <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-[20px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.15)] px-4 py-2 text-xs font-medium text-[#ff9030] shadow-lg">
                  Paste disabled during practice
                </div>
              )}
            </div>

            {/* Revise Phase: Show original response and feedback for revision */}
            {isRevisionPhase && writingContent && (
              <div className="space-y-4">
                {/* Original Response */}
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                    Your original response
                  </div>
                  <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">{writingContent}</p>
                  {writeScore !== null && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="text-[rgba(255,255,255,0.4)]">Write Phase Score:</span>
                      <span
                        className="font-medium"
                        style={{ color: writeScore >= 90 ? '#00d492' : writeScore >= 70 ? '#00e5e5' : '#ff9030' }}
                      >
                        {writeScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback from Write Phase */}
                {writeRemarks.length > 0 && (
                  <div className="rounded-[10px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#ff9030]">
                      Feedback to consider
                    </div>
                    <ul className="mt-3 space-y-3">
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
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <ExampleSidebar lesson={lesson} collapsed={false} />
          </aside>
        </div>
      </main>
    </div>
  );
}

