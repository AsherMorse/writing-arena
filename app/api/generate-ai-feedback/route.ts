import { NextRequest, NextResponse } from 'next/server';
import { MOCK_WARNINGS } from '@/lib/constants/mock-warnings';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { generateMockAIFeedback } from '@/lib/utils/mock-data';
import { getSkillLevelFromRank, getFeedbackCharacteristics } from '@/lib/utils/skill-level';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { peerWriting, rank, playerName } = requestBody;
  
  try {
    logApiKeyStatus('GENERATE AI FEEDBACK');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.error('❌ GENERATE AI FEEDBACK - API key missing - LLM API unavailable');
      return NextResponse.json(
        { 
          error: 'LLM API unavailable - Set ANTHROPIC_API_KEY environment variable',
          fallback: generateMockFeedback(rank),
          warning: MOCK_WARNINGS.MOCK_EVALUATION
        },
        { status: 500 }
      );
    }

    const skillLevel = getSkillLevelFromRank(rank);
    const prompt = `You are simulating peer feedback from a ${skillLevel} student writer named "${playerName}".

PEER'S WRITING TO EVALUATE:
${peerWriting}

Give feedback AS IF you are a ${skillLevel} student. Answer these 3 targeted questions:

1. What is the main idea? (Identify the central point of the writing)
2. What is one strength? (Point out something specific the writer did well)
3. What is one specific suggestion? (Give one concrete improvement)

Guidelines for ${skillLevel} level feedback:
${getFeedbackCharacteristics(skillLevel)}

Respond in JSON:
{
  "mainIdea": "what the writing is about",
  "strength": "one specific thing done well",
  "suggestion": "one concrete improvement"
}`;

    const aiResponse = await callAnthropicAPI(apiKey, prompt, 800);
    const parsed = parseClaudeJSON<any>(aiResponse.content[0].text);
    
    if (!parsed) {
      throw new Error('Could not parse feedback JSON');
    }
    
    return NextResponse.json({
      responses: parsed,
      playerName,
    });
  } catch (error) {
    console.error('❌ GENERATE AI FEEDBACK - Error:', error);
    return NextResponse.json(
      { 
        error: 'LLM API call failed',
        details: error instanceof Error ? error.message : String(error),
        fallback: generateMockFeedback(rank),
        warning: '🚨 LLM API UNAVAILABLE: Using mock data - not from AI evaluation'
      },
      { status: 500 }
    );
  }
}

// Skill level utilities moved to lib/utils/skill-level.ts

function generateMockFeedback(rank: string): any {
  const skillLevel = getSkillLevelFromRank(rank);
  
  const mockFeedback: Record<string, any> = {
    beginner: {
      mainIdea: "I think the main idea is about a lighthouse. It's pretty clear.",
      strength: "I like the description. It's interesting.",
      suggestion: "Maybe add more details about what happens next.",
    },
    
    intermediate: {
      mainIdea: "The main idea is about discovering a mysterious chest in an abandoned lighthouse. It's mostly clear, though I wondered why the character went inside.",
      strength: "Good use of descriptive words like 'weathered' and 'sentinel'. The mystery element is engaging.",
      suggestion: "Could add more about what the character is feeling. Also, maybe use some transitions between ideas.",
    },
    
    proficient: {
      mainIdea: "The main idea centers on a curious discovery in an old lighthouse. The clarity is strong, with the character's motivation (curiosity) clearly established.",
      strength: "Excellent use of descriptive language ('weathered stones telling stories'). Strong narrative hook with the mysterious golden light. Good pacing.",
      suggestion: "Consider expanding sentences with subordinating conjunctions to show cause-effect relationships. Could add more sensory details (sounds, smells) to enhance immersion.",
    },
  };
  
  return {
    responses: mockFeedback[skillLevel] || mockFeedback.intermediate,
  };
}

