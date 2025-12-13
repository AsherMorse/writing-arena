// ANTHROPIC (commented out - keeping for reference)
// import { callAnthropicAPI, getAnthropicApiKey } from '@/lib/utils/api-helpers';
// OPENAI (active)
import { callOpenAIAPI, getOpenAIApiKey } from '@/lib/utils/api-helpers';
import {
  ESSAY_GRADER_CONFIG,
  ESSAY_CRITERIA,
  MINIMUM_PARAGRAPHS,
  HIGHLIGHTABLE_CRITERIA,
  type EssayGraderConfig,
  type EssayGraderResult,
  type EssayCriterionResult,
  type CriterionStatus,
} from './essay-grader-config';

function getTWRLevel(gradeLevel: number): 1 | 2 {
  return gradeLevel <= 6 ? 1 : 2;
}

function buildSystemPrompt(
  config: EssayGraderConfig,
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

  const criteriaList = ESSAY_CRITERIA
    .map(c => `- ${c.id}: ${c.name} - ${c.description}`)
    .join('\n');

  const revisionInstructions = isRevision ? `
15) **Revision Grading Instructions**:
This is a REVISION. The student has already received feedback and is submitting an improved version.
- Check if the student addressed the issues from the previous feedback
- Acknowledge improvements explicitly
- Only flag issues that still exist or new issues introduced
- Be encouraging about progress made` : '';

  return `You are an expert writing coach trained in The Writing Revolution (TWR) methodology. Your task is to evaluate student essays and provide helpful, actionable feedback.

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

7) **Common Mistakes to Watch For**:
${commonMistakes}

8) **Criteria to Evaluate**:
${criteriaList}

9) **Scoring Guidelines**:
Score each criterion as:
- "yes" (1 point): Criterion is fully met
- "developing" (0.5 points): Criterion is partially met, shows effort but needs improvement
- "no" (0 points): Criterion is not met or missing

10) **Output Format**:
Return a valid JSON object with this structure:
{
  "paragraphCount": number,
  "criteria": [
    {
      "criterionId": "thesis",
      "status": "yes" | "developing" | "no",
      "feedback": "Brief, encouraging feedback (50-100 chars)",
      "highlights": ["exact text from essay"] // for highlightable criteria only
    },
    ... (one for each criterion)
  ],
  "scores": {
    "thesis": 0-1 (based on status),
    "topicSentences": 0-1,
    "supportingDetails": 0-1,
    "unity": 0-1,
    "transitions": 0-1,
    "conclusion": 0-1,
    "sentenceStrategies": 0-1,
    "conventions": 0-1,
    "paragraphCount": 0-1 (1 if >= ${MINIMUM_PARAGRAPHS} paragraphs, 0.5 if 3, 0 if < 3),
    "total": sum of above,
    "maxTotal": 9,
    "percentage": percentage score
  }
}

11) **Important**:
- Count actual paragraphs (separated by line breaks or indentation)
- Minimum ${MINIMUM_PARAGRAPHS} paragraphs required for grades 6-8
- Be ENCOURAGING and FRIENDLY in all feedback
- Return ONLY valid JSON, no markdown or additional text
- LONGER DOES NOT MEAN BETTER: Length alone is not a quality indicator. A long essay that looks impressive but lacks a clear thesis, proper topic sentences, or supporting details should score lower than a shorter, well-structured essay. Grade against the rubric criteria, not vibes or word count.

12) **CRITICAL - No Copy-able Solutions**:
- NEVER provide example sentences or specific text the student could copy
- Guide them to think about WHAT makes good writing, not WHAT to write
- The student must do the thinking and writing themselves

13) **Criteria Evaluation Details**:
- thesis: Does the intro have a clear main idea that guides the essay?
- topicSentences: Does each body paragraph start with a clear topic sentence?
- supportingDetails: Do details in each paragraph support that paragraph's topic?
- unity: Do all paragraphs connect to the thesis?
- transitions: Are there transition words between and within paragraphs?
- conclusion: Does it wrap up without just copying the thesis?
- sentenceStrategies: Is there variety (compound sentences, subordinating conjunctions)?
- conventions: Are grammar, spelling, and punctuation correct?
- paragraphCount: Are there at least ${MINIMUM_PARAGRAPHS} distinct paragraphs?

14.5) **Text Highlighting**:
For these criteria ONLY, include a "highlights" array with EXACT text copied from the student's essay:
- thesis: highlight the thesis statement (1 highlight)
- topicSentences: highlight each topic sentence found (multiple highlights, one per body paragraph)
- supportingDetails: highlight 1-2 strong supporting details OR problematic ones if status is "no"
- transitions: highlight transition words/phrases found (multiple highlights)
- conclusion: highlight the concluding statement (1 highlight)

Do NOT include highlights for: unity, sentenceStrategies, conventions, paragraphCount.
Copy text EXACTLY as written - no paraphrasing. If a criterion is missing (status "no"), highlights can be empty.

14) **isCorrect Determination**:
- Set isCorrect to true if percentage >= 70% (majority of criteria met)
- Set isCorrect to false if percentage < 70%${revisionInstructions}`;
}

function buildUserPrompt(
  essay: string,
  prompt: string,
  gradeLevel: number,
  previousResult?: EssayGraderResult,
  previousEssay?: string
): string {
  const isRevision = !!previousResult;

  let revisionContext = '';
  if (isRevision && previousResult && previousEssay) {
    const previousCriteria = previousResult.criteria
      .map((c, i) => `${i + 1}. ${c.criterionId}: ${c.status} - ${c.feedback}`)
      .join('\n');

    revisionContext = `
--- REVISION CONTEXT ---
The student submitted a revision. Check if they fixed old issues or introduced new ones.

PREVIOUS SUBMISSION:
${previousEssay}

PREVIOUS SCORE: ${previousResult.scores.percentage}%

PREVIOUS FEEDBACK:
${previousCriteria}

Now grade the revised version below and acknowledge any improvements.
--- END REVISION CONTEXT ---

`;
  }

  return `${revisionContext}Grade this ${gradeLevel}th grade student's essay${isRevision ? ' (REVISION)' : ''}.

WRITING PROMPT:
${prompt}

STUDENT'S ESSAY:
${essay}

REMINDER: Return ONLY the JSON object as specified. Be encouraging and specific in feedback.${isRevision ? ' Acknowledge improvements from the previous submission.' : ''}`;
}

function parseGraderResponse(response: string): EssayGraderResult {
  let jsonStr = response.trim();
  
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    const criteria: EssayCriterionResult[] = (parsed.criteria || []).map((c: any) => {
      const result: EssayCriterionResult = {
        criterionId: c.criterionId || '',
        status: (['yes', 'developing', 'no'].includes(c.status) ? c.status : 'no') as CriterionStatus,
        feedback: c.feedback || '',
      };
      if (HIGHLIGHTABLE_CRITERIA.includes(result.criterionId) && Array.isArray(c.highlights)) {
        result.highlights = c.highlights.filter((h: any) => typeof h === 'string' && h.trim());
      }
      return result;
    });

    const paragraphCount = Math.max(0, Number(parsed.paragraphCount) || 0);

    const scores = {
      thesis: Math.min(1, Math.max(0, Number(parsed.scores?.thesis) || 0)),
      topicSentences: Math.min(1, Math.max(0, Number(parsed.scores?.topicSentences) || 0)),
      supportingDetails: Math.min(1, Math.max(0, Number(parsed.scores?.supportingDetails) || 0)),
      unity: Math.min(1, Math.max(0, Number(parsed.scores?.unity) || 0)),
      transitions: Math.min(1, Math.max(0, Number(parsed.scores?.transitions) || 0)),
      conclusion: Math.min(1, Math.max(0, Number(parsed.scores?.conclusion) || 0)),
      sentenceStrategies: Math.min(1, Math.max(0, Number(parsed.scores?.sentenceStrategies) || 0)),
      conventions: Math.min(1, Math.max(0, Number(parsed.scores?.conventions) || 0)),
      paragraphCount: Math.min(1, Math.max(0, Number(parsed.scores?.paragraphCount) || 0)),
      total: 0,
      maxTotal: 9,
      percentage: 0,
    };
    
    scores.total = scores.thesis + scores.topicSentences + scores.supportingDetails + 
                   scores.unity + scores.transitions + scores.conclusion + 
                   scores.sentenceStrategies + scores.conventions + scores.paragraphCount;
    scores.percentage = Math.round((scores.total / scores.maxTotal) * 100);

    return {
      isCorrect: scores.percentage >= 70,
      criteria,
      scores,
      paragraphCount,
    };
  } catch (error) {
    console.error('Failed to parse essay grader response:', error);
    throw new Error(`Failed to parse grader response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface AdaptiveEssayGraderInput {
  essay: string;
  prompt: string;
  gradeLevel?: number;
  config?: EssayGraderConfig;
  previousResult?: EssayGraderResult;
  previousEssay?: string;
}

export async function gradeWithAdaptiveEssayGrader(
  input: AdaptiveEssayGraderInput
): Promise<EssayGraderResult> {
  const { 
    essay, 
    prompt, 
    gradeLevel = 7,
    config = ESSAY_GRADER_CONFIG,
    previousResult,
    previousEssay,
  } = input;

  if (!essay || essay.trim().length === 0) {
    throw new Error('Essay content is required');
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Writing prompt is required');
  }

  // ANTHROPIC (commented out)
  // const apiKey = getAnthropicApiKey();
  // if (!apiKey) {
  //   throw new Error('ANTHROPIC_API_KEY is not configured');
  // }
  
  // OPENAI (active)
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const isRevision = !!previousResult;
  const systemPrompt = buildSystemPrompt(config, gradeLevel, isRevision);
  const userPrompt = buildUserPrompt(essay, prompt, gradeLevel, previousResult, previousEssay);

  console.log(`🎯 ESSAY GRADER - Grading grade ${gradeLevel} essay${isRevision ? ' (REVISION)' : ''}`);

  // ANTHROPIC (commented out)
  // const response = await callAnthropicAPI(
  //   apiKey,
  //   `${systemPrompt}\n\n---\n\n${userPrompt}`,
  //   4000
  // );
  
  // OPENAI (active)
  const response = await callOpenAIAPI(
    apiKey,
    `${systemPrompt}\n\n---\n\n${userPrompt}`,
    4000
  );
  const responseText = response.content[0].text;

  const result = parseGraderResponse(responseText);

  const yesCount = result.criteria.filter(c => c.status === 'yes').length;
  const developingCount = result.criteria.filter(c => c.status === 'developing').length;
  const noCount = result.criteria.filter(c => c.status === 'no').length;
  console.log(`✅ ESSAY GRADER - Score: ${result.scores.total}/${result.scores.maxTotal} (${result.scores.percentage}%) | Yes: ${yesCount}, Developing: ${developingCount}, No: ${noCount} | Paragraphs: ${result.paragraphCount}`);

  return result;
}
