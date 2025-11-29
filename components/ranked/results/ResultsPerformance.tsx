import { MOCK_PHASE_FEEDBACK } from '@/lib/utils/mock-data';
import { getPhaseColorByName } from '@/lib/constants/colors';
import { isEmpty, isNotEmpty } from '@/lib/utils/array-utils';

interface ResultsPerformanceProps {
  phases: {
    writing: number;
    feedback: number;
    revision: number;
    composite: number;
  };
  expandedPhase: 'writing' | 'feedback' | 'revision' | null;
  isExpanded: (phase: 'writing' | 'feedback' | 'revision') => boolean;
  togglePhase: (phase: 'writing' | 'feedback' | 'revision') => void;
  realFeedback: {
    writing: any;
    feedback: any;
    revision: any;
  };
  improvementBonus: number;
}

export function ResultsPerformance({
  phases,
  expandedPhase,
  isExpanded,
  togglePhase,
  realFeedback,
  improvementBonus,
}: ResultsPerformanceProps) {
  return (
    <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <h2 className="mb-1 text-center text-lg font-semibold">Your Performance</h2>
      <p className="mb-5 text-center text-xs text-[rgba(255,255,255,0.4)]">Click phases to see feedback</p>
      
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <button onClick={() => togglePhase('writing')} className={`rounded-[10px] p-4 text-center transition-all ${isExpanded('writing') ? 'border-2 border-[#00e5e5] bg-[rgba(0,229,229,0.1)] scale-105' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
          <div className="mb-1 text-xs text-[#00e5e5]">📝 Phase 1</div>
          <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Writing</div>
          <div className="font-mono text-2xl font-medium">{phases.writing}</div>
          <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">40% weight</div>
        </button>
        
        <button onClick={() => togglePhase('feedback')} className={`rounded-[10px] p-4 text-center transition-all ${isExpanded('feedback') ? 'border-2 border-[#ff5f8f] bg-[rgba(255,95,143,0.1)] scale-105' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
          <div className="mb-1 text-xs text-[#ff5f8f]">🔍 Phase 2</div>
          <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Feedback</div>
          <div className="font-mono text-2xl font-medium">{phases.feedback}</div>
          <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">30% weight</div>
        </button>
        
        <button onClick={() => togglePhase('revision')} className={`rounded-[10px] p-4 text-center transition-all ${isExpanded('revision') ? 'border-2 border-[#00d492] bg-[rgba(0,212,146,0.1)] scale-105' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
          <div className="mb-1 text-xs text-[#00d492]">✏️ Phase 3</div>
          <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Revision</div>
          <div className="font-mono text-2xl font-medium">{phases.revision}</div>
          <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">30% weight</div>
        </button>
        
        <div className="rounded-[10px] border-2 border-[#ff9030] bg-[rgba(255,144,48,0.1)] p-4 text-center relative group">
          <div className="mb-1 text-xs text-[#ff9030]">⭐ Final</div>
          <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Composite</div>
          <div className="font-mono text-2xl font-medium text-[#ff9030]">{phases.composite}</div>
          <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.4)]">Overall</div>
          <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 group-hover:block z-10">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[#101012] p-3 text-left text-xs shadow-lg w-64">
              <div className="mb-2 font-semibold text-[#ff9030]">Score Calculation</div>
              <div className="space-y-1 text-[rgba(255,255,255,0.6)]">
                <div>Writing (40%): {phases.writing} × 0.4 = {Math.round(phases.writing * 0.4)}</div>
                <div>Feedback (30%): {phases.feedback} × 0.3 = {Math.round(phases.feedback * 0.3)}</div>
                <div>Revision (30%): {phases.revision} × 0.3 = {Math.round(phases.revision * 0.3)}</div>
                <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)] font-semibold text-[#ff9030]">
                  Total: {Math.round(phases.writing * 0.4) + Math.round(phases.feedback * 0.3) + Math.round(phases.revision * 0.3)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expandedPhase && (() => {
        const phaseFeedbackData = expandedPhase === 'writing' ? realFeedback.writing : expandedPhase === 'feedback' ? realFeedback.feedback : realFeedback.revision;
        const mockFeedback = MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK];
        const strengths = phaseFeedbackData?.strengths || mockFeedback.strengths;
        const improvements = phaseFeedbackData?.improvements || phaseFeedbackData?.suggestions || mockFeedback.improvements;
        
        let nextSteps = phaseFeedbackData?.nextSteps;
        if (!nextSteps && improvements && Array.isArray(improvements) && isNotEmpty(improvements)) {
          nextSteps = improvements.slice(0, 3).map((imp: string) => {
            if (typeof imp === 'string') {
              if (imp.includes('Try') || imp.includes('Practice') || imp.includes('Add')) return imp;
              if (imp.includes('because/but/so') || imp.includes('sentence expansion')) return 'Practice sentence expansion: Add "because", "but", or "so" to show deeper thinking';
              if (imp.includes('appositive')) return 'Try appositives: Add description using commas (e.g., "Sarah, a curious student, wrote...")';
              if (imp.includes('transition')) return 'Use transition words: Connect ideas with "First", "Then", "However", "Therefore"';
              return `Focus on: ${imp}`;
            }
            return imp;
          });
        }
        if (!nextSteps || isEmpty(nextSteps)) nextSteps = phaseFeedbackData?.specificFeedback ? Object.values(phaseFeedbackData.specificFeedback) : mockFeedback.writingRevConcepts;
        const traitFeedback = phaseFeedbackData?.traitFeedback || {};
        
        const phaseColor = getPhaseColorByName(expandedPhase);
        
        return (
          <div className="animate-in fade-in slide-in-from-top rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[#101012] p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <span>{expandedPhase === 'writing' ? '📝' : expandedPhase === 'feedback' ? '🔍' : '✏️'}</span>
              <span>{expandedPhase === 'writing' ? 'Writing' : expandedPhase === 'feedback' ? 'Feedback' : 'Revision'} Feedback</span>
              {phaseFeedbackData && <span className="text-[10px] text-[#00d492]">✓ AI</span>}
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-semibold text-[#00d492]">✨ Strengths</div>
                <ul className="space-y-1">
                  {Array.isArray(strengths) && isNotEmpty(strengths) ? strengths.map((s, i) => (
                    <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3">• {s}</li>
                  )) : <li className="text-sm italic text-[rgba(255,255,255,0.3)] pl-3">{phaseFeedbackData ? 'No strengths identified' : 'Submit work to receive feedback'}</li>}
                </ul>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-[#ff9030]">🎯 Areas for Growth</div>
                <ul className="space-y-1">
                  {Array.isArray(improvements) && isNotEmpty(improvements) ? improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3">• {imp}</li>
                  )) : <li className="text-sm italic text-[rgba(255,255,255,0.3)] pl-3">{phaseFeedbackData ? 'No improvements identified' : 'Submit work to receive feedback'}</li>}
                </ul>
              </div>
              
              {expandedPhase === 'writing' && traitFeedback && isNotEmpty(Object.keys(traitFeedback)) && (
                <div>
                  <div className="mb-2 text-xs font-semibold text-[#00e5e5]">📊 Trait Feedback</div>
                  <div className="space-y-2">
                    {Object.entries(traitFeedback).map(([trait, feedback]) => (
                      <div key={trait} className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-2">
                        <div className="text-[10px] font-semibold capitalize text-[#00e5e5]">{trait}</div>
                        <p className="text-xs text-[rgba(255,255,255,0.5)]">{feedback as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2 text-xs font-semibold" style={{ color: phaseColor }}>🚀 Next Steps</div>
                <ul className="space-y-1">
                  {Array.isArray(nextSteps) && isNotEmpty(nextSteps) ? nextSteps.map((step, i) => (
                    <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3">• {step}</li>
                  )) : typeof nextSteps === 'object' && nextSteps !== null ? Object.entries(nextSteps).map(([key, value], i) => (
                    <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3"><strong className="capitalize">{key}:</strong> {value as string}</li>
                  )) : <li className="text-sm italic text-[rgba(255,255,255,0.3)] pl-3">{phaseFeedbackData ? 'Review improvements above' : 'Submit work for next steps'}</li>}
                </ul>
              </div>
              
              {!phaseFeedbackData && (
                <div className="rounded-[6px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.1)] p-3">
                  <p className="text-xs text-[#ff9030]">⚠️ General feedback. Submit work for personalized AI feedback.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {improvementBonus > 0 && (
        <div className="mt-5 rounded-[10px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.1)] p-4 text-center">
          <div className="font-medium text-[#00d492]">🌟 Improvement Bonus: +{improvementBonus} points from revision!</div>
        </div>
      )}
    </div>
  );
}

