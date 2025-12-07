'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FantasyButton } from '@/components/fantasy';
import { Timer } from '../_components/Timer';
import { WritingEditor, MIN_WORDS, getWordCount } from '../_components/WritingEditor';
import { PromptCard } from '../_components/PromptCard';
import { FeedbackDisplay } from '../_components/FeedbackDisplay';
import { FeedbackSidebar } from '../_components/FeedbackSidebar';
import { ScoreDisplay } from '../_components/ScoreDisplay';
import { LoadingOverlay } from '../_components/LoadingOverlay';
import { TopicCloud } from '../_components/TopicCloud';
import { PRACTICE_TOPICS, getRandomTopic, type PracticeTopic } from '../_lib/practice-topics';
import type { GradeResponse } from '../_lib/grading';

type Phase = 'prompt' | 'write' | 'feedback' | 'revise' | 'results';

const WRITE_TIME = 7 * 60;
const REVISE_TIME = 2 * 60;

export default function PracticePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalResponse, setOriginalResponse] = useState<GradeResponse | null>(null);
  const [response, setResponse] = useState<GradeResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);

  useEffect(() => {
    setHasUnsavedWork(phase === 'write' || phase === 'revise');
  }, [phase, content]);

  const handleBack = useCallback(() => {
    if (hasUnsavedWork) {
      if (window.confirm('You have unsaved work. Are you sure you want to leave?')) {
        router.push('/fantasy');
      }
    } else {
      router.push('/fantasy');
    }
  }, [hasUnsavedWork, router]);

  const handleTopicSelect = useCallback((topic: PracticeTopic) => {
    setSelectedTopic(topic);
    setCustomTopic('');
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setPhase('write');
  }, []);

  const handleSurpriseMe = useCallback(() => {
    handleTopicSelect(getRandomTopic());
  }, [handleTopicSelect]);

  const startWriting = useCallback(() => {
    if (!customTopic.trim()) {
      setError('Please enter a topic first.');
      return;
    }
    setSelectedTopic(null);
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setPhase('write');
  }, [customTopic]);

  const getPromptText = (): string => {
    if (selectedTopic) {
      return selectedTopic.prompt;
    }
    return `Write a paragraph about: ${customTopic.trim()}`;
  };

  const hasValidTopic = selectedTopic || customTopic.trim();

  const submitWriting = useCallback(async () => {
    if (!selectedTopic && !customTopic.trim()) return;

    const wordCount = getWordCount(content);
    if (wordCount < MIN_WORDS) {
      setError(`Please write at least ${MIN_WORDS} words (currently ${wordCount}).`);
      return;
    }

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
      setOriginalContent(content);
      setOriginalResponse(data);
      setResponse(data);
      setPhase('feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [selectedTopic, customTopic, content]);

  const handleTimerComplete = useCallback(() => {
    const wordCount = getWordCount(content);
    if (wordCount < MIN_WORDS) {
      setError(`Time's up! You need at least ${MIN_WORDS} words to submit. Click "Start Over" to try again.`);
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
    if ((!selectedTopic && !customTopic.trim()) || !originalResponse) return;

    const wordCount = getWordCount(content);
    if (wordCount < MIN_WORDS) {
      setError(`Please write at least ${MIN_WORDS} words (currently ${wordCount}).`);
      return;
    }

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
      setResponse(data);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [selectedTopic, customTopic, content, originalResponse, originalContent]);

  const reset = useCallback(() => {
    setPhase('prompt');
    setSelectedTopic(null);
    setCustomTopic('');
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
  }, []);

  const wordCount = getWordCount(content);
  const canSubmit = wordCount >= MIN_WORDS && !isGrading;

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
          {phase === 'prompt' && (
            <div className="w-full max-w-2xl">
              <div className="text-center space-y-8">
                <div>
                  <h1
                    className="font-dutch809 text-4xl mb-2"
                    style={{
                      color: '#f6d493',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    Choose Your Quest
                  </h1>
                  <p
                    className="font-avenir text-lg"
                    style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                  >
                    Pick a topic or create your own
                  </p>
                </div>

                <TopicCloud
                  topics={PRACTICE_TOPICS}
                  onSelect={handleTopicSelect}
                  disabled={isGrading}
                />

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px" style={{ background: 'rgba(201, 168, 76, 0.3)' }} />
                  <span className="font-memento text-xs uppercase tracking-widest" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
                    or
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(201, 168, 76, 0.3)' }} />
                </div>

                <div
                  className="rounded-md p-5"
                  style={{
                    background: 'rgba(26, 18, 8, 0.8)',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                  }}
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                        setError(null);
                      }}
                      placeholder="Choose your own adventure..."
                      className="flex-1 px-4 py-3 rounded-md font-avenir text-base outline-none"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(201, 168, 76, 0.2)',
                        color: '#f5e6b8',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customTopic.trim()) {
                          startWriting();
                        }
                      }}
                    />
                    <FantasyButton
                      onClick={startWriting}
                      disabled={!customTopic.trim()}
                    >
                      Go
                    </FantasyButton>
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>

                <button
                  onClick={handleSurpriseMe}
                  className="font-avenir text-sm transition-all hover:underline"
                  style={{ color: 'rgba(245, 230, 184, 0.6)' }}
                >
                  ✦ Surprise me with a random topic
                </button>
              </div>
            </div>
          )}

          {phase === 'write' && (
            <div className="w-full max-w-2xl space-y-6">
              <PromptCard prompt={getPromptText()} />
              <WritingEditor
                value={content}
                onChange={setContent}
                placeholder="Begin your response..."
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

          {phase === 'feedback' && response && (
            <div className="w-full max-w-2xl space-y-6">
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

              <div
                className="rounded-md p-4"
                style={{
                  background: 'rgba(26, 18, 8, 0.8)',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-2 font-memento"
                  style={{ color: '#c9a84c' }}
                >
                  Your Writing
                </div>
                <p className="text-sm font-avenir whitespace-pre-wrap" style={{ color: 'rgba(245, 230, 184, 0.8)' }}>
                  {originalContent}
                </p>
              </div>

              <FeedbackDisplay result={response.result} />

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

          {phase === 'revise' && originalResponse && (
            <div className="w-full max-w-5xl">
              <div className="mb-4">
                <PromptCard prompt={getPromptText()} />
              </div>
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <WritingEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Revise your response..."
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

          {phase === 'results' && response && originalResponse && (
            <div className="w-full max-w-2xl space-y-6">
              <div className="text-center">
                <h2
                  className="font-dutch809 text-3xl mb-4"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Complete!
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

              <FeedbackDisplay result={response.result} />

              <div className="flex justify-center gap-4">
                <FantasyButton onClick={reset} size="large">
                  Practice Again
                </FantasyButton>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
