import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { WritingSession } from '@/lib/services/firestore';
import { getAIFeedback } from '@/lib/services/match-sync';

export async function POST(request: NextRequest) {
  try {
    const { matches, userId, gradeLevel = '7th-8th' } = await request.json();
    
    if (!matches || !Array.isArray(matches) || matches.length < 5) {
      return NextResponse.json(
        { error: 'Need at least 5 ranked matches' },
        { status: 400 }
      );
    }

    logApiKeyStatus('IMPROVE ANALYZE');
    const apiKey = getAnthropicApiKey();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 500 }
      );
    }

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
    const avgScore = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;
    const avgTraitScores = {
      content: matches.reduce((sum, m) => sum + m.traitScores.content, 0) / matches.length,
      organization: matches.reduce((sum, m) => sum + m.traitScores.organization, 0) / matches.length,
      grammar: matches.reduce((sum, m) => sum + m.traitScores.grammar, 0) / matches.length,
      vocabulary: matches.reduce((sum, m) => sum + m.traitScores.vocabulary, 0) / matches.length,
      mechanics: matches.reduce((sum, m) => sum + m.traitScores.mechanics, 0) / matches.length,
    };

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

Format your response as a friendly, conversational analysis (not JSON). Use clear sections with emojis for visual breaks. Adjust your language complexity to match ${gradeLevel} grade level.`;

    const aiResponse = await callAnthropicAPI(apiKey, prompt, 2000);
    const analysis = aiResponse.content[0].text;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('❌ IMPROVE ANALYZE - Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze matches' },
      { status: 500 }
    );
  }
}

