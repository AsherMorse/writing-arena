'use client';

interface FeedbackValidatorProps {
  responses: {
    clarity?: string;
    strengths?: string;
    improvements?: string;
    organization?: string;
    engagement?: string;
  };
}

export default function FeedbackValidator({ responses }: FeedbackValidatorProps) {
  const validateResponse = (text: string) => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check length
    if (text.length < 30) {
      issues.push('Too brief');
      suggestions.push('Add more detail');
    }
    
    // Check for specificity
    const hasQuotes = text.includes('"') || text.includes("'");
    if (!hasQuotes) {
      issues.push('No quotes');
      suggestions.push('Quote specific text');
    }
    
    // Check for TWR keywords
    const twrKeywords = ['because', 'but', 'so', 'appositive', 'transition', 'sentence', 'expand', 'combine'];
    const mentionsTWR = twrKeywords.some(keyword => text.toLowerCase().includes(keyword));
    if (!mentionsTWR) {
      issues.push('No TWR strategies');
      suggestions.push('Name a TWR strategy');
    }
    
    // Check for vague words
    const vagueWords = ['good', 'nice', 'great', 'interesting'];
    const hasVagueWords = vagueWords.some(word => text.toLowerCase().includes(word)) && text.length < 50;
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
  
  const allValidations = {
    clarity: validateResponse(responses.clarity || ''),
    strengths: validateResponse(responses.strengths || ''),
    improvements: validateResponse(responses.improvements || ''),
    organization: validateResponse(responses.organization || ''),
    engagement: validateResponse(responses.engagement || ''),
  };
  
  const totalIssues = Object.values(allValidations).reduce((sum, v) => sum + v.issues.length, 0);
  const avgScore = Object.values(allValidations).reduce((sum, v) => sum + v.score, 0) / 5;
  
  if (totalIssues === 0) {
    return null; // No warnings needed
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
            {totalIssues > 3 && (
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
                    <strong className="capitalize">{field}:</strong> {validation.suggestions.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 text-xs text-white/50 italic">
            High scores require: quoting text + naming TWR strategies + specific suggestions
          </div>
        </div>
      </div>
    </div>
  );
}

