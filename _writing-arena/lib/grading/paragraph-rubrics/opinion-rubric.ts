/**
 * @fileoverview Opinion paragraph rubric adapted from TWR.
 * Source: AlphaWrite single-paragraph-opinion-rubric.ts
 * Reference: https://www.thewritingrevolution.org/twr_sd/single-paragraph-rubric/
 */

import type { ParagraphRubric } from './types';

/**
 * @description TWR-based rubric for grading opinion paragraphs.
 * Categories: Topic Sentence (Opinion Statement), Supporting Details (Facts and Evidence), Concluding Sentence, Conventions.
 * Each category scored 0-5, max total 20 points.
 */
export const opinionRubric: ParagraphRubric = {
  id: 'opinion',
  title: 'Single Paragraph Rubric (Opinion)',
  description: 'For paragraphs that express a personal opinion supported by reasons and evidence.',
  maxScore: 20,
  categories: [
    {
      title: 'Topic Sentence (Opinion Statement)',
      criteria: [
        {
          score: 5,
          description:
            'The Topic Sentence (T.S.) clearly states a specific and strong opinion that directly addresses the prompt, using a complex sentence structure (e.g., appositive or subordinating conjunction). Word choice is precise, sophisticated, and impactful.',
        },
        {
          score: 4,
          description:
            'T.S. states a clear opinion that addresses the prompt, using varied sentence structures. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'T.S. states an opinion that addresses the prompt but may lack specificity or strength. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'T.S. lacks clarity or specificity in stating the opinion. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'T.S. is unclear, lacks relevance, or does not present a discernible opinion. Word choice is simple, repetitive, or inaccurate.',
        },
        {
          score: 0,
          description: 'T.S. is absent or incomplete.',
        },
      ],
    },
    {
      title: 'Supporting Details (Facts and Evidence)',
      criteria: [
        {
          score: 5,
          description:
            'Provides insightful and fully developed details that strongly support the opinion with factual information, evidence, and examples. Uses a variety of complex sentence structures with logical order and effective transitions. Word choice is precise, sophisticated, and powerful.',
        },
        {
          score: 4,
          description:
            'Provides relevant and well-developed details supporting the opinion with factual information. Uses varied sentence structures with logical order and appropriate transitions. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'Provides details supporting the opinion but may lack depth, specificity, or sufficient factual support. Includes some variety in sentence structures; transitions may be inconsistent. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'Details supporting the opinion are underdeveloped, unclear, or lack factual support. Limited sentence structure variety; lacks logical sequencing or transitions. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'Details do not effectively support the opinion; lack clarity, relevance, or are unsupported by facts. No logical order or transitions. Word choice is simple, repetitive, or inaccurate.',
        },
        {
          score: 0,
          description: 'There are no supporting details for the opinion.',
        },
      ],
    },
    {
      title: 'Concluding Sentence',
      criteria: [
        {
          score: 5,
          description:
            'The Concluding Sentence (C.S.) effectively reinforces the opinion and provides a thoughtful closing that reflects on the topic, using a complex sentence structure (e.g., appositive, subordinating conjunction, or transition). Word choice is precise and sophisticated.',
        },
        {
          score: 4,
          description:
            'C.S. reinforces the main points and provides an appropriate conclusion to the opinion. Word choice is precise.',
        },
        {
          score: 3,
          description:
            'C.S. restates the opinion but may lack impact or depth. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'C.S. is too similar to the T.S. or does not effectively conclude the opinion. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'C.S. does not effectively conclude the paragraph or lacks relevance to the opinion. Word choice is simple, repetitive, or inaccurate.',
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
            'Paragraph demonstrates excellent control of grammar, punctuation, and spelling with no errors.',
        },
        {
          score: 4,
          description:
            'Paragraph demonstrates good control of conventions with few minor errors.',
        },
        {
          score: 3,
          description:
            'Paragraph shows some control of conventions; occasional errors do not hinder comprehension.',
        },
        {
          score: 2,
          description: 'Errors in conventions begin to hinder comprehension.',
        },
        {
          score: 1,
          description: 'Frequent errors make comprehension very difficult.',
        },
        {
          score: 0,
          description: 'Lack of knowledge of conventions is evident.',
        },
      ],
    },
  ],
};

