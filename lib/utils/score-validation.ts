/**
 * Score validation utilities
 */

/**
 * Clamp a score component to a specific range
 */
export function clampScoreComponent(score: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, score));
}

/**
 * Validate and clamp AP Lang component scores
 */
export interface APLangScoreResult {
  thesisScore: number;
  evidenceScore: number;
  sophisticationScore: number;
  score?: number;
  scoreDescriptor?: string;
  [key: string]: any;
}

export function validateAPLangScores(result: APLangScoreResult): void {
  result.thesisScore = clampScoreComponent(result.thesisScore, 0, 1);
  result.evidenceScore = clampScoreComponent(result.evidenceScore, 0, 4);
  result.sophisticationScore = clampScoreComponent(result.sophisticationScore, 0, 1);
}

