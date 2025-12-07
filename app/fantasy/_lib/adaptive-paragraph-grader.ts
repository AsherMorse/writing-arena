import { callAnthropicAPI, getAnthropicApiKey } from '@/lib/utils/api-helpers';
import {
  PARAGRAPH_GRADER_CONFIG,
  type GraderConfig,
  type GraderResult,
  type GraderRemark,
} from './grader-config';

const REMARK_CATEGORIES = [
  'TopicSentence',
  'SupportingDetails',
  'ConcludingSentence',
  'SentenceVariety',
  'Transitions',
  'Conventions',
  'PromptRelevance',
] as const;

function getTWRLevel(gradeLevel: number): 1 | 2 {
  return gradeLevel <= 6 ? 1 : 2;
}

function buildSystemPrompt(
  config: GraderConfig,
  gradeLevel: number,
  isRevision: boolean
): string {
  const twrLevel = getTWRLevel(gradeLevel);
  const levelConsiderations = twrLevel === 1 
    ? config.gradeAppropriateConsiderations.level1 
    : config.gradeAppropriateConsiderations.level2;

  const positiveExamples = config.positiveExamples
    .map((ex, i) => `Example ${i + 1}:\n${ex.example}\nWhy it works: ${ex.explainer}`)
    .join('\n\n');

  const negativeExamples = config.negativeExamples
    .map((ex, i) => `Example ${i + 1}:\n${ex.example}\nIssues: ${ex.explainer}`)
    .join('\n\n');

  const commonMistakes = config.commonMistakesToAnticipate
    .map((m, i) => `${i + 1}. ${m.mistake}\n   Why: ${m.explanation}${m.example ? `\n   Example: "${m.example}"` : ''}`)
    .join('\n');

  const formatReqs = config.formatRequirements
    .map((r, i) => `${i + 1}. ${r.requirement}${r.correctExample ? `\n   Correct: "${r.correctExample}"` : ''}${r.incorrectExample ? `\n   Incorrect: "${r.incorrectExample}"` : ''}`)
    .join('\n');

  const revisionInstructions = isRevision ? `
14) **Revision Grading Instructions**:
This is a REVISION. The student has already received feedback and is submitting an improved version.
- Check if the student addressed the issues from the previous feedback
- Acknowledge improvements explicitly ("You fixed the topic sentence issue!")
- Only flag issues that still exist or new issues introduced
- Do NOT flip-flop on severity unless the writing materially changed
- Be encouraging about progress made
- If they fixed an issue, don't re-flag it as a different issue
- Compare against the previous submission to evaluate improvement` : '';

  return `You are an expert writing coach trained in The Writing Revolution (TWR) methodology. Your task is to evaluate student writing and provide helpful, actionable feedback.

1) **Activity Description**:
Activity: "${config.nameOfActivity}"
Primary Goal: ${config.goalForThisExercise.primaryGoal}
Secondary Goals:
${config.goalForThisExercise.secondaryGoals.map(g => `- ${g}`).join('\n')}

2) **How the Activity Works**:
${config.howTheActivityWorks}

3) **Important Principles for Grading**:
${config.importantPrinciplesForGrading.join('\n')}

4) **Positive Examples** (What good writing looks like):
${positiveExamples}

5) **Negative Examples** (Common issues to avoid):
${negativeExamples}

6) **Grade-Level Calibration**:
The student is in grade ${gradeLevel} (TWR Level ${twrLevel}).
${levelConsiderations}

7) **Format Requirements**:
${formatReqs}

8) **Common Mistakes to Watch For**:
${commonMistakes}

9) **Available Remark Categories**:
${REMARK_CATEGORIES.map(c => `- ${c}`).join('\n')}

If an issue spans multiple categories, pick the most relevant one. Do not duplicate feedback.

10) **Scoring Guidelines**:
Score each area on a scale of 0-5:
- 5: Excellent - meets or exceeds expectations
- 4: Good - solid performance with minor room for improvement
- 3: Developing - shows understanding but needs work
- 2: Needs Improvement - significant gaps
- 1: Limited - major issues present
- 0: Missing or completely off-target

11) **Output Format**:
Return a valid JSON object with this structure:
{
  "isCorrect": boolean,
  "remarks": [
    {
      "type": "issue",
      "severity": "error" | "nit",
      "category": "CategoryName",
      "concreteProblem": "Brief, friendly description of the issue (50-85 chars)",
      "callToAction": "1-2 encouraging sentences guiding HOW to improve, NOT what to write (70-150 chars)",
      "substringOfInterest": "exact text from student's writing that shows the issue (optional)"
    }
  ],
  "scores": {
    "topicSentence": 0-5,
    "detailSentences": 0-5,
    "concludingSentence": 0-5,
    "conventions": 0-5,
    "total": sum of above,
    "maxTotal": 20,
    "percentage": percentage score
  }
}

12) **Severity Guidelines**:
- "error": Major issues that significantly impact meaning, structure, or prompt relevance. The paragraph cannot be considered successful without addressing these.
- "nit": Minor issues that should be noted but do not prevent the paragraph from being successful. Includes small grammar errors, word choice suggestions, minor improvements.

13) **Important**:
- If there are no remarks (paragraph is perfect), set isCorrect to true and remarks to empty array
- If there are only nits, set isCorrect to true (student gets credit but should note the nits)
- If there are any errors, set isCorrect to false
- Limit remarks to the 3 most important issues
- Be ENCOURAGING and FRIENDLY in all feedback
- Copy text EXACTLY in substringOfInterest - no paraphrasing
- Return ONLY valid JSON, no markdown or additional text
- LONGER DOES NOT MEAN BETTER: Length alone is not a quality indicator. A long response that looks impressive but lacks a clear topic sentence, specific details, or proper structure should score lower than a shorter, well-organized paragraph. Grade against the rubric criteria, not vibes or word count.

14) **CRITICAL - No Copy-able Solutions**:
- NEVER provide example sentences, conclusions, or specific text the student could copy
- NEVER write "try something like..." or "for example, you could write..."
- Instead, explain the TECHNIQUE or APPROACH they should use
- Guide them to think about WHAT makes a good conclusion, not WHAT to write
- Bad: "Try ending with: Summer truly is the best season."
- Good: "Your conclusion should remind the reader of your main reasons without repeating the exact same words."
- The student must do the thinking and writing themselves${revisionInstructions}`;
}

function buildUserPrompt(
  paragraph: string,
  prompt: string,
  gradeLevel: number,
  previousResult?: GraderResult,
  previousParagraph?: string
): string {
  const isRevision = !!previousResult;

  let revisionContext = '';
  if (isRevision && previousResult && previousParagraph) {
    const previousIssues = previousResult.remarks
      .map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.category}: ${r.concreteProblem}`)
      .join('\n');

    revisionContext = `
--- REVISION CONTEXT ---
The student submitted a revision. Check if they fixed old mistakes or introduced new ones.

PREVIOUS SUBMISSION:
${previousParagraph}

PREVIOUS SCORE: ${previousResult.scores.percentage}%

PREVIOUS FEEDBACK GIVEN:
${previousIssues || 'No issues were flagged.'}

Now grade the revised version below and acknowledge any improvements.
--- END REVISION CONTEXT ---

`;
  }

  return `${revisionContext}Grade this ${gradeLevel}th grade student's paragraph${isRevision ? ' (REVISION)' : ''}.

WRITING PROMPT:
${prompt}

STUDENT'S PARAGRAPH:
${paragraph}

REMINDER: Return ONLY the JSON object as specified. Be encouraging and specific in feedback.${isRevision ? ' Acknowledge improvements from the previous submission.' : ''}`;
}

function parseGraderResponse(response: string): GraderResult {
  let jsonStr = response.trim();
  
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    const remarks: GraderRemark[] = (parsed.remarks || []).map((r: any) => ({
      type: 'issue' as const,
      severity: r.severity === 'error' ? 'error' : 'nit',
      category: r.category || 'General',
      concreteProblem: r.concreteProblem || '',
      callToAction: r.callToAction || '',
      substringOfInterest: r.substringOfInterest,
    }));

    const scores = {
      topicSentence: Math.min(5, Math.max(0, Number(parsed.scores?.topicSentence) || 0)),
      detailSentences: Math.min(5, Math.max(0, Number(parsed.scores?.detailSentences) || 0)),
      concludingSentence: Math.min(5, Math.max(0, Number(parsed.scores?.concludingSentence) || 0)),
      conventions: Math.min(5, Math.max(0, Number(parsed.scores?.conventions) || 0)),
      total: 0,
      maxTotal: 20,
      percentage: 0,
    };
    scores.total = scores.topicSentence + scores.detailSentences + scores.concludingSentence + scores.conventions;
    scores.percentage = Math.round((scores.total / scores.maxTotal) * 100);

    const hasErrors = remarks.some(r => r.severity === 'error');
    
    return {
      isCorrect: !hasErrors,
      remarks,
      scores,
    };
  } catch (error) {
    console.error('Failed to parse grader response:', error);
    throw new Error(`Failed to parse grader response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface AdaptiveGraderInput {
  paragraph: string;
  prompt: string;
  gradeLevel?: number;
  config?: GraderConfig;
  previousResult?: GraderResult;
  previousParagraph?: string;
}

export async function gradeWithAdaptiveGrader(
  input: AdaptiveGraderInput
): Promise<GraderResult> {
  const { 
    paragraph, 
    prompt, 
    gradeLevel = 6,
    config = PARAGRAPH_GRADER_CONFIG,
    previousResult,
    previousParagraph,
  } = input;

  if (!paragraph || paragraph.trim().length === 0) {
    throw new Error('Paragraph content is required');
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Writing prompt is required');
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const isRevision = !!previousResult;
  const systemPrompt = buildSystemPrompt(config, gradeLevel, isRevision);
  const userPrompt = buildUserPrompt(paragraph, prompt, gradeLevel, previousResult, previousParagraph);

  console.log(`🎯 ADAPTIVE GRADER - Grading grade ${gradeLevel} paragraph${isRevision ? ' (REVISION)' : ''}`);

  const response = await callAnthropicAPI(
    apiKey,
    `${systemPrompt}\n\n---\n\n${userPrompt}`,
    3000
  );
  const responseText = response.content[0].text;

  const result = parseGraderResponse(responseText);

  const errorCount = result.remarks.filter(r => r.severity === 'error').length;
  const nitCount = result.remarks.filter(r => r.severity === 'nit').length;
  console.log(`✅ ADAPTIVE GRADER - Score: ${result.scores.total}/${result.scores.maxTotal} (${result.scores.percentage}%) | Errors: ${errorCount}, Nits: ${nitCount}`);

  return result;
}
