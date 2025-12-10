'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReviewItem, ReviewExample } from '@/lib/constants/practice-examples';
import { ParchmentCard } from './ParchmentCard';
import { ParchmentButton } from './ParchmentButton';
import { getParchmentTextStyle } from './parchment-styles';

interface FantasyReviewPhaseProps {
  reviewItems: ReviewItem[];
  onComplete: (feedback: ReviewFeedback[]) => void;
}

interface ReviewFeedback {
  exampleIndex: number;
  userSaidCorrect: boolean;
  actuallyCorrect: boolean;
  isAccurate: boolean;
}

export function FantasyReviewPhase({
  reviewItems,
  onComplete,
}: FantasyReviewPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<ReviewFeedback[]>([]);
  const [showResult, setShowResult] = useState(false);

  const currentItem = reviewItems[currentIndex];
  const isLastItem = currentIndex === reviewItems.length - 1;
  
  const exampleItems = reviewItems.filter(item => item.type === 'example');
  const currentExampleIndex = reviewItems
    .slice(0, currentIndex + 1)
    .filter(item => item.type === 'example').length;
  const hasAnsweredCurrent = currentItem?.type === 'example' && 
    feedback.some(f => f.exampleIndex === currentIndex);

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

  function handleNext() {
    setShowResult(false);
    if (isLastItem) {
      onComplete(feedback);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }

  const isTutorialOrInstruction = currentItem?.type === 'tutorial' || currentItem?.type === 'instruction';
  const progressPercent = ((currentIndex + (hasAnsweredCurrent || isTutorialOrInstruction ? 1 : 0)) / reviewItems.length) * 100;

  function getStatusText() {
    if (currentItem?.type === 'tutorial') return 'Learning the concept...';
    if (currentItem?.type === 'instruction') return 'Learning the concept...';
    return `Example ${currentExampleIndex} of ${exampleItems.length}`;
  }

  if (currentItem?.type === 'tutorial') {
    return (
      <ParchmentCard>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📜</span>
          <span className="font-memento text-sm uppercase tracking-wider" style={getParchmentTextStyle()}>
            {currentItem.lessonName}
          </span>
        </div>
        <div className="tutorial-content">
          <MarkdownRenderer content={currentItem.content} />
        </div>
        <div className="mt-6">
          <ParchmentButton onClick={handleNext} variant="golden" className="w-full">
            Got it!
          </ParchmentButton>
        </div>
      </ParchmentCard>
    );
  }

  return (
    <div className="space-y-6">
      <ParchmentCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span 
              className="rounded-full px-3 py-1 text-xs font-memento uppercase tracking-wider"
              style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#8b7355' }}
            >
              Review Phase
            </span>
            <span className="font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, background: '#c9a84c' }}
          />
        </div>
      </ParchmentCard>

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

      {currentItem?.type === 'example' && (
        <ParchmentCard variant="light">
          <div className="flex items-start gap-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
            <span style={{ color: '#c9a84c' }}>💡</span>
            <span>Look for logical connections, proper grammar, and whether the response makes sense in context.</span>
          </div>
        </ParchmentCard>
      )}
    </div>
  );
}

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
    <ParchmentCard>
      <div className="flex items-center gap-2" style={{ color: '#8b7355' }}>
        <span className="text-lg">📚</span>
        <span className="font-memento text-sm uppercase tracking-wider">
          {title}
        </span>
      </div>

      <div 
        className="mt-4 rounded-lg p-4"
        style={{ background: 'rgba(0,0,0,0.05)' }}
      >
        <p className="font-avenir text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(45, 45, 45, 0.8)' }}>
          {content}
        </p>
      </div>

      {tip && (
        <div className="mt-4 flex items-start gap-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
          <span style={{ color: '#c9a84c' }}>💡</span>
          <span>{tip}</span>
        </div>
      )}

      <div className="mt-6">
        <ParchmentButton onClick={onNext} variant="golden" className="w-full">
          {isLast ? 'Start Writing' : 'Got it!'}
        </ParchmentButton>
      </div>
    </ParchmentCard>
  );
}

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
    <ParchmentCard>
      <div className="font-memento text-xs uppercase tracking-wider" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
        Example to Evaluate
      </div>

      <div 
        className="mt-4 rounded-lg p-4"
        style={{ background: 'rgba(0,0,0,0.05)' }}
      >
        <div className="font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>Question:</div>
        <p className="mt-1 font-avenir text-sm whitespace-pre-line" style={getParchmentTextStyle()}>{example.question}</p>
      </div>

      <div 
        className="mt-4 rounded-lg p-4"
        style={{ background: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.3)' }}
      >
        <div className="font-avenir text-xs" style={{ color: '#8b7355' }}>Answer:</div>
        <p className="mt-1 font-avenir text-base font-medium whitespace-pre-line" style={getParchmentTextStyle()}>
          {example.answer}
        </p>
      </div>

      {!showResult ? (
        <div className="mt-6">
          <p className="mb-4 text-center font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.6)' }}>
            Is this response correct?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => onAssessment(true)}
              className="flex-1 rounded-lg py-3 font-memento text-sm uppercase tracking-wider transition hover:brightness-105"
              style={{ 
                background: 'rgba(42, 93, 58, 0.15)', 
                border: '1px solid rgba(42, 93, 58, 0.3)',
                color: '#2a5d3a'
              }}
            >
              ✓ Yes, correct
            </button>
            <button
              onClick={() => onAssessment(false)}
              className="flex-1 rounded-lg py-3 font-memento text-sm uppercase tracking-wider transition hover:brightness-105"
              style={{ 
                background: 'rgba(139, 69, 19, 0.15)', 
                border: '1px solid rgba(139, 69, 19, 0.3)',
                color: '#8b4513'
              }}
            >
              ✗ No, issue
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className="rounded-lg p-4"
            style={{
              background: lastFeedback?.isAccurate ? 'rgba(42, 93, 58, 0.1)' : 'rgba(201, 168, 76, 0.15)',
              border: `1px solid ${lastFeedback?.isAccurate ? 'rgba(42, 93, 58, 0.3)' : 'rgba(201, 168, 76, 0.4)'}`,
            }}
          >
            <div
              className="flex items-center gap-2 font-memento text-sm uppercase tracking-wider"
              style={{ color: lastFeedback?.isAccurate ? '#2a5d3a' : '#8b7355' }}
            >
              <span>{lastFeedback?.isAccurate ? '✓' : '✗'}</span>
              <span>
                {lastFeedback?.isAccurate ? 'Correct assessment!' : 'Not quite right'}
              </span>
            </div>
            <p className="mt-2 font-avenir text-sm" style={{ color: 'rgba(45, 45, 45, 0.7)' }}>
              This example was{' '}
              <span style={{ color: example.isCorrect ? '#2a5d3a' : '#8b4513', fontWeight: 500 }}>
                {example.isCorrect ? 'correct' : 'incorrect'}
              </span>.
            </p>
            <p className="mt-2 font-avenir text-xs" style={{ color: 'rgba(45, 45, 45, 0.5)' }}>
              {example.explanation}
            </p>
          </div>

          <div className="mt-4">
            <ParchmentButton onClick={onNext} variant="golden" className="w-full">
              {isLast ? 'Start Writing' : 'Next'}
            </ParchmentButton>
          </div>
        </div>
      )}
    </ParchmentCard>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const processedContent = useMemo(() => {
    return content.replace(/\{\{\s*\w+\s*\}\}/g, '');
  }, [content]);

  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="font-memento text-xl uppercase tracking-wider mt-6 mb-3 first:mt-0" style={getParchmentTextStyle()}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-memento text-lg uppercase tracking-wider mt-5 mb-2" style={getParchmentTextStyle()}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-memento text-base uppercase tracking-wider mt-4 mb-2" style={getParchmentTextStyle()}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="font-avenir text-sm leading-relaxed mb-3" style={{ color: 'rgba(45, 45, 45, 0.8)' }}>
            {children}
          </p>
        ),
        blockquote: ({ children }) => (
          <blockquote 
            className="my-4 rounded-lg p-4"
            style={{ background: 'rgba(201, 168, 76, 0.15)', borderLeft: '3px solid #c9a84c' }}
          >
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 space-y-2 font-avenir text-sm mb-3" style={{ color: 'rgba(45, 45, 45, 0.8)' }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 space-y-2 font-avenir text-sm mb-3" style={{ color: 'rgba(45, 45, 45, 0.8)' }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="font-avenir text-sm pl-1" style={{ color: 'rgba(45, 45, 45, 0.8)' }}>
            {children}
          </li>
        ),
        code: ({ children }) => (
          <code 
            className="rounded px-1.5 py-0.5 font-avenir text-xs"
            style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#8b7355' }}
          >
            {children}
          </code>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold" style={getParchmentTextStyle()}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic" style={{ color: 'rgba(45, 45, 45, 0.9)' }}>
            {children}
          </em>
        ),
        hr: () => (
          <hr className="my-4" style={{ borderColor: 'rgba(45, 45, 45, 0.2)' }} />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
