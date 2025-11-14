'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function PhaseRankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Current phase info
  const phase = parseInt(searchParams.get('phase') || '1');
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content');
  const wordCount = searchParams.get('wordCount');
  const aiScores = searchParams.get('aiScores');
  const yourScore = searchParams.get('yourScore') || '0';
  const feedbackScore = searchParams.get('feedbackScore');
  const peerFeedback = searchParams.get('peerFeedback');
  
  const [countdown, setCountdown] = useState(10);
  
  // Generate rankings for current phase
  const generatePhaseRankings = () => {
    const score = parseFloat(
      phase === 1 ? yourScore : 
      phase === 2 ? feedbackScore || yourScore : 
      yourScore
    );
    
    const aiScoresArray = (aiScores || '0,0,0,0').split(',').map(Number);
    
    const rankings = [
      { 
        name: 'You', 
        avatar: '🌿', 
        rank: 'Silver III', 
        score: Math.round(score),
        isYou: true,
        position: 0 
      },
      { 
        name: 'ProWriter99', 
        avatar: '🎯', 
        rank: 'Silver II', 
        score: Math.round(65 + Math.random() * 25),
        isYou: false,
        position: 0 
      },
      { 
        name: 'WordMaster', 
        avatar: '📖', 
        rank: 'Silver III', 
        score: Math.round(60 + Math.random() * 30),
        isYou: false,
        position: 0 
      },
      { 
        name: 'EliteScribe', 
        avatar: '✨', 
        rank: 'Silver II', 
        score: Math.round(70 + Math.random() * 20),
        isYou: false,
        position: 0 
      },
      { 
        name: 'PenChampion', 
        avatar: '🏅', 
        rank: 'Silver IV', 
        score: Math.round(55 + Math.random() * 30),
        isYou: false,
        position: 0 
      },
    ].sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, position: index + 1 }));
    
    return rankings;
  };
  
  const rankings = generatePhaseRankings();
  const yourRank = rankings.find(p => p.isYou)?.position || 5;
  
  // Phase information
  const phaseInfo = {
    1: {
      title: 'Phase 1 recap · Draft',
      icon: '📝',
      nextPhase: 'Peer feedback briefing',
      descriptor: 'Draft scores locked in. Review standings before feedback phase opens.',
    },
    2: {
      title: 'Phase 2 recap · Feedback',
      icon: '🔍',
      nextPhase: 'Revision showdown',
      descriptor: 'Feedback accuracy tallied. Collect insights before revision.',
    },
  } as const;
  
  const currentPhaseInfo = phaseInfo[phase as keyof typeof phaseInfo] || phaseInfo[1];
  
  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Navigate to next phase
      if (phase === 1) {
        router.push(
          `/ranked/peer-feedback?trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}`
        );
      } else if (phase === 2) {
        router.push(
          `/ranked/revision?trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${feedbackScore}&peerFeedback=${peerFeedback}`
        );
      }
    }
  }, [countdown, phase, router, trait, promptId, promptType, content, wordCount, aiScores, yourScore, feedbackScore, peerFeedback]);
  
  const getPlacementBadge = (rank: number) => {
    if (rank === 1) return { label: '🥇', tone: 'bg-emerald-400 text-[#0c141d]' };
    if (rank === 2) return { label: '🥈', tone: 'bg-white/70 text-[#0c141d]' };
    if (rank === 3) return { label: '🥉', tone: 'bg-orange-300 text-[#0c141d]' };
    return { label: `#${rank}`, tone: 'bg-white/10 text-white/60' };
  };
  
  const yourBadge = getPlacementBadge(yourRank);
  
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#141e27] p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c141d] text-3xl">
              {currentPhaseInfo.icon}
            </div>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Ranked circuit</div>
              <h1 className="text-3xl font-semibold">{currentPhaseInfo.title}</h1>
              <p className="text-sm text-white/60">{currentPhaseInfo.descriptor}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0c141d] px-6 py-5 text-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-[#141e27] text-2xl font-semibold">
              {countdown}
            </div>
            <div>
              <div className="text-xs uppercase text-white/50">Next phase</div>
              <div className="text-base font-semibold text-emerald-200">{currentPhaseInfo.nextPhase}</div>
              <div className="text-xs text-white/50">Launching in {countdown}s</div>
            </div>
          </div>
        </header>

        <main className="grid gap-10 lg:grid-cols-[1.4fr,0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Current standings</div>
                <p className="mt-2 text-xs text-white/50">Scores normalized to 100. Top three get bonus LP.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Phase {phase}</div>
            </div>
            <div className="mt-6 space-y-3">
              {rankings.map(player => {
                const badge = getPlacementBadge(player.position);
                return (
                  <div
                    key={player.name}
                    className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${
                      player.isYou ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold ${badge.tone}`}>
                        {badge.label}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{player.avatar}</span>
                        <div>
                          <div className={`text-sm font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>{player.name}</div>
                          <div className="text-[11px] text-white/50">{player.rank}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>{player.score}</div>
                      <div className="text-[11px] uppercase text-white/40">score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-sm text-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Your placement</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold ${yourBadge.tone}`}>
                      {yourBadge.label}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">You are in position {yourRank}</div>
                      <p className="text-xs text-white/50">{yourRank <= 3 ? 'Eligible for LP boost.' : 'Push harder next phase to climb.'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-xs text-white/50">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Phase 1 (draft) influences final LP by 40%.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Phase 2 (feedback) contributes 30%.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Phase 3 (revision) closes with the remaining 30%.</div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-xs text-white/50">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Next steps</div>
              <p className="mt-3">- Phase transitions automatically. Stay focused on the next prompt segment.</p>
              <p className="mt-3">- Review your draft copy; you may need it for revision cues.</p>
              <p className="mt-3">- Aim to improve relative rank for extra LP.</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default function PhaseRankingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading rankings...
      </div>
    }>
      <PhaseRankingsContent />
    </Suspense>
  );
}

