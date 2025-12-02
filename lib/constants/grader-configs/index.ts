/**
 * @fileoverview Central export for all grader configurations.
 * Provides helper function to retrieve configs by lesson ID.
 */

export * from './types';
export { basicConjunctionsConfig } from './basic-conjunctions';
export { writeAppositivesConfig } from './write-appositives';

import { ActivityGraderConfig } from './types';
import { basicConjunctionsConfig } from './basic-conjunctions';
import { writeAppositivesConfig } from './write-appositives';

/**
 * @description Map of lesson IDs to their grader configurations.
 */
const GRADER_CONFIGS: Record<string, ActivityGraderConfig> = {
  'basic-conjunctions': basicConjunctionsConfig,
  'write-appositives': writeAppositivesConfig,
};

/**
 * @description Retrieves the grader configuration for a given lesson ID.
 * @throws Error if the lesson ID is not found.
 */
export function getGraderConfig(lessonId: string): ActivityGraderConfig {
  const config = GRADER_CONFIGS[lessonId];
  if (!config) {
    throw new Error(`No grader config found for lesson: ${lessonId}`);
  }
  return config;
}

/**
 * @description Returns all available lesson IDs that have grader configs.
 */
export function getAvailableLessonIds(): string[] {
  return Object.keys(GRADER_CONFIGS);
}

