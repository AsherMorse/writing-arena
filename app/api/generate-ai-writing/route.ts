import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { countWords } from '@/lib/utils/text-utils';
import { generateMockAIWriting } from '@/lib/utils/mock-data';
import { getSkillLevelFromRank, getGradeLevelFromRank, getSkillCharacteristics } from '@/lib/utils/skill-level';
import { adminDb } from '@/lib/config/firebase-admin';
import { MOCK_WARNINGS } from '@/lib/constants/mock-warnings';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { prompt, promptType, rank, playerName, matchId, playerId } = requestBody;
  
  try {
    logApiKeyStatus('GENERATE AI WRITING');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.error('❌ GENERATE AI WRITING - API key missing - LLM API unavailable');
      return NextResponse.json(
        { 
          error: 'LLM API unavailable - Set ANTHROPIC_API_KEY environment variable',
          fallback: generateMockAIWriting(rank),
          warning: MOCK_WARNINGS.MOCK_DATA_GENERATION
        },
        { status: 500 }
      );
    }

    // Call Claude API to generate writing at appropriate skill level
    const promptText = generateAIWritingPrompt(prompt, promptType, rank, playerName);
    const aiResponse = await callAnthropicAPI(apiKey, promptText, 1000);
    const writingContent = aiResponse.content[0].text.trim();
    const wordCount = countWords(writingContent);

    // Store in Firestore immediately if matchId is provided
    if (matchId && playerId) {
      try {
        console.log(`💾 Saving AI writing for ${playerName} to match ${matchId}`);
        
        const matchRef = adminDb.collection('matchStates').doc(matchId);
        
        // Create writing object
        const aiWriting = {
          playerId,
          playerName,
          content: writingContent,
          wordCount,
          isAI: true,
          rank
        };

        // Use admin SDK for array updates
        // Since this runs on the server, we bypass client-side auth rules
        // We need to use a transaction or update to handle the nested array
        
        await adminDb.runTransaction(async (transaction) => {
          const docSnap = await transaction.get(matchRef);
          
          if (!docSnap.exists) {
            transaction.set(matchRef, {
              matchId,
              aiWritings: {
                phase1: [aiWriting]
              }
            }, { merge: true });
          } else {
            const data = docSnap.data();
            const currentPhase1 = data?.aiWritings?.phase1 || [];
            
            // Check if already exists to avoid dups
            if (!currentPhase1.find((w: any) => w.playerId === playerId)) {
              // Create updated aiWritings object (preserving other phases if they existed)
              const updatedAiWritings = {
                ...(data?.aiWritings || {}),
                phase1: [...currentPhase1, aiWriting]
              };
              
              transaction.update(matchRef, {
                aiWritings: updatedAiWritings
              });
            }
          }
        });
        
        console.log(`✅ Saved AI writing for ${playerName}`);
      } catch (dbError) {
        console.error('❌ Failed to save AI writing to Firestore:', dbError);
        // Continue to return response so client can handle it if needed
      }
    }

    return NextResponse.json({
      content: writingContent,
      wordCount,
      playerName,
    });
  } catch (error) {
    console.error('❌ GENERATE AI WRITING - Error:', error);
    return NextResponse.json(
      { 
        error: 'LLM API call failed',
        details: error instanceof Error ? error.message : String(error),
        fallback: generateMockAIWriting(rank),
        warning: '🚨 LLM API UNAVAILABLE: Using mock data - not from AI generation'
      },
      { status: 500 }
    );
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
