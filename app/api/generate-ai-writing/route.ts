import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, promptType, rank, playerName } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockAIWriting(rank));
    }

    // Call Claude API to generate writing at appropriate skill level
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: generateAIWritingPrompt(prompt, promptType, rank, playerName),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const writingContent = data.content[0].text.trim();

    // Count words
    const wordCount = writingContent.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

    return NextResponse.json({
      content: writingContent,
      wordCount,
      playerName,
    });
  } catch (error) {
    console.error('Error generating AI writing:', error);
    const { rank } = await request.json();
    return NextResponse.json(generateMockAIWriting(rank));
  }
}

function generateAIWritingPrompt(prompt: string, promptType: string, rank: string, playerName: string): string {
  // Determine skill level from rank
  const skillLevel = getSkillLevelFromRank(rank);
  
  return `You are simulating a student writer named "${playerName}" at ${skillLevel} skill level.

WRITING PROMPT:
${prompt}

PROMPT TYPE: ${promptType}

INSTRUCTIONS:
Write a response to this prompt AS IF you are a ${skillLevel} student writer. Match these characteristics:

${getSkillCharacteristics(skillLevel)}

Important:
- Write naturally as a student would
- Match the skill level authentically (don't write better or worse)
- Aim for 80-120 words (appropriate for 4-minute timed writing)
- Use age-appropriate vocabulary and sentence structures
- Include the types of strengths and weaknesses typical for this level
- Write ONLY the essay content, no meta-commentary

Begin writing now:`;
}

function getSkillLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  if (rank.includes('Diamond')) return 'expert';
  if (rank.includes('Master') || rank.includes('Grand')) return 'master';
  return 'intermediate';
}

function getSkillCharacteristics(skillLevel: string): string {
  const characteristics: Record<string, string> = {
    beginner: `- Simple sentence structures, mostly subject-verb-object
- Basic vocabulary with some repetition
- May have minor grammar issues (tense consistency, subject-verb agreement)
- Ideas present but not deeply developed
- Minimal use of transitions
- 2-3 paragraphs`,
    
    intermediate: `- Mix of simple and compound sentences
- Varied vocabulary but occasionally repetitive
- Generally correct grammar with minor errors
- Clear main ideas with some supporting details
- Some transitions (First, Then, Also)
- Good organization but could be stronger
- 3-4 paragraphs`,
    
    proficient: `- Mix of simple, compound, and some complex sentences
- Strong vocabulary with good variety
- Mostly error-free grammar
- Well-developed ideas with specific details
- Effective transitions between ideas
- Clear organization and structure
- 3-5 paragraphs`,
    
    advanced: `- Complex and varied sentence structures
- Sophisticated vocabulary used appropriately
- Error-free grammar and mechanics
- Detailed, well-supported ideas
- Smooth transitions and flow
- Strong organization with clear thesis
- Uses literary devices appropriately
- 4-6 paragraphs`,
    
    expert: `- Sophisticated and varied syntax
- Advanced vocabulary with precise word choice
- Flawless mechanics
- Deeply developed ideas with nuance
- Seamless transitions
- Compelling organization
- Effective use of rhetorical devices
- Strong voice and style
- 5-7 paragraphs`,
    
    master: `- Masterful sentence variety and rhythm
- Rich, precise vocabulary
- Perfect command of language
- Profound and insightful ideas
- Elegant transitions
- Exceptional organization
- Sophisticated literary techniques
- Distinctive, engaging voice
- 6-8 paragraphs`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

function generateMockAIWriting(rank: string): any {
  const skillLevel = getSkillLevelFromRank(rank);
  
  // Simple fallback if API key not available
  const mockWritings: Record<string, string> = {
    beginner: `The lighthouse was old and scary. I went inside because I was curious. There was a chest inside that was glowing. I wonder what was in it. It was really interesting. I wanted to open it but I was scared. The door was rusty and hard to open.`,
    
    intermediate: `The old lighthouse stood on the cliff overlooking the ocean. I had walked past it many times before, but today something was different. The door was open, and I could see a golden light coming from inside. I decided to go in and see what it was. When I got inside, I saw an old wooden chest in the middle of the room. It was glowing with a strange light.`,
    
    proficient: `The weathered lighthouse had always intrigued me, standing sentinel on the rocky cliff like a forgotten guardian. For years, its rusty door remained locked, keeping its secrets safe. But today, as I walked my usual path, I noticed something different—the door stood ajar, and a mysterious golden light spilled onto the stones. My curiosity overcame my caution, and I stepped inside. The circular room was thick with dust and filled with abandoned equipment, but in the center sat an ornate wooden chest, emanating an otherworldly glow.`,
  };
  
  const content = mockWritings[skillLevel] || mockWritings.intermediate;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  return {
    content,
    wordCount,
  };
}

