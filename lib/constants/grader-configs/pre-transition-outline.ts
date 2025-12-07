/**
 * @fileoverview Grader configuration for "Pre-Transition Outline" activity.
 * Extracted from AlphaWrite: activities/50-pre-transition-outline/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Pre-Transition Outline activity.
 * Students create multi-paragraph essay outlines with thesis, topic sentences, and supporting details.
 */
export const preTransitionOutlineConfig: ActivityGraderConfig = {
  nameOfActivity: 'Pre-Transition Outline',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to structure essays by creating pre-transition outlines that include thesis statements, topic sentences, supporting details, and concluding statements.',
    secondaryGoals: [
      'Develop skills for writing clear thesis statements that guide essay development',
      'Practice creating topic sentences that support the thesis',
      'Learn to generate relevant supporting details for each topic sentence',
      'Understand how concluding statements tie together the entire essay',
      'Build organizational skills for coherent essay writing',
    ],
  },

  howTheActivityWorks: `The student is given an essay topic and asked to create a Pre-Transition Outline (PTO) with the following components:
1. Thesis Statement: A statement that presents the main idea or position of the essay
2. Paragraph Outlines: For each body paragraph:
   - Topic Sentence (TS): A sentence that introduces the main idea of the paragraph
   - Supporting Details (SD): Brief points (usually in note form) that support the topic sentence
3. Concluding Statement: A sentence that wraps up the essay and reinforces the thesis

Most essays will have 2-3 body paragraphs, depending on the topic and grade level.`,

  gradeAppropriateConsiderations: {
    level1:
      'For younger students (grades 3-5), accept more informal language in thesis statements and topic sentences. Two well-developed paragraphs are sufficient. Supporting details can be simple but should relate to the topic sentence.',
    level2:
      'For older students (grades 6-8), expect clearer thesis statements and topic sentences with logical connections. Supporting details should be relevant but may be less sophisticated.',
  },

  importantPrinciplesForGrading: [
    '1) The thesis statement should express the main idea or focus of the essay in age-appropriate language.',
    '2) Topic sentences should relate to and support the thesis statement.',
    '3) Supporting details should provide relevant evidence or examples for their respective topic sentences.',
    '4) The outline should demonstrate logical organization with a clear flow from thesis to topic sentences to supporting details.',
    '5) The concluding statement should effectively summarize the main points.',
    '6) Credit partial work, as students might complete some sections before others.',
    '7) Focus on the structural relationships between elements rather than perfect grammar or word choice in this outline phase.',
    '8) Two well-developed paragraphs are acceptable, especially for younger students or simpler topics.',
    '9) Consider the grade level when evaluating the complexity and sophistication of ideas.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Thesis statement is too vague or general',
      explanation:
        'The thesis lacks focus that can guide the rest of the outline.',
      example:
        'Topic: "Effects of Social Media on Teenagers"\nVague thesis: "Social media affects teenagers in many ways."',
    },
    {
      mistake: "Topic sentences don't clearly connect to the thesis",
      explanation:
        "Topic sentences introduce ideas that aren't clearly related to the main argument in the thesis.",
      example:
        'Thesis: "Renewable energy sources are essential for combating climate change."\nDisconnected topic sentence: "Many people use computers every day."',
    },
    {
      mistake: "Supporting details don't match their topic sentences",
      explanation:
        "The supporting details contain information that doesn't clearly support the claim in the topic sentence.",
      example:
        'Topic sentence: "Exercise improves mental health."\nIrrelevant detail: "Some people prefer to exercise outdoors rather than in gyms."',
    },
    {
      mistake: 'Repetitive content across paragraphs',
      explanation:
        'Multiple topic sentences or supporting details cover the same ground instead of developing distinct aspects of the thesis.',
      example:
        'Paragraph 1 TS: "Social media can cause anxiety in teenagers."\nParagraph 2 TS: "Teens often experience anxiety when using social media platforms."',
    },
  ],

  positiveExamples: [
    {
      example: `Topic: "The Impact of Climate Change on Wildlife"

Thesis: "Climate change hurts wildlife by destroying habitats, disrupting natural cycles, and directly harming animals."

Paragraph 1
TS: Climate change causes habitat loss that endangers many animals.
SD 1: rising sea levels destroy coastal habitats
SD 2: melting ice caps eliminate hunting grounds for polar bears
SD 3: increasing temperatures make some places too hot for native animals

Paragraph 2
TS: Changing weather patterns disrupt important cycles that wildlife depends on.
SD 1: birds sometimes miss peak food times during migration
SD 2: changing seasons affect hibernation and reproduction
SD 3: droughts affect food and water availability

Conclusion: "Without action to stop climate change, animals around the world will continue to face threats."`,
      explainer:
        'This outline demonstrates good structure with a clear thesis statement that outlines main aspects developed in the body paragraphs. Each topic sentence directly supports an aspect of the thesis, and the supporting details provide specific, relevant examples.',
    },
  ],

  negativeExamples: [
    {
      example: `Topic: "The Importance of Exercise"

Thesis: "Exercise is important."

Paragraph 1
TS: Exercise is good for health.
SD 1: helps you feel better
SD 2: is good for you
SD 3: doctors recommend it

Paragraph 2
TS: Working out is beneficial.
SD 1: makes you stronger
SD 2: is healthy
SD 3: people should exercise more

Conclusion: "In conclusion, exercise is really important and good for people."`,
      explainer:
        "This outline has several problems: The thesis is extremely vague and doesn't provide any specific focus. The topic sentences are repetitive, all saying essentially the same thing using different words. The supporting details are general and vague rather than specific.",
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly, encouraging tone, point out any structural issues in the outline elements, such as disconnects between thesis and topic sentences or irrelevant supporting details.',
    callToAction:
      'In a warm, friendly, encouraging tone, suggest how the student can improve the connections between outline elements while maintaining their original ideas.',
  },
};

