/**
 * @fileoverview Review phase component for practice sessions.
 * Now the FIRST phase - students see instruction cards and evaluate examples.
 * Implements the "I Do" part of "I Do, We Do, You Do" pedagogy.
 */

'use client';

import { useState } from 'react';
import { ReviewItem, ReviewExample } from '@/lib/constants/practice-examples';

interface PracticeReviewPhaseProps {
  /** Sequence of instruction cards and examples to show */
  reviewItems: ReviewItem[];
  /** Callback when review phase is complete */
  onComplete: (feedback: ReviewFeedback[]) => void;
  /** Time remaining in seconds */
  timeRemaining: number;
}

interface ReviewFeedback {
  exampleIndex: number;
  userSaidCorrect: boolean;
  actuallyCorrect: boolean;
  isAccurate: boolean;
}

/**
 * @description Review phase component with instruction cards and example evaluation.
 * Students learn the concept first, then evaluate AI examples.
 */
export function PracticeReviewPhase({
  reviewItems,
  onComplete,
  timeRemaining,
}: PracticeReviewPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<ReviewFeedback[]>([]);
  const [showResult, setShowResult] = useState(false);

  const currentItem = reviewItems[currentIndex];
  const isLastItem = currentIndex === reviewItems.length - 1;
  
  // Count examples for progress tracking
  const exampleItems = reviewItems.filter(item => item.type === 'example');
  const currentExampleIndex = reviewItems
    .slice(0, currentIndex + 1)
    .filter(item => item.type === 'example').length;
  const hasAnsweredCurrent = currentItem?.type === 'example' && 
    feedback.some(f => f.exampleIndex === currentIndex);

  /**
   * @description Handle user's assessment of an example.
   */
  function handleAssessment(userSaidCorrect: boolean) {
    if (currentItem?.type !== 'example') return;
    
    const example = currentItem.example;
    const isAccurate = userSaidCorrect === example.isCorrect;
    const newFeedback: ReviewFeedback = {
      exampleIndex: currentIndex,
      userSaidCorrect,
      actuallyCorrect: example.isCorrect,
      isAccurate,
    };

    setFeedback(prev => [...prev, newFeedback]);
    setShowResult(true);
  }

  /**
   * @description Move to next item or complete review.
   */
  function handleNext() {
    setShowResult(false);
    if (isLastItem) {
      onComplete(feedback);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }

  /**
   * @description Format seconds as MM:SS.
   */
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Calculate progress percentage
  const progressPercent = ((currentIndex + (hasAnsweredCurrent || currentItem?.type === 'instruction' ? 1 : 0)) / reviewItems.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[rgba(255,144,48,0.15)] px-3 py-1 text-xs font-medium text-[#ff9030]">
            Phase 1: Review
          </span>
          <span className="text-sm text-[rgba(255,255,255,0.5)]">
            {currentItem?.type === 'instruction' 
              ? 'Learning the concept...'
              : `Example ${currentExampleIndex} of ${exampleItems.length}`
            }
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[rgba(255,255,255,0.4)]">⏱️</span>
          <span className="font-mono text-[#ff9030]">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]">
        <div
          className="h-full rounded-full bg-[#ff9030] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Render based on item type */}
      {currentItem?.type === 'instruction' ? (
        <InstructionCard
          title={currentItem.title}
          content={currentItem.content}
          tip={currentItem.tip}
          onNext={handleNext}
          isLast={isLastItem}
        />
      ) : currentItem?.type === 'example' ? (
        <ExampleCard
          example={currentItem.example}
          showResult={showResult}
          lastFeedback={feedback[feedback.length - 1]}
          onAssessment={handleAssessment}
          onNext={handleNext}
          isLast={isLastItem}
        />
      ) : null}

      {/* Tips - only show during examples */}
      {currentItem?.type === 'example' && (
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4 text-xs text-[rgba(255,255,255,0.5)]">
          <span className="text-[rgba(255,255,255,0.4)]">💡 Tip:</span> Look for logical connections,
          proper grammar, and whether the response makes sense in context.
        </div>
      )}
    </div>
  );
}

/**
 * @description Instruction card component for teaching the concept.
 */
function InstructionCard({
  title,
  content,
  tip,
  onNext,
  isLast,
}: {
  title: string;
  content: string;
  tip?: string;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#ff9030]">
        <span className="text-lg">📚</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>

      {/* Content */}
      <div className="mt-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
        <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.8)] whitespace-pre-line">
          {content}
        </p>
      </div>

      {/* Tip */}
      {tip && (
        <div className="mt-4 flex items-start gap-2 text-xs text-[rgba(255,255,255,0.5)]">
          <span className="text-[#00e5e5]">💡</span>
          <span>{tip}</span>
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={onNext}
        className="mt-6 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
      >
        {isLast ? 'Start Writing' : 'Got it!'}
      </button>
    </div>
  );
}

/**
 * @description Example card component for evaluating AI responses.
 */
function ExampleCard({
  example,
  showResult,
  lastFeedback,
  onAssessment,
  onNext,
  isLast,
}: {
  example: ReviewExample;
  showResult: boolean;
  lastFeedback?: ReviewFeedback;
  onAssessment: (userSaidCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
          AI Response to Evaluate
        </div>

        {/* Question */}
        <div className="mt-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
          <div className="text-xs text-[rgba(255,255,255,0.4)]">Prompt:</div>
        <p className="mt-1 text-sm text-white">{example.question}</p>
        </div>

        {/* AI Answer */}
        <div className="mt-4 rounded-[10px] border border-[rgba(0,229,229,0.15)] bg-[rgba(0,229,229,0.05)] p-4">
          <div className="text-xs text-[#00e5e5]">AI Answer:</div>
          <p className="mt-1 text-base font-medium text-white">
          &quot;{example.answer}&quot;
          </p>
        </div>

        {/* Assessment Buttons or Result */}
        {!showResult ? (
          <div className="mt-6">
            <p className="mb-4 text-center text-sm text-[rgba(255,255,255,0.6)]">
              Is this response correct?
            </p>
            <div className="flex gap-4">
              <button
              onClick={() => onAssessment(true)}
                className="flex-1 rounded-[10px] border border-[rgba(0,212,146,0.3)] bg-[rgba(0,212,146,0.1)] py-3 text-sm font-medium text-[#00d492] transition hover:bg-[rgba(0,212,146,0.2)]"
              >
                ✓ Yes, it&apos;s correct
              </button>
              <button
              onClick={() => onAssessment(false)}
                className="flex-1 rounded-[10px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.1)] py-3 text-sm font-medium text-[#ff5f8f] transition hover:bg-[rgba(255,95,143,0.2)]"
              >
                ✗ No, there&apos;s an issue
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {/* Result Feedback */}
            <div
              className={`rounded-[10px] border p-4 ${
              lastFeedback?.isAccurate
                  ? 'border-[rgba(0,212,146,0.3)] bg-[rgba(0,212,146,0.1)]'
                  : 'border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.1)]'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                lastFeedback?.isAccurate ? 'text-[#00d492]' : 'text-[#ff9030]'
                }`}
              >
              <span>{lastFeedback?.isAccurate ? '✓' : '✗'}</span>
                <span>
                {lastFeedback?.isAccurate
                    ? 'Correct assessment!'
                    : 'Not quite right'}
                </span>
              </div>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
                This example was{' '}
                <span
                  className={
                  example.isCorrect ? 'font-medium text-[#00d492]' : 'font-medium text-[#ff5f8f]'
                  }
                >
                {example.isCorrect ? 'correct' : 'incorrect'}
                </span>
                .
              </p>
              <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">
              {example.explanation}
              </p>
            </div>

            {/* Next Button */}
            <button
            onClick={onNext}
              className="mt-4 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
            >
            {isLast ? 'Start Writing' : 'Next'}
            </button>
          </div>
        )}
    </div>
  );
}
