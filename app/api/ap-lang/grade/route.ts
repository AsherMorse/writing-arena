import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { 
  getAPLangArgumentPrompt, 
  getAPLangRhetoricalAnalysisPrompt, 
  getAPLangSynthesisPrompt 
} from '@/lib/prompts/grading-prompts';

/**
 * @fileoverview AP Language and Composition Essay Scoring API
 * 
 * Supports three AP Lang essay types with official rubrics:
 * - Argument Essay
 * - Rhetorical Analysis Essay
 * - Synthesis Essay
 * 
 * Each uses 0-6 scale: Thesis (0-1) + Evidence & Commentary (0-4) + Sophistication (0-1)
 */

type EssayType = 'argument' | 'rhetorical-analysis' | 'synthesis';

export async function POST(request: NextRequest) {
  try {
    const { prompt, essay, essayType = 'argument' } = await request.json();

    if (!prompt || !essay) {
      return NextResponse.json(
        { error: 'Both prompt and essay are required' },
        { status: 400 }
      );
    }

    if (!['argument', 'rhetorical-analysis', 'synthesis'].includes(essayType)) {
      return NextResponse.json(
        { error: 'Invalid essay type. Must be argument, rhetorical-analysis, or synthesis' },
        { status: 400 }
      );
    }

    logApiKeyStatus('AP LANG GRADE');
    const apiKey = getAnthropicApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 500 }
      );
    }

    // Select the appropriate prompt based on essay type
    let scoringPrompt: string;
    switch (essayType as EssayType) {
      case 'rhetorical-analysis':
        scoringPrompt = getAPLangRhetoricalAnalysisPrompt(prompt, essay);
        break;
      case 'synthesis':
        scoringPrompt = getAPLangSynthesisPrompt(prompt, essay);
        break;
      case 'argument':
      default:
        scoringPrompt = getAPLangArgumentPrompt(prompt, essay);
        break;
    }

    const aiResponse = await callAnthropicAPI(apiKey, scoringPrompt, 2500);
    const responseText = aiResponse.content[0].text;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate individual component scores
    if (result.thesisScore < 0 || result.thesisScore > 1) {
      result.thesisScore = Math.max(0, Math.min(1, result.thesisScore));
    }
    if (result.evidenceScore < 0 || result.evidenceScore > 4) {
      result.evidenceScore = Math.max(0, Math.min(4, result.evidenceScore));
    }
    if (result.sophisticationScore < 0 || result.sophisticationScore > 1) {
      result.sophisticationScore = Math.max(0, Math.min(1, result.sophisticationScore));
    }

    // Calculate total score from components (don't trust AI's addition)
    result.score = result.thesisScore + result.evidenceScore + result.sophisticationScore;

    // Add score descriptor based on calculated score
    if (!result.scoreDescriptor) {
      const descriptors: Record<number, string> = {
        6: 'Excellent',
        5: 'Strong',
        4: 'Adequate',
        3: 'Developing',
        2: 'Weak',
        1: 'Very Weak',
        0: 'Insufficient',
      };
      result.scoreDescriptor = descriptors[result.score] || 'Adequate';
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ AP LANG GRADE - Error:', error);
    return NextResponse.json(
      { error: 'Failed to grade essay' },
      { status: 500 }
    );
  }
}

