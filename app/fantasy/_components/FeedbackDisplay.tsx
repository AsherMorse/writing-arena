'use client';

import { useState } from 'react';
import type { GraderResult, GraderRemark } from '../_lib/grading';

interface FeedbackDisplayProps {
  result: GraderResult;
  content?: string;
}

function ScoreBar({ label, score, maxScore }: { label: string; score: number; maxScore: number }) {
  const pct = (score / maxScore) * 100;
  const color = pct >= 80 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center gap-3">
      <span className="font-memento text-xs w-28 shrink-0" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full"
        style={{ background: 'rgba(201, 168, 76, 0.2)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-memento text-xs w-8 text-right" style={{ color }}>
        {score}/{maxScore}
      </span>
    </div>
  );
}

interface RemarkCardProps {
  remark: GraderRemark;
  onHover: (remark: GraderRemark | null) => void;
}

function RemarkCard({ remark, onHover }: RemarkCardProps) {
  const isError = remark.severity === 'error';
  const borderColor = isError ? 'rgba(248, 113, 113, 0.4)' : 'rgba(251, 191, 36, 0.4)';
  const labelColor = isError ? '#f87171' : '#fbbf24';
  const labelText = isError ? 'Issue' : 'Suggestion';

  return (
    <div
      className="rounded-md p-4 cursor-pointer transition-all"
      style={{
        background: 'rgba(26, 18, 8, 0.8)',
        border: `1px solid ${borderColor}`,
      }}
      onMouseEnter={() => onHover(remark)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="font-memento text-xs uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: labelColor,
            background: `${labelColor}15`,
          }}
        >
          {labelText}
        </span>
        <span className="font-memento text-xs" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
          {remark.category}
        </span>
      </div>
      <p className="font-avenir text-sm mb-2" style={{ color: '#f5e6b8' }}>
        {remark.concreteProblem}
      </p>
      <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
        {remark.callToAction}
      </p>
      {remark.substringOfInterest && (
        <div
          className="mt-3 p-2 rounded text-xs font-mono"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'rgba(245, 230, 184, 0.6)',
            borderLeft: `2px solid ${labelColor}`,
          }}
        >
          "{remark.substringOfInterest}"
        </div>
      )}
    </div>
  );
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/—/g, '-')
    .replace(/–/g, '-');
}

function HighlightedText({ content, highlightText, highlightColor }: { 
  content: string; 
  highlightText?: string; 
  highlightColor?: string;
}) {
  if (!highlightText || !highlightColor) {
    return <>{content}</>;
  }

  const normalizedContent = normalizeText(content);
  const normalizedHighlight = normalizeText(highlightText);
  const index = normalizedContent.indexOf(normalizedHighlight);

  if (index === -1) {
    return <>{content}</>;
  }

  const before = content.slice(0, index);
  const match = content.slice(index, index + highlightText.length);
  const after = content.slice(index + highlightText.length);

  return (
    <>
      {before}
      <span
        className="rounded transition-all"
        style={{
          background: `${highlightColor}30`,
          boxShadow: `0 2px 0 ${highlightColor}`,
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

export function FeedbackDisplay({ result, content }: FeedbackDisplayProps) {
  const { scores, remarks } = result;
  const [hoveredRemark, setHoveredRemark] = useState<GraderRemark | null>(null);

  const highlightText = hoveredRemark?.substringOfInterest;
  const highlightColor = hoveredRemark 
    ? (hoveredRemark.severity === 'error' ? '#f87171' : '#fbbf24')
    : undefined;

  const feedbackContent = (
    <div className="space-y-4">
      <div
        className="rounded-md p-4"
        style={{
          background: 'rgba(26, 18, 8, 0.8)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-3 font-memento"
          style={{ color: '#c9a84c' }}
        >
          Score Breakdown
        </div>
        <div className="space-y-2">
          <ScoreBar label="Topic Sentence" score={scores.topicSentence} maxScore={5} />
          <ScoreBar label="Details" score={scores.detailSentences} maxScore={5} />
          <ScoreBar label="Conclusion" score={scores.concludingSentence} maxScore={5} />
          <ScoreBar label="Conventions" score={scores.conventions} maxScore={5} />
        </div>
      </div>

      {remarks.length > 0 && (
        <div className="space-y-3">
          <div
            className="text-xs uppercase tracking-widest font-memento"
            style={{ color: '#c9a84c' }}
          >
            Feedback ({remarks.length})
          </div>
          {remarks.map((remark, i) => (
            <RemarkCard key={i} remark={remark} onHover={setHoveredRemark} />
          ))}
        </div>
      )}

      {remarks.length === 0 && (
        <div
          className="rounded-md p-4 text-center"
          style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
          }}
        >
          <span className="font-avenir text-sm" style={{ color: '#4ade80' }}>
            Excellent work! No issues found.
          </span>
        </div>
      )}
    </div>
  );

  if (!content) {
    return feedbackContent;
  }

  return (
    <div className="flex gap-6">
      <div
        className="flex-1 rounded-md p-4"
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
          <HighlightedText 
            content={content} 
            highlightText={highlightText} 
            highlightColor={highlightColor} 
          />
        </p>
      </div>
      <div className="flex-1">
        {feedbackContent}
      </div>
    </div>
  );
}

