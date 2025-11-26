/**
 * AP Language and Composition scoring constants and utilities
 */

export const AP_LANG_SCORE_DESCRIPTORS: Record<number, string> = {
  6: 'Excellent',
  5: 'Strong',
  4: 'Adequate',
  3: 'Developing',
  2: 'Weak',
  1: 'Very Weak',
  0: 'Insufficient',
} as const;

export function getAPLangScoreDescriptor(score: number): string {
  return AP_LANG_SCORE_DESCRIPTORS[score] || 'Adequate';
}

export const AP_LANG_ESSAY_TYPES = ['argument', 'rhetorical-analysis', 'synthesis'] as const;
export type APLangEssayType = typeof AP_LANG_ESSAY_TYPES[number];

export function isValidEssayType(type: string): type is APLangEssayType {
  return AP_LANG_ESSAY_TYPES.includes(type as APLangEssayType);
}

