import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { WritingSession } from '@/lib/services/firestore';
import { getAIFeedback } from '@/lib/services/match-sync';

export async function POST(request: NextRequest) {
  try {
    const { message, matches, conversationHistory, userId, gradeLevel = '7th-8th' } = await request.json();
    
    if (!message || !matches || matches.length < 5) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    logApiKeyStatus('IMPROVE CHAT');
    const apiKey = getAnthropicApiKey();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 500 }
      );
    }

    // Prepare context from matches with feedback if available
    const matchContext = await Promise.all(
      matches.map(async (match: WritingSession, idx: number) => {
        let phase1Feedback = null;
        if (match.matchId && userId) {
          try {
            phase1Feedback = await getAIFeedback(match.matchId, userId, 1);
          } catch (error) {
            // Ignore errors, continue without feedback
          }
        }
        
        return {
          match: idx + 1,
          score: match.score,
          traitScores: match.traitScores,
          promptType: match.promptType,
          strengths: phase1Feedback?.strengths || [],
          improvements: phase1Feedback?.improvements || [],
        };
      })
    );

    // Build conversation history
    const historyText = conversationHistory
      .slice(-10) // Last 10 messages
      .map((msg: any) => `${msg.role === 'user' ? 'Student' : 'Coach'}: ${msg.content}`)
      .join('\n\n');

    // Determine grade level number for age-appropriate instruction
    let gradeNum = 7; // Default to 7th grade
    if (gradeLevel.includes('3rd')) gradeNum = 3;
    else if (gradeLevel.includes('4th')) gradeNum = 4;
    else if (gradeLevel.includes('5th')) gradeNum = 5;
    else if (gradeLevel.includes('6th')) gradeNum = 6;
    else if (gradeLevel.includes('7th')) gradeNum = 7;
    else if (gradeLevel.includes('8th')) gradeNum = 8;
    else if (gradeLevel.includes('9th')) gradeNum = 9;
    else if (gradeLevel.includes('10th')) gradeNum = 10;
    else if (gradeLevel.includes('11th')) gradeNum = 11;
    else if (gradeLevel.includes('12th')) gradeNum = 12;

    const isElementary = gradeNum >= 3 && gradeNum <= 5;
    const isMiddleSchool = gradeNum >= 6 && gradeNum <= 8;
    const isHighSchool = gradeNum >= 9 && gradeNum <= 12;

    const prompt = `You are a writing coach helping a ${gradeLevel} grade student improve their writing using The Writing Revolution (TWR) methodology. You work with students from 3rd grade through 12th grade, adapting your instruction to be age-appropriate and developmentally appropriate.

STUDENT INFORMATION:
- Grade Level: ${gradeLevel} (approximately ${gradeNum}th grade)
- Development Stage: ${isElementary ? 'Elementary (3rd-5th grade)' : isMiddleSchool ? 'Middle School (6th-8th grade)' : 'High School (9th-12th grade)'}

STUDENT'S PERFORMANCE CONTEXT (Last 5 Ranked Matches):
${JSON.stringify(matchContext, null, 2)}

RECENT CONVERSATION:
${historyText || 'No previous conversation'}

STUDENT'S CURRENT MESSAGE:
${message}

TASK:
Respond as a helpful writing coach appropriate for ${gradeLevel} grade students. You should:
1. Answer questions about TWR strategies using language and examples appropriate for ${gradeLevel} graders
2. Provide specific writing exercises based on their weak areas - make exercises developmentally appropriate
3. Give encouragement and actionable feedback that matches their grade level
4. Reference their match performance when relevant
5. Use TWR terminology appropriate for ${gradeLevel} grade (e.g., ${isElementary ? 'simple sentence expansion, basic transitions' : isMiddleSchool ? 'sentence expansion with because/but/so, appositives, transition words' : 'advanced sentence combining, sophisticated transitions, rhetorical strategies'})

AGE-APPROPRIATE GUIDANCE:
${isElementary ? `
For 3rd-5th grade students:
- Use simple, concrete language
- Focus on basic TWR strategies: simple sentence expansion, basic transitions, adding details
- Provide short, clear examples
- Use familiar vocabulary
- Break complex concepts into small steps
` : isMiddleSchool ? `
For 6th-8th grade students:
- Use clear explanations with some academic vocabulary
- Introduce intermediate TWR strategies: because/but/so expansion, appositives, transition words, subordinating conjunctions
- Balance concrete examples with abstract concepts
- Build on foundational skills while introducing complexity
` : `
For 9th-12th grade students:
- Use sophisticated language and academic vocabulary
- Introduce advanced TWR strategies: complex sentence combining, sophisticated transitions, rhetorical strategies
- Provide nuanced explanations and complex examples
- Challenge students to think critically and analytically
`}

CRITICAL: Adjust your language complexity, examples, and TWR strategies to match ${gradeLevel} grade level. Do not overwhelm younger students with advanced concepts, and do not oversimplify for older students.

Keep responses conversational, encouraging, and focused on TWR principles. Be specific with age-appropriate examples.

Respond naturally (not JSON format).`;

    const aiResponse = await callAnthropicAPI(apiKey, prompt, 1500);
    const response = aiResponse.content[0].text;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('❌ IMPROVE CHAT - Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

