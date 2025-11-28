import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, streamAnthropicAPI } from '@/lib/utils/api-helpers';
import { WritingSession } from '@/lib/services/firestore';
import { getAIFeedback } from '@/lib/services/match-sync';
import { parseGradeLevel, getGradeLevelCategory } from '@/lib/utils/grade-parser';
import { validateOrError, ValidationHelpers } from '@/lib/utils/api-validation';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matches, userId, gradeLevel = '7th-8th' } = body;
    
    console.log('📊 IMPROVE ANALYZE - Request received:', {
      matchesCount: matches?.length,
      userId,
      gradeLevel,
    });
    
    const validation = validateOrError<{ userId: string; matches: any[]; gradeLevel?: string }>(body, [
      ValidationHelpers.requiredString('userId'),
      ValidationHelpers.requiredArray('matches', 5, 'Need at least 5 ranked matches'),
    ]);

    if (!validation.valid) {
      console.error('❌ IMPROVE ANALYZE - Invalid request:', { matchesCount: matches?.length });
      return validation.response;
    }

    logApiKeyStatus('IMPROVE ANALYZE');
    const apiKey = getAnthropicApiKey();
    
    if (!apiKey) {
      console.error('❌ IMPROVE ANALYZE - API key missing');
      return createErrorResponse('API key missing', 500);
    }
    
    console.log('✅ IMPROVE ANALYZE - API key found, starting analysis...');

    // Fetch detailed feedback for each match if matchId is available
    const matchesWithFeedback = await Promise.all(
      matches.map(async (match: WritingSession, idx: number) => {
        let phase1Feedback = null;
        let phase2Feedback = null;
        let phase3Feedback = null;
        
        if (match.matchId && userId) {
          try {
            [phase1Feedback, phase2Feedback, phase3Feedback] = await Promise.all([
              getAIFeedback(match.matchId, userId, 1),
              getAIFeedback(match.matchId, userId, 2),
              getAIFeedback(match.matchId, userId, 3),
            ]);
          } catch (error) {
            console.warn(`Could not fetch feedback for match ${match.matchId}:`, error);
          }
        }
        
        const date = match.timestamp?.toDate?.() || new Date();
        return {
          matchNumber: idx + 1,
          date: date.toLocaleDateString(),
          score: match.score,
          traitScores: match.traitScores,
          wordCount: match.wordCount,
          promptType: match.promptType,
          placement: match.placement,
          content: match.content?.substring(0, 300) + (match.content && match.content.length > 300 ? '...' : ''),
          feedback: {
            phase1: phase1Feedback,
            phase2: phase2Feedback,
            phase3: phase3Feedback,
          },
        };
      })
    );

    // Prepare match summary for prompt
    const matchSummary = matchesWithFeedback.map(m => ({
      matchNumber: m.matchNumber,
      date: m.date,
      score: m.score,
      traitScores: m.traitScores,
      wordCount: m.wordCount,
      promptType: m.promptType,
      placement: m.placement,
      content: m.content,
      strengths: m.feedback.phase1?.strengths || [],
      improvements: m.feedback.phase1?.improvements || [],
      traitFeedback: m.feedback.phase1?.traitFeedback || {},
    }));

    // Calculate averages from original matches array
    const avgScore = matches.reduce((sum: number, m: any) => sum + m.score, 0) / matches.length;
    const avgTraitScores = {
      content: matches.reduce((sum: number, m: any) => sum + m.traitScores.content, 0) / matches.length,
      organization: matches.reduce((sum: number, m: any) => sum + m.traitScores.organization, 0) / matches.length,
      grammar: matches.reduce((sum: number, m: any) => sum + m.traitScores.grammar, 0) / matches.length,
      vocabulary: matches.reduce((sum: number, m: any) => sum + m.traitScores.vocabulary, 0) / matches.length,
      mechanics: matches.reduce((sum: number, m: any) => sum + m.traitScores.mechanics, 0) / matches.length,
    };

    // Determine grade level number for age-appropriate instruction
    const gradeNum = parseGradeLevel(gradeLevel);
    const category = getGradeLevelCategory(gradeNum);
    
    const isElementary = category === 'elementary';
    const isMiddleSchool = category === 'middle';
    const isHighSchool = category === 'high';

    const prompt = `You are a writing coach trained in The Writing Revolution (TWR) methodology. You work with students from 3rd grade through 12th grade, adapting TWR strategies to be age-appropriate and developmentally appropriate.

STUDENT INFORMATION:
- Grade Level: ${gradeLevel} (approximately ${gradeNum}th grade)
- Development Stage: ${isElementary ? 'Elementary (3rd-5th grade)' : isMiddleSchool ? 'Middle School (6th-8th grade)' : 'High School (9th-12th grade)'}

STUDENT'S LAST 5 MATCHES:
${JSON.stringify(matchSummary, null, 2)}

AVERAGE PERFORMANCE:
- Overall Score: ${avgScore.toFixed(1)}/100
- Content: ${avgTraitScores.content.toFixed(1)}/100
- Organization: ${avgTraitScores.organization.toFixed(1)}/100
- Grammar: ${avgTraitScores.grammar.toFixed(1)}/100
- Vocabulary: ${avgTraitScores.vocabulary.toFixed(1)}/100
- Mechanics: ${avgTraitScores.mechanics.toFixed(1)}/100

TASK:
Provide a comprehensive, age-appropriate analysis that:
1. Identifies the student's STRONGEST areas (top 2 traits)
2. Identifies their WEAKEST areas (bottom 2 traits)
3. Provides 3-5 specific TWR-based exercises appropriate for ${gradeLevel} grade students to improve weak areas
4. Suggests 2-3 TWR strategies to enhance strong areas (appropriate for their grade level)
5. References specific patterns from their writing samples and feedback

AGE-APPROPRIATE TWR STRATEGIES BY GRADE LEVEL:

**Elementary (3rd-5th grade):**
- Simple sentence expansion with "because" and "so"
- Basic transition words (First, Next, Then, Finally)
- Adding details with "and" (compound sentences)
- Using descriptive words (adjectives)
- Simple appositives with commas
- Five senses descriptions (what you see, hear, feel)

**Middle School (6th-8th grade):**
- Sentence expansion with "because/but/so"
- Appositives for description
- Transition words (However, Therefore, For example, In addition)
- Subordinating conjunctions (although, since, while, when)
- Sentence combining
- Show don't tell with specific details
- Basic paragraph structure (Topic + Details + Conclusion)

**High School (9th-12th grade):**
- Advanced sentence expansion and combining
- Complex appositives and embedded clauses
- Sophisticated transitions and subordinating conjunctions
- Rhetorical strategies (parallelism, repetition, rhetorical questions)
- Advanced vocabulary and precise word choice
- Complex paragraph structures (SPO, compare/contrast, cause/effect)
- Nuanced analysis and argumentation

CRITICAL INSTRUCTIONS:
- Use language and examples appropriate for ${gradeLevel} grade students
- ${isElementary ? 'Keep explanations simple and concrete. Use short sentences and familiar vocabulary. Focus on building basic writing skills.' : isMiddleSchool ? 'Use clear explanations with some academic vocabulary. Balance concrete examples with abstract concepts. Build on foundational skills while introducing more complexity.' : 'Use sophisticated language and academic vocabulary. Provide nuanced explanations and complex examples. Challenge students to think critically and analytically.'}
- Make exercises developmentally appropriate - don't overwhelm ${gradeLevel} graders with strategies meant for older students
- Reference their actual writing samples when giving examples
- Be encouraging and supportive - focus on growth and progress
- Use the strengths and improvements from their match feedback to identify patterns

Format your response as a friendly, conversational analysis (not JSON). Use clear sections with emojis for visual breaks. Adjust your language complexity to match ${gradeLevel} grade level.

CRITICAL: Always end your response with a call to action asking the student what they'd like to do next. Offer options like:
- "Would you like me to give you some specific exercises to practice?"
- "Do you want more explanation about any of these areas?"
- "Would you like to see examples of how to improve?"
- "Are you ready to try a writing exercise?"

Make it conversational and encouraging, matching the ${gradeLevel} grade level.`;

    console.log('🚀 IMPROVE ANALYZE - Starting streaming API call...');
    const stream = await streamAnthropicAPI(apiKey, prompt, 2000);
    
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
              console.log('✅ IMPROVE ANALYZE - Stream complete');
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
                    console.warn('⚠️ IMPROVE ANALYZE - Failed to parse SSE data:', data);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ IMPROVE ANALYZE - Stream error:', error);
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
    console.error('❌ IMPROVE ANALYZE - Error:', error);
    return createErrorResponse('Failed to analyze matches', 500);
  }
}

