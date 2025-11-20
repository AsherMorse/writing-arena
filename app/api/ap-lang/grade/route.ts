import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';

/**
 * AP Language and Composition Essay Scoring
 * 
 * Uses the official AP Lang rubric:
 * - Thesis (0-1 point)
 * - Evidence & Commentary (0-4 points)
 * - Sophistication (0-1 point)
 * Total: 0-6 points
 */

export async function POST(request: NextRequest) {
  try {
    const { prompt, essay } = await request.json();

    if (!prompt || !essay) {
      return NextResponse.json(
        { error: 'Both prompt and essay are required' },
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

    const scoringPrompt = `You are an AP Language and Composition exam reader scoring a student's argument essay.

AP PROMPT:
${prompt}

STUDENT'S ESSAY:
${essay}

TASK:
Score this essay using the official AP Language and Composition rubric (0-6 scale).

SCORING RUBRIC:

**THESIS (0-1 point)**
- 1 point: Responds to the prompt with a defensible thesis that establishes a line of reasoning
- 0 points: Does not meet criteria for 1 point

**EVIDENCE AND COMMENTARY (0-4 points)**
- 4 points: Provides specific evidence to support all claims in a line of reasoning AND consistently explains how the evidence supports the line of reasoning
- 3 points: Provides specific evidence to support all claims in a line of reasoning AND explains how some of the evidence supports the line of reasoning
- 2 points: Provides specific evidence to support all claims in a line of reasoning BUT does not consistently explain how the evidence supports the line of reasoning
- 1 point: Provides mostly general evidence AND inconsistently explains how the evidence supports the line of reasoning
- 0 points: Does not meet criteria for 1 point

**SOPHISTICATION (0-1 point)**
- 1 point: Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation
- 0 points: Does not meet criteria for 1 point

CRITICAL EVALUATION REQUIREMENTS:
1. Check if thesis directly responds to the prompt
2. Evaluate quality and specificity of evidence (quotes, examples, data)
3. Assess how well evidence is explained and connected to the argument
4. Look for sophisticated analysis, nuanced thinking, or complex understanding
5. Consider organization, transitions, and rhetorical effectiveness

Respond in JSON format:
{
  "score": 4,
  "scoreDescriptor": "Adequate",
  "thesisScore": 1,
  "evidenceScore": 3,
  "sophisticationScore": 0,
  "strengths": [
    "Clear thesis that directly addresses the prompt",
    "Uses specific examples from the provided sources",
    "Good use of transitions between paragraphs"
  ],
  "improvements": [
    "Could strengthen commentary connecting evidence to the argument",
    "Consider adding more sophisticated analysis of rhetorical strategies",
    "Some evidence could be more specific and detailed"
  ],
  "detailedFeedback": "Your essay demonstrates a solid understanding of the prompt and provides relevant evidence. The thesis is clear and defensible. However, the commentary connecting your evidence to your argument could be more explicit and developed. To reach a higher score, focus on explaining HOW your evidence supports your line of reasoning, not just WHAT the evidence says."
}`;

    const aiResponse = await callAnthropicAPI(apiKey, scoringPrompt, 2500);
    const responseText = aiResponse.content[0].text;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate scores
    if (result.score < 0 || result.score > 6) {
      result.score = Math.max(0, Math.min(6, result.score));
    }
    if (result.thesisScore < 0 || result.thesisScore > 1) {
      result.thesisScore = Math.max(0, Math.min(1, result.thesisScore));
    }
    if (result.evidenceScore < 0 || result.evidenceScore > 4) {
      result.evidenceScore = Math.max(0, Math.min(4, result.evidenceScore));
    }
    if (result.sophisticationScore < 0 || result.sophisticationScore > 1) {
      result.sophisticationScore = Math.max(0, Math.min(1, result.sophisticationScore));
    }

    // Add score descriptor if not provided
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

