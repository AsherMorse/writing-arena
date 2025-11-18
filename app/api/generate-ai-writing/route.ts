import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { countWords } from '@/lib/utils/text-utils';
import { generateMockAIWriting } from '@/lib/utils/mock-data';
import { getSkillLevelFromRank, getGradeLevelFromRank, getSkillCharacteristics } from '@/lib/utils/skill-level';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { prompt, promptType, rank, playerName } = requestBody;
  
  try {
    logApiKeyStatus('GENERATE AI WRITING');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ GENERATE AI WRITING - API key missing, using mock');
      return NextResponse.json(generateMockAIWriting(rank));
    }

    // Call Claude API to generate writing at appropriate skill level
    const promptText = generateAIWritingPrompt(prompt, promptType, rank, playerName);
    const aiResponse = await callAnthropicAPI(apiKey, promptText, 1000);
    const writingContent = aiResponse.content[0].text.trim();
    const wordCount = countWords(writingContent);

    return NextResponse.json({
      content: writingContent,
      wordCount,
      playerName,
    });
  } catch (error) {
    console.error('❌ GENERATE AI WRITING - Error:', error);
    return NextResponse.json(generateMockAIWriting(rank));
  }
}

function generateAIWritingPrompt(prompt: string, promptType: string, rank: string, playerName: string): string {
  // Determine skill level from rank
  const skillLevel = getSkillLevelFromRank(rank);
  const gradeLevel = getGradeLevelFromRank(rank);
  
  return `You are simulating a ${gradeLevel} grade student writer named "${playerName}" at ${skillLevel} skill level writing quickly under a 2-MINUTE time constraint.

WRITING PROMPT:
${prompt}

PROMPT TYPE: ${promptType}

INSTRUCTIONS:
Write a response to this prompt AS IF you are a ${gradeLevel} grade ${skillLevel} student writer typing quickly in a 2-MINUTE timed competition. Match these characteristics EXACTLY:

${getSkillCharacteristics(skillLevel)}

CRITICAL - INCLUDE REALISTIC MISTAKES:
${skillLevel === 'beginner' ? `- You MUST include 3-4 spelling errors (e.g., "teh", "becuase", "thier", "intresting")
- You MUST include 2-3 grammar mistakes (run-ons, fragments, tense shifts)
- Make it look like rushed, authentic 6th grade writing` : ''}${skillLevel === 'intermediate' ? `- You MUST include 1-2 spelling/typo errors (e.g., "teh", "recieve", "definately", "alot")
- You MUST include 1-2 grammar mistakes (comma splices, missing apostrophes, tense inconsistency)
- This is RUSHED 7th-8th grade writing - mistakes are normal and expected` : ''}${skillLevel === 'proficient' ? `- You MAY include 1 minor typo if realistic
- Writing should be mostly clean but not perfect (9th-10th grade level)` : ''}
Important:
- This is a 2-MINUTE TIMED WRITING - it should feel rushed and brief
- Write naturally with the mistakes a real student would make when typing fast
- Do NOT be overly polished - that's not realistic for this rank/timeframe
- Match the skill level authentically (don't write better than the level allows)
- Aim for 40-80 words (appropriate for 2-minute timed writing with ${gradeLevel} grade student)
- Use age-appropriate vocabulary and sentence structures for ${gradeLevel} grade
- Write ONLY the essay content, no meta-commentary or explanations

Begin writing now:`;
}

// Skill level utilities moved to lib/utils/skill-level.ts

// Mock data generation moved to lib/utils/mock-data.ts

