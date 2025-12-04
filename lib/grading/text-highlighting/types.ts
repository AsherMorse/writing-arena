/**
 * @fileoverview Type definitions for text span highlighting in grading results.
 */

/**
 * @description A text span identified by the LLM (before locating indices).
 */
export interface Span {
  /** The exact text to highlight (or "N/A" if not applicable) */
  substringOfInterest: string;
  /** Why this text is notable (feedback explanation) */
  explanation: string;
}

/**
 * @description A text span with located character positions.
 */
export interface LocatedSpan extends Span {
  /** Starting character index in the original text */
  startIndex: number;
  /** Ending character index in the original text */
  endIndex: number;
}

/**
 * @description Highlight type for UI styling.
 */
export type HighlightType = 'improvement' | 'strength';

/**
 * @description A highlight range ready for UI rendering.
 */
export interface HighlightRange {
  startIndex: number;
  endIndex: number;
  type: HighlightType;
  explanation: string;
}

