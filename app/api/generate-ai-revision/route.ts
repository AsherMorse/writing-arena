import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { countWords } from '@/lib/utils/text-utils';
import { generateMockAIWriting } from '@/lib/utils/mock-data';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { originalContent, feedback, rank, playerName } = requestBody;
  
  try {
    logApiKeyStatus('GENERATE AI REVISION');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ GENERATE AI REVISION - API key missing, using mock');
      return NextResponse.json(generateMockRevision(originalContent, rank));
    }

    const skillLevel = getSkillLevelFromRank(rank);
    const prompt = `You are simulating a ${skillLevel} student writer named "${playerName}" revising their work.

ORIGINAL WRITING:
${originalContent}

FEEDBACK RECEIVED:
${JSON.stringify(feedback, null, 2)}

TASK:
Revise the writing AS IF you are a ${skillLevel} student who has read this feedback. 

Guidelines for ${skillLevel} revision:
${getRevisionCharacteristics(skillLevel)}

Important:
- Make improvements that a ${skillLevel} student would realistically make
- Address some (not all) of the feedback points
- Keep the core story/content the same
- Show improvement but stay authentic to skill level
- Write ONLY the revised essay, no meta-commentary

Begin revised version now:`;

    const aiResponse = await callAnthropicAPI(apiKey, prompt, 1200);
    const revisedContent = aiResponse.content[0].text.trim();
    const wordCount = countWords(revisedContent);

    return NextResponse.json({
      content: revisedContent,
      wordCount,
      playerName,
    });
  } catch (error) {
    console.error('❌ GENERATE AI REVISION - Error:', error);
    return NextResponse.json(generateMockRevision(originalContent, rank));
  }
}

function getSkillLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  return 'intermediate';
}

function getRevisionCharacteristics(skillLevel: string): string {
  const characteristics: Record<string, string> = {
    beginner: `- Add a few more details where suggested
- Fix obvious grammar errors
- Maybe add 1-2 more sentences
- Improvements are modest but present
- Some feedback points may be missed`,
    
    intermediate: `- Address several feedback points
- Add more descriptive details
- Improve some sentence structures
- Add transitions where suggested
- Noticeable improvement while staying at level`,
    
    proficient: `- Address most feedback points thoughtfully
- Add sophisticated details and descriptions
- Improve sentence variety meaningfully
- Enhance organization and flow
- Clear, substantial improvement`,
    
    advanced: `- Address all major feedback points
- Add nuanced details and imagery
- Demonstrate strong command of writing techniques
- Polish sentence structures elegantly
- Significant, sophisticated improvement`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

function generateMockRevision(originalContent: string, rank: string): any {
  const skillLevel = getSkillLevelFromRank(rank);
  
  // Simple mock: add a few words/sentences based on skill level
  const additions: Record<string, string> = {
    beginner: ' I was really excited and scared. The chest looked really old.',
    intermediate: ' A sense of excitement and nervousness washed over me. The ornate carvings on the chest suggested it had been there for decades.',
    proficient: ' A mixture of excitement and trepidation coursed through me as I approached. The chest\'s intricate carvings and aged wood told stories of a bygone era.',
    advanced: ' An electric mixture of excitement and apprehension surged through me as I cautiously approached the glowing artifact. The chest\'s elaborate carvings, weathered by time yet still remarkably detailed, whispered of mysteries long forgotten.',
  };
  
  const revisedContent = originalContent + (additions[skillLevel] || additions.intermediate);
  const wordCount = countWords(revisedContent);
  
  return {
    content: revisedContent,
    wordCount,
  };
}

