'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useInterval } from '@/lib/hooks/useInterval';
import { COLOR_CLASSES } from '@/lib/constants/colors';

export default function MatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');

  const [players, setPlayers] = useState<Array<{ name: string; avatar: string; isAI: boolean }>>([{ name: 'You', avatar: '🌿', isAI: false }]);
  const [searchingDots, setSearchingDots] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  useInterval(() => {
    setSearchingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
  }, 500, []);

  useEffect(() => {
    const aiRoster = [{ name: 'WriteBot', avatar: '🤖', isAI: true }, { name: 'PenPal AI', avatar: '✍️', isAI: true }, { name: 'WordSmith', avatar: '📝', isAI: true }, { name: 'QuillMaster', avatar: '🖋️', isAI: true }, { name: 'InkWizard', avatar: '🧙', isAI: true }];
    const timeouts: NodeJS.Timeout[] = [];
    [900, 1600, 2200, 2800].forEach((delay, index) => { timeouts.push(setTimeout(() => { setPlayers(prev => [...prev, aiRoster[index]]); }, delay)); });
    timeouts.push(setTimeout(() => { setCountdown(3); }, 3200));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) { const timer = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(timer); }
    const randomPromptType = ['narrative', 'descriptive', 'informational', 'argumentative'][Math.floor(Math.random() * 4)];
    router.push(`/quick-match/session?trait=${trait}&promptType=${randomPromptType}`);
  }, [countdown, router, trait]);

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3"><span className="text-xl font-semibold tracking-wide">Quick match queue</span></div>
          <Link href="/quick-match" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]">Cancel search</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        {countdown === null ? (
          <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr]">
            <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
              <header className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Assembling party</div>
                  <h1 className="mt-2 text-2xl font-semibold">Finding teammates{searchingDots}</h1>
                  <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">AI backfill keeps the lobby full so your warmup launches fast.</p>
                </div>
                <span className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.4)]">Trait focus: {trait || 'all'}</span>
              </header>
              <div className="mt-6 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 text-xs text-[rgba(255,255,255,0.5)]">Queue stats: average wait <span className="font-medium">8 seconds</span>, party size target <span className="font-medium">6</span>.</div>
              <div className="mt-6 grid gap-3 text-sm">
                {[...Array(6)].map((_, index) => {
                  const player = players[index];
                  return (
                    <div key={index} className={`flex items-center justify-between rounded-[10px] border px-4 py-3 transition ${player ? `${COLOR_CLASSES.phase1.borderOpacity(0.2)} ${COLOR_CLASSES.phase1.bgOpacity(0.08)}` : `${COLOR_CLASSES.background.cardBorder} ${COLOR_CLASSES.background.dark}`}`}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.025)] text-lg">{player ? player.avatar : '…'}</span>
                        <div>
                          <div className={`text-sm font-medium ${player ? '' : 'text-[rgba(255,255,255,0.3)]'}`}>{player ? player.name : `Searching slot ${index + 1}`}</div>
                          <div className="text-[10px] uppercase text-[rgba(255,255,255,0.3)]">{player ? (player.isAI ? 'AI support' : 'You') : 'Pending'}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[rgba(255,255,255,0.3)]">#{index + 1}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 h-[6px] rounded-[3px] bg-[rgba(255,255,255,0.05)]"><div className={`h-full rounded-[3px] ${COLOR_CLASSES.phase1.bg}`} style={{ width: `${(players.length / 6) * 100}%` }} /></div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-sm text-[rgba(255,255,255,0.5)]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Queue feed</div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">0s · You joined the lobby.</div>
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">2s · Searching for human teammates.</div>
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">AI reserves engage automatically if seats remain open.</div>
                </div>
              </div>
              <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-xs text-[rgba(255,255,255,0.5)]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Next steps</div>
                <p className="mt-3">- Keep your editor ready. Match begins as soon as countdown hits zero.</p>
                <p className="mt-3">- Trait focus influences prompt hints but not opponent difficulty.</p>
                <p className="mt-3">- Cancel now if you need a break—leaving mid-match forfeits points.</p>
              </div>
            </aside>
          </div>
        ) : (
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-10 py-14 text-center">
            <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${COLOR_CLASSES.phase1.border} ${COLOR_CLASSES.phase1.bgOpacity(0.15)} font-mono text-5xl font-medium ${COLOR_CLASSES.phase1.text}`}>{countdown}</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Match secured</div>
              <h2 className="mt-3 text-3xl font-semibold">Lobby locked</h2>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">Prompt is loading. Draft phase launches immediately.</p>
            </div>
            <div className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-6">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Party roster</div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                {players.map((player, index) => (
                  <div key={index} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-4">
                    <div className="text-2xl">{player.avatar}</div>
                    <div className="mt-2 font-medium">{player.name}</div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.4)]">{player.isAI ? 'AI support' : 'You'}</div>
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
