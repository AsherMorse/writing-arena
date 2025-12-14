# Text Span Highlighting Implementation Guide

> How to add yellow-highlighted text spans to essay and paragraph grading results.

**Version**: 1.0  
**Date**: December 3, 2024  
**Target Files**: Essay grader, Paragraph grader, Ranked/Practice results pages

---

## Overview

This guide covers adding text highlighting to grading feedback, allowing the UI to show exactly which parts of the student's writing the feedback refers to.

**What We're Building:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Your Writing                                                   │
├─────────────────────────────────────────────────────────────────┤
│  The Industrial Revolution changed everything. ████████████████ │
│  ███████████████████████ It was a big change. Many things      │
│  happened during this time. ████████████████████████████████   │
│  ██████████████                                                 │
│                                                                 │
│  [Yellow highlights show areas needing improvement]             │
└─────────────────────────────────────────────────────────────────┘
```

**Scope:**
- ✅ Essay grader (`lib/grading/essay-grading.ts`)
- ✅ Paragraph grader (`lib/grading/paragraph-grading.ts`)
- ✅ Ranked match results (`components/ranked/ResultsContent.tsx`)
- ✅ Practice results (`components/practice/PracticeResultsContent.tsx`)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Two-Stage Process                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Stage 1: LLM Grading                                         │
│   ┌─────────────────────────────────────────────┐              │
│   │  Claude returns:                            │              │
│   │  {                                          │              │
│   │    substringOfInterest: "It was a big...",  │              │
│   │    explanation: "Too vague, add detail"     │              │
│   │  }                                          │              │
│   │  (No character positions - LLM doesn't      │              │
│   │   need to calculate indices)                │              │
│   └─────────────────────────────────────────────┘              │
│                          │                                      │
│                          v                                      │
│   Stage 2: Post-Processing                                     │
│   ┌─────────────────────────────────────────────┐              │
│   │  locateSpans() finds text in essay:         │              │
│   │  {                                          │              │
│   │    substringOfInterest: "It was a big...",  │              │
│   │    explanation: "Too vague, add detail",    │              │
│   │    startIndex: 42,  ← Added                 │              │
│   │    endIndex: 58     ← Added                 │              │
│   │  }                                          │              │
│   └─────────────────────────────────────────────┘              │
│                          │                                      │
│                          v                                      │
│   Stage 3: UI Rendering                                        │
│   ┌─────────────────────────────────────────────┐              │
│   │  <HighlightedText> component renders        │              │
│   │  yellow background at indices               │              │
│   └─────────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why two stages?**
1. **Cleaner prompts** — LLM focuses on *what* to highlight, not *where*
2. **More reliable** — LLMs often miscalculate character indices
3. **Robust matching** — Post-processing handles punctuation differences, minor misquotes

---

## Part 1: Type Definitions

### Create: `lib/grading/text-highlighting/types.ts`

```typescript
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
```

---

## Part 2: Span Locating Utilities

### Create: `lib/grading/text-highlighting/locate-spans.ts`

```typescript
/**
 * @fileoverview Utilities for locating text spans within student writing.
 * Adapted from AlphaWrite's matchers.ts pattern.
 */

import type { Span, LocatedSpan } from './types';

/**
 * @description Check if a substring is valid for matching.
 */
function isValidSubstring(text: string | null | undefined): boolean {
  if (!text) return false;
  if (text.toUpperCase() === 'N/A' || text.toUpperCase() === 'NA') return false;
  // Skip purely punctuation/whitespace
  if (/^[\p{P}\p{S}\s]+$/u.test(text)) return false;
  return true;
}

/**
 * @description Clean up a substring by removing quotes and ellipses.
 */
function cleanSubstring(text: string): string {
  if (!text) return text;
  let cleaned = text;
  // Remove leading/trailing quotes
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '');
  // Remove leading/trailing ellipses
  cleaned = cleaned.replace(/^\.{3}|\.{3}$/g, '');
  return cleaned.trim();
}

/**
 * @description Normalize text for comparison (lowercase, standardize punctuation).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Normalize dashes
    .replace(/[–—]/g, '-')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @description Adjust indices to nearest word boundaries.
 * Prevents highlights from cutting words in half.
 */
function adjustToWordBoundaries(
  text: string,
  startIndex: number,
  endIndex: number
): { adjustedStart: number; adjustedEnd: number } {
  let adjustedStart = startIndex;
  let adjustedEnd = endIndex;

  // Expand start to beginning of word
  while (adjustedStart > 0 && !/\s/.test(text[adjustedStart - 1])) {
    adjustedStart--;
  }

  // Expand end to end of word
  while (adjustedEnd < text.length && !/\s/.test(text[adjustedEnd])) {
    adjustedEnd++;
  }

  return { adjustedStart, adjustedEnd };
}

/**
 * @description Calculate similarity between two strings (0-1).
 * Uses Levenshtein distance normalized by length.
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  // Create distance matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * @description Find the closest matching substring using fuzzy matching.
 */
function findFuzzyMatch(
  needle: string,
  haystack: string,
  threshold: number = 0.85
): { substring: string; startIndex: number } | null {
  const needleLen = needle.length;
  const haystackLen = haystack.length;
  
  if (needleLen > haystackLen) return null;

  let bestMatch: { substring: string; startIndex: number; similarity: number } | null = null;

  // Slide window across haystack
  const windowSize = needleLen;
  const tolerance = Math.floor(needleLen * 0.2); // Allow 20% length variance

  for (let len = windowSize - tolerance; len <= windowSize + tolerance; len++) {
    if (len <= 0 || len > haystackLen) continue;

    for (let i = 0; i <= haystackLen - len; i++) {
      const candidate = haystack.slice(i, i + len);
      const similarity = calculateSimilarity(needle, candidate);

      if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = {
          substring: candidate,
          startIndex: i,
          similarity,
        };
      }
    }
  }

  return bestMatch ? { substring: bestMatch.substring, startIndex: bestMatch.startIndex } : null;
}

/**
 * @description Locate a single span within text.
 * Tries exact match first, then fuzzy matching.
 * 
 * @param span - The span to locate
 * @param text - The text to search within
 * @param similarityThreshold - Minimum similarity for fuzzy matches (0-1)
 * @returns Located span with indices, or undefined if not found
 */
export function locateSpan(
  span: Span,
  text: string,
  similarityThreshold: number = 0.85
): LocatedSpan | undefined {
  // Validate input
  if (!isValidSubstring(span.substringOfInterest)) {
    return undefined;
  }

  const cleanedSubstring = cleanSubstring(span.substringOfInterest);
  if (!isValidSubstring(cleanedSubstring)) {
    return undefined;
  }

  const normalizedText = normalizeText(text);
  const normalizedSubstring = normalizeText(cleanedSubstring);

  // Try exact match first
  const exactIndex = normalizedText.indexOf(normalizedSubstring);
  if (exactIndex !== -1) {
    const endIndex = exactIndex + normalizedSubstring.length;
    const { adjustedStart, adjustedEnd } = adjustToWordBoundaries(
      text,
      exactIndex,
      endIndex
    );

    return {
      substringOfInterest: text.slice(adjustedStart, adjustedEnd),
      explanation: span.explanation,
      startIndex: adjustedStart,
      endIndex: adjustedEnd,
    };
  }

  // Try fuzzy match
  const fuzzyMatch = findFuzzyMatch(normalizedSubstring, normalizedText, similarityThreshold);
  if (fuzzyMatch) {
    const { adjustedStart, adjustedEnd } = adjustToWordBoundaries(
      text,
      fuzzyMatch.startIndex,
      fuzzyMatch.startIndex + fuzzyMatch.substring.length
    );

    return {
      substringOfInterest: text.slice(adjustedStart, adjustedEnd),
      explanation: span.explanation,
      startIndex: adjustedStart,
      endIndex: adjustedEnd,
    };
  }

  // No match found
  return undefined;
}

/**
 * @description Locate multiple spans within text.
 * 
 * @param spans - Array of spans to locate
 * @param text - The text to search within
 * @param similarityThreshold - Minimum similarity for fuzzy matches
 * @returns Array of located spans (only those found)
 */
export function locateSpans(
  spans: Span[],
  text: string,
  similarityThreshold: number = 0.85
): LocatedSpan[] {
  if (!spans || !Array.isArray(spans) || !text) {
    return [];
  }

  return spans
    .map(span => locateSpan(span, text, similarityThreshold))
    .filter((span): span is LocatedSpan => span !== undefined);
}

/**
 * @description Convert string array to Span array (for backwards compatibility).
 * Uses the string as both the substring and explanation.
 */
export function stringsToSpans(strings: string[]): Span[] {
  return strings.map(str => ({
    substringOfInterest: str,
    explanation: str,
  }));
}
```

---

## Part 3: Update Grading Types

### Update: `lib/grading/essay-rubrics/types.ts`

Add these new types alongside existing ones:

```typescript
import type { Span, LocatedSpan } from '../text-highlighting/types';

// ... existing types ...

/**
 * @description Graded result for a single criterion WITH span support.
 */
export interface GradedCriterionWithSpans {
  criterion: string;
  score: CriterionScore;
  explanation: string;
  /** Text spans showing great examples (with indices for highlighting) */
  examplesOfGreatResults: LocatedSpan[];
  /** Text spans showing areas to improve (with indices for highlighting) */
  examplesOfWhereToImprove: LocatedSpan[];
}

/**
 * @description Essay scorecard with highlighting support.
 */
export interface EssayScorecardWithSpans {
  essayType: EssayType;
  gradeLevel: number;
  criteria: GradedCriterionWithSpans[];
  totalPoints: number;
  maxPoints: number;
  percentageScore: number;
}

/**
 * @description Full essay grading result with highlighting support.
 */
export interface EssayGradingResultWithSpans {
  scorecard: EssayScorecardWithSpans;
  strengths: LocatedSpan[];
  improvements: LocatedSpan[];
  overallFeedback: string;
}
```

### Update: `lib/grading/paragraph-rubrics/types.ts`

Add these new types alongside existing ones:

```typescript
import type { Span, LocatedSpan } from '../text-highlighting/types';

// ... existing types ...

/**
 * @description Graded category WITH span support.
 */
export interface GradedCategoryWithSpans {
  title: string;
  score: number;
  maxScore: number;
  feedback: string;
  /** Optional: specific text examples for this category */
  examples?: LocatedSpan[];
}

/**
 * @description Paragraph grading result with highlighting support.
 */
export interface ParagraphGradingResultWithSpans {
  scorecard: ParagraphScorecard;
  strengths: LocatedSpan[];
  improvements: LocatedSpan[];
  overallFeedback: string;
}
```

---

## Part 4: Update Grading Prompts

### Update Essay Grading Prompt

In `lib/grading/essay-grading.ts`, update the prompt to request `substringOfInterest`:

```typescript
// Add to the grading prompt schema
const exampleSchema = {
  type: 'object',
  properties: {
    substringOfInterest: {
      type: 'string',
      description: 'Exact quote from the essay (or "N/A" if not applicable). Copy the text EXACTLY as written.',
    },
    explanation: {
      type: 'string',
      description: 'Brief explanation of why this text is notable.',
    },
  },
  required: ['substringOfInterest', 'explanation'],
};

// Update the criteria schema
const criterionSchema = {
  // ... existing fields ...
  examplesOfGreatResults: {
    type: 'array',
    items: exampleSchema,
    description: 'Specific text excerpts from the essay that demonstrate this criterion well.',
  },
  examplesOfWhereToImprove: {
    type: 'array',
    items: exampleSchema,
    description: 'Specific text excerpts from the essay that need improvement for this criterion.',
  },
};
```

### Add Post-Processing

Create: `lib/grading/text-highlighting/process-grading-result.ts`

```typescript
/**
 * @fileoverview Post-process grading results to add span indices.
 */

import { locateSpans, stringsToSpans } from './locate-spans';
import type { LocatedSpan, Span } from './types';
import type { 
  EssayGradingResult, 
  EssayGradingResultWithSpans,
  GradedCriterion,
  GradedCriterionWithSpans,
} from '../essay-rubrics/types';
import type {
  ParagraphGradingResult,
  ParagraphGradingResultWithSpans,
} from '../paragraph-rubrics/types';

/**
 * @description Process examples from LLM response to located spans.
 * Handles both new format (Span[]) and legacy format (string[]).
 */
function processExamples(
  examples: Span[] | string[] | undefined,
  text: string
): LocatedSpan[] {
  if (!examples || examples.length === 0) return [];

  // Convert string[] to Span[] if needed (backwards compatibility)
  const spans: Span[] = typeof examples[0] === 'string'
    ? stringsToSpans(examples as string[])
    : examples as Span[];

  return locateSpans(spans, text);
}

/**
 * @description Add span indices to essay grading result.
 */
export function processEssayGradingResult(
  result: EssayGradingResult,
  essayText: string
): EssayGradingResultWithSpans {
  // Process each criterion's examples
  const criteriaWithSpans: GradedCriterionWithSpans[] = result.scorecard.criteria.map(
    (criterion: GradedCriterion) => ({
      criterion: criterion.criterion,
      score: criterion.score,
      explanation: criterion.explanation,
      examplesOfGreatResults: processExamples(
        criterion.examplesOfGreatResults as any,
        essayText
      ),
      examplesOfWhereToImprove: processExamples(
        criterion.examplesOfWhereToImprove as any,
        essayText
      ),
    })
  );

  // Process top-level strengths/improvements
  const strengthSpans = processExamples(
    stringsToSpans(result.strengths),
    essayText
  );
  const improvementSpans = processExamples(
    stringsToSpans(result.improvements),
    essayText
  );

  return {
    scorecard: {
      ...result.scorecard,
      criteria: criteriaWithSpans,
    },
    strengths: strengthSpans,
    improvements: improvementSpans,
    overallFeedback: result.overallFeedback,
  };
}

/**
 * @description Add span indices to paragraph grading result.
 */
export function processParagraphGradingResult(
  result: ParagraphGradingResult,
  paragraphText: string
): ParagraphGradingResultWithSpans {
  // Process top-level strengths/improvements
  const strengthSpans = processExamples(
    stringsToSpans(result.strengths),
    paragraphText
  );
  const improvementSpans = processExamples(
    stringsToSpans(result.improvements),
    paragraphText
  );

  return {
    scorecard: result.scorecard,
    strengths: strengthSpans,
    improvements: improvementSpans,
    overallFeedback: result.overallFeedback,
  };
}
```

---

## Part 5: React Highlighting Component

### Create: `components/shared/HighlightedText.tsx`

```tsx
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
function prepareHighlights(
  improvements: LocatedSpan[],
  strengths: LocatedSpan[]
): HighlightInfo[] {
  const highlights: HighlightInfo[] = [
    ...improvements.map(span => ({
      startIndex: span.startIndex,
      endIndex: span.endIndex,
      type: 'improvement' as const,
      explanation: span.explanation,
    })),
    ...strengths.map(span => ({
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

  const bgColor = type === 'improvement' 
    ? 'rgba(255, 224, 102, 0.4)' // Yellow
    : 'rgba(0, 212, 146, 0.25)'; // Green

  const hoverBgColor = type === 'improvement'
    ? 'rgba(255, 224, 102, 0.6)'
    : 'rgba(0, 212, 146, 0.4)';

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
```

---

## Part 6: Integration with Results Pages

### Example: Update Ranked Match Results

In `components/ranked/ResultsContent.tsx`, replace the plain text display:

```tsx
// Before:
<p className="whitespace-pre-wrap text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">
  {decodeURIComponent(content)}
</p>

// After:
import HighlightedText from '@/components/shared/HighlightedText';

<HighlightedText
  text={decodeURIComponent(content)}
  improvements={results?.improvements || []}
  strengths={results?.strengths || []}
  className="text-sm leading-relaxed text-[rgba(255,255,255,0.6)]"
  showTooltips={true}
/>
```

### Example: Update Practice Results

In `components/practice/PracticeResultsContent.tsx`:

```tsx
import HighlightedText from '@/components/shared/HighlightedText';

// In the writing display section:
<HighlightedText
  text={studentAnswer}
  improvements={gradingResult?.improvements || []}
  strengths={gradingResult?.strengths || []}
  className="text-sm leading-relaxed text-[rgba(255,255,255,0.6)]"
/>
```

---

## Part 7: Index File

### Create: `lib/grading/text-highlighting/index.ts`

```typescript
/**
 * @fileoverview Text span highlighting exports.
 */

export * from './types';
export * from './locate-spans';
export * from './process-grading-result';
```

---

## File Structure Summary

```
lib/grading/text-highlighting/
├── index.ts                    # Exports
├── types.ts                    # Span, LocatedSpan types
├── locate-spans.ts             # locateSpan(), locateSpans()
└── process-grading-result.ts   # processEssayGradingResult(), processParagraphGradingResult()

components/shared/
└── HighlightedText.tsx         # React highlighting component
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create `lib/grading/text-highlighting/types.ts`
- [ ] Create `lib/grading/text-highlighting/locate-spans.ts`
- [ ] Create `lib/grading/text-highlighting/index.ts`
- [ ] Test span location with sample text

### Phase 2: Grading Integration
- [ ] Update essay grading types
- [ ] Update paragraph grading types
- [ ] Create `process-grading-result.ts`
- [ ] Update grading prompts to request `substringOfInterest`
- [ ] Add post-processing to grading functions

### Phase 3: UI Components
- [ ] Create `HighlightedText.tsx` component
- [ ] Test with mock data
- [ ] Verify tooltip positioning

### Phase 4: Results Page Integration
- [ ] Update `ResultsContent.tsx` (ranked)
- [ ] Update `PracticeResultsContent.tsx` (practice)
- [ ] Test end-to-end flow

---

## Testing

### Unit Test: Span Location

```typescript
// __tests__/lib/grading/text-highlighting/locate-spans.test.ts

import { locateSpan, locateSpans } from '@/lib/grading/text-highlighting/locate-spans';

describe('locateSpan', () => {
  const sampleText = 'The Industrial Revolution changed everything. It was a big change.';

  it('finds exact match', () => {
    const span = { substringOfInterest: 'It was a big change', explanation: 'Test' };
    const result = locateSpan(span, sampleText);
    
    expect(result).toBeDefined();
    expect(result?.startIndex).toBe(46);
    expect(result?.endIndex).toBe(65);
  });

  it('handles case insensitivity', () => {
    const span = { substringOfInterest: 'INDUSTRIAL REVOLUTION', explanation: 'Test' };
    const result = locateSpan(span, sampleText);
    
    expect(result).toBeDefined();
    expect(result?.substringOfInterest).toBe('Industrial Revolution');
  });

  it('returns undefined for N/A', () => {
    const span = { substringOfInterest: 'N/A', explanation: 'Test' };
    const result = locateSpan(span, sampleText);
    
    expect(result).toBeUndefined();
  });

  it('finds fuzzy match with minor differences', () => {
    // LLM might return slightly different text
    const span = { substringOfInterest: 'It was big change', explanation: 'Test' };
    const result = locateSpan(span, sampleText, 0.8);
    
    expect(result).toBeDefined();
  });
});
```

### Integration Test: Full Flow

```typescript
// __tests__/integration/text-highlighting.test.ts

import { processEssayGradingResult } from '@/lib/grading/text-highlighting';

describe('Essay grading with highlights', () => {
  it('processes grading result and adds indices', () => {
    const essayText = 'Dogs are loyal pets. They provide companionship.';
    
    const mockResult = {
      scorecard: {
        essayType: 'Expository' as const,
        gradeLevel: 8,
        criteria: [{
          criterion: 'Topic Sentence',
          score: 'Developing' as const,
          explanation: 'Good start',
          examplesOfGreatResults: [],
          examplesOfWhereToImprove: ['Dogs are loyal pets'],
        }],
        totalPoints: 1,
        maxPoints: 3,
        percentageScore: 33,
      },
      strengths: [],
      improvements: ['Dogs are loyal pets'],
      overallFeedback: 'Keep working!',
    };

    const processed = processEssayGradingResult(mockResult, essayText);
    
    expect(processed.improvements.length).toBe(1);
    expect(processed.improvements[0].startIndex).toBe(0);
    expect(processed.improvements[0].endIndex).toBe(20);
  });
});
```

---

## Known Limitations

1. **First match wins** — If the same text appears multiple times, only the first occurrence is highlighted
2. **No overlapping highlights** — Overlapping spans are skipped (first one wins)
3. **Fuzzy matching threshold** — 85% similarity by default; very short strings may not match well

---

## Future Enhancements

1. **Multiple occurrence handling** — Use surrounding context to disambiguate
2. **Click-to-expand** — Click a highlight to see full feedback in a modal
3. **Highlight legend** — Show what colors mean
4. **Export highlighted text** — PDF export with highlights preserved

---

## References

- AlphaWrite matchers.ts: `_alphawrite/alphawrite-2/packages/edu-core/src/grading/categorical-rubric/matchers.ts`
- Essay Grader Extraction Guide: `_docs/implementation-explanation/curriculum/alphawrite/essay-paragraph-grader-extraction-guide-v2.md`

