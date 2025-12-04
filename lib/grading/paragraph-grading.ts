/**
 * @fileoverview Paragraph grading service using TWR rubrics and Claude Sonnet 4.
 * Grades single paragraphs and returns structured feedback for gap detection.
 */

import { callAnthropicAPI, getAnthropicApiKey } from '@/lib/utils/api-helpers';
import {
  getRubric,
  type ParagraphGradingInput,
  type ParagraphGradingResult,
  type ParagraphRubricType,
  type ParagraphScorecard,
  type GradedCategory,
  type CategoryExample,
} from './paragraph-rubrics';

/**
 * @description Generate the grading prompt for Claude.
 */
function generateGradingPrompt(
  paragraph: string,
  prompt: string,
  rubricType: ParagraphRubricType,
  gradeLevel?: number
): string {
  const rubric = getRubric(rubricType);
  const rubricString = JSON.stringify(rubric, null, 2);
  const gradeContext = gradeLevel ? `The student is in grade ${gradeLevel}.` : '';

  return `You are a writing instructor trained in The Writing Revolution (TWR) methodology. Grade this student's paragraph using the provided rubric.

WRITING PROMPT:
${prompt}

STUDENT PARAGRAPH:
${paragraph}

${gradeContext}

RUBRIC:
${rubricString}

GRADING INSTRUCTIONS:
1. Evaluate the paragraph against EACH category in the rubric
2. Assign a score (0-5) based on the score level descriptions
3. Provide specific, actionable feedback for each category
4. Provide examples based on the score (see EXAMPLE SELECTION RULES below)

TWR STRATEGIES TO REFERENCE:
- Sentence Expansion (because/but/so)
- Appositives (descriptive phrases)
- Subordinating Conjunctions (although, since, while, when)
- Transition Words (First, Then, However, Therefore)
- Topic Sentence clarity
- Supporting detail relevance
- Concluding sentence effectiveness

EXAMPLE SELECTION RULES (IMPORTANT - follow this exactly):
- Total examples per category: 2-3 maximum (combined strengths + improvements)
- Score 4-5 (strong): 1-2 examplesOfGreatResults, 0-1 examplesOfWhereToImprove
- Score 3 (developing): 1 examplesOfGreatResults, 1-2 examplesOfWhereToImprove
- Score 0-2 (needs work): 0-1 examplesOfGreatResults, 1-2 examplesOfWhereToImprove
- Pick only the MOST important examples - quality over quantity

EXAMPLE FORMAT RULES:
- substringOfInterest: Copy the EXACT text from the student's paragraph (no changes). Use "N/A" only for general advice.
- explanationOfSubstring: Explain why this text demonstrates the skill well OR what could be improved. Reference specific TWR strategies.

Return your evaluation as JSON in this exact format:
{
  "scorecard": {
    "rubricId": "${rubricType}",
    "categories": [
      {
        "title": "Category Name",
        "score": 0-5,
        "maxScore": 5,
        "feedback": "Specific feedback explaining the score",
        "examplesOfGreatResults": [
          {
            "substringOfInterest": "exact text from paragraph where student did well",
            "explanationOfSubstring": "Why this demonstrates the skill - reference TWR strategy"
          }
        ],
        "examplesOfWhereToImprove": [
          {
            "substringOfInterest": "exact text that needs improvement",
            "explanationOfSubstring": "What could be better and how - reference TWR strategy"
          }
        ]
      }
    ],
    "totalScore": number,
    "maxScore": 20,
    "percentageScore": number
  },
  "overallFeedback": "Brief overall assessment (2-3 sentences) highlighting main strengths and priority areas for improvement"
}

IMPORTANT:
- Copy text EXACTLY as written in substringOfInterest (no paraphrasing, no ellipses)
- Do NOT put quotes around the substringOfInterest value - just the raw text
- Name specific TWR strategies in explanations
- Return ONLY valid JSON, no markdown or additional text`;
}

/**
 * @description Parse a single example object from LLM response.
 */
function parseExample(example: any): CategoryExample | null {
  if (!example || typeof example !== 'object') return null;
  
  const substringOfInterest = example.substringOfInterest || example.substring || '';
  const explanationOfSubstring = example.explanationOfSubstring || example.explanation || '';
  
  // Skip empty or N/A examples
  if (!substringOfInterest || substringOfInterest.toUpperCase() === 'N/A') {
    // Still include if there's an explanation (general feedback)
    if (explanationOfSubstring) {
      return { substringOfInterest: 'N/A', explanationOfSubstring };
    }
    return null;
  }
  
  return { substringOfInterest, explanationOfSubstring };
}

/**
 * @description Parse an array of examples, filtering out invalid ones.
 */
function parseExamples(examples: any): CategoryExample[] {
  if (!Array.isArray(examples)) return [];
  return examples
    .map(parseExample)
    .filter((ex): ex is CategoryExample => ex !== null)
    .slice(0, 2); // Max 2 per array (total 2-3 per category)
}

/**
 * @description Parse Claude's response into a structured grading result.
 */
function parseGradingResponse(
  response: string,
  rubricType: ParagraphRubricType
): ParagraphGradingResult {
  // Try to extract JSON from the response
  let jsonStr = response.trim();
  
  // Handle potential markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    // Validate and normalize the response
    const scorecard: ParagraphScorecard = {
      rubricId: rubricType,
      categories: (parsed.scorecard?.categories || []).map((cat: any): GradedCategory => ({
        title: cat.title || 'Unknown',
        score: Math.min(5, Math.max(0, Number(cat.score) || 0)),
        maxScore: 5,
        feedback: cat.feedback || '',
        examplesOfGreatResults: parseExamples(cat.examplesOfGreatResults),
        examplesOfWhereToImprove: parseExamples(cat.examplesOfWhereToImprove),
      })),
      totalScore: 0,
      maxScore: 20,
      percentageScore: 0,
    };

    // Calculate totals
    scorecard.totalScore = scorecard.categories.reduce((sum, cat) => sum + cat.score, 0);
    scorecard.percentageScore = Math.round((scorecard.totalScore / scorecard.maxScore) * 100);

    return {
      scorecard,
      overallFeedback: parsed.overallFeedback || '',
    };
  } catch (error) {
    console.error('Failed to parse grading response:', error);
    throw new Error(`Failed to parse grading response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * @description Grade a paragraph using TWR rubrics and Claude Sonnet 4.
 * @param input - The grading input parameters
 * @returns Structured grading result with scorecard and TWR-specific feedback
 */
export async function gradeParagraph(input: ParagraphGradingInput): Promise<ParagraphGradingResult> {
  const { paragraph, prompt, rubricType = 'expository', gradeLevel } = input;

  if (!paragraph || paragraph.trim().length === 0) {
    throw new Error('Paragraph content is required');
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Writing prompt is required');
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const gradingPrompt = generateGradingPrompt(paragraph, prompt, rubricType, gradeLevel);
  
  console.log(`🔍 PARAGRAPH GRADING - Grading with ${rubricType} rubric`);
  
  const response = await callAnthropicAPI(apiKey, gradingPrompt, 2500);
  const responseText = response.content[0].text;

  const result = parseGradingResponse(responseText, rubricType);

  console.log(`✅ PARAGRAPH GRADING - Score: ${result.scorecard.totalScore}/${result.scorecard.maxScore} (${result.scorecard.percentageScore}%)`);

  return result;
}

/**
 * @description Convert paragraph score (0-20) to ranked match score (0-100).
 */
export function normalizeToRankedScore(paragraphScore: number, maxScore: number = 20): number {
  return Math.round((paragraphScore / maxScore) * 100);
}

/**
 * @description Get all available rubric types.
 */
export function getAvailableRubricTypes(): ParagraphRubricType[] {
  return ['expository', 'argumentative', 'opinion', 'pro-con'];
}

