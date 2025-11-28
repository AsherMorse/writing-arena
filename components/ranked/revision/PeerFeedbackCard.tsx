interface PeerFeedbackCardProps {
  peerFeedback: {
    reviewerName?: string;
    responses: {
      mainIdea?: string;
      clarity?: string;
      strength?: string;
      strengths?: string;
      suggestion?: string;
      improvements?: string;
    };
  } | null;
  loading: boolean;
}

export function PeerFeedbackCard({ peerFeedback, loading }: PeerFeedbackCardProps) {
  return (
    <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-4">
      <h3 className="mb-3 flex items-center justify-between font-semibold">
        <span className="flex items-center gap-2"><span>👥</span><span>Peer Feedback</span></span>
        {peerFeedback && <span className="text-[10px] text-[#00e5e5]">from {peerFeedback.reviewerName}</span>}
      </h3>
      {loading ? (
        <div className="py-6 text-center">
          <div className="mb-2 text-2xl animate-spin">📝</div>
          <div className="text-xs text-[rgba(255,255,255,0.4)]">Loading...</div>
        </div>
      ) : peerFeedback ? (
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[10px] font-semibold text-[#00e5e5]">Main Idea:</div>
            <p className="text-xs text-[rgba(255,255,255,0.6)] break-words">{peerFeedback.responses.mainIdea || peerFeedback.responses.clarity}</p>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold text-[#00d492]">Strength:</div>
            <p className="text-xs text-[rgba(255,255,255,0.6)] break-words">{peerFeedback.responses.strength || peerFeedback.responses.strengths}</p>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold text-[#ff9030]">Suggestion:</div>
            <p className="text-xs text-[rgba(255,255,255,0.6)] break-words">{peerFeedback.responses.suggestion || peerFeedback.responses.improvements}</p>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-[rgba(255,255,255,0.4)]">No peer feedback available</div>
      )}
    </div>
  );
}

