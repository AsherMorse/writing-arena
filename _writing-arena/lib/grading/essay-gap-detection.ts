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
 * @description Mapping of essay criteria to practice lesson IDs (full names).
 * Maps to AlphaWrite activities - see _docs/.../essay-criterion-lesson-mapping.md
 */
export const ESSAY_CRITERION_TO_LESSONS: Record<string, {
  high: string[];
  medium: string[];
  low: string[];
}> = {
  // Topic sentence criteria
  'Each body paragraph has a topic sentence': {
    high: ['make-topic-sentences', 'identify-topic-sentence', 'basic-conjunctions'],
    medium: ['make-topic-sentences', 'identify-topic-sentence'],
    low: ['make-topic-sentences'],
  },

  // Supporting details
  'Supporting details support topic sentence': {
    high: ['writing-spos', 'elaborate-paragraphs', 'eliminate-irrelevant-sentences'],
    medium: ['writing-spos', 'elaborate-paragraphs'],
    low: ['elaborate-paragraphs'],
  },

  // Thesis
  'Developed thesis statement': {
    high: ['write-t-from-topic', 'distinguish-g-s-t', 'make-topic-sentences'],
    medium: ['write-t-from-topic', 'distinguish-g-s-t'],
    low: ['write-t-from-topic'],
  },

  // Body paragraphs supporting thesis
  'Each body paragraph supports thesis': {
    high: ['eliminate-irrelevant-sentences', 'writing-spos', 'using-transition-words'],
    medium: ['eliminate-irrelevant-sentences', 'writing-spos'],
    low: ['eliminate-irrelevant-sentences'],
  },

  // Sentence strategies (TWR core skills)
  'Used sentence strategies': {
    high: ['basic-conjunctions', 'write-appositives', 'subordinating-conjunctions', 'kernel-expansion'],
    medium: ['basic-conjunctions', 'subordinating-conjunctions'],
    low: ['basic-conjunctions'],
  },

  // Transitions
  'Used transitions correctly': {
    high: ['using-transition-words', 'finishing-transition-words'],
    medium: ['using-transition-words', 'finishing-transition-words'],
    low: ['using-transition-words'],
  },

  // Introduction (GST structure)
  'Composed effective introduction': {
    high: ['distinguish-g-s-t', 'write-g-s-from-t', 'write-introductory-sentences'],
    medium: ['distinguish-g-s-t', 'write-g-s-from-t'],
    low: ['distinguish-g-s-t'],
  },

  // Conclusion (TSG structure)
  'Composed effective conclusion': {
    high: ['craft-conclusion-from-gst', 'distinguish-g-s-t'],
    medium: ['craft-conclusion-from-gst'],
    low: ['craft-conclusion-from-gst'],
  },

  // Editing/grammar
  'Edited for grammar and mechanics': {
    high: ['fragment-or-sentence', 'combine-sentences'],
    medium: ['fragment-or-sentence'],
    low: ['fragment-or-sentence'],
  },

  // Counterclaim (advanced argumentative)
  'Addressed opposing view/counterclaim': {
    high: ['match-details-pro-con', 'subordinating-conjunctions'],
    medium: ['match-details-pro-con'],
    low: ['match-details-pro-con'],
  },

  // Concluding sentence (grade 6)
  'Composed effective concluding sentence': {
    high: ['write-cs-from-details', 'make-topic-sentences'],
    medium: ['write-cs-from-details'],
    low: ['write-cs-from-details'],
  },

  // Evidence
  'Used credible and relevant evidence': {
    high: ['writing-spos', 'elaborate-paragraphs', 'eliminate-irrelevant-sentences'],
    medium: ['writing-spos', 'elaborate-paragraphs'],
    low: ['writing-spos'],
  },

  // Pro/Con balance
  'Presented both sides fairly': {
    high: ['match-details-pro-con', 'using-transition-words', 'writing-spos'],
    medium: ['match-details-pro-con', 'using-transition-words'],
    low: ['match-details-pro-con'],
  },

  // Minimum paragraph count (structural, no direct lesson)
  'Minimum paragraph count': {
    high: [],
    medium: [],
    low: [],
  },

  // Clear reasoning (advanced argumentative)
  'Clear reasoning from evidence to claim': {
    high: ['subordinating-conjunctions', 'elaborate-paragraphs', 'writing-spos'],
    medium: ['subordinating-conjunctions', 'writing-spos'],
    low: ['subordinating-conjunctions'],
  },
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
 * @description Mapping of essay criteria to practice lesson IDs by severity (short IDs).
 * Used by fantasy grader which uses criterionId like 'thesis', 'topicSentences', etc.
 * Severity-aligned: more lessons for more severe gaps.
 */
export const ESSAY_CRITERION_ID_TO_LESSONS: Record<string, {
  high: string[];    // Status "no": Full suite (2-4 lessons)
  medium: string[];  // Status "developing": Core skills (2 lessons)
  low: string[];     // Not used (essays don't track low severity)
}> = {
  thesis: {
    high: ['write-t-from-topic', 'distinguish-g-s-t', 'make-topic-sentences'],
    medium: ['write-t-from-topic', 'distinguish-g-s-t'],
    low: ['write-t-from-topic'],
  },
  topicSentences: {
    high: ['make-topic-sentences', 'identify-topic-sentence', 'basic-conjunctions'],
    medium: ['make-topic-sentences', 'identify-topic-sentence'],
    low: ['make-topic-sentences'],
  },
  supportingDetails: {
    high: ['writing-spos', 'elaborate-paragraphs', 'eliminate-irrelevant-sentences'],
    medium: ['writing-spos', 'elaborate-paragraphs'],
    low: ['elaborate-paragraphs'],
  },
  unity: {
    high: ['eliminate-irrelevant-sentences', 'writing-spos', 'using-transition-words'],
    medium: ['eliminate-irrelevant-sentences', 'writing-spos'],
    low: ['eliminate-irrelevant-sentences'],
  },
  transitions: {
    high: ['using-transition-words', 'finishing-transition-words'],
    medium: ['using-transition-words', 'finishing-transition-words'],
    low: ['using-transition-words'],
  },
  conclusion: {
    high: ['craft-conclusion-from-gst', 'distinguish-g-s-t'],
    medium: ['craft-conclusion-from-gst'],
    low: ['craft-conclusion-from-gst'],
  },
  sentenceStrategies: {
    high: ['basic-conjunctions', 'write-appositives', 'subordinating-conjunctions', 'kernel-expansion'],
    medium: ['basic-conjunctions', 'subordinating-conjunctions'],
    low: ['basic-conjunctions'],
  },
  conventions: {
    high: ['fragment-or-sentence', 'combine-sentences'],
    medium: ['fragment-or-sentence'],
    low: ['fragment-or-sentence'],
  },
  paragraphCount: {
    high: [],
    medium: [],
    low: [],
  },
};

/**
 * @description TWR tier definitions for lesson prioritization.
 * Lower tier = more foundational = higher priority within same severity.
 */
export const LESSON_TIERS: Record<string, number> = {
  // Tier 1: Sentence-level lessons (foundational TWR skills)
  'basic-conjunctions': 1,
  'write-appositives': 1,
  'subordinating-conjunctions': 1,
  'kernel-expansion': 1,
  'fragment-or-sentence': 1,
  'combine-sentences': 1,
  'identify-appositives': 1,
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

    const severity = getSeverity(criterion.score);
    const lessonMap = ESSAY_CRITERION_TO_LESSONS[criterion.criterion];
    const recommendedLessons = lessonMap ? lessonMap[severity] : [];

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

    const lessonMap = ESSAY_CRITERION_TO_LESSONS[criterionName];
    const recommendedLessons = lessonMap ? lessonMap[severity] : [];

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

