interface AIFeedbackCardProps {
  strengths: string[];
  improvements: string[];
  loading: boolean;
}

export function AIFeedbackCard({ strengths, improvements, loading }: AIFeedbackCardProps) {
  return (
    <div className="rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <span>🤖</span><span>AI Feedback</span>
      </h3>
      <div className="space-y-3">
        <div>
          <div className="mb-1 text-xs font-semibold text-[#00d492]">✨ Strengths</div>
          {loading ? (
            <div className="text-xs text-[rgba(255,255,255,0.4)]">Loading...</div>
          ) : (
            <ul className="space-y-1">
              {strengths.map((strength, i) => (
                <li key={`s-${i}`} className="text-xs text-[rgba(255,255,255,0.6)]">• {strength}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-[#ff9030]">💡 Suggestions</div>
          {loading ? (
            <div className="text-xs text-[rgba(255,255,255,0.4)]">Loading...</div>
          ) : (
            <ul className="space-y-1">
              {improvements.map((imp, i) => (
                <li key={`i-${i}`} className="text-xs text-[rgba(255,255,255,0.6)]">• {imp}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

