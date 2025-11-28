import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { COLOR_CLASSES } from '@/lib/constants/colors';

interface DashboardActionsProps {
  hasEnoughMatches: boolean;
  loadingMatches: boolean;
  matchesRemaining: number;
  completedMatches: number | null;
}

export function DashboardActions({
  hasEnoughMatches,
  loadingMatches,
  matchesRemaining,
  completedMatches,
}: DashboardActionsProps) {
  const router = useRouter();
  const { navigateToRanked, navigateToImprove, navigateToAPLang } = useNavigation();

  return (
    <section className="mb-8">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.22)]">
        Quick Actions
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <button
          onClick={navigateToRanked}
          className={`group relative rounded-[14px] border ${COLOR_CLASSES.phase1.borderOpacity(0.3)} ${COLOR_CLASSES.phase1.bgOpacity(0.08)} p-6 text-left transition-all hover:border-[rgba(0,229,229,0.5)] hover:bg-[rgba(0,229,229,0.12)]`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${COLOR_CLASSES.phase1.bgOpacity(0.15)} text-lg`}>
              🏆
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${COLOR_CLASSES.phase1.text}`}>
              Ranked
            </span>
          </div>
          <div className="text-lg font-semibold text-[rgba(255,255,255,0.9)]">Ranked Circuit</div>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
            Compete in three-phase matches and climb the leaderboard
          </p>
          <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${COLOR_CLASSES.phase1.text}`}>
            Enter ranked
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </button>

        <button
          onClick={() => hasEnoughMatches && navigateToImprove()}
          disabled={!hasEnoughMatches}
          className={`group relative rounded-[14px] border p-6 text-left transition-all ${
            hasEnoughMatches
              ? 'border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.08)] hover:border-[rgba(255,95,143,0.5)] hover:bg-[rgba(255,95,143,0.12)]'
              : 'cursor-not-allowed border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] opacity-60'
          }`}
        >
          {!hasEnoughMatches && (
            <div className="absolute right-3 top-3 rounded-[20px] bg-[rgba(255,95,143,0.15)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#ff5f8f]">
              {loadingMatches ? 'Loading' : `${matchesRemaining} more`}
            </div>
          )}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(255,95,143,0.15)] text-lg">
              📈
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${hasEnoughMatches ? 'text-[#ff5f8f]' : 'text-[rgba(255,255,255,0.22)]'}`}>
              Improve
            </span>
          </div>
          <div className={`text-lg font-semibold ${hasEnoughMatches ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(255,255,255,0.4)]'}`}>
            Improve Writing
          </div>
          <p className={`mt-1 text-sm ${hasEnoughMatches ? 'text-[rgba(255,255,255,0.5)]' : 'text-[rgba(255,255,255,0.3)]'}`}>
            {hasEnoughMatches
              ? 'Personalized exercises based on your last 5 ranked matches'
              : `Complete ${matchesRemaining} more ranked match${matchesRemaining !== 1 ? 'es' : ''} to unlock`}
          </p>
          {!hasEnoughMatches && completedMatches !== null && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-[rgba(255,255,255,0.4)]">Progress</span>
                <span className="font-mono text-[#ff5f8f]">{completedMatches}/5</span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full rounded-[3px] transition-all"
                  style={{ width: `${(completedMatches / 5) * 100}%`, background: '#ff5f8f' }}
                />
              </div>
            </div>
          )}
          {hasEnoughMatches && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ff5f8f]">
              Start improving
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          )}
        </button>

        <button
          onClick={navigateToAPLang}
          className="group relative rounded-[14px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.08)] p-6 text-left transition-all hover:border-[rgba(255,144,48,0.5)] hover:bg-[rgba(255,144,48,0.12)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(255,144,48,0.15)] text-lg">
              📚
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ff9030]">
              AP Lang
            </span>
          </div>
          <div className="text-lg font-semibold text-[rgba(255,255,255,0.9)]">AP Lang Grader</div>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
            Grade essays or practice with authentic AP prompts
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ff9030]">
            Open grader
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </button>
      </div>
    </section>
  );
}

