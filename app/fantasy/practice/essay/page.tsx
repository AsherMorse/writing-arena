'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FantasyButton } from '@/components/fantasy';
import { Timer } from '../../_components/Timer';
import { WritingEditor } from '../../_components/WritingEditor';
import { PromptCard } from '../../_components/PromptCard';
import { EssayFeedbackDisplay } from '../../_components/EssayFeedbackDisplay';
import { EssayFeedbackSidebar } from '../../_components/EssayFeedbackSidebar';
import { ScoreDisplay } from '../../_components/ScoreDisplay';
import { LoadingOverlay } from '../../_components/LoadingOverlay';
import { TopicCloud } from '../../_components/TopicCloud';
import { FantasyAccordion } from '../../_components/FantasyAccordion';
import { getRandomEssayTopics, getRandomEssayTopic, type EssayTopic } from '../../_lib/essay-topics';
import type { EssayGradeResponse } from '../../_lib/grading';

type Phase = 'prompt' | 'write' | 'feedback' | 'revise' | 'results';

const WRITE_TIME = 10 * 60;
const REVISE_TIME = 3 * 60;
const MIN_TOPIC_LENGTH = 3;
const MAX_TOPIC_LENGTH = 30;

export default function EssayPracticePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [displayedTopics, setDisplayedTopics] = useState<EssayTopic[]>(() => getRandomEssayTopics(6));
  const [selectedTopic, setSelectedTopic] = useState<EssayTopic | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalResponse, setOriginalResponse] = useState<EssayGradeResponse | null>(null);
  const [response, setResponse] = useState<EssayGradeResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  /** Which accordion panel is currently open */
  const [openPanel, setOpenPanel] = useState<'hints' | 'fixes' | null>(null);
  /** Generated background info for inspiration */
  const [inspirationContent, setInspirationContent] = useState<string | null>(null);
  /** Loading state for inspiration generation */
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);

  useEffect(() => {
    setHasUnsavedWork(phase === 'write' || phase === 'revise');
  }, [phase, content]);

  const handleBack = useCallback(() => {
    if (hasUnsavedWork) {
      if (window.confirm('You have unsaved work. Are you sure you want to leave?')) {
        router.push('/fantasy/practice');
      }
    } else {
      router.push('/fantasy/practice');
    }
  }, [hasUnsavedWork, router]);

  const handleTopicSelect = useCallback((topic: EssayTopic) => {
    setSelectedTopic(topic);
    setCustomTopic('');
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setOpenPanel(null);
    setInspirationContent(null);
    setPhase('write');
  }, []);

  const handleSurpriseMe = useCallback(() => {
    handleTopicSelect(getRandomEssayTopic());
  }, [handleTopicSelect]);

  const startWriting = useCallback(async () => {
    const topic = customTopic.trim();
    if (!topic) {
      setError('Please enter a topic first.');
      return;
    }
    if (topic.length < MIN_TOPIC_LENGTH) {
      setError(`Topic must be at least ${MIN_TOPIC_LENGTH} characters.`);
      return;
    }

    setIsGeneratingPrompt(true);
    setError(null);

    try {
      const res = await fetch('/fantasy/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type: 'essay' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate prompt');
      }

      const data = await res.json();
      setGeneratedPrompt(data.prompt);
      setSelectedTopic(null);
      setContent('');
      setOriginalContent('');
      setOriginalResponse(null);
      setResponse(null);
      setOpenPanel(null);
      setInspirationContent(null);
      setPhase('write');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [customTopic]);

  const getPromptText = (): string => {
    if (selectedTopic) {
      return selectedTopic.prompt;
    }
    return generatedPrompt || `Write an essay about: ${customTopic.trim()}`;
  };

  const submitWriting = useCallback(async () => {
    if (!selectedTopic && !customTopic.trim()) return;
    if (!content.trim()) return;

    setIsGrading(true);
    setError(null);

    try {
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: getPromptText(),
          type: 'essay',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: EssayGradeResponse = await res.json();
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
    setOpenPanel('fixes'); // Things to Fix expanded by default
  }, []);

  const submitRevision = useCallback(async () => {
    if ((!selectedTopic && !customTopic.trim()) || !originalResponse) return;
    if (!content.trim()) return;

    setIsGrading(true);
    setError(null);

    try {
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: getPromptText(),
          type: 'essay',
          previousResult: originalResponse.result,
          previousContent: originalContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: EssayGradeResponse = await res.json();
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
    setDisplayedTopics(getRandomEssayTopics(6));
    setSelectedTopic(null);
    setCustomTopic('');
    setGeneratedPrompt(null);
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setOpenPanel(null);
    setInspirationContent(null);
  }, []);

  /** Fetch inspiration content when accordion is opened */
  const fetchInspiration = useCallback(async (promptText: string) => {
    if (inspirationContent || isLoadingInspiration) return;
    if (!promptText) return;
    
    setIsLoadingInspiration(true);
    try {
      const res = await fetch('/fantasy/api/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setInspirationContent(data.backgroundInfo);
      }
    } catch (err) {
      console.error('Failed to fetch inspiration:', err);
    } finally {
      setIsLoadingInspiration(false);
    }
  }, [inspirationContent, isLoadingInspiration]);

  /** Handle opening the inspiration accordion */
  const handleInspirationToggle = useCallback(() => {
    const isOpening = openPanel !== 'hints';
    setOpenPanel(prev => prev === 'hints' ? null : 'hints');
    if (isOpening) {
      fetchInspiration(getPromptText());
    }
  }, [openPanel, fetchInspiration, selectedTopic, generatedPrompt, customTopic]);

  const canSubmit = content.trim().length > 0 && !isGrading;

  return (
    <div className="relative min-h-screen">
      {isGrading && <LoadingOverlay />}

      <Image
        src="/images/backgrounds/practice.webp"
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
                    Essay Challenge
                  </h1>
                  <p
                    className="font-avenir text-lg"
                    style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                  >
                    Write a multi-paragraph essay (4+ paragraphs)
                  </p>
                </div>

                <TopicCloud
                  topics={displayedTopics}
                  onSelect={handleTopicSelect}
                  disabled={isGrading || isGeneratingPrompt}
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
                        const value = e.target.value;
                        if (value.length <= MAX_TOPIC_LENGTH) {
                          setCustomTopic(value);
                          setError(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
                        if (!/^[a-zA-Z0-9]$/.test(e.key) && e.key !== ' ' && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                        if (e.key === 'Enter' && customTopic.trim().length >= MIN_TOPIC_LENGTH) {
                          startWriting();
                        }
                      }}
                      onPaste={(e) => e.preventDefault()}
                      placeholder="Choose your own topic..."
                      className="flex-1 px-4 py-3 rounded-md font-avenir text-base outline-none"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(201, 168, 76, 0.2)',
                        color: '#f5e6b8',
                      }}
                      disabled={isGeneratingPrompt}
                      maxLength={MAX_TOPIC_LENGTH}
                    />
                    <FantasyButton
                      onClick={startWriting}
                      disabled={customTopic.trim().length < MIN_TOPIC_LENGTH || isGeneratingPrompt}
                    >
                      {isGeneratingPrompt ? '...' : 'Go'}
                    </FantasyButton>
                  </div>
                  <div className="flex justify-between mt-2 text-xs" style={{ color: 'rgba(245, 230, 184, 0.4)' }}>
                    <span>{customTopic.length}/{MAX_TOPIC_LENGTH}</span>
                    {customTopic.length > 0 && customTopic.length < MIN_TOPIC_LENGTH && (
                      <span style={{ color: '#fbbf24' }}>Min {MIN_TOPIC_LENGTH} characters</span>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>

                <button
                  onClick={handleSurpriseMe}
                  disabled={isGeneratingPrompt}
                  className="font-avenir text-sm transition-all hover:underline disabled:opacity-50"
                  style={{ color: 'rgba(245, 230, 184, 0.6)' }}
                >
                  ✦ Surprise me with a random topic
                </button>
              </div>
            </div>
          )}

          {phase === 'write' && (
            <div className="w-full max-w-3xl space-y-6">
              <PromptCard prompt={getPromptText()} />
              
              {/* Inspiration accordion */}
              <FantasyAccordion
                title="Get Inspiration"
                isOpen={openPanel === 'hints'}
                onToggle={handleInspirationToggle}
                maxHeight="200px"
              >
                {isLoadingInspiration ? (
                  <p className="font-avenir text-sm italic" style={{ opacity: 0.7 }}>
                    Loading background info...
                  </p>
                ) : inspirationContent ? (
                  <p className="font-avenir text-sm leading-relaxed">
                    {inspirationContent}
                  </p>
                ) : (
                  <p className="font-avenir text-sm italic" style={{ opacity: 0.7 }}>
                    Click to load topic information...
                  </p>
                )}
              </FantasyAccordion>

              <WritingEditor
                value={content}
                onChange={setContent}
                placeholder="Begin your essay with an introduction that includes your thesis statement..."
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

          {phase === 'feedback' && response && (
            <div className="w-full max-w-6xl space-y-6">
              <div className="text-center">
                <h2
                  className="font-dutch809 text-3xl mb-4"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Essay Feedback
                </h2>
                <ScoreDisplay
                  percentage={response.result.scores.percentage}
                  total={response.result.scores.total}
                  max={response.result.scores.maxTotal}
                />
              </div>

              <EssayFeedbackDisplay result={response.result} content={originalContent} />

              <div className="flex justify-center gap-4">
                <FantasyButton onClick={reset} variant="secondary">
                  Start Over
                </FantasyButton>
                <FantasyButton onClick={startRevision} size="large">
                  Revise Your Essay
                </FantasyButton>
              </div>
            </div>
          )}

          {phase === 'revise' && originalResponse && (
            <div className="w-full max-w-6xl">
              <div className="mb-4">
                <PromptCard prompt={getPromptText()} />
              </div>
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <WritingEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Revise your essay..."
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
                <div className="w-80 shrink-0">
                  <EssayFeedbackSidebar result={originalResponse.result} />
                </div>
              </div>
            </div>
          )}

          {phase === 'results' && response && originalResponse && (
            <div className="w-full max-w-6xl space-y-6">
              <div className="text-center">
                <h2
                  className="font-dutch809 text-3xl mb-4"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Essay Complete!
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

              <EssayFeedbackDisplay result={response.result} content={content} />

              <div className="flex justify-center gap-4">
                <FantasyButton onClick={reset} size="large">
                  Write Another Essay
                </FantasyButton>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
