'use client';

import { useState, useEffect, useMemo } from 'react';
import { use } from 'react';
import Image from 'next/image';
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
import { FantasyReviewPhase } from '../../../_components/FantasyReviewPhase';
import { SPOEditor, SPOData, createEmptySPO, spoToText, countSPOWords } from '@/components/practice/SPOEditor';
import { PTOEditor, PTOData, createEmptyPTO, ptoToText, countPTOWords } from '@/components/practice/PTOEditor';
import { GradingResult, GradingRemark, SectionScores } from '@/lib/constants/grader-configs';
import { ParchmentCard } from '../../../_components/ParchmentCard';
import { ParchmentButton } from '../../../_components/ParchmentButton';
import { WritingEditor } from '../../../_components/WritingEditor';
import { LoadingOverlay } from '../../../_components/LoadingOverlay';
import { getParchmentTextStyle } from '../../../_components/parchment-styles';

type EditorType = 'freeform' | 'spo' | 'pto';

const LESSON_EDITOR_MAP: Record<string, EditorType> = {
  'writing-spos': 'spo',
  'pre-transition-outline': 'pto',
};

const CARDINAL_RUBRIC_ACTIVITIES: Record<string, { maxScore: number }> = {
  'writing-spos': { maxScore: 20 },
  'elaborate-paragraphs': { maxScore: 10 },
  'write-freeform-paragraph': { maxScore: 20 },
};

function getEditorType(lessonId: string): EditorType {
  return LESSON_EDITOR_MAP[lessonId] || 'freeform';
}

function usesCardinalRubric(lessonId: string): boolean {
  return lessonId in CARDINAL_RUBRIC_ACTIVITIES;
}

function getCardinalMaxScore(lessonId: string): number {
  return CARDINAL_RUBRIC_ACTIVITIES[lessonId]?.maxScore || 100;
}

interface SessionPageProps {
  params: Promise<{ lessonId: string }>;
}

type SessionPhase = 'ready' | 'reviewPhase' | 'writePhase' | 'revisePhase' | 'submitting' | 'complete';

interface ReviewFeedback {
  exampleIndex: number;
  userSaidCorrect: boolean;
  actuallyCorrect: boolean;
  isAccurate: boolean;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { lessonId } = use(params);
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
  const [writingContent, setWritingContent] = useState('');
  const [revisedContent, setRevisedContent] = useState('');
  const [spoData, setSpoData] = useState<SPOData>(() => createEmptySPO(3));
  const [revisedSpoData, setRevisedSpoData] = useState<SPOData>(() => createEmptySPO(3));
  const [ptoData, setPtoData] = useState<PTOData>(() => createEmptyPTO(2, 3));
  const [revisedPtoData, setRevisedPtoData] = useState<PTOData>(() => createEmptyPTO(2, 3));
  
  const [wordCount, setWordCount] = useState(0);
  const [revisedWordCount, setRevisedWordCount] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState<ReviewFeedback[]>([]);
  const [writeScore, setWriteScore] = useState<number | null>(null);
  const [writeRemarks, setWriteRemarks] = useState<GradingRemark[]>([]);
  const [reviseRemarks, setReviseRemarks] = useState<GradingRemark[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  
  const [writeSectionScores, setWriteSectionScores] = useState<SectionScores | null>(null);
  const [reviseSectionScores, setReviseSectionScores] = useState<SectionScores | null>(null);
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockingRemarks, setBlockingRemarks] = useState<GradingRemark[]>([]);
  const [blockingSolution, setBlockingSolution] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  
  const [previousAttempts, setPreviousAttempts] = useState<
    { content: string; remarks: GradingRemark[] }[]
  >([]);

  const debouncedContent = useDebounce(writingContent, 300);
  const debouncedRevisedContent = useDebounce(revisedContent, 300);
  const { showPasteWarning, handlePaste, handleCut } = usePastePrevention({ warningDuration: 2500 });

  const editorType = getEditorType(lessonId);

  const reviewItems = useMemo(
    () => buildReviewSequence(lessonId, 3),
    [lessonId]
  );

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

  function handleStart() {
    setSessionPhase('reviewPhase');
    startSession();
  }

  function getCurrentContentAsText(): string {
    if (editorType === 'spo') return spoToText(spoData);
    if (editorType === 'pto') return ptoToText(ptoData);
    return writingContent;
  }

  function getRevisedContentAsText(): string {
    if (editorType === 'spo') return spoToText(revisedSpoData);
    if (editorType === 'pto') return ptoToText(revisedPtoData);
    return revisedContent;
  }

  function hasBlockingErrors(remarks: GradingRemark[]): boolean {
    return remarks.some(r => r.severity === 'error');
  }

  async function handlePhaseComplete() {
    if (sessionPhase === 'reviewPhase') {
      setSessionPhase('writePhase');
      nextPhase();
    } else if (sessionPhase === 'writePhase') {
      setIsGrading(true);
      setAttemptCount(prev => prev + 1);
      const contentToGrade = getCurrentContentAsText();
      
      try {
        const result = await gradeSubmission(contentToGrade);
        setWriteScore(result.score);
        setWriteRemarks(result.remarks);
        
        if (result.sectionScores) {
          setWriteSectionScores(result.sectionScores);
        }
        
        if (hasBlockingErrors(result.remarks)) {
          setPreviousAttempts(prev => [
            ...prev,
            { content: contentToGrade, remarks: result.remarks },
          ]);
          
          setIsBlocked(true);
          setBlockingRemarks(result.remarks);
          setBlockingSolution(result.solution);
          setIsGrading(false);
          return;
        }
        
        setIsBlocked(false);
        setBlockingRemarks([]);
        setBlockingSolution('');
      } catch (error) {
        console.error('[DEBUG] Write phase grading failed:', error);
        setWriteScore(0);
        setWriteRemarks([]);
      }
      setIsGrading(false);
      
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
      await handleSubmitSession();
    }
  }

  function handleRetry() {
    setIsBlocked(false);
    setBlockingRemarks([]);
    setBlockingSolution('');
  }

  function handleReviewComplete(feedback: ReviewFeedback[]) {
    setReviewFeedback(feedback);
    handlePhaseComplete();
  }

  async function gradeSubmission(content: string): Promise<GradingResult> {
    const emptyResult: GradingResult = { isCorrect: false, score: 0, remarks: [], solution: '' };

    if (!currentPrompt || !content.trim()) {
      return emptyResult;
    }

    const requestBody = {
      lessonId,
      question: currentPrompt.prompt + (currentPrompt.nounPhrase || ''),
      studentAnswer: content,
      previousAttempts: previousAttempts.length > 0 ? previousAttempts : undefined,
    };

    const response = await fetch('/api/evaluate-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Grading failed');
    }

    const data = await response.json() as GradingResult;

    return {
      isCorrect: data.isCorrect ?? false,
      score: data.score ?? 0,
      remarks: data.remarks ?? [],
      solution: data.solution ?? '',
    };
  }

  async function handleSubmitSession() {
    setSessionPhase('submitting');

    try {
      const revisedContentText = getRevisedContentAsText();
      let reviseScore = 0;
      let reviseRemarksLocal: GradingRemark[] = [];
      let reviseSectionScoresLocal: SectionScores | null = null;
      try {
        const result = await gradeSubmission(revisedContentText);
        reviseScore = result.score;
        reviseRemarksLocal = result.remarks;
        setReviseRemarks(result.remarks);
        
        if (result.sectionScores) {
          reviseSectionScoresLocal = result.sectionScores;
          setReviseSectionScores(result.sectionScores);
        }
      } catch (error) {
        console.error('[DEBUG] Revise phase grading failed:', error);
        reviseScore = 0;
        reviseRemarksLocal = [];
      }

      const reviewScore = reviewFeedback.length > 0
        ? Math.round((reviewFeedback.filter(f => f.isAccurate).length / reviewFeedback.length) * 100)
        : 0;

      const compositeScore = Math.round(
        (reviewScore ?? 0) * 0.2 + (writeScore ?? 0) * 0.4 + (reviseScore ?? 0) * 0.4
      );

      let lpEarned = 0;
      if (user) {
        const result = await recordAttempt(compositeScore);
        lpEarned = result.lpEarned;
      }

      sessionStorage.setItem('fantasyStudyResults', JSON.stringify({
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
        writeSectionScores: writeSectionScores ?? null,
        reviseSectionScores: reviseSectionScoresLocal ?? null,
      }));

      router.push(`/fantasy/study/${lessonId}/results`);
    } catch (err) {
      console.error('Session submission failed:', err);
      sessionStorage.setItem('fantasyStudyResults', JSON.stringify({
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
      router.push(`/fantasy/study/${lessonId}/results`);
    }
  }

  function handleManualSubmit() {
    handlePhaseComplete();
  }

  if (isLoading) {
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

  if (error || !lesson) {
    return (
      <div className="relative min-h-screen">
        <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
          <ParchmentCard>
            <div className="text-center">
              <h1 className="font-memento text-xl uppercase tracking-wider" style={getParchmentTextStyle()}>
                {error || 'Lesson not found'}
              </h1>
            </div>
          </ParchmentCard>
        </div>
      </div>
    );
  }

  if (sessionPhase === 'ready') {
    return (
      <div className="relative min-h-screen">
        <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <ParchmentCard>
              <div className="text-center">
                <div className="text-4xl">✏️</div>
                <h1
                  className="mt-4 font-memento text-2xl uppercase tracking-wider"
                  style={getParchmentTextStyle()}
                >
                  {lesson.name}
                </h1>
                <p className="mt-3 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                  {lesson.description}
                </p>

                <div className="mt-6 flex justify-center gap-4">
                  <div
                    className="rounded-lg px-4 py-2 text-center"
                    style={{ background: 'rgba(0,0,0,0.1)' }}
                  >
                    <span className="font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                      👀 Review
                    </span>
                  </div>
                  <div
                    className="rounded-lg px-4 py-2 text-center"
                    style={{ background: 'rgba(0,0,0,0.1)' }}
                  >
                    <span className="font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                      ✍️ Write
                    </span>
                  </div>
                  <div
                    className="rounded-lg px-4 py-2 text-center"
                    style={{ background: 'rgba(0,0,0,0.1)' }}
                  >
                    <span className="font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
                      ✨ Revise
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <ParchmentButton onClick={handleStart} variant="golden">
                    Start
                  </ParchmentButton>
                </div>
              </div>
            </ParchmentCard>
          </div>
        </div>
      </div>
    );
  }

  if (sessionPhase === 'submitting' || isGrading) {
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

  const currentPhaseColor = '#c9a84c';

  if (sessionPhase === 'reviewPhase') {
    return (
      <div className="relative min-h-screen">
        <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
        />
        <div className="relative z-10 min-h-screen p-4">
          <div className="mx-auto max-w-4xl py-8">
            <div className="mb-6">
              <ParchmentCard>
                <div className="flex items-center gap-3">
                  <span className="text-xl">✏️</span>
                  <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
                    {lesson.name}
                  </span>
                  <span
                    className="ml-2 font-avenir text-xs capitalize"
                    style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                  >
                    {lesson.category} skill
                  </span>
                </div>
              </ParchmentCard>
            </div>
            <FantasyReviewPhase
              reviewItems={reviewItems}
              onComplete={handleReviewComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  const isRevisionPhase = sessionPhase === 'revisePhase';
  const currentWordCount = isRevisionPhase ? revisedWordCount : wordCount;
  
  const currentContent = isRevisionPhase ? revisedContent : writingContent;
  const setCurrentContent = isRevisionPhase ? setRevisedContent : setWritingContent;
  
  const currentSpoData = isRevisionPhase ? revisedSpoData : spoData;
  const setCurrentSpoData = isRevisionPhase ? setRevisedSpoData : setSpoData;
  
  const currentPtoData = isRevisionPhase ? revisedPtoData : ptoData;
  const setCurrentPtoData = isRevisionPhase ? setRevisedPtoData : setPtoData;

  return (
    <div className="relative min-h-screen">
      <Image src="/images/backgrounds/bg.webp" alt="" fill className="object-cover" priority />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-10 min-h-screen">
        <header className="sticky top-0 z-20 p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div>
              <div
                className="font-memento text-xs uppercase tracking-wider"
                style={{ color: 'rgba(245, 230, 184, 0.5)' }}
              >
                Phase {getPhaseNumber(currentPhase)}: {getPhaseName(currentPhase)}
              </div>
              <p className="font-avenir text-sm" style={{ color: '#f6d493' }}>
                {isRevisionPhase ? 'Improve your response' : lesson.instruction}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="rounded-full px-3 py-1 font-avenir text-sm"
                style={{ background: 'rgba(245, 230, 184, 0.1)', color: 'rgba(245, 230, 184, 0.7)' }}
              >
                {currentWordCount} words
              </span>
              <ParchmentButton onClick={handleManualSubmit} variant="golden">
                Submit
              </ParchmentButton>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
            <div className="space-y-4">
              <ParchmentCard>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✏️</span>
                  <div>
                    <h2
                      className="font-memento text-lg uppercase tracking-wider"
                      style={getParchmentTextStyle()}
                    >
                      {lesson.name}
                    </h2>
                    {currentPrompt && (
                      <div className="mt-3">
                        <div
                          className="font-memento text-xs uppercase tracking-wider"
                          style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                        >
                          Your prompt
                        </div>
                        <p className="mt-1 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.8)' }}>
                          {currentPrompt.prompt}
                          {currentPrompt.nounPhrase && (
                            <span style={{ color: '#c9a84c' }}> "{currentPrompt.nounPhrase}"</span>
                          )}
                        </p>
                        {currentPrompt.hint && (
                          <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                            💡 {currentPrompt.hint}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ParchmentCard>

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
                <WritingEditor
                  value={currentContent}
                  onChange={setCurrentContent}
                  placeholder={isRevisionPhase ? 'Revise your response...' : 'Start writing here...'}
                  showRequirements={false}
                />
              )}

              {isBlocked && !isRevisionPhase && blockingRemarks.length > 0 && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <div className="flex items-center gap-2 font-memento text-sm uppercase tracking-wider" style={{ color: '#ef4444' }}>
                    <span>⚠️</span>
                    <span>Please fix the following</span>
                    <span className="ml-auto font-avenir text-xs normal-case" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
                      Attempt {attemptCount}
                    </span>
                  </div>
                  
                  <ul className="mt-4 space-y-3">
                    {blockingRemarks.map((remark, idx) => (
                      <li key={idx} className="font-avenir text-sm">
                        <div className="flex items-start gap-3">
                          <span style={{ color: remark.severity === 'error' ? '#ef4444' : '#f59e0b' }}>
                            {remark.severity === 'error' ? '❌' : '💡'}
                          </span>
                          <div>
                            <p style={{ color: 'rgba(245, 230, 184, 0.9)' }}>{remark.concreteProblem}</p>
                            <p className="mt-1" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>{remark.callToAction}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {blockingSolution && (
                    <details className="mt-4">
                      <summary
                        className="cursor-pointer font-avenir text-xs"
                        style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                      >
                        💡 Show example solution
                      </summary>
                      <pre
                        className="mt-2 whitespace-pre-wrap rounded-lg p-3 font-avenir text-xs"
                        style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(245, 230, 184, 0.7)' }}
                      >
                        {blockingSolution}
                      </pre>
                    </details>
                  )}

                  <div className="mt-6">
                    <ParchmentButton onClick={handleRetry} variant="golden" className="w-full">
                      ✏️ Edit & Try Again
                    </ParchmentButton>
                  </div>
                </div>
              )}

              {isRevisionPhase && (editorType !== 'freeform' || writingContent) && (
                <div className="space-y-4">
                  <ParchmentCard variant="light">
                    <div
                      className="font-memento text-xs uppercase tracking-wider"
                      style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                    >
                      Your original response
                    </div>
                    <pre
                      className="mt-2 whitespace-pre-wrap font-avenir text-sm"
                      style={{ color: 'rgba(45, 45, 45, 0.7)' }}
                    >
                      {editorType === 'spo' 
                        ? spoToText(spoData) 
                        : editorType === 'pto' 
                          ? ptoToText(ptoData) 
                          : writingContent}
                    </pre>
                    {writeScore !== null && (
                      <div className="mt-3 flex items-center gap-2 font-avenir text-xs">
                        <span style={{ color: 'rgba(45, 45, 45, 0.5)' }}>Write Phase Score:</span>
                        <span
                          style={{ color: writeScore >= 90 ? '#2a5d3a' : writeScore >= 70 ? '#c9a84c' : '#8b4513' }}
                        >
                          {writeScore}%
                        </span>
                      </div>
                    )}
                  </ParchmentCard>

                  {writeRemarks.length > 0 && (
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: 'rgba(251, 191, 36, 0.15)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                      }}
                    >
                      <div
                        className="font-memento text-xs uppercase tracking-wider"
                        style={{ color: '#fbbf24' }}
                      >
                        Feedback to consider
                      </div>
                      <ul className="mt-3 space-y-3">
                        {writeRemarks.map((remark, idx) => (
                          <li key={idx} className="font-avenir text-sm">
                            <div className="flex items-start gap-2">
                              <span style={{ color: remark.severity === 'error' ? '#ef4444' : '#fbbf24' }}>
                                {remark.severity === 'error' ? '⚠️' : '💡'}
                              </span>
                              <div>
                                <p style={{ color: 'rgba(245, 230, 184, 0.8)' }}>{remark.concreteProblem}</p>
                                <p className="mt-1 text-xs" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>{remark.callToAction}</p>
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

            <aside className="space-y-4">
              <ParchmentCard>
                <div
                  className="font-memento text-xs uppercase tracking-wider"
                  style={{ color: 'rgba(45, 45, 45, 0.5)' }}
                >
                  Reference Examples
                </div>
                {lesson.exampleResponse && (
                  <div className="mt-3">
                    <p className="font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
                      {lesson.exampleResponse.prompt}
                    </p>
                    <p className="mt-2 font-avenir text-sm" style={getParchmentTextStyle()}>
                      {lesson.exampleResponse.response}
                    </p>
                    <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
                      {lesson.exampleResponse.explanation}
                    </p>
                  </div>
                )}
              </ParchmentCard>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
