/**
 * @fileoverview System prompt builder for practice mode grading.
 * Constructs prompts from AlphaWrite-style grader configurations.
 */

import { ActivityGraderConfig } from '@/lib/constants/grader-configs';

/**
 * @description Builds a system prompt for the grading LLM from a grader config.
 * Based on AlphaWrite's adaptive grader prompt structure.
 */
export function buildSystemPrompt(
  config: ActivityGraderConfig,
  grade: number = 9
): string {
  const gradeLevel = grade <= 9 ? 'Level 1 (grades 7-9)' : 'Level 2 (grades 10-12)';
  const levelInstructions = grade <= 9
    ? 'Expect solid grammar and clear logical connections. Allow for developing sophistication in style.'
    : 'Expect strong grammar, sophisticated vocabulary, and nuanced logical connections appropriate for college prep.';

  return `You are an expert writing coach using principles from "The Writing Revolution" (TWR).
Your job is to evaluate a student's submission and provide helpful, actionable feedback.

## Activity: ${config.nameOfActivity}

**Primary Goal**: ${config.goalForThisExercise.primaryGoal}

**Secondary Goals**:
${config.goalForThisExercise.secondaryGoals.map(g => `- ${g}`).join('\n')}

## How This Activity Works

${config.howTheActivityWorks}

## Important Grading Principles

${config.importantPrinciplesForGrading.map((p, i) => `${p}`).join('\n')}

## Common Mistakes to Watch For

${config.commonMistakesToAnticipate.map(m => `- **${m.mistake}**: ${m.explanation}${m.example ? `\n  Example: ${m.example}` : ''}`).join('\n\n')}

## Positive Examples (CORRECT answers)

${config.positiveExamples.map(e => `- **Example**: ${e.example}\n  **Why it's correct**: ${e.explainer}`).join('\n\n')}

## Negative Examples (INCORRECT answers)

${config.negativeExamples.map(e => `- **Example**: ${e.example}\n  **Why it's wrong**: ${e.explainer}`).join('\n\n')}

## Grade Level Calibration

The student is in grade ${grade} (${gradeLevel}).
${levelInstructions}
${config.gradeAppropriateConsiderations.level1 && grade <= 9 ? `\nAdditional notes: ${config.gradeAppropriateConsiderations.level1}` : ''}
${config.gradeAppropriateConsiderations.level2 && grade > 9 ? `\nAdditional notes: ${config.gradeAppropriateConsiderations.level2}` : ''}

## Scoring Guide

- **100**: Perfect answer, demonstrates full understanding
- **90-99**: Correct with very minor issues (nits only)
- **80-89**: Mostly correct, small improvements needed
- **70-79**: Partially correct, significant room for improvement
- **60-69**: Shows understanding but has notable problems
- **0-59**: Incorrect or fundamentally flawed

## Feedback Guidelines

${config.feedbackPromptOverrides?.concreteProblem || 'Point out what was wrong in a warm, friendly, encouraging tone appropriate for elementary students.'}

${config.feedbackPromptOverrides?.callToAction || 'Explain how the student can improve in a warm, friendly, encouraging tone.'}

## Output Requirements

You must evaluate the student's answer and provide:
1. **isCorrect**: Whether the answer meets the activity requirements (true/false)
2. **score**: A numerical score from 0-100
3. **remarks**: An array of feedback items (empty if perfect)
4. **solution**: A corrected version if incorrect, or empty string if correct

For remarks, each item should have:
- **severity**: "error" for major issues, "nit" for minor issues
- **concreteProblem**: Brief description of the issue (50-85 characters, friendly tone)
- **callToAction**: How to fix it (70-150 characters, friendly tone)

Keep feedback age-appropriate and encouraging. Limit to the 3 most important issues.`.trim();
}

/**
 * @description A previous attempt with content and grading feedback.
 */
interface PreviousAttempt {
  content: string;
  remarks: { severity: string; concreteProblem: string; callToAction: string }[];
}

/**
 * @description Builds the user prompt with the question and student answer.
 * Includes previous attempts context if this is a retry.
 */
export function buildUserPrompt(
  question: string,
  studentAnswer: string,
  questionLabel?: string,
  previousAttempts: PreviousAttempt[] = []
): string {
  const label = questionLabel || 'Question';
  
  let prompt = `${label}: ${question}\n\n`;
  
  // Include previous attempts context if this is a retry
  if (previousAttempts.length > 0) {
    prompt += `## Previous Attempts\n\n`;
    prompt += `The student has attempted this ${previousAttempts.length} time(s) before. `;
    prompt += `Consider what they've already tried and avoid repeating the same feedback.\n\n`;
    
    previousAttempts.forEach((attempt, idx) => {
      prompt += `### Attempt ${idx + 1}\n`;
      prompt += `**Submitted**: ${attempt.content}\n`;
      if (attempt.remarks.length > 0) {
        prompt += `**Feedback given**:\n`;
        attempt.remarks.forEach(r => {
          prompt += `- [${r.severity}] ${r.concreteProblem}\n`;
        });
      }
      prompt += `\n`;
    });
    
    prompt += `### Current Attempt (${previousAttempts.length + 1})\n`;
  }
  
  prompt += `Student Answer: ${studentAnswer}\n\n`;
  prompt += `Please evaluate this answer using the submit_grading_result tool.`;
  
  return prompt;
}

