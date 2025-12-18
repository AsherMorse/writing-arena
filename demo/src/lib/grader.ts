/**
 * @fileoverview Writing grader for the adventure game.
 * Uses the full 3-layer D&D Grader for grammar, quest, and narrative checking.
 */

import { gradeDnDTurn, type DnDGraderResult, type NarrativeContext } from "./grading";

export type GradeResult = {
  score: number;
  feedback: string[];
  // Enhanced fields from D&D grader
  hpDamage?: number;
  errorCount?: number;
  feedbackSummary?: string;
  errors?: DnDGraderResult['prioritizedErrors'];
  // 3-layer specific
  accepted: boolean;
  blockingReason?: string;
};

export type GameContext = {
  location?: string;
  scene?: string;
  characterClass?: string;
  abilities?: string[];
  inventory?: string[];
  objective?: string;
  previousResponses?: string[];
  /** Recent story events for context (last few exchanges) */
  recentStory?: string;
};

/**
 * @description Grade a player's written response using all 3 layers.
 * Layer 1: Grammar/conventions
 * Layer 2: Quest requirements (is it a valid player action?)
 * Layer 3: Narrative appropriateness (does it fit the fantasy world?)
 */
export async function gradeResponse(
  text: string,
  gameContext?: GameContext
): Promise<GradeResult> {
  try {
    const narrativeContext: NarrativeContext = {
      currentLocation: gameContext?.location ?? "Dragon's Lair",
      sceneDescription: gameContext?.scene ?? "A massive red dragon sleeps atop a mountain of gold. The cave walls glitter with embedded gems.",
      characterClass: gameContext?.characterClass ?? "Thief",
      characterAbilities: gameContext?.abilities ?? ["stealth", "lockpicking", "dagger fighting", "climbing"],
      inventoryItems: gameContext?.inventory ?? ["dagger", "rope", "lockpicks", "small pouch"],
      currentObjective: gameContext?.objective ?? "Steal treasure from the dragon's hoard without waking the beast",
      recentStorySummary: gameContext?.recentStory,
    };

    const result = await gradeDnDTurn({
      studentResponse: text,
      gradeLevel: 6,
      categoryPreset: 'fantasy',
      gameContext: narrativeContext,
      previousResponses: gameContext?.previousResponses,
    });

    const gradeResult: GradeResult = {
      score: result.score,
      feedback: result.feedback,
      hpDamage: result.hpDamage,
      errorCount: result.errorCount,
      feedbackSummary: result.feedbackSummary,
      errors: result.prioritizedErrors,
      accepted: result.accepted,
      blockingReason: result.blockingReason,
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
  let accepted = true;

  if (wordCount < 3) {
    score = 30;
    feedback.push("Too short");
    accepted = false;
  }
  if (!hasCapital) feedback.push("Capitalize first word");
  if (!hasPunctuation) feedback.push("Add ending punctuation");

  return { 
    score, 
    feedback, 
    accepted,
    blockingReason: accepted ? undefined : "Response too short",
  };
}
