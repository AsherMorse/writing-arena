/**
 * Validation utilities for phase submissions
 */

export interface ValidationResult {
  isValid: boolean;
  isEmpty?: boolean;
  unchanged?: boolean;
}

/**
 * Validate writing submission (Phase 1)
 */
export function validateWritingSubmission(
  content: string,
  wordCount: number
): ValidationResult {
  // Check for empty content - be very strict
  const trimmedContent = content?.trim() || '';
  const isEmpty = !content || trimmedContent.length === 0 || wordCount === 0;
  
  if (isEmpty) {
    console.warn('⚠️ VALIDATION - Empty writing detected:', {
      hasContent: !!content,
      contentLength: content?.length || 0,
      trimmedLength: trimmedContent.length,
      wordCount,
    });
  }
  
  return { isValid: !isEmpty, isEmpty };
}

/**
 * Validate feedback submission (Phase 2)
 */
export function validateFeedbackSubmission(
  responses: Record<string, string>
): ValidationResult {
  const totalChars = Object.values(responses).join('').trim().length;
  const isEmpty = totalChars < 50; // Less than 50 total characters = empty
  
  if (isEmpty) {
    console.warn('⚠️ VALIDATION - Empty feedback detected:', {
      totalChars,
      responseLengths: Object.entries(responses).map(([key, value]) => ({
        key,
        length: value?.trim().length || 0,
      })),
    });
  }
  
  return { isValid: !isEmpty, isEmpty };
}

/**
 * Validate revision submission (Phase 3)
 */
export function validateRevisionSubmission(
  originalContent: string,
  revisedContent: string,
  wordCount: number
): ValidationResult {
  const trimmedRevised = revisedContent?.trim() || '';
  const isEmpty = !revisedContent || trimmedRevised.length === 0 || wordCount === 0;
  const unchanged = revisedContent === originalContent;
  
  if (isEmpty || unchanged) {
    console.warn('⚠️ VALIDATION - Invalid revision detected:', {
      isEmpty,
      unchanged,
      originalLength: originalContent?.length || 0,
      revisedLength: revisedContent?.length || 0,
      trimmedRevisedLength: trimmedRevised.length,
      wordCount,
    });
  }
  
  return { isValid: !isEmpty && !unchanged, isEmpty, unchanged };
}

