/**
 * @fileoverview Middle school expository paragraph rubric (grades 6-8).
 * Simplified scoring criteria that focus on structure and strategy use
 * rather than "sophisticated" word choice requirements.
 * Based on AlphaWrite's single-paragraph grader approach.
 */

import type { ParagraphRubric } from './types';

/**
 * @description Middle school rubric for grading expository paragraphs.
 * Categories: Topic Sentence, Detail Sentences, Concluding Sentence, Conventions.
 * Each category scored 0-5, max total 20 points.
 * 
 * Key differences from high school rubric:
 * - Removes "sophisticated and powerful" word choice requirements
 * - Focuses on whether TWR strategies are present and effective
 * - More achievable standards for grades 6-8
 */
export const expositoryMiddleSchoolRubric: ParagraphRubric = {
  id: 'expository',
  title: 'Single Paragraph Rubric (Expository - Middle School)',
  description: 'For middle school paragraphs that explain or inform about a topic.',
  maxScore: 20,
  categories: [
    {
      title: 'Topic Sentence',
      criteria: [
        {
          score: 5,
          description:
            'Topic Sentence (T.S.) expresses a clear main idea and accurately addresses the prompt. Uses an effective sentence structure (e.g., colon to introduce reasons, appositive, or subordinating conjunction). Word choice is clear and effective.',
        },
        {
          score: 4,
          description:
            'T.S. expresses a clear idea and addresses the prompt well. Word choice is appropriate for the topic.',
        },
        {
          score: 3,
          description:
            'T.S. is a general statement that introduces the topic and addresses the prompt. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'T.S. lacks clarity or does not address the prompt fully. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'T.S. lacks clarity or relevance and does not address the prompt. Word choice is repetitive.',
        },
        {
          score: 0,
          description: 'T.S. is absent or incomplete.',
        },
      ],
    },
    {
      title: 'Detail Sentences',
      criteria: [
        {
          score: 5,
          description:
            'Details clearly support the T.S. and are well-developed. Written with varied sentence structures (e.g., compound, complex) in logical order with transitions (e.g., First, Furthermore, Lastly). Word choice is clear and effective.',
        },
        {
          score: 4,
          description:
            'Details support the T.S. and are developed. Uses some varied sentence structures and transitions. Word choice is appropriate.',
        },
        {
          score: 3,
          description:
            'Details support the T.S. but lack full development. Some sentence variety but limited transitions. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'Details do not clearly support the T.S. Limited sentence variety; lacks logical order or transitions. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'Details do not support the T.S.; they lack clarity or development. No logical order or transitions.',
        },
        {
          score: 0,
          description: 'There are no details to support the T.S.',
        },
      ],
    },
    {
      title: 'Concluding Sentence',
      criteria: [
        {
          score: 5,
          description:
            'Concluding Sentence (C.S.) effectively summarizes or concludes the paragraph. Uses a transition (e.g., "In conclusion") and/or sentence strategy. Word choice is clear and effective.',
        },
        {
          score: 4,
          description:
            'C.S. summarizes or concludes the paragraph appropriately. Word choice is appropriate.',
        },
        {
          score: 3,
          description:
            'C.S. summarizes the paragraph but word choice is functional.',
        },
        {
          score: 2,
          description:
            'C.S. is too similar to the T.S. or does not summarize effectively. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'C.S. does not summarize or conclude the paragraph.',
        },
        {
          score: 0,
          description: 'C.S. is absent or incomplete.',
        },
      ],
    },
    {
      title: 'Conventions',
      criteria: [
        {
          score: 5,
          description:
            'Paragraph demonstrates strong control of conventions with minimal errors that do not affect meaning.',
        },
        {
          score: 4,
          description:
            'Paragraph demonstrates control of conventions with few errors.',
        },
        {
          score: 3,
          description:
            'Paragraph demonstrates some control of conventions; occasional errors do not hinder comprehension.',
        },
        {
          score: 2,
          description: 'Errors hinder comprehension.',
        },
        {
          score: 1,
          description: 'Frequent errors make comprehension difficult.',
        },
        {
          score: 0,
          description: 'Lack of knowledge of conventions is evident.',
        },
      ],
    },
  ],
};

