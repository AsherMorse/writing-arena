'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FantasyButton } from '@/components/fantasy';
import { LoadingState } from '@/components/shared/LoadingState';
import { Timer } from '../_components/Timer';
import { WritingEditor } from '../_components/WritingEditor';
import { PromptCard } from '../_components/PromptCard';
import { FeedbackDisplay } from '../_components/FeedbackDisplay';
import { FeedbackSidebar } from '../_components/FeedbackSidebar';
import { ScoreDisplay } from '../_components/ScoreDisplay';
import { LoadingOverlay } from '../_components/LoadingOverlay';
import { getUserRankedProgress, advanceUserProgress } from '@/lib/services/ranked-progress';
import { getPromptBySequence, getMaxSequenceNumber } from '@/lib/services/ranked-prompts';
import {
  createRankedSubmission,
  updateRankedSubmission,
  getSubmissionByUserAndPrompt,
} from '@/lib/services/ranked-submissions';
import type { GradeResponse } from '../_lib/grading';
import type { RankedPrompt, RankedSubmission } from '@/lib/types';

type Phase = 'loading' | 'prompt' | 'write' | 'feedback' | 'revise' | 'results' | 'completed' | 'already_submitted';

const WRITE_TIME = 7 * 60;
const REVISE_TIME = 2 * 60;

export default function RankedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [currentPrompt, setCurrentPrompt] = useState<RankedPrompt | null>(null);
  const [promptSequence, setPromptSequence] = useState(1);
  const [maxSequence, setMaxSequence] = useState(0);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalResponse, setOriginalResponse] = useState<GradeResponse | null>(null);
  const [response, setResponse] = useState<GradeResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<RankedSubmission | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);

  const fetchCurrentPrompt = useCallback(async () => {
    if (!user) return;

    setPhase('loading');
    setExistingSubmission(null);
    setSubmissionId(null);
    setIsAllComplete(false);

    try {
      const progress = await getUserRankedProgress(user.uid);
      const max = await getMaxSequenceNumber('paragraph');

      setPromptSequence(progress.currentPromptSequence);
      setMaxSequence(max);

      if (max === 0) {
        setCurrentPrompt(null);
        setPhase('completed');
        return;
      }

      if (progress.currentPromptSequence > max) {
        const lastPrompt = await getPromptBySequence(max, 'paragraph');
        if (lastPrompt) {
          const lastSubmission = await getSubmissionByUserAndPrompt(user.uid, lastPrompt.id);
          if (lastSubmission) {
            setCurrentPrompt(lastPrompt);
            setPromptSequence(max);
            setExistingSubmission(lastSubmission);
            setIsAllComplete(true);
            setPhase('already_submitted');
            return;
          }
        }
        setCurrentPrompt(null);
        setPhase('completed');
        return;
      }

      const prompt = await getPromptBySequence(progress.currentPromptSequence, 'paragraph');

      if (!prompt) {
        setCurrentPrompt(null);
        setPhase('completed');
        return;
      }

      setCurrentPrompt(prompt);

      const existing = await getSubmissionByUserAndPrompt(user.uid, prompt.id);
      if (existing) {
        setExistingSubmission(existing);
        setPhase('already_submitted');
      } else {
        setPhase('prompt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompt');
      setPhase('prompt');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/fantasy/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchCurrentPrompt();
    }
  }, [user, authLoading, fetchCurrentPrompt]);

  const handleBack = useCallback(() => {
    const hasUnsavedWork = phase === 'write' || phase === 'revise';
    if (hasUnsavedWork) {
      if (window.confirm('You have unsaved work. Are you sure you want to leave?')) {
        router.push('/fantasy/home');
      }
    } else {
      router.push('/fantasy/home');
    }
  }, [phase, router]);

  const beginWriting = useCallback(() => {
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setPhase('write');
  }, []);

  const getPromptText = (): string => {
    return currentPrompt?.promptText || '';
  };

  const submitWriting = useCallback(async () => {
    if (!content.trim() || !currentPrompt || !user) return;

    setIsGrading(true);
    setError(null);

    try {
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: getPromptText(),
          type: 'paragraph',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: GradeResponse = await res.json();

      const newSubmissionId = await createRankedSubmission(
        user.uid,
        currentPrompt.id,
        content,
        data.result.scores.percentage,
        data.result as unknown as Record<string, unknown>
      );
      setSubmissionId(newSubmissionId);

      setOriginalContent(content);
      setOriginalResponse(data);
      setResponse(data);
      setPhase('feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [content, currentPrompt, user]);

  const handleTimerComplete = useCallback(() => {
    if (!content.trim()) {
      setError(`Time's up! You need to write something to submit. Click "Start Over" to try again.`);
      return;
    }
    if (phase === 'write') {
      submitWriting();
    } else if (phase === 'revise') {
      submitRevision();
    }
  }, [content, phase]);

  const startRevision = useCallback(() => {
    setPhase('revise');
  }, []);

  const submitRevision = useCallback(async () => {
    if (!originalResponse || !content.trim() || !currentPrompt || !submissionId) return;

    setIsGrading(true);
    setError(null);

    try {
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: getPromptText(),
          type: 'paragraph',
          previousResult: originalResponse.result,
          previousContent: originalContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: GradeResponse = await res.json();

      await updateRankedSubmission(
        submissionId,
        content,
        data.result.scores.percentage,
        data.result as unknown as Record<string, unknown>
      );

      setResponse(data);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [content, originalResponse, originalContent, currentPrompt, submissionId]);

  const handleContinue = useCallback(async () => {
    if (!user || !currentPrompt) return;

    try {
      await advanceUserProgress(user.uid, currentPrompt.id);
      setContent('');
      setOriginalContent('');
      setOriginalResponse(null);
      setResponse(null);
      setError(null);
      await fetchCurrentPrompt();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue');
    }
  }, [user, currentPrompt, fetchCurrentPrompt]);

  const reset = useCallback(() => {
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setPhase('prompt');
  }, []);

  useEffect(() => {
    const handleFillEditor = () => {
      setContent('This is sample text filled by the debug menu for testing purposes. It contains enough content to submit and test the grading flow without having to type manually.');
    };

    const handleForceSubmit = () => {
      if (phase === 'write') {
        submitWriting();
      } else if (phase === 'revise') {
        submitRevision();
      }
    };

    const handleSkipToResults = () => {
      if (originalResponse && response) {
        setPhase('results');
      }
    };

    window.addEventListener('debug-fill-editor', handleFillEditor);
    window.addEventListener('debug-force-submit', handleForceSubmit);
    window.addEventListener('debug-skip-to-results', handleSkipToResults);

    return () => {
      window.removeEventListener('debug-fill-editor', handleFillEditor);
      window.removeEventListener('debug-force-submit', handleForceSubmit);
      window.removeEventListener('debug-skip-to-results', handleSkipToResults);
    };
  }, [phase, originalResponse, response, submitWriting, submitRevision]);

  if (authLoading || phase === 'loading') {
    return <LoadingState message="Preparing your challenge..." />;
  }

  if (!user) {
    return null;
  }

  const canSubmit = content.trim().length > 0 && !isGrading;
  const promptText = getPromptText();

  return (
    <div className="relative min-h-screen">
      {isGrading && <LoadingOverlay />}

      <Image
        src="/images/backgrounds/bg.webp"
        alt=""
        fill
        className="object-cover"
        priority
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="font-memento text-sm uppercase tracking-wider"
            style={{ color: 'rgba(245, 230, 184, 0.6)' }}
          >
            ← Back
          </button>
          {(phase === 'write' || phase === 'revise') && (
            <Timer
              key={phase}
              seconds={phase === 'write' ? WRITE_TIME : REVISE_TIME}
              onComplete={handleTimerComplete}
            />
          )}
          <div className="w-16" />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          {phase === 'completed' && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {maxSequence === 0 ? 'No Challenges Available' : 'All Challenges Complete!'}
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  {maxSequence === 0
                    ? 'Check back soon for new ranked challenges.'
                    : `You've completed all ${maxSequence} available challenges. More coming soon!`}
                </p>
              </div>

              <FantasyButton onClick={() => router.push('/fantasy/home')} size="large">
                Return Home
              </FantasyButton>
            </div>
          )}

          {phase === 'already_submitted' && existingSubmission && currentPrompt && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {isAllComplete ? 'All Challenges Complete!' : `Challenge ${promptSequence} Complete!`}
                </h1>
                {isAllComplete && (
                  <p
                    className="font-avenir text-lg"
                    style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                  >
                    You&apos;ve conquered all {maxSequence} challenge{maxSequence > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <ScoreDisplay
                percentage={existingSubmission.revisedScore ?? existingSubmission.originalScore}
                total={Math.round((existingSubmission.revisedScore ?? existingSubmission.originalScore) / 10)}
                max={10}
              />

              {existingSubmission.revisedScore !== undefined && existingSubmission.revisedScore !== existingSubmission.originalScore && (
                <div>
                  {existingSubmission.revisedScore > existingSubmission.originalScore ? (
                    <span className="font-avenir text-lg" style={{ color: '#4ade80' }}>
                      +{existingSubmission.revisedScore - existingSubmission.originalScore}% from revision!
                    </span>
                  ) : (
                    <span className="font-avenir text-sm" style={{ color: '#fbbf24' }}>
                      Original: {existingSubmission.originalScore}% → Revised: {existingSubmission.revisedScore}%
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-center gap-4">
                {!isAllComplete && promptSequence < maxSequence ? (
                  <>
                    <FantasyButton onClick={() => router.push('/fantasy/home')} variant="secondary">
                      Return Home
                    </FantasyButton>
                    <FantasyButton onClick={handleContinue} size="large">
                      Continue to Challenge {promptSequence + 1}
                    </FantasyButton>
                  </>
                ) : (
                  <FantasyButton onClick={() => router.push('/fantasy/home')} size="large">
                    Return Home
                  </FantasyButton>
                )}
              </div>
            </div>
          )}

          {phase === 'prompt' && !currentPrompt && error && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Something went wrong
                </h1>
                <p className="text-red-400">{error}</p>
              </div>
              <FantasyButton onClick={fetchCurrentPrompt} size="large">
                Try Again
              </FantasyButton>
            </div>
          )}

          {phase === 'prompt' && currentPrompt && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Challenge {promptSequence}
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  You have 7 minutes to write, then 2 minutes to revise
                </p>
              </div>

              <PromptCard prompt={promptText} />

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <FantasyButton onClick={beginWriting} size="large">
                Begin Writing
              </FantasyButton>
            </div>
          )}

          {phase === 'write' && currentPrompt && (
            <div className="w-full max-w-2xl space-y-6">
              <PromptCard prompt={promptText} />
              <WritingEditor
                value={content}
                onChange={setContent}
                placeholder="Begin your response..."
                showRequirements={false}
              />
              {error && (
                <div className="text-center space-y-4">
                  <div className="text-red-400 text-sm">{error}</div>
                  <FantasyButton onClick={reset} variant="secondary">
                    Start Over
                  </FantasyButton>
                </div>
              )}
              {!error && (
                <div className="flex justify-end">
                  <FantasyButton onClick={submitWriting} disabled={!canSubmit}>
                    {isGrading ? 'Grading...' : 'Submit Early'}
                  </FantasyButton>
                </div>
              )}
            </div>
          )}

          {phase === 'feedback' && response && currentPrompt && (
            <div className="w-full max-w-5xl space-y-6">
              <div className="text-center">
                <h2
                  className="font-dutch809 text-3xl mb-4"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Feedback
                </h2>
                <ScoreDisplay
                  percentage={response.result.scores.percentage}
                  total={response.result.scores.total}
                  max={response.result.scores.maxTotal}
                />
              </div>

              <FeedbackDisplay result={response.result} content={originalContent} />

              <div className="flex justify-center gap-4">
                <FantasyButton onClick={reset} variant="secondary">
                  Start Over
                </FantasyButton>
                <FantasyButton onClick={startRevision} size="large">
                  Revise Your Work
                </FantasyButton>
              </div>
            </div>
          )}

          {phase === 'revise' && originalResponse && currentPrompt && (
            <div className="w-full max-w-5xl">
              <div className="mb-4">
                <PromptCard prompt={promptText} />
              </div>
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <WritingEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Revise your response..."
                    showRequirements={false}
                  />
                  {error && (
                    <div className="text-center space-y-4">
                      <div className="text-red-400 text-sm">{error}</div>
                      <FantasyButton onClick={reset} variant="secondary">
                        Start Over
                      </FantasyButton>
                    </div>
                  )}
                  {!error && (
                    <div className="flex justify-end">
                      <FantasyButton onClick={submitRevision} disabled={!canSubmit}>
                        {isGrading ? 'Grading...' : 'Submit Revision'}
                      </FantasyButton>
                    </div>
                  )}
                </div>
                <div className="w-72 shrink-0">
                  <FeedbackSidebar result={originalResponse.result} />
                </div>
              </div>
            </div>
          )}

          {phase === 'results' && response && originalResponse && currentPrompt && (
            <div className="w-full max-w-5xl space-y-6">
              <div className="text-center">
                <h2
                  className="font-dutch809 text-3xl mb-4"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Challenge {promptSequence} Complete!
                </h2>
                <ScoreDisplay
                  percentage={response.result.scores.percentage}
                  total={response.result.scores.total}
                  max={response.result.scores.maxTotal}
                />

                {originalResponse.result.scores.percentage !== response.result.scores.percentage && (
                  <div className="mt-4">
                    {response.result.scores.percentage > originalResponse.result.scores.percentage ? (
                      <span className="font-avenir text-lg" style={{ color: '#4ade80' }}>
                        +{response.result.scores.percentage - originalResponse.result.scores.percentage}% from revision!
                      </span>
                    ) : (
                      <span className="font-avenir text-sm" style={{ color: '#fbbf24' }}>
                        Original: {originalResponse.result.scores.percentage}% → Revised: {response.result.scores.percentage}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              <FeedbackDisplay result={response.result} content={content} />

              <div className="flex justify-center gap-4">
                <FantasyButton onClick={() => router.push('/fantasy/home')} variant="secondary">
                  Return Home
                </FantasyButton>
                {promptSequence < maxSequence && (
                  <FantasyButton onClick={handleContinue} size="large">
                    Continue to Challenge {promptSequence + 1}
                  </FantasyButton>
                )}
                {promptSequence >= maxSequence && (
                  <FantasyButton onClick={handleContinue} size="large">
                    Finish
                  </FantasyButton>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
