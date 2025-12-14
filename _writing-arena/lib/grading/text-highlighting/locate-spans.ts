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
  cleaned = cleaned.replace(/^["'`""'']+|["'`""'']+$/g, '');
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
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
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
    const { adjustedStart, adjustedEnd } = adjustToWordBoundaries(text, exactIndex, endIndex);

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
    .map((span) => locateSpan(span, text, similarityThreshold))
    .filter((span): span is LocatedSpan => span !== undefined);
}

/**
 * @description Convert string array to Span array (for backwards compatibility).
 * Parses strings in format: "Quote: 'text' - explanation"
 */
export function stringsToSpans(strings: string[]): Span[] {
  return strings.map((str) => {
    // Try to parse "Quote: 'text' - explanation" format
    const quoteMatch = str.match(/Quote:\s*['"]([^'"]+)['"]/i);
    if (quoteMatch) {
      const quote = quoteMatch[1];
      const dashIndex = str.indexOf(' - ');
      const explanation = dashIndex > 0 ? str.slice(dashIndex + 3) : str;
      return {
        substringOfInterest: quote,
        explanation,
      };
    }

    // Try to parse "Change 'before' to 'after' - reason" format
    const changeMatch = str.match(/Change\s*['"]([^'"]+)['"]/i);
    if (changeMatch) {
      return {
        substringOfInterest: changeMatch[1],
        explanation: str,
      };
    }

    // Fallback: use the whole string as both
    return {
      substringOfInterest: str,
      explanation: str,
    };
  });
}

/**
 * @description Extract and locate spans from feedback strings.
 * Combines stringsToSpans + locateSpans.
 */
export function extractAndLocateSpans(
  feedbackStrings: string[],
  text: string,
  similarityThreshold: number = 0.85
): LocatedSpan[] {
  const spans = stringsToSpans(feedbackStrings);
  return locateSpans(spans, text, similarityThreshold);
}

/**
 * @description CategoryExample from paragraph grader (AlphaWrite format).
 */
export interface CategoryExample {
  substringOfInterest: string;
  explanationOfSubstring: string;
}

/**
 * @description Locate CategoryExample objects within text.
 * Converts AlphaWrite-style {substringOfInterest, explanationOfSubstring} to LocatedSpan with indices.
 */
export function locateCategoryExamples(
  examples: CategoryExample[],
  text: string,
  similarityThreshold: number = 0.85
): LocatedSpan[] {
  if (!examples || !Array.isArray(examples) || !text) {
    return [];
  }

  // Convert CategoryExample to Span format
  const spans: Span[] = examples.map((ex) => ({
    substringOfInterest: ex.substringOfInterest,
    explanation: ex.explanationOfSubstring,
  }));

  return locateSpans(spans, text, similarityThreshold);
}

