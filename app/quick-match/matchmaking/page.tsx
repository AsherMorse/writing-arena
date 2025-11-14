'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function MatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');

  const [players, setPlayers] = useState<Array<{ name: string; avatar: string; isAI: boolean }>>([
    { name: 'You', avatar: '🌿', isAI: false },
  ]);
  const [searchingDots, setSearchingDots] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const aiRoster = [
      { name: 'WriteBot', avatar: '🤖', isAI: true },
      { name: 'PenPal AI', avatar: '✍️', isAI: true },
      { name: 'WordSmith', avatar: '📝', isAI: true },
      { name: 'QuillMaster', avatar: '🖋️', isAI: true },
      { name: 'InkWizard', avatar: '🧙', isAI: true },
    ];

    const timeouts: NodeJS.Timeout[] = [];
    [900, 1600, 2200, 2800].forEach((delay, index) => {
      timeouts.push(
        setTimeout(() => {
          setPlayers(prev => [...prev, aiRoster[index]]);
        }, delay)
      );
    });

    timeouts.push(
      setTimeout(() => {
        setCountdown(3);
      }, 3200)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    const randomPromptType = ['narrative', 'descriptive', 'informational', 'argumentative'][Math.floor(Math.random() * 4)];
    router.push(`/quick-match/session?trait=${trait}&promptType=${randomPromptType}`);
  }, [countdown, router, trait]);

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">✶</div>
            <span className="text-xl font-semibold tracking-wide">Quick match queue</span>
          </div>
          <Link
            href="/quick-match"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancel search
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        {countdown === null ? (
          <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr]">
            <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <header className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Assembling party</div>
                  <h1 className="mt-2 text-3xl font-semibold">Finding teammates{searchingDots}</h1>
                  <p className="mt-2 text-sm text-white/60">AI backfill keeps the lobby full so your warmup launches fast.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Trait focus: {trait || 'all'}</span>
              </header>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Queue stats: average wait <span className="font-semibold text-white">8 seconds</span>, party size target <span className="font-semibold text-white">6</span>.
              </div>
              <div className="mt-6 grid gap-3 text-sm">
                {[...Array(6)].map((_, index) => {
                  const player = players[index];
                  const filled = Boolean(player);
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        filled ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c141d] text-lg">
                          {player ? player.avatar : '…'}
                        </span>
                        <div>
                          <div className={`text-sm font-semibold ${player ? 'text-white' : 'text-white/40'}`}>
                            {player ? player.name : `Searching slot ${index + 1}`}
                          </div>
                          <div className="text-[11px] uppercase text-white/40">
                            {player ? (player.isAI ? 'AI support' : 'You') : 'Pending'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/40">#{index + 1}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${(players.length / 6) * 100}%` }}
                />
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-sm text-white/60">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Queue feed</div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">0s · You joined the lobby.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">2s · Searching for human teammates.</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">AI reserves engage automatically if seats remain open.</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-xs text-white/60">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Next steps</div>
                <p className="mt-3">- Keep your editor ready. Match begins as soon as countdown hits zero.</p>
                <p className="mt-3">- Trait focus influences prompt hints but not opponent difficulty.</p>
                <p className="mt-3">- Cancel now if you need a break—leaving mid-match forfeits points.</p>
              </div>
            </aside>
          </div>
        ) : (
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 rounded-3xl border border-white/10 bg-[#141e27] px-10 py-14 text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-400/20 text-5xl font-semibold text-emerald-200">
              {countdown}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Match secured</div>
              <h2 className="mt-3 text-4xl font-semibold">Lobby locked</h2>
              <p className="mt-2 text-sm text-white/60">Prompt is loading. Draft phase launches immediately.</p>
            </div>
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Party roster</div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                {players.map((player, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-[#0c141d] px-4 py-4">
                    <div className="text-2xl">{player.avatar}</div>
                    <div className="mt-2 font-semibold text-white">{player.name}</div>
                    <div className="text-[11px] text-white/50">{player.isAI ? 'AI support' : 'You'}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function MatchmakingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading quick match queue...
      </div>
    }>
      <MatchmakingContent />
    </Suspense>
  );
}

