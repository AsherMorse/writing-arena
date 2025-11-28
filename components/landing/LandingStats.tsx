/**
 * Stats section component for landing page
 * Displays key metrics about the platform
 */
export function LandingStats() {
  return (
    <section className="mb-12 grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Avg Match
        </div>
        <div className="font-mono text-4xl font-medium leading-none text-[#00e5e5]">4</div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">minutes</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Traits Tracked
        </div>
        <div className="font-mono text-4xl font-medium leading-none text-[#ff5f8f]">5</div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">categories</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Mastery Tiers
        </div>
        <div className="font-mono text-4xl font-medium leading-none text-[#ff9030]">5</div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">levels</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          AI Coach
        </div>
        <div className="font-mono text-4xl font-medium leading-none text-[#00d492]">24/7</div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">available</div>
      </div>
    </section>
  );
}

