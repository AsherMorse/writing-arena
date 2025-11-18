import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { generateMockAIFeedback } from '@/lib/utils/mock-data';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { peerWriting, rank, playerName } = requestBody;
  
  try {
    logApiKeyStatus('GENERATE AI FEEDBACK');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ GENERATE AI FEEDBACK - API key missing, using mock');
      return NextResponse.json(generateMockFeedback(rank));
    }

    const skillLevel = getSkillLevelFromRank(rank);
    const prompt = `You are simulating peer feedback from a ${skillLevel} student writer named "${playerName}".

PEER'S WRITING TO EVALUATE:
${peerWriting}

Give feedback AS IF you are a ${skillLevel} student. Provide responses to these questions:

1. Main idea clarity: What is the main idea? Is it clear?
2. Strengths: What did the writer do well?
3. Improvements: What could be better?
4. Organization: How is the writing organized?
5. Engagement: Does it hold your interest?

Guidelines for ${skillLevel} level feedback:
${getFeedbackCharacteristics(skillLevel)}

Respond in JSON:
{
  "clarity": "response about main idea",
  "strengths": "what they did well",
  "improvements": "suggestions",
  "organization": "how it's organized",
  "engagement": "interest level"
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
    return NextResponse.json(generateMockFeedback(rank));
  }
}

function getSkillLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  return 'intermediate';
}

function getFeedbackCharacteristics(skillLevel: string): string {
  const characteristics: Record<string, string> = {
    beginner: `- Simple, general observations
- Basic language ("good", "nice", "cool")
- May miss some details
- Feedback is encouraging but not very specific`,
    
    intermediate: `- More specific observations
- References some specific parts of the writing
- Constructive suggestions
- Uses some writing vocabulary`,
    
    proficient: `- Detailed, specific feedback
- References exact sentences or phrases
- Actionable suggestions for improvement
- Uses writing terminology appropriately`,
    
    advanced: `- Sophisticated analysis
- Identifies literary techniques
- Highly specific, actionable feedback
- References Writing Revolution strategies`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

function generateMockFeedback(rank: string): any {
  const skillLevel = getSkillLevelFromRank(rank);
  
  const mockFeedback: Record<string, any> = {
    beginner: {
      clarity: "I think the main idea is about a lighthouse. It's pretty clear.",
      strengths: "I like the description. It's interesting.",
      improvements: "Maybe add more details about what happens next.",
      organization: "It goes in order and makes sense.",
      engagement: "Yeah it's interesting. I want to know what's in the chest.",
    },
    
    intermediate: {
      clarity: "The main idea is about discovering a mysterious chest in an abandoned lighthouse. It's mostly clear, though I wondered why the character went inside.",
      strengths: "Good use of descriptive words like 'weathered' and 'sentinel'. The mystery element is engaging.",
      improvements: "Could add more about what the character is feeling. Also, maybe use some transitions between ideas.",
      organization: "The writing flows well from seeing the lighthouse to going inside to finding the chest.",
      engagement: "Yes, it definitely holds my interest. The golden light and glowing chest create suspense.",
    },
    
    proficient: {
      clarity: "The main idea centers on a curious discovery in an old lighthouse. The clarity is strong, with the character's motivation (curiosity) clearly established.",
      strengths: "Excellent use of descriptive language ('weathered stones telling stories'). Strong narrative hook with the mysterious golden light. Good pacing.",
      improvements: "Consider expanding sentences with subordinating conjunctions to show cause-effect relationships. Could add more sensory details (sounds, smells) to enhance immersion.",
      organization: "Well-organized with clear progression: familiar setting → unusual change → investigation → discovery. Transitions are smooth.",
      engagement: "Highly engaging. The mystery element and vivid descriptions create strong reader interest. The cliffhanger ending is effective.",
    },
  };
  
  return {
    responses: mockFeedback[skillLevel] || mockFeedback.intermediate,
  };
}

