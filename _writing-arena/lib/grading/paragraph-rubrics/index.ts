/**
 * @fileoverview Exports all paragraph rubrics and types.
 */

export * from './types';

export { expositoryRubric } from './expository-rubric';
export { expositoryMiddleSchoolRubric } from './expository-middle-school';
export { argumentativeRubric } from './argumentative-rubric';
export { opinionRubric } from './opinion-rubric';
export { proConRubric } from './pro-con-rubric';

import type { ParagraphRubric, ParagraphRubricType } from './types';
import { expositoryRubric } from './expository-rubric';
import { expositoryMiddleSchoolRubric } from './expository-middle-school';
import { argumentativeRubric } from './argumentative-rubric';
import { opinionRubric } from './opinion-rubric';
import { proConRubric } from './pro-con-rubric';

/**
 * @description Map of all available paragraph rubrics by type (high school / default).
 */
export const PARAGRAPH_RUBRICS: Record<ParagraphRubricType, ParagraphRubric> = {
  expository: expositoryRubric,
  argumentative: argumentativeRubric,
  opinion: opinionRubric,
  'pro-con': proConRubric,
};

/**
 * @description Map of middle school paragraph rubrics (grades 8 and below).
 * Only expository is available for now; others fall back to default.
 */
export const MIDDLE_SCHOOL_RUBRICS: Partial<Record<ParagraphRubricType, ParagraphRubric>> = {
  expository: expositoryMiddleSchoolRubric,
};

/**
 * @description Get a paragraph rubric by type and grade level.
 * Currently using middle school rubric for all grades since high school
 * rubric is too strict.
 * 
 * @param type - The rubric type (expository, argumentative, etc.)
 * @param gradeLevel - Student grade level (default 6)
 * @returns The appropriate rubric for the grade level
 */
export function getRubric(
  type: ParagraphRubricType = 'expository',
  gradeLevel: number = 6
): ParagraphRubric {
  // TEMPORARY: Use middle school rubric for all grades
  // High school rubric requirements are too harsh
  const middleSchoolRubric = MIDDLE_SCHOOL_RUBRICS[type];
  if (middleSchoolRubric) {
    return middleSchoolRubric;
  }
  
  // Fall back to default (high school) rubric if no middle school version exists
  return PARAGRAPH_RUBRICS[type];
  
  /* ORIGINAL LOGIC (commented out for reference):
  // Use middle school rubric for grades 8 and below (if available)
  if (gradeLevel <= 8) {
    const middleSchoolRubric = MIDDLE_SCHOOL_RUBRICS[type];
    if (middleSchoolRubric) {
      return middleSchoolRubric;
    }
  }
  
  // Fall back to default (high school) rubric
  return PARAGRAPH_RUBRICS[type];
  */
}

