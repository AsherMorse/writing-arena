'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function QuickMatchLanding() {
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

  const handleStartMatch = () => router.push(`/quick-match/matchmaking?trait=${selectedTrait}`);

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3"><span className="text-xl font-semibold tracking-wide">Quick Match Lobby</span></Link>
          <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]">Back to dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-14">
        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-3xl">⚡</div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Four-minute scrims</div>
                <h1 className="mt-2 text-2xl font-semibold">Sprint-ready queue</h1>
                <p className="mt-3 text-sm text-[rgba(255,255,255,0.5)]">Drop into an instant writing duel. AI backups keep the lobby full so you can focus on sharpening a trait and banking points.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-4 text-sm text-[rgba(255,255,255,0.6)]"><div className="text-[10px] uppercase text-[rgba(255,255,255,0.4)]">Pace</div><p className="mt-2">4-minute timer with auto scoring.</p></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-4 text-sm text-[rgba(255,255,255,0.6)]"><div className="text-[10px] uppercase text-[rgba(255,255,255,0.4)]">Party fill</div><p className="mt-2">Matches start with humans; AI joins instantly if needed.</p></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-4 text-sm text-[rgba(255,255,255,0.6)]"><div className="text-[10px] uppercase text-[rgba(255,255,255,0.4)]">Scoring</div><p className="mt-2">Earn XP, season points, and consistency streak credit.</p></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-4 text-sm text-[rgba(255,255,255,0.6)]"><div className="text-[10px] uppercase text-[rgba(255,255,255,0.4)]">Focus lanes</div><p className="mt-2">Stay balanced or target the trait you need most.</p></div>
            </div>
            <div className="mt-8 rounded-[10px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-5 py-4 text-sm text-[#00e5e5]">Daily reps unlock streak bonuses. Queue here for warmups before heading to ranked.</div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7">
              <div className="flex items-center justify-between">
                <div><div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Trait selection</div><p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">Pick a focus to guide prompts and scoring emphasis.</p></div>
                <span className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.4)]">Optional</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {traits.map(trait => (
                  <button key={trait.id} onClick={() => setSelectedTrait(trait.id)} className={`flex items-start gap-3 rounded-[10px] border px-4 py-4 text-left text-sm transition ${selectedTrait === trait.id ? 'border-[rgba(0,229,229,0.3)] bg-[rgba(0,229,229,0.1)]' : 'border-[rgba(255,255,255,0.05)] bg-[#101012] hover:border-[rgba(0,229,229,0.2)]'}`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.025)] text-lg">{trait.icon}</span>
                    <div>
                      <div className="font-medium">{trait.name}</div>
                      <p className="text-xs text-[rgba(255,255,255,0.4)]">{trait.description}</p>
                      {selectedTrait === trait.id && <div className="mt-2 text-[10px] uppercase text-[#00e5e5]">Selected</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Ready?</div>
              <h2 className="mt-3 text-xl font-semibold">Launch match</h2>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">Average wait time under 10 seconds.</p>
              <button onClick={handleStartMatch} className="mt-6 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-6 py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]">Find match</button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
