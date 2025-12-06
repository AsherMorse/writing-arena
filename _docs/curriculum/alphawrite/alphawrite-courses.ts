import { Activity } from '@eigen/scribe-db';

import { Courses, LevelConfig } from '../activities/types';
import { DifficultyLevel } from './difficulties';
import { GradeLevel } from './grades';

// Define mapping from Grade Level to Roman Numeral Level
const GRADE_TO_ROMAN = {
  [3]: 'I',
  [4]: 'II',
  [5]: 'III',
};

export const SENTENCE_ACTIVITIES = [
  Activity.FRAGMENT_OR_SENTENCE,
  Activity.UNSCRAMBLE_SENTENCES,
  Activity.IDENTIFY_SENTENCE_TYPE,
  Activity.CHANGE_SENTENCE_TYPE,
  Activity.USE_SENTENCE_TYPES,
  Activity.WRITE_SENTENCE_ABOUT_PICTURE,
  Activity.BASIC_CONJUNCTIONS,
  Activity.IDENTIFY_APPOSITIVES,
  Activity.WRITE_APPOSITIVES,
  Activity.SUBORDINATING_CONJUNCTIONS,
  Activity.COMBINE_SENTENCES,
  Activity.KERNEL_EXPANSION,
];

export const PARAGRAPH_ACTIVITIES = [
  Activity.IDENTIFY_TOPIC_SENTENCE,
  Activity.TOPIC_BRAINSTORM,
  Activity.IDENTIFY_TOPIC_SENTENCE_AND_SEQUENCE_DETAILS,
  Activity.ELIMINATE_IRRELEVANT_SENTENCES,
  Activity.MAKE_TOPIC_SENTENCES,
  Activity.TURN_PARAGRAPH_INTO_SPO,
  Activity.WRITING_SPOS,
  Activity.TURN_OUTLINE_INTO_DRAFT,
  Activity.ELABORATE_PARAGRAPHS,
  Activity.USING_TRANSITION_WORDS,
  Activity.FINISHING_TRANSITION_WORDS,
  Activity.WRITE_FREEFORM_PARAGRAPH,
];

/**
 * Helper function to attach a `grade` and `difficulty` to an activity.
 */
const activityToLevel = (
  activity: Activity,
  grade: GradeLevel
): LevelConfig => {
  return {
    activity,
    grade,
    difficulty: DifficultyLevel.Easy,
  };
};

export const isActivityInCourse = (activity: Activity): boolean => {
  return (
    SENTENCE_ACTIVITIES.includes(activity as any) ||
    PARAGRAPH_ACTIVITIES.includes(activity as any)
  );
};

export const activityConfigToNameWithCourse = (config: LevelConfig): string => {
  const courseName = SENTENCE_ACTIVITIES.includes(config.activity as any)
    ? 'Sentences'
    : PARAGRAPH_ACTIVITIES.includes(config.activity as any)
      ? 'Paragraphs'
      : 'Unknown';

  // NOTE: this will break if we shift Paragraphs grades from 3,4,5 to 4,5,6 etc.
  const courseIndex =
    GRADE_TO_ROMAN[config.grade as keyof typeof GRADE_TO_ROMAN] ?? '';

  return `${courseName} ${courseIndex}`.trim();
};

export const COURSES: Courses = [
  // Sentences Courses
  {
    name: 'Sentences I',
    levels: SENTENCE_ACTIVITIES.map(activity => activityToLevel(activity, 3)),
  },
  {
    name: 'Sentences II',
    levels: SENTENCE_ACTIVITIES.map(activity => activityToLevel(activity, 4)),
  },
  {
    name: 'Sentences III',
    levels: SENTENCE_ACTIVITIES.map(activity => activityToLevel(activity, 5)),
  },

  // Paragraphs Courses
  {
    name: 'Paragraphs I',
    levels: PARAGRAPH_ACTIVITIES.map(activity => activityToLevel(activity, 4)),
  },
  {
    name: 'Paragraphs II',
    levels: PARAGRAPH_ACTIVITIES.map(activity => activityToLevel(activity, 5)),
  },
  {
    name: 'Paragraphs III',
    levels: PARAGRAPH_ACTIVITIES.map(activity => activityToLevel(activity, 6)),
  },
];
