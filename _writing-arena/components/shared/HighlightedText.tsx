/**
 * @fileoverview Component for rendering text with highlighted spans.
 */

'use client';

import { useMemo, useState } from 'react';
import type { LocatedSpan } from '@/lib/grading/text-highlighting/types';

interface HighlightedTextProps {
  /** The full text to render */
  text: string;
  /** Spans to highlight as improvements (yellow) */
  improvements?: LocatedSpan[];
  /** Spans to highlight as strengths (green) */
  strengths?: LocatedSpan[];
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to show tooltips on hover */
  showTooltips?: boolean;
}

interface HighlightInfo {
  startIndex: number;
  endIndex: number;
  type: 'improvement' | 'strength';
  explanation: string;
}

/**
 * @description Merge and sort highlights, handling overlaps.
 */
function prepareHighlights(improvements: LocatedSpan[], strengths: LocatedSpan[]): HighlightInfo[] {
  const highlights: HighlightInfo[] = [
    ...improvements.map((span) => ({
      startIndex: span.startIndex,
      endIndex: span.endIndex,
      type: 'improvement' as const,
      explanation: span.explanation,
    })),
    ...strengths.map((span) => ({
      startIndex: span.startIndex,
      endIndex: span.endIndex,
      type: 'strength' as const,
      explanation: span.explanation,
    })),
  ];

  // Sort by start index
  highlights.sort((a, b) => a.startIndex - b.startIndex);

  return highlights;
}

/**
 * @description Split text into segments (highlighted and non-highlighted).
 */
function segmentText(
  text: string,
  highlights: HighlightInfo[]
): Array<{ text: string; highlight?: HighlightInfo }> {
  if (highlights.length === 0) {
    return [{ text }];
  }

  const segments: Array<{ text: string; highlight?: HighlightInfo }> = [];
  let currentIndex = 0;

  for (const highlight of highlights) {
    // Skip if highlight is out of bounds or overlaps with previous
    if (highlight.startIndex < currentIndex) continue;
    if (highlight.startIndex >= text.length) continue;

    // Add non-highlighted text before this highlight
    if (highlight.startIndex > currentIndex) {
      segments.push({
        text: text.slice(currentIndex, highlight.startIndex),
      });
    }

    // Add highlighted text
    const endIndex = Math.min(highlight.endIndex, text.length);
    segments.push({
      text: text.slice(highlight.startIndex, endIndex),
      highlight,
    });

    currentIndex = endIndex;
  }

  // Add remaining text after last highlight
  if (currentIndex < text.length) {
    segments.push({
      text: text.slice(currentIndex),
    });
  }

  return segments;
}

/**
 * @description Highlighted text segment with optional tooltip.
 */
function HighlightSegment({
  text,
  type,
  explanation,
  showTooltip,
}: {
  text: string;
  type: 'improvement' | 'strength';
  explanation: string;
  showTooltip: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const bgColor =
    type === 'improvement'
      ? 'rgba(255, 224, 102, 0.4)' // Yellow
      : 'rgba(0, 212, 146, 0.25)'; // Green

  const hoverBgColor = type === 'improvement' ? 'rgba(255, 224, 102, 0.6)' : 'rgba(0, 212, 146, 0.4)';

  return (
    <span
      className="relative cursor-help rounded-sm transition-colors"
      style={{ backgroundColor: isHovered ? hoverBgColor : bgColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text}
      {showTooltip && isHovered && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1a1a1c] p-3 text-xs text-[rgba(255,255,255,0.8)] shadow-xl"
          style={{ whiteSpace: 'normal' }}
        >
          <span className="mb-1 block font-medium">
            {type === 'improvement' ? '💡 Suggestion' : '✨ Strength'}
          </span>
          {explanation}
          {/* Tooltip arrow */}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1c]" />
        </span>
      )}
    </span>
  );
}

/**
 * @description Render text with highlighted spans for feedback.
 */
export default function HighlightedText({
  text,
  improvements = [],
  strengths = [],
  className = '',
  showTooltips = true,
}: HighlightedTextProps) {
  const segments = useMemo(() => {
    const highlights = prepareHighlights(improvements, strengths);
    return segmentText(text, highlights);
  }, [text, improvements, strengths]);

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {segments.map((segment, index) => {
        if (segment.highlight) {
          return (
            <HighlightSegment
              key={index}
              text={segment.text}
              type={segment.highlight.type}
              explanation={segment.highlight.explanation}
              showTooltip={showTooltips}
            />
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </div>
  );
}

