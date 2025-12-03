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
 * These map directly to lessons in lib/constants/practice-lessons.ts
 */
const ESSAY_CRITERION_TO_LESSONS: Record<string, string[]> = {
  // Topic sentence criteria
  'Each body paragraph has a topic sentence': [
    'topic-sentence',
    'basic-conjunctions',
  ],

  // Supporting details
  'Supporting details support topic sentence': [
    'transition-words',
    'kernel-expansion',
    'subordinating-conjunctions',
  ],

  // Thesis
  'Developed thesis statement': ['topic-sentence'],

  // Body paragraphs supporting thesis
  'Each body paragraph supports thesis': ['topic-sentence', 'transition-words'],

  // Sentence strategies (most important for TWR)
  'Used sentence strategies': [
    'basic-conjunctions',
    'write-appositives',
    'subordinating-conjunctions',
    'kernel-expansion',
  ],

  // Transitions
  'Used transitions correctly': ['transition-words'],

  // Introduction (GST structure)
  'Composed effective introduction': ['topic-sentence'],

  // Conclusion (TSG structure)
  'Composed effective conclusion': ['topic-sentence'],

  // Editing/grammar
  'Edited for grammar and mechanics': ['fragment-or-sentence'],

  // Counterclaim (advanced)
  'Addressed opposing view/counterclaim': ['subordinating-conjunctions'],

  // Concluding sentence (grade 6)
  'Composed effective concluding sentence': ['topic-sentence'],

  // Evidence
  'Used credible and relevant evidence': ['transition-words', 'kernel-expansion'],

  // Pro/Con balance
  'Presented both sides fairly': ['transition-words'],

  // Minimum paragraph count (structural, no direct lesson)
  'Minimum paragraph count': [],

  // Clear reasoning (advanced argumentative)
  'Clear reasoning from evidence to claim': [
    'subordinating-conjunctions',
    'kernel-expansion',
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
 * @description Detect skill gaps from an essay scorecard.
 * Returns gaps for any criterion not scoring "Yes".
 */
export function detectGapsFromEssayScorecard(
  scorecard: EssayScorecard
): EssayGapDetectionResult {
  const gaps: EssaySkillGap[] = [];
  const allLessons = new Set<string>();

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

    // High severity lessons get added first
    if (severity === 'high') {
      recommendedLessons.forEach((lesson) => allLessons.add(lesson));
    }
  }

  // Add medium severity lessons
  gaps
    .filter((g) => g.severity === 'medium')
    .forEach((g) => g.recommendedLessons.forEach((lesson) => allLessons.add(lesson)));

  // Prioritize lessons (sentence-level first, then available ones)
  const prioritizedLessons = Array.from(allLessons).sort((a, b) => {
    // Sentence-level lessons first (TWR approach: build from sentences up)
    const sentenceLessons = [
      'basic-conjunctions',
      'write-appositives',
      'subordinating-conjunctions',
      'kernel-expansion',
      'fragment-or-sentence',
    ];
    const aIsSentence = sentenceLessons.includes(a);
    const bIsSentence = sentenceLessons.includes(b);
    if (aIsSentence && !bIsSentence) return -1;
    if (!aIsSentence && bIsSentence) return 1;

    // Available lessons before coming-soon
    const availableLessons = ['basic-conjunctions', 'write-appositives'];
    const aAvailable = availableLessons.includes(a);
    const bAvailable = availableLessons.includes(b);
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;

    return 0;
  });

  return {
    gaps,
    hasGaps: gaps.length > 0,
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

