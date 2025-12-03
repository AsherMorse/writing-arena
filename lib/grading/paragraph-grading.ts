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
4. Identify 3 specific STRENGTHS - quote the student's text and name the TWR strategy used
5. Identify 3 specific IMPROVEMENTS - quote what to change and name the TWR strategy to use

TWR STRATEGIES TO LOOK FOR:
- Sentence Expansion (because/but/so)
- Appositives (descriptive phrases)
- Subordinating Conjunctions (although, since, while, when)
- Transition Words (First, Then, However, Therefore)
- Topic Sentence clarity
- Supporting detail relevance
- Concluding sentence effectiveness

Return your evaluation as JSON in this exact format:
{
  "scorecard": {
    "rubricId": "${rubricType}",
    "categories": [
      {
        "title": "Category Name",
        "score": 0-5,
        "maxScore": 5,
        "feedback": "Specific feedback with examples from the text"
      }
    ],
    "totalScore": number,
    "maxScore": 20,
    "percentageScore": number
  },
  "strengths": [
    "Quote: 'exact text from paragraph' - demonstrates [TWR strategy] (e.g., uses appositive to add description)",
    "Quote: 'exact text' - shows [TWR strategy]",
    "Quote: 'exact text' - [TWR strategy explanation]"
  ],
  "improvements": [
    "Change 'current text' to 'improved version' - use [TWR strategy] to [benefit]",
    "Add [TWR strategy] to sentence X: 'suggested revision'",
    "[Specific TWR-based improvement suggestion]"
  ],
  "overallFeedback": "Brief overall assessment highlighting main strengths and priority areas for improvement"
}

IMPORTANT: 
- Quote the student's actual text in strengths and improvements
- Name specific TWR strategies (appositives, subordinating conjunctions, transitions, etc.)
- Provide concrete revision suggestions, not vague advice
- Return ONLY valid JSON, no markdown or additional text`;
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
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
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

