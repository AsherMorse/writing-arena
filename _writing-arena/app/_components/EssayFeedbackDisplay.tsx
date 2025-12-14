'use client';

import { useState } from 'react';
import { ESSAY_CRITERIA, HIGHLIGHTABLE_CRITERIA } from '@/app/_lib/essay-grader-config';
import type { EssayGraderResult, CriterionStatus, EssayCriterionResult } from '@/app/_lib/grading';

interface EssayFeedbackDisplayProps {
  result: EssayGraderResult;
  content?: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/—/g, '-')
    .replace(/–/g, '-');
}

function MultiHighlightText({ 
  content, 
  highlights, 
  highlightColor 
}: { 
  content: string; 
  highlights: string[]; 
  highlightColor: string;
}) {
  if (!highlights.length) {
    return <>{content}</>;
  }

  const normalizedContent = normalizeText(content);
  
  const ranges: Array<{ start: number; end: number }> = [];
  for (const highlight of highlights) {
    const normalizedHighlight = normalizeText(highlight);
    let searchStart = 0;
    let index: number;
    while ((index = normalizedContent.indexOf(normalizedHighlight, searchStart)) !== -1) {
      ranges.push({ start: index, end: index + highlight.length });
      searchStart = index + 1;
    }
  }

  if (ranges.length === 0) {
    return <>{content}</>;
  }

  ranges.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    if (merged.length === 0 || merged[merged.length - 1].end < range.start) {
      merged.push({ ...range });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, range.end);
    }
  }

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;
  for (let i = 0; i < merged.length; i++) {
    const { start, end } = merged[i];
    if (start > lastEnd) {
      parts.push(content.slice(lastEnd, start));
    }
    parts.push(
      <span
        key={i}
        className="rounded transition-all"
        style={{
          background: `${highlightColor}30`,
          boxShadow: `0 2px 0 ${highlightColor}`,
        }}
      >
        {content.slice(start, end)}
      </span>
    );
    lastEnd = end;
  }
  if (lastEnd < content.length) {
    parts.push(content.slice(lastEnd));
  }

  return <>{parts}</>;
}

function StatusBadge({ status }: { status: CriterionStatus }) {
  const config = {
    yes: { label: 'Yes', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
    developing: { label: 'Developing', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
    no: { label: 'No', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  }[status];

  return (
    <span
      className="font-memento text-xs uppercase tracking-wider px-2 py-1 rounded"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  );
}

function CriterionRow({ 
  name, 
  description, 
  status, 
  feedback,
  criterionId,
  onHover,
}: { 
  name: string; 
  description: string; 
  status: CriterionStatus; 
  feedback: string;
  criterionId: string;
  onHover: (criterionId: string | null) => void;
}) {
  const isHighlightable = HIGHLIGHTABLE_CRITERIA.includes(criterionId);
  return (
    <div
      className={`p-3 rounded-md transition-all ${isHighlightable ? 'cursor-pointer hover:border-[rgba(201,168,76,0.4)]' : ''}`}
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(201, 168, 76, 0.1)',
      }}
      onMouseEnter={() => isHighlightable && onHover(criterionId)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-memento text-sm" style={{ color: '#f5e6b8' }}>
          {name}
        </span>
        <StatusBadge status={status} />
      </div>
      <p className="font-avenir text-xs mb-2" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
        {description}
      </p>
      {feedback && (
        <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.8)' }}>
          {feedback}
        </p>
      )}
    </div>
  );
}

interface ScoreSummaryProps {
  scores: EssayGraderResult['scores'];
  onHover: (criterionId: string | null) => void;
}

const SCORE_TO_CRITERION: Record<string, string> = {
  'Thesis': 'thesis',
  'Topic Sentences': 'topicSentences',
  'Supporting Details': 'supportingDetails',
  'Unity': 'unity',
  'Transitions': 'transitions',
  'Conclusion': 'conclusion',
  'Sentence Variety': 'sentenceStrategies',
  'Conventions': 'conventions',
  'Paragraph Count': 'paragraphCount',
};

function ScoreSummary({ scores, onHover }: ScoreSummaryProps) {
  const categories = [
    { label: 'Thesis', value: scores.thesis },
    { label: 'Topic Sentences', value: scores.topicSentences },
    { label: 'Supporting Details', value: scores.supportingDetails },
    { label: 'Unity', value: scores.unity },
    { label: 'Transitions', value: scores.transitions },
    { label: 'Conclusion', value: scores.conclusion },
    { label: 'Sentence Variety', value: scores.sentenceStrategies },
    { label: 'Conventions', value: scores.conventions },
    { label: 'Paragraph Count', value: scores.paragraphCount },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map(({ label, value }) => {
        const pct = value * 100;
        const color = pct >= 75 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171';
        const criterionId = SCORE_TO_CRITERION[label];
        const isHighlightable = HIGHLIGHTABLE_CRITERIA.includes(criterionId);
        return (
          <div
            key={label}
            className={`p-2 rounded text-center transition-all ${isHighlightable ? 'cursor-pointer hover:scale-105' : ''}`}
            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            onMouseEnter={() => isHighlightable && onHover(criterionId)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="font-memento text-xs mb-1" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
              {label}
            </div>
            <div className="font-dutch809 text-lg" style={{ color }}>
              {value === 1 ? '✓' : value === 0.5 ? '~' : '✗'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EssayFeedbackDisplay({ result, content }: EssayFeedbackDisplayProps) {
  const { criteria, scores, paragraphCount } = result;
  const [hoveredCriterion, setHoveredCriterion] = useState<string | null>(null);

  const criteriaMap = new Map(criteria.map(c => [c.criterionId, c]));

  const hoveredResult = hoveredCriterion ? criteriaMap.get(hoveredCriterion) : null;
  const highlights = hoveredResult?.highlights || [];
  const highlightColor = hoveredResult 
    ? (hoveredResult.status === 'yes' ? '#4ade80' : hoveredResult.status === 'developing' ? '#fbbf24' : '#f87171')
    : '#4ade80';

  const feedbackContent = (
    <div className="space-y-4">
      <div
        className="rounded-md p-4"
        style={{
          background: 'rgba(26, 18, 8, 0.8)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs uppercase tracking-widest font-memento"
            style={{ color: '#c9a84c' }}
          >
            Score Overview
          </span>
          <span className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
            {paragraphCount} paragraphs
          </span>
        </div>
        <ScoreSummary scores={scores} onHover={setHoveredCriterion} />
      </div>

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
          Criteria Feedback
        </div>
        <div className="space-y-2">
          {ESSAY_CRITERIA.map((criterion) => {
            const criterionResult = criteriaMap.get(criterion.id);
            return (
              <CriterionRow
                key={criterion.id}
                criterionId={criterion.id}
                name={criterion.name}
                description={criterion.description}
                status={criterionResult?.status || 'no'}
                feedback={criterionResult?.feedback || ''}
                onHover={setHoveredCriterion}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!content) {
    return feedbackContent;
  }

  return (
    <div className="flex gap-6">
      <div
        className="flex-1 rounded-md p-4 max-h-[500px] overflow-y-auto"
        style={{
          background: 'rgba(26, 18, 8, 0.8)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-2 font-memento"
          style={{ color: '#c9a84c' }}
        >
          Your Essay
        </div>
        <div className="font-avenir text-sm whitespace-pre-wrap" style={{ color: 'rgba(245, 230, 184, 0.8)' }}>
          <MultiHighlightText 
            content={content} 
            highlights={highlights} 
            highlightColor={highlightColor} 
          />
        </div>
      </div>
      <div className="flex-1 max-h-[500px] overflow-y-auto">
        {feedbackContent}
      </div>
    </div>
  );
}
