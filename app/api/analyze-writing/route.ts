import { NextRequest, NextResponse } from 'next/server';
import { generateTWRWritingPrompt } from '@/lib/utils/twr-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { countWords } from '@/lib/utils/text-utils';
import { randomScore } from '@/lib/utils/random-utils';

export async function POST(request: NextRequest) {
  let payload: { content?: string; trait?: string | null; promptType?: string | null };
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Error parsing analyze-writing body:', error);
    return NextResponse.json(generateMockFeedback(null, 0));
  }

  const content = payload.content || '';
  const trait = payload.trait || null;
  const promptType = payload.promptType || null;
  const wordCount = countWords(content);

  try {
    logApiKeyStatus('ANALYZE WRITING');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ ANALYZE WRITING - API key missing, using mock feedback');
      return NextResponse.json(generateMockFeedback(trait, wordCount));
    }

    // Call Claude API for real feedback
    const prompt = generateTWRWritingPrompt(content, trait || 'all', promptType || 'narrative');
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 2000);
    const feedback = parseClaudioFeedback(aiResponse.content[0].text, trait || 'all', wordCount);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('❌ ANALYZE WRITING - Error:', error);
    return NextResponse.json(generateMockFeedback(trait, wordCount));
  }
}

function generatePrompt(content: string, trait: string, promptType: string): string {
  return `You are a supportive writing instructor providing formative feedback to a student.

STUDENT WRITING:
${content}

CONTEXT:
- Prompt type: ${promptType}
- Focus trait: ${trait}
- This is a 4-minute practice session

TASK:
Analyze this writing and provide HIGHLY SPECIFIC, POINTED feedback. Structure your response as JSON with:
1. Overall score (0-100)
2. Individual trait scores for: content, organization, grammar, vocabulary, mechanics (each 0-100)
3. 3 SPECIFIC strengths with EXACT EXAMPLES from the text
4. 3 SPECIFIC areas for improvement with EXACT EXAMPLES and CONCRETE suggestions
5. Detailed feedback for each of the 5 traits
6. 3 actionable next steps

CRITICAL REQUIREMENTS FOR SPECIFICITY:
- ALWAYS quote exact phrases, sentences, or words from the student's writing
- Use "In sentence X, you wrote '...' which shows..."
- Never say "good use of" without quoting the exact example
- Never say "could improve" without pointing to specific sentences that need work
- Give CONCRETE revisions: "Change 'X' to 'Y'" or "Add a sentence here that..."
- Reference specific Writing Revolution strategies by name when applicable

Example GOOD feedback:
✓ "In your opening 'The lighthouse stood sentinel,' the word 'sentinel' creates strong imagery"
✓ "Your third sentence lacks a transition. Add 'However,' before 'Sarah had passed it...'"
✓ "Change 'got the better of her' to a more vivid phrase like 'pulled her forward' or 'consumed her thoughts'"

Example BAD (vague) feedback:
✗ "Good use of descriptive language"
✗ "Could improve transitions"
✗ "Nice vocabulary choices"

Be encouraging BUT SPECIFIC. Every comment must reference the actual text.

Format your response as valid JSON matching this structure:
{
  "overallScore": 85,
  "traits": {
    "content": 88,
    "organization": 82,
    "grammar": 85,
    "vocabulary": 80,
    "mechanics": 90
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "specificFeedback": {
    "content": "feedback text",
    "organization": "feedback text",
    "grammar": "feedback text",
    "vocabulary": "feedback text",
    "mechanics": "feedback text"
  },
  "nextSteps": ["step 1", "step 2", "step 3"]
}`;
}

function parseClaudioFeedback(claudeResponse: string, trait: string, wordCount: number): any {
  const parsed = parseClaudeJSON<any>(claudeResponse);
  
  if (!parsed) {
    console.warn('⚠️ ANALYZE WRITING - Failed to parse Claude response, using mock');
    return generateMockFeedback(trait, wordCount);
  }
  
  return {
    ...parsed,
    xpEarned: Math.round(parsed.overallScore * 1.5),
  };
}

function generateMockFeedback(focusTrait: string | null, words: number) {
  const baseScore = Math.min(100, Math.max(40, 60 + (words / 10)));
  
  return {
    overallScore: Math.round(baseScore),
    xpEarned: Math.round(baseScore * 1.5),
    traits: {
      content: randomScore(baseScore, 5),
      organization: randomScore(baseScore, 5),
      grammar: randomScore(baseScore, 5),
      vocabulary: randomScore(baseScore, 5),
      mechanics: randomScore(baseScore, 5),
    },
    strengths: [
      'Strong opening that captures attention',
      'Good use of descriptive details',
      'Clear progression of ideas',
    ],
    improvements: [
      'Try adding more transitional phrases between paragraphs',
      'Vary your sentence structure for better flow',
      'Consider expanding on your main points with specific examples',
    ],
    specificFeedback: {
      content: 'Your ideas are relevant and address the prompt well. Consider adding more specific examples to support your main points.',
      organization: 'Good logical flow overall. Transitions could be smoother between some paragraphs.',
      grammar: 'Sentence variety is good. Watch for a few minor punctuation issues.',
      vocabulary: 'Solid word choice. Try incorporating more precise verbs to strengthen your writing.',
      mechanics: 'Generally clean writing with good spelling and punctuation. Check capitalization in a few spots.',
    },
    nextSteps: [
      'Practice writing transitions between paragraphs',
      'Try the descriptive prompt type to expand vocabulary skills',
      'Focus on varying sentence beginnings in your next session',
    ],
  };
}

