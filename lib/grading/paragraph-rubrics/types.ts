/**
 * @fileoverview Type definitions for TWR-based paragraph grading rubrics.
 * Adapted from AlphaWrite's single-paragraph rubric system.
 */

/**
 * @description Available rubric types for paragraph grading.
 */
export type ParagraphRubricType = 'expository' | 'argumentative' | 'opinion' | 'pro-con';

/**
 * @description Score level descriptor for a rubric criterion.
 */
export interface ScoreLevel {
  score: number;
  description: string;
}

/**
 * @description A category within the paragraph rubric (e.g., Topic Sentence, Detail Sentences).
 */
export interface ParagraphRubricCategory {
  title: string;
  criteria: ScoreLevel[];
}

/**
 * @description Complete paragraph rubric definition with all categories.
 */
export interface ParagraphRubric {
  id: ParagraphRubricType;
  title: string;
  description?: string;
  categories: ParagraphRubricCategory[];
  maxScore: number;
}

/**
 * @description Graded result for a single category.
 */
export interface GradedCategory {
  title: string;
  score: number;
  maxScore: number;
  feedback: string;
}

/**
 * @description Complete scorecard with all graded categories.
 */
export interface ParagraphScorecard {
  rubricId: ParagraphRubricType;
  categories: GradedCategory[];
  totalScore: number;
  maxScore: number;
  percentageScore: number;
}

/**
 * @description Full grading result including scorecard and TWR-specific feedback.
 */
export interface ParagraphGradingResult {
  scorecard: ParagraphScorecard;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

/**
 * @description Input parameters for paragraph grading.
 */
export interface ParagraphGradingInput {
  paragraph: string;
  prompt: string;
  rubricType?: ParagraphRubricType;
  gradeLevel?: number;
}

/**
 * @description Skill gap detected from paragraph grading.
 */
export interface SkillGap {
  category: string;
  score: number;
  maxScore: number;
  severity: 'low' | 'medium' | 'high';
  recommendedLessons: string[];
  feedback: string;
}

/**
 * @description Result of gap detection analysis.
 */
export interface GapDetectionResult {
  gaps: SkillGap[];
  hasGaps: boolean;
  prioritizedLessons: string[];
}

