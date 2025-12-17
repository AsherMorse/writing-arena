import Anthropic from "@anthropic-ai/sdk";

export type GradeResult = {
  score: number;
  feedback: string[];
};

const client = new Anthropic();

const GRADING_PROMPT = `You are a writing quality grader for a game. Grade the player's sentence on grammar, spelling, punctuation, and sentence structure.

Return JSON only, no other text:
{"score": <0-100>, "feedback": ["issue 1", "issue 2"]}

Scoring guide:
- 90-100: Perfect or near-perfect writing
- 70-89: Good writing with minor issues
- 50-69: Acceptable but has noticeable errors
- 30-49: Poor writing with multiple errors
- 0-29: Very poor, barely comprehensible or extremely short

Keep feedback brief (2-4 words per item). If perfect, feedback can be ["Well written!"].
If the input is just a few words or not a real sentence, score low and note it.`;

export async function gradeResponse(text: string): Promise<GradeResult> {
  try {
    const response = await client.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 150,
      system: GRADING_PROMPT,
      messages: [{ role: "user", content: `Grade this: "${text}"` }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return fallbackGrade(text);
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackGrade(text);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: Math.max(0, Math.min(100, parsed.score)),
      feedback: parsed.feedback || [],
    };
  } catch (error) {
    console.error("Grader error:", error);
    return fallbackGrade(text);
  }
}

function fallbackGrade(text: string): GradeResult {
  const wordCount = text.trim().split(/\s+/).length;
  const hasCapital = /^[A-Z]/.test(text.trim());
  const hasPunctuation = /[.!?]$/.test(text.trim());

  let score = 50;
  const feedback: string[] = [];

  if (wordCount < 3) {
    score = 30;
    feedback.push("Too short");
  }
  if (!hasCapital) feedback.push("Capitalize first word");
  if (!hasPunctuation) feedback.push("Add ending punctuation");

  return { score, feedback };
}
