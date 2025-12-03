/**
 * @fileoverview TWR-based essay composition rubric with 16 criteria.
 * Adapted from AlphaWrite's categorical-rubric/rubrics/composition-rubric.ts
 * Supports grades 6-12 and all 7 essay types.
 */

import type { EssayCriterion, EssayType, PreparedEssayRubric } from './types';

/**
 * @description All 16 composition criteria from the TWR rubric.
 * Each criterion has applicable grades, essay types, and type-specific guidance.
 */
export const COMPOSITION_CRITERIA: EssayCriterion[] = [
  // Criterion 1: Composition follows outline (skip for now - no outline support)
  {
    name: 'Composition follows outline',
    description:
      'The composition should adhere to the structure and sequence of ideas in the outline. Each paragraph should correspond to a main idea from the outline.',
    applicableGrades: { min: 6, max: 12 },
    // This criterion is skipped when there's no outline
  },

  // Criterion 2: Topic sentences
  {
    name: 'Each body paragraph has a topic sentence',
    description:
      'Each paragraph should have a topic sentence that clearly expresses the main idea and is connected to the thesis statement.',
    applicableGrades: { min: 6, max: 12 },
    essayTypeGuidance: {
      Expository:
        'The student should present subtopics or aspects of the main idea in a clear, factual way within each topic sentence.',
      'Problem/Solution':
        'The student should present subtopics or aspects of the main idea in a clear, factual way within each topic sentence.',
      Narrative:
        "The student might focus each paragraph's first line on a specific time period, step, or stage in the chronological sequence.",
      Opinion:
        "The student should clearly state the supporting reason or viewpoint in each paragraph's first sentence.",
      'Pro/Con':
        'The student should indicate in the first sentence whether the paragraph addresses the "pro" side or the "con" side.',
      Story:
        'The student should use topic sentences that advance the plot, develop characters, and/or establish setting.',
      Argumentative:
        'The student should assert or defend a sub-claim or address a counterclaim tied to the main argument in each paragraph.',
    },
  },

  // Criterion 3: Supporting details
  {
    name: 'Supporting details support topic sentence',
    description:
      'Each supporting detail sentence should support the topic sentence, and supporting details should be well-sequenced.',
    applicableGrades: { min: 6, max: 12 },
    essayTypeGuidance: {
      Expository:
        'Provide factual or explanatory evidence, examples, and data relevant to the main idea.',
      'Problem/Solution':
        'Provide factual or explanatory evidence, examples, and data relevant to the main idea.',
      Narrative:
        'Include factual details, dates, academic content, and evidence presented in chronological order.',
      Opinion:
        'Can rely on personal anecdotes or subjective examples. Factual evidence is welcome but not mandatory.',
      'Pro/Con':
        'Use specific details or evidence that exemplify either a pro side or a con side.',
      Story:
        'Include vivid descriptive details, dialogue, character actions, and/or sensory language.',
      Argumentative:
        'Provide factual or textual evidence, data, or references. Personal examples alone are not sufficient.',
    },
    gradeLevelGuidance: [
      {
        min: 6,
        max: 12,
        explanation:
          'For Grades 6-12, there should be at least 3 supporting detail sentences per paragraph.',
      },
    ],
  },

  // Criterion 4: Thesis statement
  {
    name: 'Developed thesis statement',
    description:
      "The thesis statement should be well-developed and clearly express the main idea of the composition. It doesn't need to be complicated.",
    applicableGrades: { min: 6, max: 12 },
    essayTypeGuidance: {
      Expository: 'Clearly state the main topic or focus to be explained.',
      'Problem/Solution': 'Clearly state the main topic or focus to be explained.',
      Narrative:
        'Present a clear thesis statement about the factual account (e.g., "Frederick Douglass\'s journey involved three key phases").',
      Opinion:
        'Present a concise statement of personal viewpoint, often using first-person phrasing (e.g., "I believe…").',
      'Pro/Con':
        'Neutrally state that there are two valid sides without taking one side as "better."',
      Argumentative:
        "Explicitly state a debatable stance and serve as the essay's central claim to defend with evidence and reasoning.",
    },
  },

  // Criterion 5: Body paragraphs support thesis
  {
    name: 'Each body paragraph supports thesis',
    description: 'Each paragraph should support the thesis statement.',
    applicableGrades: { min: 6, max: 12 },
    essayTypeGuidance: {
      Expository:
        'Expand on or illustrate different aspects of the main topic in all paragraphs.',
      'Problem/Solution':
        'Expand on or illustrate different aspects of the main topic in all paragraphs.',
      Narrative:
        'Paragraphs should collectively support the thesis by presenting events, steps, or stages in logical chronological sequence.',
      Opinion: 'Reinforce or explain a reason supporting the opinion in every paragraph.',
      'Pro/Con':
        'Relate each paragraph to either the pro side or the con side without drifting from the central question.',
      Argumentative:
        'Defend or analyze a sub-claim or address/refute a counterargument in each paragraph.',
    },
  },

  // Criterion 6: Sentence strategies
  {
    name: 'Used sentence strategies',
    description:
      'The essay should use multiple sentence strategies (sentence expansion, conjunctions, appositives) correctly.',
    applicableGrades: { min: 6, max: 12 },
    subcriteria: ['sentence expansion', 'basic and subordinating conjunctions', 'appositives'],
    gradeLevelGuidance: [
      {
        min: 6,
        max: 12,
        explanation:
          'For Grades 6-12, the essay should use multiple varied sentence strategies.',
      },
    ],
  },

  // Criterion 7: Transitions
  {
    name: 'Used transitions correctly',
    description:
      'All transition words/phrases should be used correctly. Most paragraphs should include transitions.',
    applicableGrades: { min: 6, max: 12 },
    essayTypeGuidance: {
      Expository:
        'Use transition phrases that show cause/effect, sequence, or examples (e.g., "for instance," "in addition").',
      'Problem/Solution':
        'Use transition phrases that show cause/effect, sequence, or examples.',
      Narrative:
        'Use time-order transitions: "first," "next," "then," "finally," "as a result," "consequently."',
      Opinion:
        'Use transitions that highlight reasons or personal experience (e.g., "another reason," "for example").',
      'Pro/Con':
        'Use language to toggle between perspectives (e.g., "in contrast," "on the other hand").',
      Story:
        'Use time-order transitions, scene shifts, and/or emotional transitions (e.g., "suddenly," "meanwhile").',
      Argumentative:
        'Use transitions that connect evidence, refutations, or concessions ("however," "furthermore," "despite this").',
    },
    gradeLevelGuidance: [
      {
        min: 6,
        max: 12,
        explanation:
          'For Grades 6-12, demonstrate correct usage of more advanced transitions showing cause/effect, compare/contrast.',
      },
    ],
  },

  // Criterion 8: Effective introduction (Grades 7-12 only)
  {
    name: 'Composed effective introduction',
    description:
      'Introduction must have at least 3 sentences. If using GST structure: General statement → Specific statement → Thesis statement.',
    applicableGrades: { min: 7, max: 12 },
    subcriteria: ['general statement', 'specific statement', 'thesis statement'],
    essayTypeGuidance: {
      Expository:
        "Begin with broad context and narrow to a clear thesis on the subject's importance or scope.",
      'Problem/Solution':
        "Begin with broad context and narrow to a clear thesis on the subject's importance or scope.",
      Narrative:
        'Orient the reader with who/when/where context and present a clear thesis.',
      Opinion:
        'Open with something that grabs interest, then reveal the main personal stance.',
      'Pro/Con':
        'Introduce the controversy or issue neutrally, clarifying that multiple viewpoints exist.',
      Story:
        'Create an engaging opening that draws readers into the narrative world.',
      Argumentative:
        'Begin with context or a compelling fact, then clearly state the debatable claim.',
    },
  },

  // Criterion 9: Effective conclusion (Grades 7-12 only)
  {
    name: 'Composed effective conclusion',
    description:
      'Conclusion should contain at least 3 sentences. If using TSG: Thesis → Specific statement → General statement.',
    applicableGrades: { min: 7, max: 12 },
    subcriteria: ['rephrased thesis statement', 'specific statement', 'general statement'],
    essayTypeGuidance: {
      Expository:
        'Summarize key findings, restate why the topic matters, possibly suggest next steps.',
      'Problem/Solution':
        'Summarize key findings, restate why the topic matters, possibly suggest next steps.',
      Narrative:
        'Conclude by restating the thesis and summarizing the significance.',
      Opinion:
        'Restate personal stance, summarize reasons, possibly leave a call to action.',
      'Pro/Con':
        'Restate the balanced approach, acknowledging both sides without pushing reader to pick one.',
      Story:
        'Provide a satisfying ending - resolve conflict, show character growth, reflect on meaning.',
      Argumentative:
        'Reinforce the stance, highlight strongest evidence, underscore significance, possibly call for action.',
    },
  },

  // Criterion 10: Editing
  {
    name: 'Edited for grammar and mechanics',
    description:
      'Count instances of editing errors: fragments, run-ons, spelling, capitalization, tense agreement, number agreement, repetition.',
    applicableGrades: { min: 6, max: 12 },
    subcriteria: [
      'fragments',
      'run-ons',
      'spelling',
      'capitalization',
      'tense agreement',
      'number agreement',
      'repetition',
    ],
    gradeLevelGuidance: [
      {
        min: 6,
        max: 8,
        explanation: 'For Grades 6-8, the essay can have 2-3 minor mechanical errors.',
      },
      {
        min: 9,
        max: 12,
        explanation:
          'For Grades 9-12, the essay should have at most 1 editing error, with near-flawless mechanics.',
      },
    ],
  },

  // Criterion 11: Addressed opposing view (Grades 9-12, Argumentative only)
  {
    name: 'Addressed opposing view/counterclaim',
    description:
      'The writer should clearly acknowledge at least one opposing viewpoint and offer some form of rebuttal or concession.',
    applicableGrades: { min: 9, max: 12 },
    applicableEssayTypes: ['Argumentative'],
    essayTypeGuidance: {
      Argumentative:
        'The student must address an opposing viewpoint with a rebuttal or concession, as it is mandatory.',
    },
  },

  // Criterion 12: Effective concluding sentence (Grade 6 only)
  {
    name: 'Composed effective concluding sentence',
    description:
      "The concluding sentence must provide a clear, logical wrap-up of the essay's main idea. It should rephrase the thesis in a fresh way.",
    applicableGrades: { min: 6, max: 6 },
    essayTypeGuidance: {
      Expository: 'Summarize main points.',
      'Problem/Solution': 'Summarize main points.',
      Narrative: 'Restate the thesis and summarize the importance of the factual account.',
      Opinion:
        'Reassert personal stance; might prompt further thought or action (e.g., "We must all…").',
      'Pro/Con':
        'Paraphrase both sides without taking one. E.g., "In summary, both sides present valid perspectives..."',
      Story:
        'Conclude with a reflection on what was learned, a final image, or moment showing character change.',
      Argumentative: 'Reaffirm the stronger side or final call to action.',
    },
  },

  // Criterion 13: Credible evidence
  {
    name: 'Used credible and relevant evidence',
    description:
      'The essay must use credible and relevant evidence (facts, data, statistics, quotations) that directly supports the thesis.',
    applicableGrades: { min: 6, max: 12 },
    applicableEssayTypes: ['Argumentative', 'Expository', 'Problem/Solution', 'Pro/Con', 'Narrative'],
    essayTypeGuidance: {
      Argumentative:
        'Ensure evidence is sufficient and relevant. Personal anecdotes alone are not enough; factual or textual support is required.',
      Expository:
        'Provide enough factual or textual support to reinforce the thesis. Personal anecdotes alone are not enough.',
      'Problem/Solution':
        'Provide enough factual or textual support to reinforce the thesis.',
      Narrative:
        'Include factual evidence and academic content: dates, historical facts, textual references.',
      'Pro/Con':
        'Supply enough credible evidence to support the thesis for both sides.',
    },
    gradeLevelGuidance: [
      {
        min: 6,
        max: 6,
        explanation:
          'For Grade 6, cite evidence from text using illustration transitions and direct or paraphrased quotations.',
      },
      {
        min: 7,
        max: 12,
        explanation:
          'For Grades 7-12, provide robust, credible evidence including facts, data, statistics, or textual quotations.',
      },
    ],
  },

  // Criterion 14: Both sides fairly (Pro/Con only)
  {
    name: 'Presented both sides fairly',
    description:
      'The essay should introduce both the "pro" and "con" sides without implying one side is superior. Language remains neutral.',
    applicableGrades: { min: 6, max: 12 },
    applicableEssayTypes: ['Pro/Con'],
    essayTypeGuidance: {
      'Pro/Con':
        'Explicitly address each side, offering roughly equivalent depth or evidence if possible.',
    },
  },

  // Criterion 15: Minimum paragraph count
  {
    name: 'Minimum paragraph count',
    description: 'The essay should have at least the minimum number of paragraphs.',
    applicableGrades: { min: 6, max: 12 },
    gradeLevelGuidance: [
      {
        min: 6,
        max: 7,
        explanation: 'For Grades 6-7, the essay should have at least 4 paragraphs.',
      },
      {
        min: 8,
        max: 12,
        explanation: 'For Grades 8-12, the essay should have at least 5 paragraphs.',
      },
    ],
  },

  // Criterion 16: Clear reasoning (Grades 9-12, Argumentative only)
  {
    name: 'Clear reasoning from evidence to claim',
    description:
      'The essay should explicitly show how each piece of evidence supports the thesis or refutes a counterclaim.',
    applicableGrades: { min: 9, max: 12 },
    applicableEssayTypes: ['Argumentative'],
    essayTypeGuidance: {
      Argumentative:
        'Provide a "bridge" between evidence and claims, ensuring the audience understands how each fact proves the point.',
    },
  },
];

/**
 * @description Check if a criterion applies to a given grade level.
 */
function criterionAppliesToGrade(criterion: EssayCriterion, gradeLevel: number): boolean {
  return gradeLevel >= criterion.applicableGrades.min && gradeLevel <= criterion.applicableGrades.max;
}

/**
 * @description Check if a criterion applies to a given essay type.
 */
function criterionAppliesToType(criterion: EssayCriterion, essayType: EssayType): boolean {
  // If no specific types are defined, it applies to all types
  if (!criterion.applicableEssayTypes) return true;
  return criterion.applicableEssayTypes.includes(essayType);
}

/**
 * @description Get grade-specific guidance for a criterion.
 */
export function getGradeLevelGuidance(
  criterion: EssayCriterion,
  gradeLevel: number
): string | undefined {
  if (!criterion.gradeLevelGuidance) return undefined;

  const guidance = criterion.gradeLevelGuidance.find(
    (g) => gradeLevel >= g.min && gradeLevel <= g.max
  );
  return guidance?.explanation;
}

/**
 * @description Get essay type-specific guidance for a criterion.
 */
export function getEssayTypeGuidance(
  criterion: EssayCriterion,
  essayType: EssayType
): string | undefined {
  if (!criterion.essayTypeGuidance) return undefined;
  return criterion.essayTypeGuidance[essayType];
}

/**
 * @description Get a prepared rubric filtered by grade level and essay type.
 * Excludes "Composition follows outline" since we don't support outlines.
 */
export function getPreparedRubric(
  gradeLevel: number,
  essayType: EssayType
): PreparedEssayRubric {
  // Validate grade level
  if (gradeLevel < 6 || gradeLevel > 12) {
    throw new Error(`Grade level must be between 6 and 12. Received: ${gradeLevel}`);
  }

  // Filter criteria by grade and type, excluding outline criterion
  const filteredCriteria = COMPOSITION_CRITERIA.filter((criterion) => {
    // Skip outline criterion (we don't support outlines)
    if (criterion.name === 'Composition follows outline') return false;

    // Check grade applicability
    if (!criterionAppliesToGrade(criterion, gradeLevel)) return false;

    // Check type applicability
    if (!criterionAppliesToType(criterion, essayType)) return false;

    return true;
  });

  return {
    essayType,
    gradeLevel,
    criteria: filteredCriteria,
  };
}

/**
 * @description Get all available essay types.
 */
export function getAvailableEssayTypes(): EssayType[] {
  return [
    'Expository',
    'Problem/Solution',
    'Argumentative',
    'Opinion',
    'Pro/Con',
    'Narrative',
    'Story',
  ];
}

/**
 * @description Format criteria as a string for LLM prompts.
 */
export function formatCriteriaForPrompt(
  criteria: EssayCriterion[],
  essayType: EssayType,
  gradeLevel: number
): string {
  return criteria
    .map((c, index) => {
      const typeGuidance = getEssayTypeGuidance(c, essayType);
      const gradeGuidance = getGradeLevelGuidance(c, gradeLevel);
      const subcriteria = c.subcriteria ? `\n   Subcriteria: ${c.subcriteria.join(', ')}` : '';

      let formatted = `${index + 1}. ${c.name}\n   ${c.description}${subcriteria}`;
      if (typeGuidance) formatted += `\n   For ${essayType}: ${typeGuidance}`;
      if (gradeGuidance) formatted += `\n   ${gradeGuidance}`;

      return formatted;
    })
    .join('\n\n');
}

