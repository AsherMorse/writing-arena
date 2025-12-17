/**
 * @fileoverview Writing grader for the adventure game.
 * Uses the enhanced D&D Conventions Grader for detailed grammar checking.
 */

import { gradeDnDResponse, type DnDGraderResult } from "./grading";

export type GradeResult = {
  score: number;
  feedback: string[];
  // Enhanced fields from D&D grader
  hpDamage?: number;
  errorCount?: number;
  feedbackSummary?: string;
  errors?: DnDGraderResult['prioritizedErrors'];
};

/**
 * @description Grade a player's written response.
 * Returns both the simple score/feedback format and enhanced grading details.
 */
export async function gradeResponse(text: string): Promise<GradeResult> {
  try {
    const result = await gradeDnDResponse({
      studentResponse: text,
      gradeLevel: 6,
      categoryPreset: 'strict',
    });

    const gradeResult = {
      score: result.score,
      feedback: result.feedback,
      hpDamage: result.hpDamage,
      errorCount: result.errorCount,
      feedbackSummary: result.feedbackSummary,
      errors: result.prioritizedErrors,
    };

    console.log("Grader response:", JSON.stringify(gradeResult, null, 2));

    return gradeResult;
  } catch (error) {
    console.error("Grader error:", error);
    return fallbackGrade(text);
  }
}

/**
 * @description Fallback grading when the LLM call fails.
 */
function fallbackGrade(text: string): GradeResult {
  const wordCount = text.trim().split(/\s+/).length;
  const hasCapital = /^[A-Z]/.test(text.trim());
  const hasPunctuation = /[.!?]$/.test(text.trim());

  let score = 50;
  const feedback: string[] = [];

  if (wordCount < 3) {
    score = 30;
    feedback.push("Too short");
  }
  if (!hasCapital) feedback.push("Capitalize first word");
  if (!hasPunctuation) feedback.push("Add ending punctuation");

  return { score, feedback };
}
