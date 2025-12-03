/**
 * @fileoverview Gap detection service for paragraph grading.
 * Maps rubric category scores to recommended practice lessons.
 */

import type {
  ParagraphScorecard,
  SkillGap,
  GapDetectionResult,
} from './paragraph-rubrics';

/**
 * @description Threshold below which a category is considered a gap.
 * Score of 4 or higher is considered proficient, below 4 needs work.
 */
const GAP_THRESHOLD = 4;

/**
 * @description Mapping of rubric categories to practice lesson IDs.
 * These map directly to lessons in lib/constants/practice-lessons.ts
 */
const CATEGORY_TO_LESSONS: Record<string, string[]> = {
  // Topic Sentence variations (all rubric types)
  'Topic Sentence': ['topic-sentence', 'basic-conjunctions', 'write-appositives'],
  'Claim (Topic Sentence)': ['topic-sentence', 'basic-conjunctions'],
  'Topic Sentence (Opinion Statement)': ['topic-sentence', 'basic-conjunctions'],
  'Topic Sentence (Introduction)': ['topic-sentence', 'basic-conjunctions'],

  // Detail Sentences variations
  'Detail Sentences': ['transition-words', 'subordinating-conjunctions', 'kernel-expansion'],
  'Evidence and Reasoning (Detail Sentences)': ['transition-words', 'subordinating-conjunctions', 'kernel-expansion'],
  'Supporting Details (Facts and Evidence)': ['transition-words', 'kernel-expansion'],
  'Supporting Details (Pro or Con)': ['transition-words', 'subordinating-conjunctions'],

  // Concluding Sentence (all rubrics use same name)
  'Concluding Sentence': ['topic-sentence', 'write-appositives'],

  // Conventions
  'Conventions': ['fragment-or-sentence'],
};

/**
 * @description Get severity based on score.
 */
function getSeverity(score: number): 'low' | 'medium' | 'high' {
  if (score <= 1) return 'high';
  if (score <= 2) return 'medium';
  return 'low';
}

/**
 * @description Detect skill gaps from a paragraph scorecard.
 * Returns gaps for any category scoring below the threshold (4/5).
 */
export function detectGapsFromScorecard(scorecard: ParagraphScorecard): GapDetectionResult {
  const gaps: SkillGap[] = [];
  const allLessons = new Set<string>();

  for (const category of scorecard.categories) {
    if (category.score < GAP_THRESHOLD) {
      const recommendedLessons = CATEGORY_TO_LESSONS[category.title] || [];
      const severity = getSeverity(category.score);

      gaps.push({
        category: category.title,
        score: category.score,
        maxScore: category.maxScore,
        severity,
        recommendedLessons,
        feedback: category.feedback,
      });

      // High severity lessons get priority
      if (severity === 'high') {
        recommendedLessons.forEach(lesson => allLessons.add(lesson));
      }
    }
  }

  // Add medium severity lessons if we haven't hit limit
  gaps
    .filter(g => g.severity === 'medium')
    .forEach(g => g.recommendedLessons.forEach(lesson => allLessons.add(lesson)));

  // Add low severity lessons
  gaps
    .filter(g => g.severity === 'low')
    .forEach(g => g.recommendedLessons.forEach(lesson => allLessons.add(lesson)));

  // Prioritize lessons (prefer available ones and sentence-level first)
  const prioritizedLessons = Array.from(allLessons).sort((a, b) => {
    // Sentence-level lessons first (TWR approach: build from sentences up)
    const sentenceLessons = ['basic-conjunctions', 'write-appositives', 'subordinating-conjunctions', 'kernel-expansion', 'fragment-or-sentence'];
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
 * @description Analyze multiple scorecards to find persistent gaps (patterns).
 * Useful for recommending lessons based on multiple sessions.
 */
export function analyzeGapPatterns(
  scorecards: ParagraphScorecard[],
  minOccurrences: number = 2
): GapDetectionResult {
  const categoryGapCounts = new Map<string, { count: number; totalScore: number; feedback: string[] }>();

  // Count gaps across all scorecards
  for (const scorecard of scorecards) {
    for (const category of scorecard.categories) {
      if (category.score < GAP_THRESHOLD) {
        const existing = categoryGapCounts.get(category.title) || { count: 0, totalScore: 0, feedback: [] };
        existing.count++;
        existing.totalScore += category.score;
        existing.feedback.push(category.feedback);
        categoryGapCounts.set(category.title, existing);
      }
    }
  }

  // Build gaps from patterns that occur at least minOccurrences times
  const gaps: SkillGap[] = [];
  const allLessons = new Set<string>();

  for (const [category, data] of categoryGapCounts) {
    if (data.count >= minOccurrences) {
      const avgScore = Math.round(data.totalScore / data.count);
      const recommendedLessons = CATEGORY_TO_LESSONS[category] || [];
      const severity = getSeverity(avgScore);

      gaps.push({
        category,
        score: avgScore,
        maxScore: 5,
        severity,
        recommendedLessons,
        feedback: `Recurring issue (${data.count} times): ${data.feedback[0]}`,
      });

      recommendedLessons.forEach(lesson => allLessons.add(lesson));
    }
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
 * @description Get the top N recommended lessons based on gaps.
 */
export function getTopRecommendedLessons(
  gapResult: GapDetectionResult,
  limit: number = 3
): string[] {
  return gapResult.prioritizedLessons.slice(0, limit);
}

/**
 * @description Check if a specific lesson is recommended based on gaps.
 */
export function isLessonRecommended(
  gapResult: GapDetectionResult,
  lessonId: string
): boolean {
  return gapResult.prioritizedLessons.includes(lessonId);
}

