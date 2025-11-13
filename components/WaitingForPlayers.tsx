'use client';

interface WaitingForPlayersProps {
  phase: 1 | 2 | 3;
  playersReady: number;
  totalPlayers: number;
  timeRemaining: number;
}

export default function WaitingForPlayers({
  phase,
  playersReady,
  totalPlayers,
  timeRemaining,
}: WaitingForPlayersProps) {
  const phaseNames = {
    1: 'Draft',
    2: 'Feedback',
    3: 'Revision',
  } as const;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playersRemaining = Math.max(totalPlayers - playersReady, 0);

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Ranked circuit</div>
            <h1 className="mt-3 text-3xl font-semibold">Awaiting squad</h1>
            <p className="mt-2 text-sm text-white/60">You packed up your {phaseNames[phase]} phase. The arena will advance when the remaining teammates submit.</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#141e27] px-5 py-4 text-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0c141d] text-lg font-semibold">
              ⏳
            </div>
            <div>
              <div className="text-xs uppercase text-white/50">Auto-advance in</div>
              <div className="text-lg font-semibold text-emerald-200">{formatTime(timeRemaining)}</div>
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Submissions received</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold">{playersReady}</span>
                  <span className="text-2xl text-white/40">/</span>
                  <span className="text-2xl text-white/40">{totalPlayers}</span>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Waiting on {playersRemaining}</div>
            </div>

            <div className="mt-6 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${(playersReady / totalPlayers) * 100}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-white/60 md:grid-cols-2">
              {[...Array(totalPlayers)].map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                    index < playersReady ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c141d] text-lg">
                      {index < playersReady ? '✓' : '…'}
                    </div>
                    <span className={index < playersReady ? 'font-semibold' : undefined}>Slot {index + 1}</span>
                  </div>
                  <span className="text-xs uppercase tracking-wide">{index < playersReady ? 'Ready' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-sm text-white/60">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Status feed</div>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-emerald-200">1</div>
                  <div>
                    <div className="text-sm font-semibold text-white">You submitted</div>
                    <p className="text-xs text-white/50">Draft saved and queued for scoring.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white/60">2</div>
                  <div>
                    <div className="text-sm font-semibold text-white">Waiting on squadmates</div>
                    <p className="text-xs text-white/50">We notify you when {playersRemaining} teammate{playersRemaining === 1 ? '' : 's'} submit.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white/60">3</div>
                  <div>
                    <div className="text-sm font-semibold text-white">Auto advance</div>
                    <p className="text-xs text-white/50">Phase ends at {formatTime(timeRemaining)} or sooner if all drafts arrive.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-xs text-white/50">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Next phase prep</div>
              <p className="mt-3">- Review Claude&apos;s feedback template to speed through ratings.</p>
              <p className="mt-3">- Keep browser active—phase 2 opens immediately.</p>
              <p className="mt-3">- Hydrate and reset your timer habits.</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

