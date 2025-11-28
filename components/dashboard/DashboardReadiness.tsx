import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/hooks/useNavigation';

export function DashboardReadiness() {
  const router = useRouter();
  const { navigateToRanked, navigateToQuickMatch, navigateToPractice } = useNavigation();

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Match Readiness
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={navigateToRanked}
          className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-4 py-3 text-left transition-all hover:bg-[#33ebeb]"
        >
          <div className="text-sm font-semibold text-[#101012]">Join Ranked</div>
          <div className="mt-1 text-xs text-[#101012]/70">Recommended</div>
        </button>
        <button
          onClick={navigateToQuickMatch}
          className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-left transition-all hover:bg-[rgba(255,255,255,0.04)]"
        >
          <div className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Quick Match</div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">4 min warmup</div>
        </button>
        <button
          onClick={navigateToPractice}
          className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-left transition-all hover:bg-[rgba(255,255,255,0.04)]"
        >
          <div className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Practice</div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Solo drills</div>
        </button>
      </div>
    </div>
  );
}

