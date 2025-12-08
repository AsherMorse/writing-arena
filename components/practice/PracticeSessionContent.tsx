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
import { GradingSidebar } from './GradingSidebar';
import { PracticeReviewPhase } from './PracticeReviewPhase';
import { SPOEditor, SPOData, createEmptySPO, spoToText, countSPOWords } from './SPOEditor';
import { PTOEditor, PTOData, createEmptyPTO, ptoToText, countPTOWords } from './PTOEditor';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { GradingResult, GradingRemark, SectionScores } from '@/lib/constants/grader-configs';

/** Editor type for different lesson types */
type EditorType = 'freeform' | 'spo' | 'pto';

/** Map lesson IDs to their editor types */
const LESSON_EDITOR_MAP: Record<string, EditorType> = {
  'writing-spos': 'spo',
  'pre-transition-outline': 'pto',
};

/** Activities that use cardinal rubric (per-section scoring) */
const CARDINAL_RUBRIC_ACTIVITIES: Record<string, { maxScore: number }> = {
  'writing-spos': { maxScore: 20 },
  'elaborate-paragraphs': { maxScore: 10 },
  'write-freeform-paragraph': { maxScore: 20 },
};

/**
 * @description Get the editor type for a lesson.
 */
function getEditorType(lessonId: string): EditorType {
  return LESSON_EDITOR_MAP[lessonId] || 'freeform';
}

/**
 * @description Check if a lesson uses cardinal rubric (per-section scoring).
 */
function usesCardinalRubric(lessonId: string): boolean {
  return lessonId in CARDINAL_RUBRIC_ACTIVITIES;
}

/**
 * @description Get max score for cardinal rubric activities.
 */
function getCardinalMaxScore(lessonId: string): number {
  return CARDINAL_RUBRIC_ACTIVITIES[lessonId]?.maxScore || 100;
}

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
    isLoading,
    error,
    startSession,
    nextPhase,
  } = usePracticeLesson(lessonId);

  const { recordAttempt } = useLessonMastery(lessonId);

  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('ready');
  // Freeform text state
  const [writingContent, setWritingContent] = useState('');
  const [revisedContent, setRevisedContent] = useState('');
  // Structured editor state (SPO)
  const [spoData, setSpoData] = useState<SPOData>(() => createEmptySPO(3));
  const [revisedSpoData, setRevisedSpoData] = useState<SPOData>(() => createEmptySPO(3));
  // Structured editor state (PTO)
  const [ptoData, setPtoData] = useState<PTOData>(() => createEmptyPTO(2, 3));
  const [revisedPtoData, setRevisedPtoData] = useState<PTOData>(() => createEmptyPTO(2, 3));
  
  const [wordCount, setWordCount] = useState(0);
  const [revisedWordCount, setRevisedWordCount] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState<ReviewFeedback[]>([]);
  // Scores and feedback stored for display during revision phase
  const [writeScore, setWriteScore] = useState<number | null>(null);
  const [writeRemarks, setWriteRemarks] = useState<GradingRemark[]>([]);
  const [reviseRemarks, setReviseRemarks] = useState<GradingRemark[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  
  // Per-section scores for cardinal rubric activities
  const [writeSectionScores, setWriteSectionScores] = useState<SectionScores | null>(null);
  const [reviseSectionScores, setReviseSectionScores] = useState<SectionScores | null>(null);
  
  // Blocking grading state - when student needs to fix errors before advancing
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockingRemarks, setBlockingRemarks] = useState<GradingRemark[]>([]);
  const [blockingSolution, setBlockingSolution] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Previous attempts tracking - for context in retry grading
  const [previousAttempts, setPreviousAttempts] = useState<
    { content: string; remarks: GradingRemark[] }[]
  >([]);

  const debouncedContent = useDebounce(writingContent, 300);
  const debouncedRevisedContent = useDebounce(revisedContent, 300);
  const { showPasteWarning, handlePaste, handleCut } = usePastePrevention({ warningDuration: 2500 });

  // Determine editor type for this lesson
  const editorType = getEditorType(lessonId);

  // Memoize review sequence (instruction cards + examples) so they don't regenerate on every timer tick
  const reviewItems = useMemo(
    () => buildReviewSequence(lessonId, 3),
    [lessonId]
  );

  // Update word counts based on editor type
  useEffect(() => {
    if (editorType === 'spo') {
      setWordCount(countSPOWords(spoData));
    } else if (editorType === 'pto') {
      setWordCount(countPTOWords(ptoData));
    } else {
      setWordCount(countWords(debouncedContent));
    }
  }, [editorType, debouncedContent, spoData, ptoData]);

  useEffect(() => {
    if (editorType === 'spo') {
      setRevisedWordCount(countSPOWords(revisedSpoData));
    } else if (editorType === 'pto') {
      setRevisedWordCount(countPTOWords(revisedPtoData));
    } else {
      setRevisedWordCount(countWords(debouncedRevisedContent));
    }
  }, [editorType, debouncedRevisedContent, revisedSpoData, revisedPtoData]);


  /**
   * @description Start the practice session.
   * Session begins with Review phase (I Do).
   */
  function handleStart() {
    setSessionPhase('reviewPhase');
    startSession();
  }

  /**
   * @description Get the current content as text (handles structured editors).
   */
  function getCurrentContentAsText(): string {
    if (editorType === 'spo') return spoToText(spoData);
    if (editorType === 'pto') return ptoToText(ptoData);
    return writingContent;
  }

  /**
   * @description Get the revised content as text (handles structured editors).
   */
  function getRevisedContentAsText(): string {
    if (editorType === 'spo') return spoToText(revisedSpoData);
    if (editorType === 'pto') return ptoToText(revisedPtoData);
    return revisedContent;
  }

  /**
   * @description Check if grading result has any blocking errors.
   */
  function hasBlockingErrors(remarks: GradingRemark[]): boolean {
    return remarks.some(r => r.severity === 'error');
  }

  /**
   * @description Handle phase completion and transitions.
   * Order: review → write → revise
   * Write phase blocks advancement if there are errors.
   */
  async function handlePhaseComplete() {
    if (sessionPhase === 'reviewPhase') {
      // Review complete → Move to Write phase
      setSessionPhase('writePhase');
      nextPhase();
    } else if (sessionPhase === 'writePhase') {
      // Write complete → Grade writing
      setIsGrading(true);
      setAttemptCount(prev => prev + 1);
      const contentToGrade = getCurrentContentAsText();
      
      try {
        const result = await gradeSubmission(contentToGrade);
        setWriteScore(result.score);
        setWriteRemarks(result.remarks);
        
        // Capture section scores for cardinal rubric activities
        if (result.sectionScores) {
          setWriteSectionScores(result.sectionScores);
        }
        
        // Check if there are blocking errors
        if (hasBlockingErrors(result.remarks)) {
          // Track this attempt for context in future grading
          setPreviousAttempts(prev => [
            ...prev,
            { content: contentToGrade, remarks: result.remarks },
          ]);
          
          // Block advancement - show feedback and let student retry
          setIsBlocked(true);
          setBlockingRemarks(result.remarks);
          setBlockingSolution(result.solution);
          setIsGrading(false);
          return; // Don't advance to Revise phase
        }
        
        // No blocking errors - can advance (nits are OK)
        setIsBlocked(false);
        setBlockingRemarks([]);
        setBlockingSolution('');
      } catch (error) {
        // TEMPORARY: Debug logging for grading failures
        console.error('[DEBUG] Write phase grading failed:', error);
        setWriteScore(0);
        setWriteRemarks([]);
        // On grading failure, allow advancement to avoid blocking forever
      }
      setIsGrading(false);
      
      // Pre-fill revised content with original
      if (editorType === 'spo') {
        setRevisedSpoData({ ...spoData });
      } else if (editorType === 'pto') {
        setRevisedPtoData({ ...ptoData });
      } else {
        setRevisedContent(writingContent);
      }
      setSessionPhase('revisePhase');
      nextPhase();
    } else if (sessionPhase === 'revisePhase') {
      // Revise complete → Submit session
      await handleSubmitSession();
    }
  }

  /**
   * @description Handle retry after blocking feedback.
   * Clears feedback and lets student continue editing.
   */
  function handleRetry() {
    setIsBlocked(false);
    setBlockingRemarks([]);
    setBlockingSolution('');
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
      previousAttempts: previousAttempts.length > 0 ? previousAttempts : undefined,
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
      const revisedContentText = getRevisedContentAsText();
      let reviseScore = 0;
      let reviseRemarksLocal: GradingRemark[] = [];
      let reviseSectionScoresLocal: SectionScores | null = null;
      try {
        const result = await gradeSubmission(revisedContentText);
        reviseScore = result.score;
        reviseRemarksLocal = result.remarks;
        setReviseRemarks(result.remarks);
        
        // Capture section scores for cardinal rubric activities
        if (result.sectionScores) {
          reviseSectionScoresLocal = result.sectionScores;
          setReviseSectionScores(result.sectionScores);
        }
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

      // Store all results in session storage (clean URL, no query params)
      sessionStorage.setItem('practiceResults', JSON.stringify({
        lessonId,
        reviewScore: reviewScore ?? 0,
        writeScore: writeScore ?? 0,
        reviseScore: reviseScore ?? 0,
        compositeScore: compositeScore ?? 0,
        lpEarned: lpEarned ?? 0,
        wordCount: wordCount ?? 0,
        revisedWordCount: revisedWordCount ?? 0,
        writeRemarks,
        reviseRemarks: reviseRemarksLocal,
        // Include section scores for cardinal rubric activities
        writeSectionScores: writeSectionScores ?? null,
        reviseSectionScores: reviseSectionScoresLocal ?? null,
      }));

      // Navigate to results (all data in session storage)
      router.push(`/improve/activities/${lessonId}/results`);
    } catch (err) {
      console.error('Session submission failed:', err);
      // Store error state in session storage for consistent handling
      sessionStorage.setItem('practiceResults', JSON.stringify({
        lessonId,
        reviewScore: 0,
        writeScore: 0,
        reviseScore: 0,
        compositeScore: 0,
        lpEarned: 0,
        wordCount: 0,
        revisedWordCount: 0,
        writeRemarks: [],
        reviseRemarks: [],
      }));
      router.push(`/improve/activities/${lessonId}/results`);
    }
  }

  /**
   * @description Manual submit button handler.
   */
  function handleManualSubmit() {
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

            {/* Phase Info - Order: Review → Write → Revise */}
            <div className="mt-6 grid gap-4 text-sm text-[rgba(255,255,255,0.5)] sm:grid-cols-3">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                👀 Review
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                ✍️ Write
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                ✨ Revise
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-8 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
            >
              Start
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
            />
          </div>
        </main>
      </div>
    );
  }

  // Write & Revise phases: Writing UI
  const isRevisionPhase = sessionPhase === 'revisePhase';
  const currentWordCount = isRevisionPhase ? revisedWordCount : wordCount;
  
  // For freeform editor
  const currentContent = isRevisionPhase ? revisedContent : writingContent;
  const setCurrentContent = isRevisionPhase ? setRevisedContent : setWritingContent;
  
  // For SPO editor
  const currentSpoData = isRevisionPhase ? revisedSpoData : spoData;
  const setCurrentSpoData = isRevisionPhase ? setRevisedSpoData : setSpoData;
  
  // For PTO editor
  const currentPtoData = isRevisionPhase ? revisedPtoData : ptoData;
  const setCurrentPtoData = isRevisionPhase ? setRevisedPtoData : setPtoData;

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
              Phase {getPhaseNumber(currentPhase)}: {getPhaseName(currentPhase)}
            </div>
            <p className="text-sm font-medium" style={{ color: currentPhaseColor }}>
              {isRevisionPhase ? 'Improve your response' : lesson.instruction}
            </p>
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
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Main Writing Area */}
          <div className="space-y-6">
            <SkillFocusBanner lesson={lesson} currentPrompt={currentPrompt} />

            {/* Writing Editor */}
            <div className="relative rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-white p-8 text-[#1b1f24] shadow-xl">
              {editorType === 'spo' ? (
                <SPOEditor
                  value={currentSpoData}
                  onChange={setCurrentSpoData}
                  isRevision={isRevisionPhase}
                />
              ) : editorType === 'pto' ? (
                <PTOEditor
                  value={currentPtoData}
                  onChange={setCurrentPtoData}
                  isRevision={isRevisionPhase}
                />
              ) : (
                <textarea
                  value={currentContent}
                  onChange={e => setCurrentContent(e.target.value)}
                  onPaste={handlePaste}
                  onCut={handleCut}
                  placeholder={isRevisionPhase ? 'Revise your response here...' : 'Start writing here...'}
                  className="h-[400px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
                  autoFocus
                />
              )}
              {showPasteWarning && (
                <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-[20px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.15)] px-4 py-2 text-xs font-medium text-[#ff9030] shadow-lg">
                  Paste disabled during practice
                </div>
              )}
            </div>

            {/* Blocking Feedback - shown when student needs to fix errors */}
            {isBlocked && !isRevisionPhase && blockingRemarks.length > 0 && (
              <div className="space-y-4">
                {/* Feedback Banner */}
                <div className="rounded-[14px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.08)] p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#ff5f8f]">
                    <span>⚠️</span>
                    <span>Please fix the following before continuing</span>
                    <span className="ml-auto text-xs text-[rgba(255,255,255,0.4)]">
                      Attempt {attemptCount}
                    </span>
                  </div>
                  
                  <ul className="mt-4 space-y-4">
                    {blockingRemarks.map((remark, idx) => (
                      <li key={idx} className="text-sm">
                        <div className="flex items-start gap-3">
                          <span className={remark.severity === 'error' ? 'text-[#ff5f8f]' : 'text-[#ff9030]'}>
                            {remark.severity === 'error' ? '❌' : '💡'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-white">{remark.concreteProblem}</p>
                            <p className="mt-1 text-[rgba(255,255,255,0.6)]">{remark.callToAction}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Model Solution (if available) */}
                  {blockingSolution && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-[rgba(255,255,255,0.5)] hover:text-white">
                        💡 Show example solution
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap rounded-[8px] bg-[rgba(0,0,0,0.2)] p-3 text-xs text-[rgba(255,255,255,0.7)]">
                        {blockingSolution}
                      </pre>
                    </details>
                  )}

                  {/* Try Again Button */}
                  <button
                    onClick={handleRetry}
                    className="mt-6 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
                  >
                    ✏️ Edit & Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Revise Phase: Show original response and feedback for revision */}
            {isRevisionPhase && (editorType !== 'freeform' || writingContent) && (
              <div className="space-y-4">
                {/* Original Response */}
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                    Your original response
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-[rgba(255,255,255,0.6)]">
                    {editorType === 'spo' 
                      ? spoToText(spoData) 
                      : editorType === 'pto' 
                        ? ptoToText(ptoData) 
                        : writingContent}
                  </pre>
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
            {/* Show GradingSidebar for cardinal rubric activities after grading */}
            {usesCardinalRubric(lessonId) && (isRevisionPhase ? reviseSectionScores : writeSectionScores) && (
              <GradingSidebar
                sectionScores={(isRevisionPhase ? reviseSectionScores : writeSectionScores)!}
                totalScore={isRevisionPhase 
                  ? Object.values(reviseSectionScores || {}).reduce((a, b) => a + (b || 0), 0)
                  : Object.values(writeSectionScores || {}).reduce((a, b) => a + (b || 0), 0)
                }
                maxScore={getCardinalMaxScore(lessonId)}
              />
            )}
            <ExampleSidebar lesson={lesson} collapsed={false} />
          </aside>
        </div>
      </main>
    </div>
  );
}

