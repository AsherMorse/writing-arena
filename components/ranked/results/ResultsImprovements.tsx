import { getPhaseColorByName } from '@/lib/constants/colors';

interface ResultsImprovementsProps {
  realFeedback: {
    writing: any;
    feedback: any;
    revision: any;
  };
  phases: {
    writing: number;
    feedback: number;
    revision: number;
  };
}

export function ResultsImprovements({ realFeedback, phases }: ResultsImprovementsProps) {
  // Determine top 3 improvement areas based on lowest scores and feedback
  const improvements: Array<{ phase: string; score: number; suggestions: string[] }> = [];
  
  // Writing phase improvements
  if (phases.writing < 80) {
    const writingFeedback = realFeedback.writing;
    const writingSuggestions = writingFeedback?.improvements || writingFeedback?.suggestions || [];
    improvements.push({
      phase: 'Writing',
      score: phases.writing,
      suggestions: Array.isArray(writingSuggestions) ? writingSuggestions.slice(0, 2) : [],
    });
  }
  
  // Feedback phase improvements
  if (phases.feedback < 80) {
    const feedbackFeedback = realFeedback.feedback;
    const feedbackSuggestions = feedbackFeedback?.improvements || feedbackFeedback?.suggestions || [];
    improvements.push({
      phase: 'Feedback',
      score: phases.feedback,
      suggestions: Array.isArray(feedbackSuggestions) ? feedbackSuggestions.slice(0, 2) : [],
    });
  }
  
  // Revision phase improvements
  if (phases.revision < 80) {
    const revisionFeedback = realFeedback.revision;
    const revisionSuggestions = revisionFeedback?.improvements || revisionFeedback?.suggestions || [];
    improvements.push({
      phase: 'Revision',
      score: phases.revision,
      suggestions: Array.isArray(revisionSuggestions) ? revisionSuggestions.slice(0, 2) : [],
    });
  }
  
  // Sort by score (lowest first) and take top 3
  const topImprovements = improvements
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  
  // If no specific improvements, provide general guidance
  if (topImprovements.length === 0) {
    return (
      <div className="mb-8 rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#00d492]">
          <span>🎯</span>
          <span>Keep Improving!</span>
        </h2>
        <p className="text-sm text-[rgba(255,255,255,0.6)]">
          All your phase scores are above 80! Focus on consistency and refining your writing skills.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-8 rounded-[14px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#ff9030]">
        <span>🎯</span>
        <span>Top 3 Areas to Work On</span>
      </h2>
      
      <div className="space-y-4">
        {topImprovements.map((improvement, index) => {
          const phaseColor = getPhaseColorByName(improvement.phase.toLowerCase() as 'writing' | 'feedback' | 'revision');
          const suggestions = improvement.suggestions.length > 0 
            ? improvement.suggestions 
            : [
                improvement.phase === 'Writing' ? 'Focus on clarity and detail in your initial draft' : '',
                improvement.phase === 'Feedback' ? 'Provide more specific and actionable feedback' : '',
                improvement.phase === 'Revision' ? 'Make more substantial improvements in your revision' : '',
              ].filter(Boolean);
          
          return (
            <div key={index} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {improvement.phase === 'Writing' ? '📝' : improvement.phase === 'Feedback' ? '🔍' : '✏️'}
                  </span>
                  <span className="font-semibold" style={{ color: phaseColor }}>
                    {improvement.phase} Phase
                  </span>
                </div>
                <div className="font-mono text-sm" style={{ color: phaseColor }}>
                  Score: {improvement.score}
                </div>
              </div>
              
              <div className="mt-2 space-y-1">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-[rgba(255,255,255,0.6)]">
                    <span className="mt-0.5 text-[#ff9030]">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 rounded-[10px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-3">
        <p className="text-xs text-[rgba(255,255,255,0.5)]">
          💡 <strong>Tip:</strong> Practice these areas in Practice Mode to improve your ranked performance!
        </p>
      </div>
    </div>
  );
}

