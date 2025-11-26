'use client';

interface MatchmakingStartModalProps {
  onChoice: (choice: 'wait' | 'ai') => void;
}

export default function MatchmakingStartModal({ onChoice }: MatchmakingStartModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-2xl rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-8">
        <div className="mb-6 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Start Ranked Match
          </div>
          <h2 className="mt-2 text-2xl font-semibold">Choose how you want to play</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => onChoice('wait')}
            className="group rounded-[14px] border border-[rgba(255,95,143,0.2)] bg-[rgba(255,95,143,0.05)] p-6 text-left transition-all hover:border-[rgba(255,95,143,0.4)] hover:bg-[rgba(255,95,143,0.1)]"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(255,95,143,0.12)] text-2xl">
              ⏳
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ff5f8f]">
              Wait for Players
            </div>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
              Match with real players for competitive ranked
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ff5f8f]">
              Start matchmaking
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
          
          <button
            onClick={() => onChoice('ai')}
            className="group rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6 text-left transition-all hover:border-[rgba(0,229,229,0.4)] hover:bg-[rgba(0,229,229,0.1)]"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(0,229,229,0.12)] text-2xl">
              🤖
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
              Compete Against AI
            </div>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
              Start immediately with AI opponents
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#00e5e5]">
              Start now
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

