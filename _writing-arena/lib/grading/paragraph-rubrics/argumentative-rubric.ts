/**
 * @fileoverview Argumentative paragraph rubric adapted from TWR.
 * Source: AlphaWrite single-paragraph-argumentative-rubric.ts
 * Reference: https://www.thewritingrevolution.org/twr_sd/single-paragraph-rubric/
 */

import type { ParagraphRubric } from './types';

/**
 * @description TWR-based rubric for grading argumentative paragraphs.
 * Categories: Claim (Topic Sentence), Evidence and Reasoning (Detail Sentences), Concluding Sentence, Conventions.
 * Each category scored 0-5, max total 20 points.
 */
export const argumentativeRubric: ParagraphRubric = {
  id: 'argumentative',
  title: 'Single Paragraph Rubric (Argumentative)',
  description: 'For paragraphs that make a claim and support it with evidence and reasoning.',
  maxScore: 20,
  categories: [
    {
      title: 'Claim (Topic Sentence)',
      criteria: [
        {
          score: 5,
          description:
            'The Topic Sentence (T.S.) presents a clear, specific, and arguable claim that directly addresses the prompt using a complex sentence structure (e.g., appositive or subordinating conjunction). Word choice is precise, sophisticated, and impactful.',
        },
        {
          score: 4,
          description:
            'T.S. presents a clear and arguable claim that addresses the prompt using a varied sentence structure. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'T.S. presents a general claim that addresses the prompt. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'T.S. lacks clarity or specificity and does not fully address the prompt. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'T.S. lacks a clear claim or relevance and does not address the prompt. Word choice is simple, repetitive, or inaccurate.',
        },
        {
          score: 0,
          description: 'T.S. is absent or incomplete.',
        },
      ],
    },
    {
      title: 'Evidence and Reasoning (Detail Sentences)',
      criteria: [
        {
          score: 5,
          description:
            'Details effectively support the claim with insightful evidence and clear reasoning. Written in a variety of complex sentence structures with logical order and effective transitions. Word choice is precise, sophisticated, and powerful.',
        },
        {
          score: 4,
          description:
            'Details support the claim with relevant evidence and reasoning. Written in varied sentence structures and logical order, incorporating appropriate transitions. Word choice is precise and appropriate.',
        },
        {
          score: 3,
          description:
            'Details support the claim but may lack depth or full development. Includes some variety in sentence structures but lacks consistent transitions. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'Details do not clearly support the claim; evidence may be weak or reasoning unclear. Limited sentence structure variety; not sequenced logically or lacking transitions. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'Details do not support the claim; they lack clarity, relevance, or development. No logical order or transitions. Word choice is simple, repetitive, or inaccurate.',
        },
        {
          score: 0,
          description: 'There are no supporting details for the claim.',
        },
      ],
    },
    {
      title: 'Concluding Sentence',
      criteria: [
        {
          score: 5,
          description:
            'The Concluding Sentence (C.S.) effectively reinforces the claim and provides a strong closing using a complex sentence structure (e.g., appositive, subordinating conjunction, or transition). Word choice is precise and sophisticated.',
        },
        {
          score: 4,
          description:
            'C.S. reinforces the claim and provides an appropriate conclusion. Word choice is precise.',
        },
        {
          score: 3,
          description:
            'C.S. restates the claim but may lack impact or sophistication. Word choice is functional.',
        },
        {
          score: 2,
          description:
            'C.S. is too similar to the T.S. or does not effectively conclude the argument. Word choice is simple.',
        },
        {
          score: 1,
          description:
            'C.S. does not reinforce the claim or conclude the paragraph. Word choice is simple, repetitive, or inaccurate.',
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

