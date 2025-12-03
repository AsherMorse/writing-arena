interface Peer {
  avatar: string;
  author: string;
  rank: string;
  wordCount: number;
  content: string;
  phase1Score?: number;
}

interface Prompt {
  description: string;
  type: string;
}

interface PeerWritingCardProps {
  peer: Peer | null;
  loading: boolean;
  prompt?: Prompt | null;
}

export function PeerWritingCard({ peer, loading, prompt }: PeerWritingCardProps) {
  if (loading || !peer) {
    return (
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
        <div className="py-16 text-center">
          <div className="mb-3 text-4xl animate-spin">📖</div>
          <div className="text-[rgba(255,255,255,0.4)]">Loading peer&apos;s writing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
      {prompt && (
        <div className="mb-4 rounded-[10px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
            Prompt · {prompt.type}
          </div>
          <p className="text-sm text-[rgba(255,255,255,0.7)]">{prompt.description}</p>
        </div>
      )}
      
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{peer.avatar}</span>
        <div className="flex-1">
          <div className="font-semibold">{peer.author}</div>
          <div className="text-xs text-[rgba(255,255,255,0.4)]">
            {peer.rank} · {peer.wordCount} words
            {peer.phase1Score !== undefined && (
              <span className="ml-2 text-[#00e5e5]">· Phase 1 Score: {peer.phase1Score}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="rounded-[10px] bg-white p-5 max-h-[500px] overflow-y-auto">
        <p className="text-[#101012] leading-relaxed whitespace-pre-wrap">{peer.content}</p>
      </div>
    </div>
  );
}

