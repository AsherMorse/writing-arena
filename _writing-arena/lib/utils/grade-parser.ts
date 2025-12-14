/**
 * Grade level parsing utilities
 */

/**
 * Parse grade level string to number (3-12)
 * Handles formats like "7th", "7th-8th", "7th grade", etc.
 */
export function parseGradeLevel(gradeLevel: string): number {
  // Handle ranges like "7th-8th" by taking the first number
  const gradeMatch = gradeLevel.match(/(\d+)(?:st|nd|rd|th)/);
  if (gradeMatch) {
    const gradeNum = parseInt(gradeMatch[1], 10);
    // Validate range
    if (gradeNum >= 3 && gradeNum <= 12) {
      return gradeNum;
    }
  }
  return 7; // Default to 7th grade
}

/**
 * Get grade level category
 */
export function getGradeLevelCategory(gradeNum: number): 'elementary' | 'middle' | 'high' {
  if (gradeNum >= 3 && gradeNum <= 5) return 'elementary';
  if (gradeNum >= 6 && gradeNum <= 8) return 'middle';
  if (gradeNum >= 9 && gradeNum <= 12) return 'high';
  return 'middle'; // Default
}

