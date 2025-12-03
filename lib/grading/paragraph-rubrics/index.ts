/**
 * @fileoverview Exports all paragraph rubrics and types.
 */

export * from './types';

export { expositoryRubric } from './expository-rubric';
export { argumentativeRubric } from './argumentative-rubric';
export { opinionRubric } from './opinion-rubric';
export { proConRubric } from './pro-con-rubric';

import type { ParagraphRubric, ParagraphRubricType } from './types';
import { expositoryRubric } from './expository-rubric';
import { argumentativeRubric } from './argumentative-rubric';
import { opinionRubric } from './opinion-rubric';
import { proConRubric } from './pro-con-rubric';

/**
 * @description Map of all available paragraph rubrics by type.
 */
export const PARAGRAPH_RUBRICS: Record<ParagraphRubricType, ParagraphRubric> = {
  expository: expositoryRubric,
  argumentative: argumentativeRubric,
  opinion: opinionRubric,
  'pro-con': proConRubric,
};

/**
 * @description Get a paragraph rubric by type.
 */
export function getRubric(type: ParagraphRubricType = 'expository'): ParagraphRubric {
  return PARAGRAPH_RUBRICS[type];
}

