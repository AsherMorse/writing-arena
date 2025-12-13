/**
 * @fileoverview Synopsis generation for writing submissions.
 * Generates a concise overall assessment for paragraphs and essays.
 */

import OpenAI from 'openai';
import type { GraderResult } from './grader-config';
import type { EssayGraderResult } from './essay-grader-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type WritingType = 'paragraph' | 'essay';

interface SynopsisInput {
  content: string;
  prompt: string;
  type: WritingType;
  gradeLevel?: number;
  result: GraderResult | EssayGraderResult;
}

/**
 * @description Formats paragraph grading result for synopsis context.
 */
function formatParagraphResult(result: GraderResult): string {
  const { scores, remarks } = result;
  
  let summary = `Scores (out of 5):
- Topic Sentence: ${scores.topicSentence}/5
- Details: ${scores.detailSentences}/5
- Conclusion: ${scores.concludingSentence}/5
- Conventions: ${scores.conventions}/5
- Overall: ${scores.percentage}%`;

  if (remarks.length > 0) {
    summary += '\n\nFeedback areas:';
    for (const remark of remarks) {
      summary += `\n- ${remark.category}: ${remark.concreteProblem}`;
    }
  }

  return summary;
}

/**
 * @description Formats essay grading result for synopsis context.
 */
function formatEssayResult(result: EssayGraderResult): string {
  const { scores, criteria } = result;
  
  let summary = `Scores:
- Thesis: ${scores.thesis}/1
- Topic Sentences: ${scores.topicSentences}/1
- Supporting Details: ${scores.supportingDetails}/1
- Unity: ${scores.unity}/1
- Transitions: ${scores.transitions}/1
- Conclusion: ${scores.conclusion}/1
- Sentence Strategies: ${scores.sentenceStrategies}/1
- Conventions: ${scores.conventions}/1
- Overall: ${scores.percentage}%`;

  const issues = criteria.filter(c => c.status !== 'yes');
  if (issues.length > 0) {
    summary += '\n\nAreas needing improvement:';
    for (const issue of issues) {
      summary += `\n- ${issue.criterionId} (${issue.status}): ${issue.feedback}`;
    }
  }

  return summary;
}

/**
 * @description Generates a concise overall assessment for a writing submission.
 * Works for both paragraphs and essays.
 */
export async function generateSynopsis(input: SynopsisInput): Promise<string> {
  const { content, prompt, type, gradeLevel = 6, result } = input;
  
  const gradeLevelText = gradeLevel <= 5 ? '4th-5th' : gradeLevel <= 8 ? '6th-8th' : '9th+';
  const writingTypeName = type === 'essay' ? 'essay' : 'paragraph';
  
  const resultSummary = type === 'essay' 
    ? formatEssayResult(result as EssayGraderResult)
    : formatParagraphResult(result as GraderResult);

  const systemPrompt = `You are generating a brief overall assessment for a ${gradeLevelText} grade student's ${writingTypeName}.

Your task is to write a 1-2 sentence summary that:
1. Acknowledges what the student did well (if anything scored well)
2. Identifies the most important area for improvement (if any)
3. Is encouraging and constructive
4. Speaks directly to the student using "you/your"

Keep it concise and actionable. Do NOT list all the scores - just give an overall impression and one key takeaway.`;

  const userPrompt = `Writing Prompt: ${prompt}

Student's ${writingTypeName}:
${content}

Grading Results:
${resultSummary}

Write a 1-2 sentence overall assessment:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 150,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Synopsis generation error:', error);
    // Return empty string on error - the UI will handle missing synopsis gracefully
    return '';
  }
}
