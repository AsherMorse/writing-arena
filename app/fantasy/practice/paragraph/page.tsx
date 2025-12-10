/**
 * @fileoverview Paragraph practice page with parchment-styled fantasy UI.
 * Allows users to practice writing with customizable topics or prompts.
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FantasyButton } from '@/components/fantasy';
import { Timer } from '../../_components/Timer';
import { WritingEditor } from '../../_components/WritingEditor';
import { PromptCard } from '../../_components/PromptCard';
import { 
  FeedbackDisplay,
  FeedbackProvider,
  WritingCard,
  ExpandableScoreBreakdown,
} from '../../_components/FeedbackDisplay';
import { FeedbackSidebar } from '../../_components/FeedbackSidebar';
import { LoadingOverlay } from '../../_components/LoadingOverlay';
import { TopicCloud } from '../../_components/TopicCloud';
import { ParchmentCard } from '../../_components/ParchmentCard';
import { ParchmentButton } from '../../_components/ParchmentButton';
import { HintsCard } from '../../_components/HintsCard';
import { getParchmentTextStyle } from '../../_components/parchment-styles';
import { getRandomTopics, getRandomTopic, type PracticeTopic } from '../../_lib/practice-topics';
import {
  createPracticeSubmission,
  updatePracticeSubmission,
} from '@/lib/services/practice-submissions';
import { RecommendedLessons } from '../../_components/RecommendedLessons';
import type { GradeResponse } from '../../_lib/grading';

type Phase = 'prompt' | 'write' | 'feedback' | 'revise' | 'results';

const WRITE_TIME = 7 * 60;
const REVISE_TIME = 2 * 60;
const MIN_TOPIC_LENGTH = 3;
const MAX_TOPIC_LENGTH = 20;

/** Default hints shown during writing */
const DEFAULT_HINTS = [
  'Think about cause and effect',
  'Expand on several benefits',
  'Use specific examples',
];

export default function ParagraphPracticePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [displayedTopics, setDisplayedTopics] = useState<PracticeTopic[]>(() => getRandomTopics(9));
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalResponse, setOriginalResponse] = useState<GradeResponse | null>(null);
  const [response, setResponse] = useState<GradeResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

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
        body: JSON.stringify({ topic }),
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
      setPhase('write');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [customTopic]);

  const getPromptText = (): string => {
    if (selectedTopic) return selectedTopic.prompt;
    return generatedPrompt || `Write a paragraph about: ${customTopic.trim()}`;
  };

  const submitWriting = useCallback(async () => {
    if (!selectedTopic && !customTopic.trim()) return;
    if (!content.trim()) return;

    setIsGrading(true);
    setError(null);

    const gapTrackingId = crypto.randomUUID();

    try {
      const promptText = getPromptText();
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: promptText,
          type: 'paragraph',
          userId: user?.uid,
          submissionId: gapTrackingId,
          source: 'practice',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: GradeResponse = await res.json();

      if (user) {
        const topic = selectedTopic?.label || customTopic.trim();
        const newSubmissionId = await createPracticeSubmission(
          user.uid,
          'paragraph',
          topic,
          promptText,
          content,
          data.result.scores.percentage,
          data.result as unknown as Record<string, unknown>
        );
        setSubmissionId(newSubmissionId);
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
  }, [selectedTopic, customTopic, content, user]);

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
    if ((!selectedTopic && !customTopic.trim()) || !originalResponse) return;
    if (!content.trim()) return;

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
          userId: user?.uid,
          submissionId: gapTrackingId,
          source: 'practice',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: GradeResponse = await res.json();

      if (submissionId) {
        await updatePracticeSubmission(
          submissionId,
          content,
          data.result.scores.percentage,
          data.result as unknown as Record<string, unknown>
        );
      }

      setResponse(data);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [selectedTopic, customTopic, content, originalResponse, originalContent, submissionId, user]);

  const reset = useCallback(() => {
    setPhase('prompt');
    setDisplayedTopics(getRandomTopics(9));
    setSelectedTopic(null);
    setCustomTopic('');
    setGeneratedPrompt(null);
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setSubmissionId(null);
  }, []);

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
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Minimal header for back button */}
        <header className="p-4">
          <button
            onClick={handleBack}
            className="font-memento text-sm uppercase tracking-wider"
            style={{ color: 'rgba(245, 230, 184, 0.6)' }}
          >
            ← Back
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          {/* Topic Selection Phase */}
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
                      placeholder="Choose your own adventure..."
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

          {/* Writing Phase - Parchment Style */}
          {phase === 'write' && (
            <div className="w-full max-w-4xl space-y-4">
              {/* Header row: Title (left) + Timer (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Daily Challenge
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-48 shrink-0">
                  <Timer
                    key={phase}
                    seconds={WRITE_TIME}
                    onComplete={handleTimerComplete}
                    parchmentStyle
                    className="h-full"
                  />
                </div>
              </div>

              {/* Two column layout */}
              <div className="flex gap-4">
                {/* Left column: Prompt, Editor */}
                <div className="flex-1 space-y-4">
                  <PromptCard prompt={getPromptText()} />

                  <WritingEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Begin your response..."
                    showRequirements={false}
                  />

                  {error && (
                    <div className="text-center space-y-4">
                      <div className="text-red-400 text-sm">{error}</div>
                      <ParchmentButton onClick={reset}>
                        Start Over
                      </ParchmentButton>
                    </div>
                  )}
                </div>

                {/* Right column: Hints, Submit */}
                <div className="w-48 space-y-4 flex flex-col">
                  <HintsCard hints={DEFAULT_HINTS} />

                  <div className="mt-auto">
                    {!error && (
                      <ParchmentButton onClick={submitWriting} disabled={!canSubmit} className="w-full">
                        {isGrading ? 'Grading...' : 'Submit'}
                      </ParchmentButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Phase */}
          {phase === 'feedback' && response && (
            <div className="w-full max-w-5xl space-y-4">
              {/* Header row: Title (left) + Score (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Feedback
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-80 shrink-0">
                  <ParchmentCard className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-4xl"
                        style={getParchmentTextStyle()}
                      >
                        {response.result.scores.percentage}%
                      </div>
                      <div className="font-avenir text-xs" style={getParchmentTextStyle()}>
                        {response.result.scores.total}/{response.result.scores.maxTotal} points
                      </div>
                    </div>
                  </ParchmentCard>
                </div>
              </div>

              {/* Two column layout - constrained height so buttons stay anchored */}
              <FeedbackProvider>
                <div className="flex gap-4 max-h-[calc(100vh-250px)]">
                  {/* Left column: Your Writing + Practice Recommended */}
                  <div className="flex-1 space-y-4 parchment-scrollbar">
                    <WritingCard content={originalContent} />
                    
                    {response.prioritizedLessons.length > 0 && (
                      <RecommendedLessons
                        lessons={response.prioritizedLessons}
                        hasSevereGap={response.hasSevereGap}
                        maxDisplay={3}
                        showPracticeButton={false}
                      />
                    )}
                  </div>

                  {/* Right column: Expandable Score Breakdown (scrollable) */}
                  <div className="w-80 shrink-0 parchment-scrollbar">
                    <ExpandableScoreBreakdown 
                      scores={response.result.scores} 
                      remarks={response.result.remarks} 
                    />
                  </div>
                </div>
              </FeedbackProvider>

              <div className="flex justify-center gap-4">
                <ParchmentButton onClick={reset}>
                  Start Over
                </ParchmentButton>
                {response.prioritizedLessons.length > 0 && (
                  <ParchmentButton onClick={() => router.push('/improve/activities')}>
                    Practice
                  </ParchmentButton>
                )}
                <ParchmentButton onClick={startRevision} variant="golden">
                  Revise Your Work
                </ParchmentButton>
              </div>
            </div>
          )}

          {/* Revision Phase */}
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
                    showRequirements={false}
                  />
                  {error && (
                    <div className="text-center space-y-4">
                      <div className="text-red-400 text-sm">{error}</div>
                      <ParchmentButton onClick={reset}>
                        Start Over
                      </ParchmentButton>
                    </div>
                  )}
                  {!error && (
                    <div className="flex justify-end">
                      <ParchmentButton onClick={submitRevision} disabled={!canSubmit}>
                        {isGrading ? 'Grading...' : 'Submit Revision'}
                      </ParchmentButton>
                    </div>
                  )}
                </div>
                <div className="w-72 shrink-0 space-y-4">
                  <Timer
                    key={phase}
                    seconds={REVISE_TIME}
                    onComplete={handleTimerComplete}
                    parchmentStyle
                  />
                  <FeedbackSidebar result={originalResponse.result} />
                </div>
              </div>
            </div>
          )}

          {/* Results Phase */}
          {phase === 'results' && response && originalResponse && (
            <div className="w-full max-w-5xl space-y-4">
              {/* Header row: Title (left) + Score (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Complete!
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-80 shrink-0">
                  <ParchmentCard className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-4xl"
                        style={getParchmentTextStyle()}
                      >
                        {response.result.scores.percentage}%
                      </div>
                      <div className="font-avenir text-xs" style={getParchmentTextStyle()}>
                        {response.result.scores.total}/{response.result.scores.maxTotal} points
                      </div>
                      {originalResponse.result.scores.percentage !== response.result.scores.percentage && (
                        <div className="mt-1">
                          {response.result.scores.percentage > originalResponse.result.scores.percentage ? (
                            <span className="font-avenir text-xs" style={{ color: '#16a34a' }}>
                              +{response.result.scores.percentage - originalResponse.result.scores.percentage}%
                            </span>
                          ) : (
                            <span className="font-avenir text-xs" style={{ color: '#d97706' }}>
                              {originalResponse.result.scores.percentage}% → {response.result.scores.percentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </ParchmentCard>
                </div>
              </div>

              {/* Two column layout - constrained height so buttons stay anchored */}
              <FeedbackProvider>
                <div className="flex gap-4 max-h-[calc(100vh-250px)]">
                  {/* Left column: Your Writing */}
                  <div className="flex-1 overflow-y-auto parchment-scrollbar">
                    <WritingCard content={content} />
                  </div>

                  {/* Right column: Expandable Score Breakdown (scrollable) */}
                  <div className="w-80 shrink-0 overflow-y-auto parchment-scrollbar">
                    <ExpandableScoreBreakdown 
                      scores={response.result.scores} 
                      remarks={response.result.remarks} 
                    />
                  </div>
                </div>
              </FeedbackProvider>

              <div className="flex justify-center gap-4">
                <ParchmentButton onClick={reset}>
                  Practice Again
                </ParchmentButton>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
