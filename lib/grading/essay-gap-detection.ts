/**
 * @fileoverview Gap detection service for essay grading.
 * Maps essay criterion scores to recommended practice lessons.
 */

import type {
  EssayScorecard,
  EssaySkillGap,
  EssayGapDetectionResult,
  CriterionScore,
} from './essay-rubrics';

/**
 * @description Mapping of essay criteria to practice lesson IDs.
 * Maps to AlphaWrite activities - see _docs/.../essay-criterion-lesson-mapping.md
 */
const ESSAY_CRITERION_TO_LESSONS: Record<string, string[]> = {
  // Topic sentence criteria
  'Each body paragraph has a topic sentence': [
    'make-topic-sentences',
    'identify-topic-sentence',
    'basic-conjunctions',
  ],

  // Supporting details
  'Supporting details support topic sentence': [
    'writing-spos',
    'eliminate-irrelevant-sentences',
    'elaborate-paragraphs',
  ],

  // Thesis
  'Developed thesis statement': [
    'write-t-from-topic',
    'distinguish-g-s-t',
    'make-topic-sentences',
  ],

  // Body paragraphs supporting thesis
  'Each body paragraph supports thesis': [
    'eliminate-irrelevant-sentences',
    'writing-spos',
    'using-transition-words',
  ],

  // Sentence strategies (TWR core skills)
  'Used sentence strategies': [
    'basic-conjunctions',
    'write-appositives',
    'subordinating-conjunctions',
    'kernel-expansion',
  ],

  // Transitions
  'Used transitions correctly': [
    'using-transition-words',
    'finishing-transition-words',
  ],

  // Introduction (GST structure)
  'Composed effective introduction': [
    'distinguish-g-s-t',
    'write-g-s-from-t',
    'write-introductory-sentences',
  ],

  // Conclusion (TSG structure)
  'Composed effective conclusion': [
    'craft-conclusion-from-gst',
    'distinguish-g-s-t',
  ],

  // Editing/grammar
  'Edited for grammar and mechanics': ['fragment-or-sentence'],

  // Counterclaim (advanced argumentative)
  'Addressed opposing view/counterclaim': [
    'match-details-pro-con',
    'subordinating-conjunctions',
  ],

  // Concluding sentence (grade 6)
  'Composed effective concluding sentence': [
    'write-cs-from-details',
    'make-topic-sentences',
  ],

  // Evidence
  'Used credible and relevant evidence': [
    'writing-spos',
    'eliminate-irrelevant-sentences',
    'elaborate-paragraphs',
  ],

  // Pro/Con balance
  'Presented both sides fairly': [
    'match-details-pro-con',
    'using-transition-words',
    'writing-spos',
  ],

  // Minimum paragraph count (structural, no direct lesson)
  'Minimum paragraph count': [],

  // Clear reasoning (advanced argumentative)
  'Clear reasoning from evidence to claim': [
    'subordinating-conjunctions',
    'elaborate-paragraphs',
    'writing-spos',
  ],
};

/**
 * @description Get severity based on criterion score.
 */
function getSeverity(score: CriterionScore): 'low' | 'medium' | 'high' {
  if (score === 'No') return 'high';
  if (score === 'Developing') return 'medium';
  return 'low';
}

/**
 * @description TWR tier definitions for lesson prioritization.
 * Lower tier = more foundational = higher priority within same severity.
 */
const LESSON_TIERS: Record<string, number> = {
  // Tier 1: Sentence-level lessons (foundational TWR skills)
  'basic-conjunctions': 1,
  'write-appositives': 1,
  'subordinating-conjunctions': 1,
  'kernel-expansion': 1,
  'fragment-or-sentence': 1,
  // Tier 2: Paragraph-level lessons
  'make-topic-sentences': 2,
  'identify-topic-sentence': 2,
  'writing-spos': 2,
  'eliminate-irrelevant-sentences': 2,
  'elaborate-paragraphs': 2,
  'using-transition-words': 2,
  'finishing-transition-words': 2,
  'write-cs-from-details': 2,
  'write-ts-from-details': 2,
  // Tier 3: Essay-level lessons
  'distinguish-g-s-t': 3,
  'write-g-s-from-t': 3,
  'write-introductory-sentences': 3,
  'craft-conclusion-from-gst': 3,
  'write-t-from-topic': 3,
  'match-details-pro-con': 3,
};

/**
 * @description Get TWR tier for a lesson (1=sentence, 2=paragraph, 3=essay, 4=unknown).
 */
function getLessonTier(lesson: string): number {
  return LESSON_TIERS[lesson] || 4;
}

/**
 * @description Detect skill gaps from an essay scorecard.
 * Returns gaps for any criterion not scoring "Yes".
 * 
 * Prioritization: Severity first, TWR tier second (within same severity).
 * See _docs/practice-mode/grader-info/essay-criterion-lesson-mapping.md
 */
export function detectGapsFromEssayScorecard(
  scorecard: EssayScorecard
): EssayGapDetectionResult {
  const gaps: EssaySkillGap[] = [];

  // Collect all gaps with their lessons
  for (const criterion of scorecard.criteria) {
    if (criterion.score === 'Yes') continue;

    const recommendedLessons = ESSAY_CRITERION_TO_LESSONS[criterion.criterion] || [];
    const severity = getSeverity(criterion.score);

    gaps.push({
      criterion: criterion.criterion,
      score: criterion.score,
      severity,
      recommendedLessons,
      explanation: criterion.explanation,
    });
  }

  // Sort gaps: severity first (high before medium), then TWR tier within severity
  const sortedGaps = [...gaps].sort((a, b) => {
    // Severity order: high (0) > medium (1) > low (2)
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Within same severity, sort by lowest tier lesson available
    const aMinTier = Math.min(...a.recommendedLessons.map(getLessonTier));
    const bMinTier = Math.min(...b.recommendedLessons.map(getLessonTier));
    return aMinTier - bMinTier;
  });

  // Build prioritized lessons list in gap order
  const seenLessons = new Set<string>();
  const prioritizedLessons: string[] = [];

  for (const gap of sortedGaps) {
    // Sort this gap's lessons by tier
    const sortedLessons = [...gap.recommendedLessons].sort(
      (a, b) => getLessonTier(a) - getLessonTier(b)
    );

    for (const lesson of sortedLessons) {
      if (!seenLessons.has(lesson)) {
        seenLessons.add(lesson);
        prioritizedLessons.push(lesson);
      }
    }
  }

  return {
    gaps: sortedGaps, // Return sorted gaps (severity first, then TWR tier)
    hasGaps: sortedGaps.length > 0,
    prioritizedLessons,
  };
}

/**
 * @description Analyze multiple essay scorecards to find persistent gaps.
 * Useful for recommending lessons based on multiple sessions.
 */
export function analyzeEssayGapPatterns(
  scorecards: EssayScorecard[],
  minOccurrences: number = 2
): EssayGapDetectionResult {
  const criterionGapCounts = new Map<
    string,
    { count: number; scores: CriterionScore[]; explanations: string[] }
  >();

  // Count gaps across all scorecards
  for (const scorecard of scorecards) {
    for (const criterion of scorecard.criteria) {
      if (criterion.score === 'Yes') continue;

      const existing = criterionGapCounts.get(criterion.criterion) || {
        count: 0,
        scores: [],
        explanations: [],
      };
      existing.count++;
      existing.scores.push(criterion.score);
      existing.explanations.push(criterion.explanation);
      criterionGapCounts.set(criterion.criterion, existing);
    }
  }

  // Build gaps from patterns that occur at least minOccurrences times
  const gaps: EssaySkillGap[] = [];
  const allLessons = new Set<string>();

  for (const [criterionName, data] of criterionGapCounts) {
    if (data.count < minOccurrences) continue;

    // Determine severity based on most common score
    const noCount = data.scores.filter((s) => s === 'No').length;
    const developingCount = data.scores.filter((s) => s === 'Developing').length;
    const mostCommonScore: CriterionScore =
      noCount >= developingCount ? 'No' : 'Developing';
    const severity = getSeverity(mostCommonScore);

    const recommendedLessons = ESSAY_CRITERION_TO_LESSONS[criterionName] || [];

    gaps.push({
      criterion: criterionName,
      score: mostCommonScore,
      severity,
      recommendedLessons,
      explanation: `Recurring issue (${data.count} times): ${data.explanations[0]}`,
    });

    recommendedLessons.forEach((lesson) => allLessons.add(lesson));
  }

  // Sort gaps by severity
  gaps.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return {
    gaps,
    hasGaps: gaps.length > 0,
    prioritizedLessons: Array.from(allLessons),
  };
}

/**
 * @description Get the top N recommended lessons based on essay gaps.
 */
export function getTopRecommendedLessons(
  gapResult: EssayGapDetectionResult,
  limit: number = 3
): string[] {
  return gapResult.prioritizedLessons.slice(0, limit);
}

/**
 * @description Check if a specific lesson is recommended based on essay gaps.
 */
export function isLessonRecommended(
  gapResult: EssayGapDetectionResult,
  lessonId: string
): boolean {
  return gapResult.prioritizedLessons.includes(lessonId);
}

/**
 * @description Get a summary of gaps by severity.
 */
export function getGapSummary(gapResult: EssayGapDetectionResult): {
  highSeverity: number;
  mediumSeverity: number;
  total: number;
} {
  const highSeverity = gapResult.gaps.filter((g) => g.severity === 'high').length;
  const mediumSeverity = gapResult.gaps.filter((g) => g.severity === 'medium').length;

  return {
    highSeverity,
    mediumSeverity,
    total: gapResult.gaps.length,
  };
}

