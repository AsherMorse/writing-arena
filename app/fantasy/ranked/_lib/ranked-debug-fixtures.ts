/**
 * @fileoverview Dev-only fixtures for jumping between ranked match UI phases.
 */

import { Timestamp } from 'firebase/firestore';
import type { GradeResponse } from '@/app/fantasy/_lib/grading';
import type { RankedPrompt, PromptOptions, SubmissionLevel } from '@/lib/types';

export type RankedDebugPreset = 'minimal' | 'short' | 'long' | 'stress';

/**
 * @description Create a deterministic fake ranked prompt for UI preview.
 */
export function createRankedDebugPrompt(args: {
  submissionMode: SubmissionLevel;
  preset: RankedDebugPreset;
}): RankedPrompt {
  const promptTextByPreset: Record<RankedDebugPreset, string> = {
    minimal: 'Explain one reason libraries matter.',
    short: 'Explain why libraries matter to a community.',
    long: [
      'Explain why libraries matter to a community.',
      'You might discuss access to information, a quiet place to study, or events that bring people together.',
      'Use clear reasons and at least one example.',
    ].join(' '),
    stress: [
      'Explain why libraries matter to a community.',
      'Include at least three reasons and connect them logically.',
      'You might discuss access to information, equity, local history, and community health.',
      'Write with clear transitions and a concluding sentence that leaves the reader with a takeaway.',
    ].join(' '),
  };

  return {
    id: 'debug-ranked-prompt',
    level: args.submissionMode,
    sequenceNumber: 999,
    activeDate: 'debug',
    promptText: promptTextByPreset[args.preset],
    topic: 'Community',
    inspirationText:
      args.preset === 'minimal'
        ? undefined
        : 'Think of a time you needed help finding an answer or a safe place to focus. Libraries are one of the few places designed for that.',
    createdAt: Timestamp.now(),
  };
}

/**
 * @description Create fake prompt options for the selection UI.
 */
export function createRankedDebugPromptOptions(args: {
  preset: RankedDebugPreset;
}): PromptOptions {
  const optionsByPreset: Record<RankedDebugPreset, string[]> = {
    minimal: ['books', 'quiet', 'computers', 'events'],
    short: ['books', 'quiet study', 'computers', 'storytime'],
    long: [
      'books for everyone',
      'a quiet place to study',
      'free computers and internet',
      'community events',
      'help from librarians',
      'local history resources',
    ],
    stress: Array.from({ length: 12 }).map((_, i) => `Option ${i + 1}: a longer selection label to test wrapping`),
  };

  return {
    topic: 'Community',
    angle: 'Focus on why people find this topic interesting or enjoyable',
    question: 'What is one thing a library gives people that they might not have at home?',
    options: optionsByPreset[args.preset],
  };
}

/**
 * @description Create fake student writing content with variable length.
 */
export function createRankedDebugWritingContent(args: {
  preset: RankedDebugPreset;
}): string {
  const contentByPreset: Record<RankedDebugPreset, string> = {
    minimal: 'Libraries help people learn.',
    short: [
      'Libraries matter because they give people free access to knowledge.',
      'For example, a student can borrow a book or use a computer to research a topic.',
      'That support helps the whole community grow.',
    ].join(' '),
    long: [
      'Libraries matter because they give people free access to knowledge and space, even when money or distractions make learning hard.',
      'First, they provide books and information that are too expensive for many families to buy, so anyone can explore a new topic.',
      'Second, they offer quiet places to study, which can be the difference between finishing homework and giving up.',
      'Third, they host events like storytime or workshops that bring neighbors together and make learning feel welcoming.',
      'For example, a teenager might use library computers to apply for a job, while a younger student finds a book that sparks curiosity.',
      'Because libraries lower barriers, they help a community become more informed and more connected.',
      'In conclusion, libraries are not just buildings with books; they are public tools that support opportunity.',
    ].join(' '),
    stress: Array.from({ length: 18 }).map((_, i) => `Sentence ${i + 1}: This is a longer paragraph sentence designed to stress-test scrolling, wrapping, and layout constraints.`).join(' '),
  };

  return contentByPreset[args.preset];
}

/**
 * @description Create a fake grading response with variable numbers of remarks/lessons.
 */
export function createRankedDebugGradeResponse(args: {
  preset: RankedDebugPreset;
}): GradeResponse {
  const remarkCountByPreset: Record<RankedDebugPreset, number> = {
    minimal: 0,
    short: 3,
    long: 8,
    stress: 18,
  };

  const lessonCountByPreset: Record<RankedDebugPreset, number> = {
    minimal: 0,
    short: 2,
    long: 5,
    stress: 9,
  };

  const remarks = Array.from({ length: remarkCountByPreset[args.preset] }).map((_, i) => ({
    type: 'issue' as const,
    severity: i % 3 === 0 ? 'error' as const : 'nit' as const,
    category: i % 2 === 0 ? 'Topic sentence' : 'Conventions',
    concreteProblem: `Remark ${i + 1}: This is a concrete problem description to test vertical density and wrapping.`,
    callToAction: `Call to action ${i + 1}: Make a specific revision to address the problem (e.g., add a clearer reason, fix punctuation, or add a transition).`,
    substringOfInterest: i % 4 === 0 ? 'example' : undefined,
  }));

  const prioritizedLessons = Array.from({ length: lessonCountByPreset[args.preset] }).map(
    (_, i) => `lesson_${i + 1}_placeholder`
  );

  const percentageByPreset: Record<RankedDebugPreset, number> = {
    minimal: 92,
    short: 78,
    long: 66,
    stress: 54,
  };

  const percentage = percentageByPreset[args.preset];
  const maxTotal = 20;
  const total = Math.max(0, Math.min(maxTotal, Math.round((percentage / 100) * maxTotal)));

  return {
    result: {
      isCorrect: percentage >= 70,
      remarks,
      scores: {
        topicSentence: 4,
        detailSentences: 3,
        concludingSentence: 3,
        conventions: 3,
        total,
        maxTotal,
        percentage,
      },
    },
    gaps: [],
    hasSevereGap: remarks.some((r) => r.severity === 'error'),
    prioritizedLessons,
    overallAssessment:
      args.preset === 'minimal'
        ? 'Strong start with a clear idea.'
        : 'You have a clear idea. Add a stronger reason chain and polish transitions to make the paragraph easier to follow.',
  };
}

