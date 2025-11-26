'use client';

interface FeedbackValidatorProps {
  responses: {
    mainIdea?: string;
    strength?: string;
    suggestion?: string;
  };
}

export default function FeedbackValidator({ responses }: FeedbackValidatorProps) {
  const validateResponse = (text: string, fieldType: 'mainIdea' | 'strength' | 'suggestion') => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (text.length < 20) {
      issues.push('Too brief');
      suggestions.push('Add more detail');
    }
    
    const hasQuotes = text.includes('"') || text.includes("'");
    if (!hasQuotes && fieldType !== 'mainIdea') {
      issues.push('No quotes');
      suggestions.push('Quote specific text from the writing');
    }
    
    if (fieldType === 'suggestion') {
      const twrKeywords = ['because', 'but', 'so', 'appositive', 'transition', 'sentence', 'expand', 'combine', 'add', 'try'];
      const mentionsTWR = twrKeywords.some(keyword => text.toLowerCase().includes(keyword));
      if (!mentionsTWR) {
        issues.push('Not actionable');
        suggestions.push('Include a specific action (e.g., "Try adding..." or "Use because/but/so")');
      }
    }
    
    const vagueWords = ['good', 'nice', 'great', 'interesting'];
    const hasVagueWords = vagueWords.some(word => text.toLowerCase().includes(word)) && text.length < 40;
    if (hasVagueWords) {
      issues.push('Too vague');
      suggestions.push('Be more specific');
    }
    
    return {
      isGood: issues.length === 0,
      issues,
      suggestions,
      score: Math.max(0, 100 - (issues.length * 25)),
    };
  };
  
  const fieldLabels: Record<string, string> = { mainIdea: 'Main Idea', strength: 'Strength', suggestion: 'Suggestion' };
  
  const allValidations = {
    mainIdea: validateResponse(responses.mainIdea || '', 'mainIdea'),
    strength: validateResponse(responses.strength || '', 'strength'),
    suggestion: validateResponse(responses.suggestion || '', 'suggestion'),
  };
  
  const totalIssues = Object.values(allValidations).reduce((sum, v) => sum + v.issues.length, 0);
  const avgScore = Object.values(allValidations).reduce((sum, v) => sum + v.score, 0) / 3;
  
  if (totalIssues === 0) return null;
  
  return (
    <div className="mt-4 rounded-[10px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.1)] p-4">
      <div className="flex items-start gap-3">
        <div className="text-xl">⚠️</div>
        <div className="flex-1">
          <h3 className="mb-2 text-sm font-semibold text-[#ff9030]">Feedback Quality Tips</h3>
          <div className="space-y-2 text-xs text-[rgba(255,255,255,0.5)]">
            {totalIssues > 2 && (
              <div className="rounded-[6px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.1)] px-3 py-2">
                <strong className="text-[#ff9030]">Predicted Score: {Math.round(avgScore)}/100</strong>
                <div className="mt-1 text-[rgba(255,255,255,0.4)]">Your feedback could be more specific</div>
              </div>
            )}
            
            {Object.entries(allValidations).map(([field, validation]) => {
              if (validation.issues.length === 0) return null;
              return (
                <div key={field} className="flex items-start gap-2">
                  <div className="mt-0.5 text-[#ff9030]">•</div>
                  <div><strong>{fieldLabels[field]}:</strong> {validation.suggestions.join(', ')}</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 text-xs italic text-[rgba(255,255,255,0.3)]">
            High scores require: quoting text + specific suggestions
          </div>
        </div>
      </div>
    </div>
  );
}
