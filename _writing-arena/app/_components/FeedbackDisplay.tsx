/**
 * @fileoverview Feedback display components with parchment styling.
 * Shows expandable score breakdown with feedback remarks nested under categories.
 */
'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { ParchmentCard, ParchmentCardWithLine } from './ParchmentCard';
import { getParchmentTextStyle } from './parchment-styles';
import type { GraderResult, GraderRemark } from '@/app/_lib/grading';

/**
 * @description Formats a camelCase or PascalCase string into readable text with spaces.
 */
function formatCategory(category: string): string {
  return category
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * @description Maps score keys to display labels.
 */
const SCORE_CATEGORIES = [
  { key: 'topicSentence', label: 'Topic Sentence' },
  { key: 'detailSentences', label: 'Details' },
  { key: 'concludingSentence', label: 'Conclusion' },
  { key: 'conventions', label: 'Conventions' },
] as const;

/** Context for sharing hover state between components */
const HoverContext = createContext<{
  hoveredRemark: GraderRemark | null;
  setHoveredRemark: (remark: GraderRemark | null) => void;
}>({ hoveredRemark: null, setHoveredRemark: () => {} });

/** Maps score keys to expected remark category names from the grader */
const CATEGORY_MAP: Record<string, string> = {
  topicsentence: 'topic sentence',
  detailsentences: 'details',
  concludingsentence: 'conclusion',
  conventions: 'conventions',
};

/**
 * @description Get remarks that match a score category using exact matching.
 */
function getRemarksForCategory(remarks: GraderRemark[], categoryKey: string): GraderRemark[] {
  const expectedCategory = CATEGORY_MAP[categoryKey.toLowerCase()];
  if (!expectedCategory) return [];
  return remarks.filter(r => r.category.toLowerCase() === expectedCategory);
}

interface ExpandableScoreRowProps {
  label: string;
  score: number;
  maxScore: number;
  remarks: GraderRemark[];
}

/**
 * @description Single expandable score row with nested feedback remarks.
 */
function ExpandableScoreRow({ label, score, maxScore, remarks }: ExpandableScoreRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setHoveredRemark } = useContext(HoverContext);
  const pct = (score / maxScore) * 100;
  const color = pct >= 80 ? '#15803d' : pct >= 60 ? '#b45309' : '#b91c1c';
  const textStyle = getParchmentTextStyle();
  const hasRemarks = remarks.length > 0;

  return (
    <div>
      {/* Score row - clickable if has remarks */}
      <button
        onClick={() => hasRemarks && setIsExpanded(!isExpanded)}
        disabled={!hasRemarks}
        className={`w-full flex items-center gap-2 py-2 px-2 ${hasRemarks ? 'cursor-pointer hover:bg-[rgba(139,99,52,0.1)] rounded-md' : 'cursor-default'}`}
      >
        <span className="font-memento text-sm w-24 shrink-0 text-left" style={textStyle}>
          {label}
        </span>
        <div
          className="flex-1 h-2 rounded-full min-w-[60px]"
          style={{ background: 'rgba(139, 99, 52, 0.3)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="font-memento text-xs w-7 text-right shrink-0" style={{ ...textStyle, color }}>
          {score}/{maxScore}
        </span>
        {hasRemarks && (
          <span 
            className="text-xs transition-transform w-4 shrink-0"
            style={{ ...textStyle, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        )}
        {!hasRemarks && <span className="w-4 shrink-0" />}
      </button>

      {/* Expanded feedback remarks */}
      {isExpanded && hasRemarks && (
        <div className="mt-2 mb-3 space-y-2">
          {remarks.map((remark, i) => {
            const isPerfectScore = score === maxScore;
            const isError = remark.severity === 'error';
            
            // Determine label and color based on score and severity
            let labelColor: string;
            let labelText: string;
            if (isPerfectScore) {
              labelColor = '#15803d'; // green
              labelText = 'Strength';
            } else if (isError) {
              labelColor = '#b91c1c'; // red
              labelText = 'Issue';
            } else {
              labelColor = '#b45309'; // amber
              labelText = 'Suggestion';
            }

            return (
              <div
                key={i}
                className="rounded-lg p-3 cursor-pointer transition-all"
                style={{ background: 'rgba(139, 99, 52, 0.15)' }}
                onMouseEnter={() => setHoveredRemark(remark)}
                onMouseLeave={() => setHoveredRemark(null)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-memento text-xs uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color: labelColor, background: `${labelColor}15` }}
                  >
                    {labelText}
                  </span>
                </div>
                <p className="font-avenir text-sm mb-1" style={textStyle}>
                  {remark.concreteProblem}
                </p>
                <p className="font-avenir text-sm" style={{ ...textStyle, opacity: 0.8 }}>
                  {remark.callToAction}
                </p>
                {remark.substringOfInterest && (
                  <div
                    className="mt-2 p-2 rounded text-xs font-mono"
                    style={{
                      background: 'rgba(139, 99, 52, 0.2)',
                      ...textStyle,
                      opacity: 0.7,
                      borderLeft: `2px solid ${labelColor}`,
                    }}
                  >
                    "{remark.substringOfInterest}"
                  </div>
                )}
              </div>
            );
          })}
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

// ============================================================================
// Exported Components
// ============================================================================

interface FeedbackProviderProps {
  children: ReactNode;
}

/**
 * @description Provider component that enables hover-to-highlight between WritingCard and feedback.
 */
export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [hoveredRemark, setHoveredRemark] = useState<GraderRemark | null>(null);
  return (
    <HoverContext.Provider value={{ hoveredRemark, setHoveredRemark }}>
      {children}
    </HoverContext.Provider>
  );
}

interface WritingCardProps {
  content: string;
}

/**
 * @description Card displaying the user's writing with hover highlight support.
 */
export function WritingCard({ content }: WritingCardProps) {
  const { hoveredRemark } = useContext(HoverContext);
  const highlightText = hoveredRemark?.substringOfInterest;
  const highlightColor = hoveredRemark 
    ? (hoveredRemark.severity === 'error' ? '#b91c1c' : '#b45309')
    : undefined;

  return (
    <ParchmentCardWithLine title="Your Writing">
      <p className="text-sm font-avenir whitespace-pre-wrap" style={getParchmentTextStyle()}>
        <HighlightedText 
          content={content} 
          highlightText={highlightText} 
          highlightColor={highlightColor} 
        />
      </p>
    </ParchmentCardWithLine>
  );
}

interface ExpandableScoreBreakdownProps {
  scores: GraderResult['scores'];
  remarks: GraderRemark[];
  /** Optional AI-generated overall assessment summary */
  overallAssessment?: string;
}

/**
 * @description Expandable score breakdown with feedback remarks nested under each category.
 */
export function ExpandableScoreBreakdown({ scores, remarks, overallAssessment }: ExpandableScoreBreakdownProps) {
  const textStyle = getParchmentTextStyle();
  
  return (
    <ParchmentCardWithLine title="Score Breakdown">
      <div className="space-y-1 -mx-2">
        {SCORE_CATEGORIES.map(({ key, label }) => {
          const categoryRemarks = getRemarksForCategory(remarks, key);
          return (
            <ExpandableScoreRow
              key={key}
              label={label}
              score={scores[key]}
              maxScore={5}
              remarks={categoryRemarks}
            />
          );
        })}
      </div>
      
      {overallAssessment && (
        <details
          className="mt-4 pt-3 border-t"
          style={{ borderColor: 'rgba(139, 99, 52, 0.3)' }}
        >
          <summary
            className="cursor-pointer select-none text-xs uppercase tracking-widest font-memento"
            style={{ ...textStyle, opacity: 0.7 }}
          >
            Summary
          </summary>
          <p className="mt-2 font-avenir text-sm leading-relaxed" style={textStyle}>
            {overallAssessment}
          </p>
        </details>
      )}
    </ParchmentCardWithLine>
  );
}

// ============================================================================
// Legacy Components (for backwards compatibility)
// ============================================================================

interface ScoreBreakdownCardProps {
  scores: GraderResult['scores'];
}

/**
 * @description Static score breakdown card (legacy).
 * @deprecated Use ExpandableScoreBreakdown for better UX.
 */
export function ScoreBreakdownCard({ scores }: ScoreBreakdownCardProps) {
  const textStyle = getParchmentTextStyle();
  
  return (
    <ParchmentCard variant="default" borderRadius="lg">
      <div
        className="text-base uppercase tracking-widest mb-3 pb-2 font-memento border-b"
        style={{ ...textStyle, borderColor: 'rgba(139, 99, 52, 0.3)' }}
      >
        Score Breakdown
      </div>
      <div className="space-y-2 pt-1">
        {SCORE_CATEGORIES.map(({ key, label }) => {
          const score = scores[key];
          const pct = (score / 5) * 100;
          const color = pct >= 80 ? '#15803d' : pct >= 60 ? '#b45309' : '#b91c1c';
          
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="font-memento text-sm w-28 shrink-0" style={textStyle}>
                {label}
              </span>
              <div
                className="flex-1 h-2 rounded-full"
                style={{ background: 'rgba(139, 99, 52, 0.3)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="font-memento text-xs w-8 text-right" style={{ ...textStyle, color }}>
                {score}/5
              </span>
            </div>
          );
        })}
      </div>
    </ParchmentCard>
  );
}

interface FeedbackRemarksCardProps {
  remarks: GraderRemark[];
}

/**
 * @description Card showing feedback remarks (legacy).
 * @deprecated Use ExpandableScoreBreakdown for better UX.
 */
export function FeedbackRemarksCard({ remarks }: FeedbackRemarksCardProps) {
  const { setHoveredRemark } = useContext(HoverContext);
  const textStyle = getParchmentTextStyle();

  if (remarks.length === 0) {
    return (
      <ParchmentCard variant="light" borderRadius="lg" flat>
        <div className="text-center">
          <span className="font-avenir text-sm" style={{ ...textStyle, color: '#15803d' }}>
            Excellent work! No issues found.
          </span>
        </div>
      </ParchmentCard>
    );
  }

  return (
    <ParchmentCard variant="default" borderRadius="lg">
      <div
        className="text-xs uppercase tracking-widest font-memento mb-3"
        style={textStyle}
      >
        Feedback ({remarks.length})
      </div>
      <div className="space-y-3">
        {remarks.map((remark, i) => {
          const isError = remark.severity === 'error';
          const labelColor = isError ? '#b91c1c' : '#b45309';
          const labelText = isError ? 'Issue' : 'Suggestion';

          return (
            <div
              key={i}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredRemark(remark)}
              onMouseLeave={() => setHoveredRemark(null)}
            >
              <ParchmentCard variant="light" borderRadius="md" flat>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="font-memento text-xs uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color: labelColor, background: `${labelColor}15` }}
                  >
                    {labelText}
                  </span>
                  <span className="font-memento text-xs" style={{ ...textStyle, opacity: 0.7 }}>
                    {formatCategory(remark.category)}
                  </span>
                </div>
                <p className="font-avenir text-sm mb-2" style={textStyle}>
                  {remark.concreteProblem}
                </p>
                <p className="font-avenir text-sm" style={{ ...textStyle, opacity: 0.8 }}>
                  {remark.callToAction}
                </p>
                {remark.substringOfInterest && (
                  <div
                    className="mt-3 p-2 rounded text-xs font-mono"
                    style={{
                      background: 'rgba(139, 99, 52, 0.2)',
                      ...textStyle,
                      opacity: 0.7,
                      borderLeft: `2px solid ${labelColor}`,
                    }}
                  >
                    "{remark.substringOfInterest}"
                  </div>
                )}
              </ParchmentCard>
            </div>
          );
        })}
      </div>
    </ParchmentCard>
  );
}

interface FeedbackDisplayProps {
  result: GraderResult;
  content?: string;
}

/**
 * @description Combined feedback display with writing and all feedback panels.
 * @deprecated Use individual components for more control.
 */
export function FeedbackDisplay({ result, content }: FeedbackDisplayProps) {
  const { scores, remarks } = result;

  const feedbackContent = (
    <div className="space-y-4">
      <ScoreBreakdownCard scores={scores} />
      <FeedbackRemarksCard remarks={remarks} />
    </div>
  );

  if (!content) {
    return (
      <FeedbackProvider>
        {feedbackContent}
      </FeedbackProvider>
    );
  }

  return (
    <FeedbackProvider>
      <div className="flex gap-6">
        <div className="flex-1">
          <WritingCard content={content} />
        </div>
        <div className="flex-1">
          {feedbackContent}
        </div>
      </div>
    </FeedbackProvider>
  );
}
