import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, streamAnthropicAPI } from '@/lib/utils/api-helpers';
import { WritingSession } from '@/lib/services/firestore';
import { getAIFeedback } from '@/lib/services/match-sync';
import { parseGradeLevel, getGradeLevelCategory } from '@/lib/utils/grade-parser';
import { validateOrError, ValidationHelpers } from '@/lib/utils/api-validation';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, matches, conversationHistory, userId, gradeLevel = '7th-8th' } = body;
    
    logger.debug(LOG_CONTEXTS.IMPROVE_CHAT, 'Request received', {
      messageLength: message?.length,
      matchesCount: matches?.length,
      historyLength: conversationHistory?.length,
      userId,
      gradeLevel,
    });
    
    const validation = validateOrError<{ message: string; userId: string; matches: any[]; conversationHistory?: any[]; gradeLevel?: string }>(body, [
      ValidationHelpers.requiredString('message'),
      ValidationHelpers.requiredString('userId'),
      ValidationHelpers.requiredArray('matches', 5, 'Need at least 5 ranked matches'),
    ]);

    if (!validation.valid) {
      logger.error(LOG_CONTEXTS.IMPROVE_CHAT, 'Invalid request', undefined, {
        hasMessage: !!message,
        matchesCount: matches?.length,
      });
      return validation.response;
    }

    logApiKeyStatus('IMPROVE CHAT');
    const apiKey = getAnthropicApiKey();
    
    if (!apiKey) {
      logger.error(LOG_CONTEXTS.IMPROVE_CHAT, 'API key missing');
      return createErrorResponse('API key missing', 500);
    }
    
    logger.info(LOG_CONTEXTS.IMPROVE_CHAT, 'API key found, starting chat response');

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
    const gradeNum = parseGradeLevel(gradeLevel);
    const category = getGradeLevelCategory(gradeNum);
    
    const isElementary = category === 'elementary';
    const isMiddleSchool = category === 'middle';
    const isHighSchool = category === 'high';

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

IMPORTANT: After providing your answer or explanation, always end with a call to action asking what the student would like to do next. Offer options like:
- "Would you like me to give you some exercises to practice this?"
- "Do you need more explanation about this concept?"
- "Would you like to see examples?"
- "Are you ready to try a writing exercise?"

Make it natural and encouraging, matching the ${gradeLevel} grade level.

Respond naturally (not JSON format).`;

    logger.debug(LOG_CONTEXTS.IMPROVE_CHAT, 'Starting streaming API call');
    const stream = await streamAnthropicAPI(apiKey, prompt, 1500);
    
    // Create a readable stream that parses SSE events and extracts text
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        let buffer = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              logger.info(LOG_CONTEXTS.IMPROVE_CHAT, 'Stream complete');
              controller.close();
              break;
            }
            
            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE events (lines end with \n\n)
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep incomplete event in buffer
            
            for (const event of events) {
              if (!event.trim()) continue;
              
              // Parse SSE format: "data: {...}"
              const lines = event.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  
                  if (data === '[DONE]') {
                    controller.close();
                    return;
                  }
                  
                  try {
                    const json = JSON.parse(data);
                    
                    // Extract text from content_block_delta events
                    if (json.type === 'content_block_delta' && json.delta?.text) {
                      const text = json.delta.text;
                      controller.enqueue(encoder.encode(text));
                    }
                  } catch (e) {
                    // Ignore parse errors for non-JSON lines
                    logger.warn(LOG_CONTEXTS.IMPROVE_CHAT, 'Failed to parse SSE data', data);
                  }
                }
              }
            }
          }
        } catch (error) {
          logger.error(LOG_CONTEXTS.IMPROVE_CHAT, 'Stream error', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logger.error(LOG_CONTEXTS.IMPROVE_CHAT, 'Error', error);
    return createErrorResponse('Failed to generate response', 500);
  }
}

