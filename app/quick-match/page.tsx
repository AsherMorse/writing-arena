'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function QuickMatchPage() {
  const router = useRouter();
  const [selectedTrait, setSelectedTrait] = useState<string>('all');

  const traits = [
    { id: 'all', name: 'All traits', icon: '✨', description: 'Balanced practice across every writing skill.' },
    { id: 'content', name: 'Content', icon: '📚', description: 'Sharpen ideas, relevance, and evidence.' },
    { id: 'organization', name: 'Organization', icon: '🗂️', description: 'Tighten structure, flow, and transitions.' },
    { id: 'grammar', name: 'Grammar', icon: '✏️', description: 'Strengthen sentence variety and syntax.' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📖', description: 'Elevate precision and word choice.' },
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️', description: 'Polish spelling, punctuation, and conventions.' },
  ];

  const handleStartMatch = () => {
    router.push(`/quick-match/matchmaking?trait=${selectedTrait}`);
  };

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">✶</div>
            <span className="text-xl font-semibold tracking-wide">Quick Match Lobby</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c141d] text-3xl">⚡</div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Four-minute scrims</div>
                <h1 className="mt-2 text-3xl font-semibold">Sprint-ready queue</h1>
                <p className="mt-3 text-sm text-white/60">Drop into an instant writing duel. AI backups keep the lobby full so you can focus on sharpening a trait and banking points.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                <div className="text-xs uppercase text-white/50">Pace</div>
                <p className="mt-2 text-white">4-minute timer with auto scoring.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                <div className="text-xs uppercase text-white/50">Party fill</div>
                <p className="mt-2 text-white">Matches start with humans; AI joins instantly if needed.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                <div className="text-xs uppercase text-white/50">Scoring</div>
                <p className="mt-2 text-white">Earn XP, season points, and consistency streak credit.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                <div className="text-xs uppercase text-white/50">Focus lanes</div>
                <p className="mt-2 text-white">Stay balanced or target the trait you need most.</p>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200">
              Daily reps unlock streak bonuses. Queue here for warmups before heading to ranked.
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Trait selection</div>
                  <p className="mt-2 text-xs text-white/50">Pick a focus to guide prompts and scoring emphasis.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Optional</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {traits.map(trait => (
                  <button
                    key={trait.id}
                    onClick={() => setSelectedTrait(trait.id)}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      selectedTrait === trait.id
                        ? 'border-emerald-300/40 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5 hover:border-emerald-200/30'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c141d] text-lg">{trait.icon}</span>
                    <div>
                      <div className="text-white font-semibold">{trait.name}</div>
                      <p className="text-xs text-white/50">{trait.description}</p>
                      {selectedTrait === trait.id && <div className="mt-2 text-[10px] uppercase text-emerald-200">Selected</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Ready?</div>
              <h2 className="mt-3 text-xl font-semibold">Launch match</h2>
              <p className="mt-2 text-sm text-white/60">Average wait time under 10 seconds.</p>
              <button
                onClick={handleStartMatch}
                className="mt-6 w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
              >
                Find match
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

