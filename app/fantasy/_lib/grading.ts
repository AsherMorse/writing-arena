import { gradeWithAdaptiveGrader, type AdaptiveGraderInput } from './adaptive-paragraph-grader';
import { gradeWithAdaptiveEssayGrader, type AdaptiveEssayGraderInput } from './adaptive-essay-grader';
import type { GraderResult, GraderRemark } from './grader-config';
import type { EssayGraderResult, EssayCriterionResult, CriterionStatus, EssayScores } from './essay-grader-config';
export { HIGHLIGHTABLE_CRITERIA } from './essay-grader-config';

import { CATEGORY_TO_LESSONS } from '@/lib/grading/paragraph-gap-detection';
import { ESSAY_CRITERION_ID_TO_LESSONS, LESSON_TIERS } from '@/lib/grading/essay-gap-detection';

export type WritingType = 'paragraph' | 'essay';

export interface GradeRequest {
  content: string;
  prompt: string;
  type: WritingType;
  gradeLevel?: number;
  previousResult?: GraderResult;
  previousContent?: string;
}

export interface EssayGradeRequest {
  content: string;
  prompt: string;
  type: 'essay';
  gradeLevel?: number;
  previousResult?: EssayGraderResult;
  previousContent?: string;
}

export interface SkillGap {
  category: string;
  score: number;
  maxScore: number;
  severity: 'low' | 'medium' | 'high';
  feedback: string;
  recommendedLessons: string[];
}

export interface GradeResponse {
  result: GraderResult;
  gaps: SkillGap[];
  hasSevereGap: boolean;
  prioritizedLessons: string[];
}

export interface EssayGradeResponse {
  result: EssayGraderResult;
  gaps: SkillGap[];
  hasSevereGap: boolean;
  prioritizedLessons: string[];
}

/**
 * @description Get TWR tier for a lesson (1=sentence, 2=paragraph, 3=essay, 4=unknown).
 */
function getLessonTier(lesson: string): number {
  return LESSON_TIERS[lesson] || 4;
}

/**
 * @description Prioritize lessons: severity first, then TWR tier (sentence → paragraph → essay).
 */
function prioritizeLessons(gaps: SkillGap[]): string[] {
  // Sort gaps by severity (high first)
  const sortedGaps = [...gaps].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Build prioritized lessons list
  const seenLessons = new Set<string>();
  const prioritizedLessons: string[] = [];

  for (const gap of sortedGaps) {
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

  return prioritizedLessons;
}

function detectGapsFromResult(result: GraderResult): SkillGap[] {
  const gaps: SkillGap[] = [];
  const { scores } = result;

  const categoryMapping: Array<{ key: keyof typeof scores; name: string }> = [
    { key: 'topicSentence', name: 'Topic Sentence' },
    { key: 'detailSentences', name: 'Detail Sentences' },
    { key: 'concludingSentence', name: 'Concluding Sentence' },
    { key: 'conventions', name: 'Conventions' },
  ];

  for (const { key, name } of categoryMapping) {
    const score = scores[key] as number;
    
    // Determine severity based on score
    let severity: SkillGap['severity'];
    if (score <= 2) {
      severity = 'high';
    } else if (score === 3) {
      severity = 'medium';
    } else if (score === 4) {
      severity = 'low';
    } else {
      continue; // Score 5 = no gap
    }
    
    const relatedRemark = result.remarks.find(r => 
      r.category.toLowerCase().includes(name.toLowerCase().split(' ')[0])
    );
    
    const lessonMap = CATEGORY_TO_LESSONS[name];
    const recommendedLessons = lessonMap ? lessonMap[severity] : [];
    
    gaps.push({
      category: name,
      score,
      maxScore: 5,
      severity,
      feedback: relatedRemark?.concreteProblem || `Needs improvement in ${name.toLowerCase()}`,
      recommendedLessons,
    });
  }

  return gaps;
}

function detectEssayGaps(result: EssayGraderResult): SkillGap[] {
  const gaps: SkillGap[] = [];

  for (const criterion of result.criteria) {
    let severity: SkillGap['severity'];
    let score: number;
    
    if (criterion.status === 'no') {
      severity = 'high';
      score = 0;
    } else if (criterion.status === 'developing') {
      severity = 'medium';
      score = 0.5;
    } else {
      continue; // Status 'yes' = no gap
    }
    
    const lessonMap = ESSAY_CRITERION_ID_TO_LESSONS[criterion.criterionId];
    const recommendedLessons = lessonMap ? lessonMap[severity] : [];
    
    gaps.push({
      category: criterion.criterionId,
      score,
      maxScore: 1,
      severity,
      feedback: criterion.feedback,
      recommendedLessons,
    });
  }

  return gaps;
}

export async function gradeWriting(request: GradeRequest): Promise<GradeResponse> {
  if (request.type === 'essay') {
    throw new Error('Use gradeEssay for essay grading');
  }

  const graderInput: AdaptiveGraderInput = {
    paragraph: request.content,
    prompt: request.prompt,
    gradeLevel: request.gradeLevel,
    previousResult: request.previousResult,
    previousParagraph: request.previousContent,
  };

  const result = await gradeWithAdaptiveGrader(graderInput);
  const gaps = detectGapsFromResult(result);
  const prioritizedLessons = prioritizeLessons(gaps);

  return {
    result,
    gaps,
    hasSevereGap: gaps.some((g) => g.severity === 'high'),
    prioritizedLessons,
  };
}

export async function gradeEssay(request: EssayGradeRequest): Promise<EssayGradeResponse> {
  const graderInput: AdaptiveEssayGraderInput = {
    essay: request.content,
    prompt: request.prompt,
    gradeLevel: request.gradeLevel,
    previousResult: request.previousResult,
    previousEssay: request.previousContent,
  };

  const result = await gradeWithAdaptiveEssayGrader(graderInput);
  const gaps = detectEssayGaps(result);
  const prioritizedLessons = prioritizeLessons(gaps);

  return {
    result,
    gaps,
    hasSevereGap: gaps.some((g) => g.severity === 'high'),
    prioritizedLessons,
  };
}

/**
 * @description Get the top N recommended lessons from a grade response.
 */
export function getTopRecommendedLessons(
  response: GradeResponse | EssayGradeResponse,
  limit: number = 3
): string[] {
  return response.prioritizedLessons.slice(0, limit);
}

export type { GraderResult, GraderRemark, EssayGraderResult, EssayCriterionResult, CriterionStatus, EssayScores };
