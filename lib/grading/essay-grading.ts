/**
 * @fileoverview Essay grading service using TWR categorical rubrics and Claude Sonnet 4.
 * Grades full essays with Yes/Developing/No scoring and returns structured feedback.
 */

import { callAnthropicAPI, getAnthropicApiKey } from '@/lib/utils/api-helpers';
import {
  getPreparedRubric,
  formatCriteriaForPrompt,
  getAvailableEssayTypes,
  type EssayType,
  type EssayGradingInput,
  type EssayGradingResult,
  type EssayScorecard,
  type GradedCriterion,
  type CriterionScore,
} from './essay-rubrics';

/**
 * @description Score mapping for calculating total points.
 */
const SCORE_MAP: Record<CriterionScore, number> = {
  Yes: 2,
  Developing: 1,
  No: 0,
};

/**
 * @description Generate the grading prompt for Claude.
 */
function generateGradingPrompt(
  essay: string,
  prompt: string,
  essayType: EssayType,
  gradeLevel: number
): string {
  const preparedRubric = getPreparedRubric(gradeLevel, essayType);
  const criteriaString = formatCriteriaForPrompt(
    preparedRubric.criteria,
    essayType,
    gradeLevel
  );

  return `You are a writing instructor trained in The Writing Revolution (TWR) methodology. Grade this student's essay using the provided categorical rubric.

WRITING PROMPT:
${prompt}

STUDENT ESSAY:
${essay}

GRADE LEVEL: ${gradeLevel}
ESSAY TYPE: ${essayType}

RUBRIC CRITERIA:
${criteriaString}

GRADING INSTRUCTIONS:

For each criterion, assign a score:
- **Yes**: Work fully matches criterion with clarity and consistency
- **Developing**: Partial or inconsistent fulfillment  
- **No**: Does not meet criterion or element is missing

Provide specific feedback including:
1. Explanation of why you chose that score
2. Examples of great results (quote the student's text when applicable)
3. Examples of where to improve (quote specific text and suggest TWR strategies)

TWR STRATEGIES TO REFERENCE IN FEEDBACK:
- Sentence Expansion (because/but/so)
- Appositives (descriptive phrases)
- Subordinating Conjunctions (although, since, while, when)
- Transition Words (First, Then, However, Therefore, Furthermore)
- Topic Sentence clarity and placement
- GST structure for introductions (General → Specific → Thesis)
- TSG structure for conclusions (Thesis → Specific → General)
- Evidence integration with commentary

Return your evaluation as JSON in this exact format:
{
  "scorecard": {
    "essayType": "${essayType}",
    "gradeLevel": ${gradeLevel},
    "criteria": [
      {
        "criterion": "Criterion Name",
        "score": "Yes" | "Developing" | "No",
        "explanation": "Detailed explanation of why this score was given",
        "examplesOfGreatResults": ["Quote from essay showing mastery (or empty if No)"],
        "examplesOfWhereToImprove": ["Quote from essay with suggestion (or empty if Yes)"]
      }
    ]
  },
  "strengths": [
    "Strength 1: Quote from essay + TWR strategy demonstrated",
    "Strength 2: Quote + strategy",
    "Strength 3: Quote + strategy"
  ],
  "improvements": [
    "Improvement 1: Quote current text → suggested revision using [TWR strategy]",
    "Improvement 2: Quote → revision using [strategy]",
    "Improvement 3: Quote → revision using [strategy]"
  ],
  "overallFeedback": "Brief overall assessment (2-3 sentences) highlighting main strengths and priority areas"
}

IMPORTANT:
- Evaluate EVERY criterion in the rubric
- Quote the student's actual text in examples and feedback
- Name specific TWR strategies (appositives, subordinating conjunctions, transitions, etc.)
- Provide concrete revision suggestions, not vague advice
- Return ONLY valid JSON, no markdown or additional text`;
}

/**
 * @description Calculate scorecard totals from graded criteria.
 */
function calculateScores(criteria: GradedCriterion[]): {
  totalPoints: number;
  maxPoints: number;
  percentageScore: number;
} {
  const totalPoints = criteria.reduce(
    (sum, c) => sum + SCORE_MAP[c.score],
    0
  );
  const maxPoints = criteria.length * 2;
  const percentageScore = Math.round((totalPoints / maxPoints) * 100);

  return { totalPoints, maxPoints, percentageScore };
}

/**
 * @description Parse Claude's response into a structured grading result.
 */
function parseGradingResponse(
  response: string,
  essayType: EssayType,
  gradeLevel: number
): EssayGradingResult {
  // Try to extract JSON from the response
  let jsonStr = response.trim();

  // Handle potential markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and normalize the criteria
    const criteria: GradedCriterion[] = (parsed.scorecard?.criteria || []).map(
      (c: Record<string, unknown>): GradedCriterion => ({
        criterion: String(c.criterion || 'Unknown'),
        score: validateScore(c.score),
        explanation: String(c.explanation || ''),
        examplesOfGreatResults: Array.isArray(c.examplesOfGreatResults)
          ? c.examplesOfGreatResults.map(String)
          : [],
        examplesOfWhereToImprove: Array.isArray(c.examplesOfWhereToImprove)
          ? c.examplesOfWhereToImprove.map(String)
          : [],
      })
    );

    // Calculate totals
    const scores = calculateScores(criteria);

    const scorecard: EssayScorecard = {
      essayType,
      gradeLevel,
      criteria,
      ...scores,
    };

    return {
      scorecard,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.slice(0, 5).map(String)
        : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.slice(0, 5).map(String)
        : [],
      overallFeedback: String(parsed.overallFeedback || ''),
    };
  } catch (error) {
    console.error('Failed to parse essay grading response:', error);
    throw new Error(
      `Failed to parse essay grading response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * @description Validate and normalize a score value.
 */
function validateScore(score: unknown): CriterionScore {
  const validScores: CriterionScore[] = ['Yes', 'Developing', 'No'];
  const scoreStr = String(score);

  if (validScores.includes(scoreStr as CriterionScore)) {
    return scoreStr as CriterionScore;
  }

  // Try to map common variations
  const lower = scoreStr.toLowerCase();
  if (lower === 'yes' || lower === 'y') return 'Yes';
  if (lower === 'no' || lower === 'n') return 'No';
  if (lower.includes('develop')) return 'Developing';

  // Default to No if unrecognized
  console.warn(`Unrecognized score value: ${scoreStr}, defaulting to No`);
  return 'No';
}

/**
 * @description Grade an essay using TWR categorical rubrics and Claude Sonnet 4.
 * @param input - The grading input parameters
 * @returns Structured grading result with scorecard and TWR-specific feedback
 */
export async function gradeEssay(
  input: EssayGradingInput
): Promise<EssayGradingResult> {
  const { essay, prompt, essayType = 'Expository', gradeLevel } = input;

  if (!essay || essay.trim().length === 0) {
    throw new Error('Essay content is required');
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Writing prompt is required');
  }

  if (gradeLevel < 6 || gradeLevel > 12) {
    throw new Error(`Grade level must be between 6 and 12. Received: ${gradeLevel}`);
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const gradingPrompt = generateGradingPrompt(essay, prompt, essayType, gradeLevel);

  console.log(`📝 ESSAY GRADING - Type: ${essayType}, Grade: ${gradeLevel}`);

  // Use higher token limit for essays (they have more criteria)
  const response = await callAnthropicAPI(apiKey, gradingPrompt, 4000);
  const responseText = response.content[0].text;

  const result = parseGradingResponse(responseText, essayType, gradeLevel);

  console.log(
    `✅ ESSAY GRADING - Score: ${result.scorecard.totalPoints}/${result.scorecard.maxPoints} (${result.scorecard.percentageScore}%)`
  );

  return result;
}

/**
 * @description Convert essay percentage score to ranked match score (already 0-100).
 */
export function normalizeToRankedScore(essayScorecard: EssayScorecard): number {
  return essayScorecard.percentageScore;
}

/**
 * @description Get all available essay types.
 */
export function getAvailableEssayTypesForGrading(): EssayType[] {
  return getAvailableEssayTypes();
}

/**
 * @description Get criterion count for a specific grade/type combination.
 */
export function getCriteriaCount(gradeLevel: number, essayType: EssayType): number {
  const rubric = getPreparedRubric(gradeLevel, essayType);
  return rubric.criteria.length;
}

