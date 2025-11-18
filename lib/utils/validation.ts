/**
 * Form validation utilities
 */

/**
 * Check if a string value is empty
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Check if a string meets minimum length requirement
 */
export function isMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

/**
 * Check if all form responses meet minimum length requirements
 */
export function isFormComplete(
  responses: Record<string, string>,
  minLength: number = 10
): boolean {
  return Object.values(responses).every(response => 
    isMinLength(response, minLength)
  );
}

/**
 * Check if revised content is unchanged from original
 */
export function isUnchanged(original: string, revised: string): boolean {
  return original.trim() === revised.trim();
}

/**
 * Check if content has minimum word count
 */
export function hasMinimumWords(content: string, minWords: number): boolean {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length >= minWords;
}

/**
 * Validate submission content
 */
export function validateSubmission(
  content: string,
  wordCount: number,
  minWords: number = 1
): { isValid: boolean; error?: string } {
  if (isEmpty(content)) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  
  if (wordCount < minWords) {
    return { isValid: false, error: `Minimum ${minWords} word(s) required` };
  }
  
  return { isValid: true };
}

