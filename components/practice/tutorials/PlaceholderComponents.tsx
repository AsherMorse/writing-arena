/**
 * @fileoverview Shared styled components for tutorial placeholders.
 * These are presentational components used to display examples in tutorials.
 */

import { ReactNode } from 'react';

interface ExampleBlockProps {
  children: ReactNode;
  label?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

/**
 * @description Styled block for displaying examples in tutorials.
 */
export function ExampleBlock({ children, label, variant = 'default' }: ExampleBlockProps) {
  const variantStyles = {
    default: 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]',
    primary: 'border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)]',
    success: 'border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.08)]',
    warning: 'border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.08)]',
  };

  return (
    <div className={`my-4 rounded-lg border p-4 ${variantStyles[variant]}`}>
      {label && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
          {label}
        </div>
      )}
      <div className="text-sm leading-relaxed text-[rgba(255,255,255,0.9)]">
        {children}
      </div>
    </div>
  );
}

interface SentenceBlockProps {
  children: ReactNode;
  highlight?: boolean;
}

/**
 * @description Styled block for displaying sentences.
 */
export function SentenceBlock({ children, highlight = false }: SentenceBlockProps) {
  return (
    <div
      className={`my-2 rounded-md px-3 py-2 text-sm font-medium ${
        highlight
          ? 'bg-[rgba(0,229,229,0.15)] text-[#00e5e5]'
          : 'bg-[rgba(255,255,255,0.08)] text-white'
      }`}
    >
      {children}
    </div>
  );
}

interface QuestionAnswerBlockProps {
  question: string;
  answer?: string;
  context?: string;
}

/**
 * @description Styled Q&A block for examples.
 */
export function QuestionAnswerBlock({ question, answer, context }: QuestionAnswerBlockProps) {
  return (
    <ExampleBlock variant="primary" label="Example">
      {context && (
        <div className="mb-3 text-xs text-[rgba(255,255,255,0.6)]">
          {context}
        </div>
      )}
      <div className="mb-2">
        <span className="font-semibold text-[#00e5e5]">Question: </span>
        <span>{question}</span>
      </div>
      {answer && (
        <div>
          <span className="font-semibold text-[#00e5e5]">Answer: </span>
          <span>{answer}</span>
        </div>
      )}
    </ExampleBlock>
  );
}

interface TwoColumnCompareProps {
  left: { label: string; content: ReactNode };
  right: { label: string; content: ReactNode };
}

/**
 * @description Two-column comparison block.
 */
export function TwoColumnCompare({ left, right }: TwoColumnCompareProps) {
  return (
    <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <ExampleBlock label={left.label} variant="warning">
        {left.content}
      </ExampleBlock>
      <ExampleBlock label={right.label} variant="success">
        {right.content}
      </ExampleBlock>
    </div>
  );
}
