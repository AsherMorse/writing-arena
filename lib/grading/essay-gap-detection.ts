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

  // Prioritize lessons (TWR approach: sentence → paragraph → essay)
  const prioritizedLessons = Array.from(allLessons).sort((a, b) => {
    // Tier 1: Sentence-level lessons (foundational TWR skills)
    const sentenceLessons = [
      'basic-conjunctions',
      'write-appositives',
      'subordinating-conjunctions',
      'kernel-expansion',
      'fragment-or-sentence',
    ];

    // Tier 2: Paragraph-level lessons
    const paragraphLessons = [
      'make-topic-sentences',
      'identify-topic-sentence',
      'writing-spos',
      'eliminate-irrelevant-sentences',
      'elaborate-paragraphs',
      'using-transition-words',
      'finishing-transition-words',
      'write-cs-from-details',
    ];

    // Tier 3: Essay-level lessons
    const essayLessons = [
      'distinguish-g-s-t',
      'write-g-s-from-t',
      'write-introductory-sentences',
      'craft-conclusion-from-gst',
      'write-t-from-topic',
      'match-details-pro-con',
    ];

    // Get tier for each lesson (lower = higher priority)
    const getTier = (lesson: string) => {
      if (sentenceLessons.includes(lesson)) return 1;
      if (paragraphLessons.includes(lesson)) return 2;
      if (essayLessons.includes(lesson)) return 3;
      return 4; // Unknown lessons last
    };

    const tierDiff = getTier(a) - getTier(b);
    if (tierDiff !== 0) return tierDiff;

    // Within same tier, prioritize available lessons
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

