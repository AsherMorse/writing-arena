import Link from 'next/link';

export function ResultsHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-semibold uppercase tracking-[0.08em]">Ranked Results</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ranked" className="rounded-[10px] border border-[#00e5e5] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[#00e5e5] transition hover:bg-[rgba(0,229,229,0.1)]">
            Play Again
          </Link>
          <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

