/**
 * @fileoverview Pre-validation checks for Layer 2 (Quest Requirements).
 * Runs programmatic checks before calling the LLM to save resources.
 */

/**
 * Result from pre-validation checks.
 */
export type PreValidationResult = {
  /** Whether the response passed pre-validation */
  valid: boolean;
  /** Category of the blocking issue (if invalid) */
  category?: 'GIBBERISH_INPUT' | 'TOO_SHORT';
  /** Human-readable reason for rejection */
  reason?: string;
  /** Feedback message to show the student */
  feedback?: string;
};

/**
 * Configuration for pre-validation.
 */
export type PreValidationConfig = {
  /** Minimum number of words required (default: 3) */
  minWordCount?: number;
  /** Previous responses for duplicate detection */
  previousResponses?: string[];
};

const DEFAULT_MIN_WORD_COUNT = 3;

/**
 * @description Run programmatic pre-validation checks before LLM call.
 * Catches obvious issues like empty input, gibberish, and too-short responses.
 *
 * @example
 * ```typescript
 * const result = preValidateResponse("asdfghjkl");
 * // { valid: false, category: 'GIBBERISH_INPUT', reason: 'no vowels', ... }
 *
 * const result2 = preValidateResponse("I draw my sword.");
 * // { valid: true }
 * ```
 */
export function preValidateResponse(
  text: string,
  config: PreValidationConfig = {}
): PreValidationResult {
  const { minWordCount = DEFAULT_MIN_WORD_COUNT, previousResponses = [] } = config;

  // 1. Empty or whitespace only
  if (!text || !text.trim()) {
    return {
      valid: false,
      category: 'GIBBERISH_INPUT',
      reason: 'empty',
      feedback: "Please write something! Describe what your character does.",
    };
  }

  const trimmed = text.trim();
  const noSpaces = trimmed.replace(/\s/g, '').toLowerCase();

  // 2. Only punctuation or special characters (check before word count)
  const lettersOrNumbers = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (lettersOrNumbers.length === 0) {
    return {
      valid: false,
      category: 'GIBBERISH_INPUT',
      reason: 'no letters or numbers',
      feedback: "Please write actual words describing what your character does.",
    };
  }

  // 3. All same character (e.g., "aaaaaa", "111111")
  if (/^(.)\1+$/.test(noSpaces)) {
    return {
      valid: false,
      category: 'GIBBERISH_INPUT',
      reason: 'repeated single character',
      feedback: "That doesn't look like a real response. Please write what your character does.",
    };
  }

  // 4. Random character patterns (common keyboard patterns) - check before word count
  const keyboardPatterns = [
    /^[qwertyuiop]+$/i,  // Top row
    /^[asdfghjkl]+$/i,   // Home row  
    /^[zxcvbnm]+$/i,     // Bottom row
    /^[qazwsx]+$/i,      // Diagonal patterns
    /^[123456789]+$/,    // Numbers
  ];
  for (const pattern of keyboardPatterns) {
    if (noSpaces.length > 4 && pattern.test(noSpaces)) {
      return {
        valid: false,
        category: 'GIBBERISH_INPUT',
        reason: 'keyboard pattern',
        feedback: "That looks like random typing. Please write a real action for your character.",
      };
    }
  }

  // 5. No vowels in alphabetic content (gibberish detection) - check before word count
  const alphaOnly = trimmed.replace(/[^a-zA-Z]/g, '');
  if (alphaOnly.length > 5 && !/[aeiouAEIOU]/.test(alphaOnly)) {
    return {
      valid: false,
      category: 'GIBBERISH_INPUT',
      reason: 'no vowels',
      feedback: "I couldn't understand your response. Please write real words describing your action.",
    };
  }

  // 6. Repeated characters (keyboard mashing) - 5+ consecutive repeated chars
  // if (/(.)\1{4,}/.test(trimmed)) {
  //   return {
  //     valid: false,
  //     category: 'GIBBERISH_INPUT',
  //     reason: 'repeated characters',
  //     feedback: "That doesn't look like a real response. Please write a clear action for your character.",
  //   };
  // }

  // 7. Too short (configurable, default 3 words) - check AFTER gibberish detection
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < minWordCount) {
    return {
      valid: false,
      category: 'TOO_SHORT',
      reason: `only ${words.length} word${words.length === 1 ? '' : 's'}`,
      feedback: `Your response is too short. Please describe your action in more detail (at least ${minWordCount} words).`,
    };
  }

  // 8. Duplicate of previous response
  if (isDuplicateOfPrevious(trimmed, previousResponses)) {
    return {
      valid: false,
      category: 'GIBBERISH_INPUT',
      reason: 'duplicate response',
      feedback: "You already tried that! Please write a different action.",
    };
  }

  // Passed all checks!
  return { valid: true };
}

/**
 * @description Check if the current response is too similar to a previous one.
 */
function isDuplicateOfPrevious(
  current: string,
  previousResponses: string[]
): boolean {
  if (previousResponses.length === 0) return false;

  const normalizedCurrent = normalizeForComparison(current);

  for (const previous of previousResponses) {
    const normalizedPrevious = normalizeForComparison(previous);
    
    // Exact match after normalization
    if (normalizedCurrent === normalizedPrevious) {
      return true;
    }

    // Very similar (90% overlap)
    if (calculateSimilarity(normalizedCurrent, normalizedPrevious) > 0.9) {
      return true;
    }
  }

  return false;
}

/**
 * @description Normalize text for duplicate comparison.
 */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
    .trim();
}

/**
 * @description Calculate simple similarity ratio between two strings.
 * Uses Jaccard similarity on character bigrams.
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const getBigrams = (s: string): Set<string> => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
  };

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);

  let intersection = 0;
  for (const bigram of bigramsA) {
    if (bigramsB.has(bigram)) intersection++;
  }

  const union = bigramsA.size + bigramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * @description Quick check if text appears to be gibberish.
 * Useful for early termination before more expensive checks.
 */
export function isLikelyGibberish(text: string): boolean {
  const result = preValidateResponse(text, { minWordCount: 1 });
  return !result.valid && result.category === 'GIBBERISH_INPUT';
}

