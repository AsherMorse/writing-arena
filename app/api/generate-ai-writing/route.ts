import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { prompt, promptType, rank, playerName } = payload;
  try {

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockAIWriting(rank));
    }

    // Call Claude API to generate writing at appropriate skill level
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Claude API request failed', anthropicResponse.status, errorText);
      throw new Error('Claude API request failed');
    }

    const aiResponse = await anthropicResponse.json();
    const writingContent = aiResponse.content[0].text.trim();

    // Count words
    const wordCount = writingContent.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

    return NextResponse.json({
      content: writingContent,
      wordCount,
      playerName,
    });
  } catch (error) {
    console.error('Error generating AI writing:', error);
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

function getSkillLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  if (rank.includes('Diamond')) return 'expert';
  if (rank.includes('Master') || rank.includes('Grand')) return 'master';
  return 'intermediate';
}

function getGradeLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return '6th';
  if (rank.includes('Silver')) return '7th-8th';
  if (rank.includes('Gold')) return '9th-10th';
  if (rank.includes('Platinum')) return '11th';
  if (rank.includes('Diamond')) return '12th';
  if (rank.includes('Master') || rank.includes('Grand')) return '12th';
  return '7th-8th';
}

function getSkillCharacteristics(skillLevel: string): string {
  const characteristics: Record<string, string> = {
    beginner: `- Simple, short sentences (mostly subject-verb-object)
- Basic 6th grade vocabulary with repetition
- Include 3-4 spelling errors (common words misspelled: "teh", "becuase", "thier", "alot")
- Include 2-3 grammar mistakes (run-ons, fragments, tense shifts, subject-verb agreement)
- Missing or incorrect punctuation (missing commas, periods, apostrophes)
- Ideas present but brief and underdeveloped
- Minimal or no transitions
- 40-60 words total (2-minute rush)
- 1-2 short paragraphs only`,
    
    intermediate: `- Mix of simple and compound sentences
- 7th-8th grade vocabulary with some variety
- Include 1-2 spelling/typo errors (realistic typos: "teh", "recieve", "definately", "alot")
- Include 1-2 grammar mistakes (comma splices, occasional tense inconsistency, missing apostrophes)
- Generally correct punctuation but may miss a comma or two
- Clear main ideas with some supporting details
- Some basic transitions (First, Then, Also)
- 50-70 words total (2-minute rush)
- 2-3 short paragraphs`,
    
    proficient: `- Mix of simple, compound, and some complex sentences
- 9th-10th grade vocabulary with good variety
- Maybe 1 minor typo (realistic fast-typing error like "teh")
- Mostly error-free grammar (at most 1 small mistake)
- Well-developed ideas with some specific details
- Effective transitions between ideas
- Clear organization
- 60-80 words total (2-minute rush)
- 2-3 paragraphs`,
    
    advanced: `- Complex and varied sentence structures
- 11th grade vocabulary used appropriately
- Error-free grammar and mechanics
- Detailed, well-supported ideas
- Smooth transitions and flow
- Strong organization
- 70-85 words total (2-minute rush)
- 3 paragraphs`,
    
    expert: `- Sophisticated and varied syntax
- 12th grade vocabulary with precise word choice
- Flawless mechanics
- Deeply developed ideas with nuance
- Seamless transitions
- Compelling organization
- Effective rhetorical devices
- 75-90 words total (2-minute rush)
- 3-4 paragraphs`,
    
    master: `- Masterful sentence variety and rhythm
- College-level vocabulary
- Perfect command of language
- Profound and insightful ideas
- Elegant transitions
- Exceptional organization
- Sophisticated literary techniques
- Distinctive voice
- 80-100 words total (2-minute rush)
- 3-4 paragraphs`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

function generateMockAIWriting(rank: string): any {
  const skillLevel = getSkillLevelFromRank(rank);
  
  // Simple fallback if API key not available - with realistic mistakes and shorter for 2-min constraint
  const mockWritings: Record<string, string> = {
    beginner: `The lighthouse was old and scary. I went inside becuase I was curios. There was a chest that was glowing I wonder what was in it. It was really intresting.`,
    
    intermediate: `The old lighthouse stood on teh cliff. I walked past it before but today was different. The door was open and I could see a golden light inside. I decided to go in, I couldnt beleive what I saw.`,
    
    proficient: `The weathered lighthouse had always intrigued me, standing on the rocky cliff. For years, its door remained locked. But today, as I walked my usual path, I noticed something different—the door stood ajar, and a mysterious golden light spilled out. My curiosity overcame my caution and I stepped inside.`,
  };
  
  const content = mockWritings[skillLevel] || mockWritings.intermediate;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  return {
    content,
    wordCount,
  };
}

