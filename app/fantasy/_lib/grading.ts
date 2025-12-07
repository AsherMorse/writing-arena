import { gradeWithAdaptiveGrader, type AdaptiveGraderInput } from './adaptive-paragraph-grader';
import type { GraderResult, GraderRemark } from './grader-config';

export type WritingType = 'paragraph' | 'essay';

export interface GradeRequest {
  content: string;
  prompt: string;
  type: WritingType;
  gradeLevel?: number;
  previousResult?: GraderResult;
  previousContent?: string;
}

export interface SkillGap {
  category: string;
  score: number;
  maxScore: number;
  severity: 'low' | 'medium' | 'high';
  feedback: string;
}

export interface GradeResponse {
  result: GraderResult;
  gaps: SkillGap[];
  hasSevereGap: boolean;
}

function detectGapsFromResult(result: GraderResult): SkillGap[] {
  const gaps: SkillGap[] = [];
  const { scores } = result;

  const categoryMapping: Array<{ key: keyof typeof scores; name: string }> = [
    { key: 'topicSentence', name: 'Topic Sentence' },
    { key: 'detailSentences', name: 'Detail Sentences' },
    { key: 'concludingSentence', name: 'Concluding Sentence' },
    { key: 'conventions', name: 'Conventions' },
  ];

  for (const { key, name } of categoryMapping) {
    const score = scores[key] as number;
    if (score <= 2) {
      const severity: SkillGap['severity'] = score === 0 ? 'high' : score === 1 ? 'high' : 'medium';
      const relatedRemark = result.remarks.find(r => 
        r.category.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      );
      
      gaps.push({
        category: name,
        score,
        maxScore: 5,
        severity,
        feedback: relatedRemark?.concreteProblem || `Needs improvement in ${name.toLowerCase()}`,
      });
    } else if (score === 3) {
      const relatedRemark = result.remarks.find(r => 
        r.category.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      );
      
      gaps.push({
        category: name,
        score,
        maxScore: 5,
        severity: 'low',
        feedback: relatedRemark?.concreteProblem || `Developing skills in ${name.toLowerCase()}`,
      });
    }
  }

  return gaps;
}

export async function gradeWriting(request: GradeRequest): Promise<GradeResponse> {
  if (request.type === 'essay') {
    throw new Error('Essay grading not yet implemented');
  }

  const graderInput: AdaptiveGraderInput = {
    paragraph: request.content,
    prompt: request.prompt,
    gradeLevel: request.gradeLevel,
    previousResult: request.previousResult,
    previousParagraph: request.previousContent,
  };

  const result = await gradeWithAdaptiveGrader(graderInput);
  const gaps = detectGapsFromResult(result);

  return {
    result,
    gaps,
    hasSevereGap: gaps.some((g) => g.severity === 'high'),
  };
}

export type { GraderResult, GraderRemark };
