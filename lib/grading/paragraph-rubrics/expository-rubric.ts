/**
 * @fileoverview Expository paragraph rubric adapted from TWR.
 * Source: AlphaWrite single-paragraph-expository-rubric.ts
 * Reference: https://www.thewritingrevolution.org/twr_sd/single-paragraph-rubric/
 */

import type { ParagraphRubric } from './types';

/**
 * @description TWR-based rubric for grading expository paragraphs.
 * Categories: Topic Sentence, Detail Sentences, Concluding Sentence, Conventions.
 * Each category scored 0-5, max total 20 points.
 */
export const expositoryRubric: ParagraphRubric = {
  id: 'expository',
  title: 'Single Paragraph Rubric (Expository)',
  description: 'For paragraphs that explain or inform about a topic.',
  maxScore: 20,
  categories: [
    {
      title: 'Topic Sentence',
      criteria: [
        {
          score: 5,
          description:
            'Topic Sentence (T.S.) expresses a clear main idea and accurately addresses the prompt using a sentence type (e.g., appositive or subordinating conjunction). Word choice is precise, sophisticated, and powerful.',
        },
        {
          score: 4,
          description:
            'T.S. expresses a clear idea and accurately addresses the prompt using a sentence type. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'T.S. is a general statement that introduces the topic and addresses the prompt. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'T.S. lacks clarity or does not address the prompt fully or accurately. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'T.S. lacks clarity or relevance and does not address the prompt. Word choice is simple, repetitive, and inaccurate.',
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
            'Details clearly support the T.S. and are insightful and fully developed. Written in a variety of sentence structures (e.g., compound, complex) with logical order and frequent transitions. Word choice is precise, sophisticated, and powerful.',
        },
        {
          score: 4,
          description:
            'Details support the T.S. and are developed. Written in varied sentence structures and logical order, incorporating transitions. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'Details support the T.S. but lack full development. Includes some variety in sentence structures but lacks transitions. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'Details do not clearly support the T.S. and may lack focus, accuracy, or development. Limited sentence structure variety; not sequenced logically or lacking transitions. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'Details do not support the T.S.; they lack clarity, focus, or development. No logical order or transitions. Word choice is simple, repetitive, and inaccurate.',
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
            'Concluding Sentence (C.S.) summarizes or concludes the paragraph using a sentence type (e.g., appositive, subordinating conjunction, or transition). Word choice is precise and sophisticated.',
        },
        {
          score: 4,
          description:
            'C.S. summarizes or concludes the paragraph appropriately. Word choice is precise.',
        },
        {
          score: 3,
          description:
            'C.S. summarizes the paragraph, but most word choice is functional.',
        },
        {
          score: 2,
          description:
            'C.S. is too similar to the T.S. or does not summarize or conclude effectively. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'C.S. does not summarize or conclude the paragraph. Word choice is simple, repetitive, and inaccurate.',
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
            'Paragraph demonstrates control of conventions with no errors.',
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

