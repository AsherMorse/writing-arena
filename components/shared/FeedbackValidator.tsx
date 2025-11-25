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
  
  const fieldLabels: Record<string, string> = {
    mainIdea: 'Main Idea',
    strength: 'Strength',
    suggestion: 'Suggestion',
  };
  
  const allValidations = {
    mainIdea: validateResponse(responses.mainIdea || '', 'mainIdea'),
    strength: validateResponse(responses.strength || '', 'strength'),
    suggestion: validateResponse(responses.suggestion || '', 'suggestion'),
  };
  
  const totalIssues = Object.values(allValidations).reduce((sum, v) => sum + v.issues.length, 0);
  const avgScore = Object.values(allValidations).reduce((sum, v) => sum + v.score, 0) / 3;
  
  if (totalIssues === 0) {
    return null;
  }
  
  return (
    <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-yellow-200 font-semibold text-sm mb-2">
            Feedback Quality Tips
          </h3>
          <div className="space-y-2 text-xs text-white/70">
            {totalIssues > 2 && (
              <div className="bg-yellow-400/10 rounded px-3 py-2 border border-yellow-400/20">
                <strong className="text-yellow-300">Predicted Score: {Math.round(avgScore)}/100</strong>
                <div className="text-white/60 mt-1">Your feedback could be more specific</div>
              </div>
            )}
            
            {Object.entries(allValidations).map(([field, validation]) => {
              if (validation.issues.length === 0) return null;
              return (
                <div key={field} className="flex items-start gap-2">
                  <div className="text-yellow-300 mt-0.5">•</div>
                  <div>
                    <strong>{fieldLabels[field]}:</strong> {validation.suggestions.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 text-xs text-white/50 italic">
            High scores require: quoting text + specific suggestions
          </div>
        </div>
      </div>
    </div>
  );
}
