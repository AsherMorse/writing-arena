import Link from 'next/link';

interface MatchmakingHeaderProps {
  onCancel?: () => void;
}

/**
 * Header component for matchmaking page
 */
export function MatchmakingHeader({ onCancel }: MatchmakingHeaderProps) {
  return (
    <header className="border-b border-[rgba(255,255,255,0.05)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
        <Link href="/ranked" className="text-base font-semibold tracking-wide">
          Matchmaking
        </Link>
        {onCancel ? (
          <button
            onClick={onCancel}
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ← Cancel
          </button>
        ) : (
          <Link 
            href="/ranked"
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ← Cancel
          </Link>
        )}
      </div>
    </header>
  );
}

