/**
 * @fileoverview Pro-Con paragraph rubric adapted from TWR.
 * Source: AlphaWrite single-paragraph-pro-con-rubric.ts
 * Reference: https://www.thewritingrevolution.org/twr_sd/single-paragraph-rubric/
 */

import type { ParagraphRubric } from './types';

/**
 * @description TWR-based rubric for grading pro-con paragraphs.
 * Categories: Topic Sentence (Introduction), Supporting Details (Pro or Con), Concluding Sentence, Conventions.
 * Each category scored 0-5, max total 20 points.
 */
export const proConRubric: ParagraphRubric = {
  id: 'pro-con',
  title: 'Single Paragraph Rubric (Pro-Con)',
  description: 'For paragraphs that argue one side (pro or con) of an issue.',
  maxScore: 20,
  categories: [
    {
      title: 'Topic Sentence (Introduction)',
      criteria: [
        {
          score: 5,
          description:
            'The Topic Sentence (T.S.) introduces the topic and clearly states the side (either pro or con) the paragraph will argue, using a complex sentence structure (e.g., appositive or subordinating conjunction). Word choice is precise, sophisticated, and impactful.',
        },
        {
          score: 4,
          description:
            'T.S. introduces the topic and states the side being argued, using varied sentence structures. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'T.S. introduces the topic and indicates the side but may lack clarity or specificity. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'T.S. lacks clarity or does not clearly indicate the side being argued. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'T.S. is unclear, lacks relevance, or does not address the prompt. Word choice is simple, repetitive, or inaccurate.',
        },
        {
          score: 0,
          description: 'T.S. is absent or incomplete.',
        },
      ],
    },
    {
      title: 'Supporting Details (Pro or Con)',
      criteria: [
        {
          score: 5,
          description:
            'Provides insightful and fully developed details that strongly support the chosen side (pro or con) of the argument. Uses a variety of complex sentence structures with logical order and effective transitions. Word choice is precise, sophisticated, and powerful.',
        },
        {
          score: 4,
          description:
            'Provides relevant and well-developed details supporting the chosen side. Uses varied sentence structures with logical order and appropriate transitions. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'Provides details supporting the chosen side but may lack depth or full development. Includes some variety in sentence structures but lacks consistent transitions. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'Details supporting the chosen side are underdeveloped or unclear. Limited sentence structure variety; lacks logical sequencing or transitions. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'Details do not effectively support the chosen side; lack clarity or relevance. No logical order or transitions. Word choice is simple, repetitive, or inaccurate.',
        },
        {
          score: 0,
          description: 'There are no supporting details for the chosen side.',
        },
      ],
    },
    {
      title: 'Concluding Sentence',
      criteria: [
        {
          score: 5,
          description:
            'The Concluding Sentence (C.S.) effectively reinforces the argument for the chosen side and provides a thoughtful closing that reflects on the topic, using a complex sentence structure (e.g., appositive, subordinating conjunction, or transition). Word choice is precise and sophisticated.',
        },
        {
          score: 4,
          description:
            'C.S. reinforces the main points and provides an appropriate conclusion to the argument. Word choice is precise.',
        },
        {
          score: 3,
          description:
            'C.S. restates the main points but may lack impact or depth. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'C.S. is too similar to the T.S. or does not effectively conclude the argument. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'C.S. does not effectively conclude the paragraph or lacks relevance to the argument. Word choice is simple, repetitive, or inaccurate.',
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

