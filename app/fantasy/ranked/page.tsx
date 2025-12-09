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
import { Leaderboard } from '../_components/Leaderboard';
import { RecommendedLessons } from '../_components/RecommendedLessons';
import { getTodaysPrompt, formatDateString } from '@/lib/services/ranked-prompts';
import { getDebugDate, setDebugPromptId } from '@/lib/utils/debug-date';
import {
  createRankedSubmission,
  updateRankedSubmission,
  getSubmissionByUserAndPrompt,
} from '@/lib/services/ranked-submissions';
import { checkBlockStatus, updateSkillGaps } from '@/lib/services/skill-gap-tracker';
import { getLessonDisplayName } from '@/lib/constants/lesson-display-names';
import type { GradeResponse } from '../_lib/grading';
import type { RankedPrompt, RankedSubmission, BlockCheckResult } from '@/lib/types';

type Phase = 'loading' | 'prompt' | 'write' | 'feedback' | 'revise' | 'results' | 'no_prompt' | 'already_submitted' | 'blocked';

const WRITE_TIME = 7 * 60;
const REVISE_TIME = 2 * 60;

export default function RankedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [currentPrompt, setCurrentPrompt] = useState<RankedPrompt | null>(null);
  const [todayString, setTodayString] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalResponse, setOriginalResponse] = useState<GradeResponse | null>(null);
  const [response, setResponse] = useState<GradeResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<RankedSubmission | null>(null);
  const [blockStatus, setBlockStatus] = useState<BlockCheckResult | null>(null);

  const fetchTodaysPrompt = useCallback(async () => {
    if (!user) return;

    setPhase('loading');
    setExistingSubmission(null);
    setSubmissionId(null);
    setBlockStatus(null);

    try {
      const today = getDebugDate();
      setTodayString(formatDateString(today));

      const prompt = await getTodaysPrompt('paragraph');

      if (!prompt) {
        setCurrentPrompt(null);
        setPhase('no_prompt');
        return;
      }

      setCurrentPrompt(prompt);

      const existing = await getSubmissionByUserAndPrompt(user.uid, prompt.id);
      if (existing) {
        setExistingSubmission(existing);
        setPhase('already_submitted');
        return;
      }

      // Check if user is blocked from ranked
      const blockResult = await checkBlockStatus(user.uid);
      if (blockResult.blocked) {
        setBlockStatus(blockResult);
        setPhase('blocked');
        return;
      }

      // Store warnings for display (optional)
      if (blockResult.warnings?.length) {
        setBlockStatus(blockResult);
      }

      setPhase('prompt');
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
    if (currentPrompt) {
      setDebugPromptId(currentPrompt.id);
    }
    return () => {
      setDebugPromptId(undefined);
    };
  }, [currentPrompt]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTodaysPrompt();
    }
  }, [user, authLoading, fetchTodaysPrompt]);

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

    // Generate a unique ID for gap tracking (will be used as reference)
    const gapTrackingId = crypto.randomUUID();

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

      // Track skill gaps client-side (has auth context)
      if (data.gaps.length > 0) {
        try {
          await updateSkillGaps(user.uid, data.gaps, 'ranked', gapTrackingId);
        } catch (gapErr) {
          console.error('Failed to track skill gaps:', gapErr);
        }
      }

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

  const submitRevision = useCallback(async () => {
    if (!originalResponse || !content.trim() || !currentPrompt || !submissionId || !user) return;

    setIsGrading(true);
    setError(null);

    const gapTrackingId = crypto.randomUUID();

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

      if (data.gaps.length > 0) {
        try {
          await updateSkillGaps(user.uid, data.gaps, 'ranked', gapTrackingId);
        } catch (gapErr) {
          console.error('Failed to track skill gaps:', gapErr);
        }
      }

      setResponse(data);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [content, originalResponse, originalContent, currentPrompt, submissionId, user]);

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
  }, [content, phase, submitWriting, submitRevision]);

  const startRevision = useCallback(() => {
    setPhase('revise');
  }, []);

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
          {phase === 'no_prompt' && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  No Challenge Today
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  Check back tomorrow for a new daily challenge!
                </p>
                {todayString && (
                  <p
                    className="font-avenir text-sm mt-2"
                    style={{ color: 'rgba(245, 230, 184, 0.4)' }}
                  >
                    Date: {todayString}
                  </p>
                )}
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
                  Today&apos;s Challenge Complete!
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  Come back tomorrow for a new challenge
                </p>
              </div>

              <ScoreDisplay
                percentage={existingSubmission.revisedScore ?? existingSubmission.originalScore}
                total={((existingSubmission.revisedFeedback ?? existingSubmission.originalFeedback) as { scores?: { total?: number } })?.scores?.total ?? Math.round((existingSubmission.revisedScore ?? existingSubmission.originalScore) / 10)}
                max={((existingSubmission.revisedFeedback ?? existingSubmission.originalFeedback) as { scores?: { maxTotal?: number } })?.scores?.maxTotal ?? 10}
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

              <Leaderboard promptId={currentPrompt.id} userId={user?.uid} />

              <FantasyButton onClick={() => router.push('/fantasy/home')} size="large">
                Return Home
              </FantasyButton>
            </div>
          )}

          {phase === 'blocked' && blockStatus && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Practice Required
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  {blockStatus.reason === 'high_severity'
                    ? 'A critical skill gap needs attention before continuing ranked challenges.'
                    : 'Persistent skill gaps have been detected. Complete the recommended lessons to unlock ranked mode.'}
                </p>
              </div>

              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(245, 230, 184, 0.2)',
                }}
              >
                <h3
                  className="font-memento text-sm uppercase tracking-wider mb-4"
                  style={{ color: 'rgba(245, 230, 184, 0.6)' }}
                >
                  Skills to Improve
                </h3>
                <div className="space-y-2">
                  {blockStatus.blockingGaps.map((gap) => (
                    <div
                      key={gap}
                      className="font-avenir text-base"
                      style={{ color: '#fbbf24' }}
                    >
                      • {gap}
                    </div>
                  ))}
                </div>
              </div>

              {blockStatus.requiredLessons.length > 0 && (
                <div
                  className="rounded-lg p-6"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(245, 230, 184, 0.2)',
                  }}
                >
                  <h3
                    className="font-memento text-sm uppercase tracking-wider mb-4"
                    style={{ color: 'rgba(245, 230, 184, 0.6)' }}
                  >
                    Required Lessons
                  </h3>
                  <div className="space-y-2">
                    {blockStatus.requiredLessons.slice(0, 5).map((lesson) => (
                      <div
                        key={lesson}
                        className="font-avenir text-base"
                        style={{ color: 'rgba(245, 230, 184, 0.9)' }}
                      >
                        • {getLessonDisplayName(lesson)}
                      </div>
                    ))}
                    {blockStatus.requiredLessons.length > 5 && (
                      <div
                        className="font-avenir text-sm"
                        style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                      >
                        +{blockStatus.requiredLessons.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <FantasyButton onClick={() => router.push('/fantasy/home')} variant="secondary">
                  Return Home
                </FantasyButton>
                <FantasyButton onClick={() => router.push('/improve/activities')} size="large">
                  Go to Practice
                </FantasyButton>
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
              <FantasyButton onClick={fetchTodaysPrompt} size="large">
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
                  Daily Challenge
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  You have 7 minutes to write, then 2 minutes to revise
                </p>
              </div>

              {/* Warning banner for approaching block threshold */}
              {blockStatus?.warnings && blockStatus.warnings.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                  }}
                >
                  <p
                    className="font-avenir text-sm"
                    style={{ color: '#fbbf24' }}
                  >
                    ⚠️ You&apos;re approaching the limit for: {blockStatus.warnings.join(', ')}. 
                    Consider practicing these skills to avoid being blocked.
                  </p>
                </div>
              )}

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

              {/* Show recommended lessons if there are gaps */}
              {response.prioritizedLessons.length > 0 && (
                <RecommendedLessons
                  lessons={response.prioritizedLessons}
                  hasSevereGap={response.hasSevereGap}
                  maxDisplay={3}
                />
              )}

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
                  Daily Challenge Complete!
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

              <Leaderboard promptId={currentPrompt.id} userId={user?.uid} />

              <FantasyButton onClick={() => router.push('/fantasy/home')} size="large">
                Return Home
              </FantasyButton>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
