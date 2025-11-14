import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { originalContent, feedback, rank, playerName } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockRevision(originalContent, rank));
    }

    const skillLevel = getSkillLevelFromRank(rank);

    // Call Claude API to generate a revision at appropriate skill level
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: `You are simulating a ${skillLevel} student writer named "${playerName}" revising their work.

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

Begin revised version now:`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const revisedContent = data.content[0].text.trim();
    const wordCount = revisedContent.split(/\s+/).filter((w: string) => w.length > 0).length;

    return NextResponse.json({
      content: revisedContent,
      wordCount,
      playerName,
    });
  } catch (error) {
    console.error('Error generating AI revision:', error);
    const { originalContent, rank } = await request.json();
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
  const wordCount = revisedContent.split(/\s+/).filter(w => w.length > 0).length;
  
  return {
    content: revisedContent,
    wordCount,
  };
}

