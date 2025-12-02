/**
 * @fileoverview Type definitions for AlphaWrite-style grader configurations.
 * Extracted from AlphaWrite's adaptive grader system.
 */

/**
 * @description Configuration for activity-specific grading.
 * This metadata is used to construct the system prompt for the LLM grader.
 */
export interface ActivityGraderConfig {
  /** Human-readable name of the activity e.g. "Because, But, So" */
  nameOfActivity: string;

  /** Pedagogical / skill-acquisition goals for this activity */
  goalForThisExercise: {
    primaryGoal: string;
    secondaryGoals: string[];
  };

  /** Mechanics of the activity, helping the LLM understand what the student is asked to do */
  howTheActivityWorks: string;

  /** Level-specific instructions for grading the activity */
  gradeAppropriateConsiderations: {
    level1: string; // Grades 7-9 (Middle School)
    level2: string; // Grades 10-12 (High School)
  };

  /** Important principles for grading the activity */
  importantPrinciplesForGrading: string[];

  /** Known failure modes for this exercise */
  commonMistakesToAnticipate: Array<{
    /** A description of a mistake, such as "Using 'so' as an intensifier" */
    mistake: string;
    /** An explanation of why this move is a mistake in this exercise */
    explanation: string;
    /** An example of the mistake */
    example?: string;
  }>;

  /** Notes on what shape or format the student's answer should follow */
  formatRequirements?: Array<{
    /** Summary of one requirement */
    requirement: string;
    /** An example of the correct answer */
    correctExample?: string;
    /** An example of the incorrect answer */
    incorrectExample?: string;
  }>;

  /** Examples of correct answers */
  positiveExamples: Array<{
    /** An example of the correct answer */
    example: string;
    /** An explanation of why this answer is correct */
    explainer: string;
  }>;

  /** Examples of incorrect answers */
  negativeExamples: Array<{
    /** An example of the incorrect answer */
    example: string;
    /** An explanation of why this answer is incorrect */
    explainer: string;
  }>;

  /** Optional label for the question in the user prompt */
  questionLabel?: string;

  /** Allow overriding defaults to make better activity-specific feedback */
  feedbackPromptOverrides?: {
    concreteProblem?: string;
    callToAction?: string;
  };
}

/**
 * @description Result returned from the grading LLM.
 */
export interface GradingResult {
  isCorrect: boolean;
  score: number;
  remarks: GradingRemark[];
  solution: string;
}

/**
 * @description Individual feedback item from grading.
 */
export interface GradingRemark {
  severity: 'error' | 'nit';
  category?: string;
  concreteProblem: string;
  callToAction: string;
}

