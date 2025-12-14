/**
 * @fileoverview Type definitions for TWR-based essay grading rubrics.
 * Adapted from AlphaWrite's categorical rubric system (Yes/Developing/No scoring).
 */

/**
 * @description Available essay types for grading (7 total).
 */
export type EssayType =
  | 'Expository'
  | 'Problem/Solution'
  | 'Argumentative'
  | 'Opinion'
  | 'Pro/Con'
  | 'Narrative'
  | 'Story';

/**
 * @description Scoring options for essay criteria (categorical, not numeric).
 */
export type CriterionScore = 'Yes' | 'Developing' | 'No';

/**
 * @description Category groupings for essay criteria.
 * Structure: Organization and framework (thesis, intro, conclusion, paragraph count)
 * Content: What's inside (topic sentences, supporting details, evidence)
 * Craft: How it's written (sentence strategies, transitions, editing)
 */
export type CriterionCategory = 'Structure' | 'Content' | 'Craft';

/**
 * @description Grade level range for criterion applicability.
 */
export interface GradeRange {
  min: number;
  max: number;
}

/**
 * @description Grade-level specific guidance for a criterion.
 */
export interface GradeLevelGuidance {
  min: number;
  max: number;
  explanation: string;
}

/**
 * @description Single essay criterion definition from the rubric.
 */
export interface EssayCriterion {
  name: string;
  description: string;
  category: CriterionCategory;
  applicableGrades: GradeRange;
  applicableEssayTypes?: EssayType[];
  essayTypeGuidance?: Partial<Record<EssayType, string>>;
  gradeLevelGuidance?: GradeLevelGuidance[];
  subcriteria?: string[];
}

/**
 * @description Example with text span for highlighting (matches paragraph grader format).
 */
export interface CriterionExample {
  substringOfInterest: string;
  explanationOfSubstring: string;
}

/**
 * @description Graded result for a single criterion.
 */
export interface GradedCriterion {
  criterion: string;
  category?: CriterionCategory;
  score: CriterionScore;
  explanation: string;
  examplesOfGreatResults: CriterionExample[];
  examplesOfWhereToImprove: CriterionExample[];
}

/**
 * @description Complete essay scorecard with all graded criteria.
 */
export interface EssayScorecard {
  essayType: EssayType;
  gradeLevel: number;
  criteria: GradedCriterion[];
  totalPoints: number;
  maxPoints: number;
  percentageScore: number;
}

/**
 * @description Full essay grading result including scorecard and feedback.
 */
export interface EssayGradingResult {
  scorecard: EssayScorecard;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

/**
 * @description Input parameters for essay grading.
 */
export interface EssayGradingInput {
  essay: string;
  prompt: string;
  essayType?: EssayType;
  gradeLevel: number;
}

/**
 * @description Skill gap detected from essay grading.
 */
export interface EssaySkillGap {
  criterion: string;
  score: CriterionScore;
  severity: 'low' | 'medium' | 'high';
  recommendedLessons: string[];
  explanation: string;
}

/**
 * @description Result of essay gap detection analysis.
 */
export interface EssayGapDetectionResult {
  gaps: EssaySkillGap[];
  hasGaps: boolean;
  prioritizedLessons: string[];
}

/**
 * @description Prepared rubric with filtered criteria for a specific grade/type.
 */
export interface PreparedEssayRubric {
  essayType: EssayType;
  gradeLevel: number;
  criteria: EssayCriterion[];
}


