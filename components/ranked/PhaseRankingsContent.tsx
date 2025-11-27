'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { getMedalEmoji } from '@/lib/utils/rank-utils';
import { getPhaseColor } from '@/lib/constants/colors';

export default function PhaseRankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const phase = parseInt(searchParams.get('phase') || '1');
  const sessionId = searchParams.get('sessionId') || '';
  const matchId = searchParams.get('matchId') || '';
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
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [realRankings, setRealRankings] = useState<any[]>([]);
  
  const writingConcepts = useMemo(() => [
    { name: 'Sentence Expansion', tip: 'Use because, but, or so to show why things happen.', example: 'She opened the door because she heard a strange noise.', icon: '🔗' },
    { name: 'Appositives', tip: 'Add description using commas to provide extra information.', example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.', icon: '✏️' },
    { name: 'Five Senses', tip: 'Include what you see, hear, smell, taste, and feel.', example: 'The salty air stung my eyes while waves crashed loudly below.', icon: '👁️' },
    { name: 'Show, Don\'t Tell', tip: 'Use specific details instead of general statements.', example: 'Her hands trembled as she reached for the handle.', icon: '🎭' },
    { name: 'Transition Words', tip: 'Use signal words to connect ideas smoothly.', example: 'First, Then, However, Therefore, For example', icon: '➡️' },
    { name: 'Strong Conclusions', tip: 'End with a final thought that ties everything together.', example: 'For these reasons, it is clear that...', icon: '🎯' },
  ], []);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!matchId) return;
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        const matchState = matchDoc.data();
        const phaseKey = `phase${phase}`;
        const rankings = matchState?.rankings?.[phaseKey];
        if (rankings && rankings.length > 0) setRealRankings(rankings);
      } catch (error) {
        console.error('❌ PHASE RANKINGS - Failed to fetch rankings:', error);
      }
    };
    fetchRankings();
  }, [matchId, phase]);

  const rankings = useMemo(() => {
    if (realRankings.length > 0) {
      return realRankings.map((r, idx) => ({
        name: r.playerName || (r.isAI ? r.playerId : 'You'),
        avatar: r.isAI ? ['🎯', '📖', '✨', '🏅'][idx % 4] : '🌿',
        rank: r.isAI ? ['Silver II', 'Silver III', 'Silver II', 'Silver IV'][idx % 4] : 'Silver III',
        score: r.score,
        isYou: !r.isAI,
        position: r.rank,
      }));
    }
    
    const score = parseFloat(phase === 1 ? yourScore : phase === 2 ? feedbackScore || yourScore : yourScore);
    const rankedPlayers = [
      { name: 'You', avatar: '🌿', rank: 'Silver III', score: Math.round(score), isYou: true, position: 0 },
      { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', score: Math.round(65 + Math.random() * 25), isYou: false, position: 0 },
      { name: 'WordMaster', avatar: '📖', rank: 'Silver III', score: Math.round(60 + Math.random() * 30), isYou: false, position: 0 },
      { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', score: Math.round(70 + Math.random() * 20), isYou: false, position: 0 },
      { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', score: Math.round(55 + Math.random() * 30), isYou: false, position: 0 },
    ].sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, position: index + 1 }));
    return rankedPlayers;
  }, [phase, yourScore, feedbackScore, aiScores, realRankings]);
  
  const yourRank = rankings.find(p => p.isYou)?.position || 5;
  
  const phaseInfo = {
    1: { title: 'Phase 1 Complete: Writing', icon: '📝', nextPhase: 'Peer Feedback', color: getPhaseColor(1) },
    2: { title: 'Phase 2 Complete: Peer Feedback', icon: '🔍', nextPhase: 'Revision', color: getPhaseColor(2) },
  };
  
  const currentPhaseInfo = phaseInfo[phase as keyof typeof phaseInfo] || phaseInfo[1];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % writingConcepts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [writingConcepts.length]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      let navigated = false;
      const navigate = () => {
        if (navigated || !sessionId) return;
        navigated = true;
        router.push(`/session/${sessionId}`);
      };
      navigate();
    }
  }, [countdown, phase, router, sessionId]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101012] px-4 py-6 text-[rgba(255,255,255,0.8)]">
      <div className="w-full max-w-[900px]">
        <div className="mb-4 text-center">
          <div className="mb-3 text-5xl animate-bounce">{currentPhaseInfo.icon}</div>
          <h1 className="mb-1 text-2xl font-semibold">{currentPhaseInfo.title}</h1>
          <p className="mb-4 text-sm text-[rgba(255,255,255,0.4)]">Current Standings</p>
          
          <div className="inline-flex items-center justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2" style={{ borderColor: currentPhaseInfo.color, background: `${currentPhaseInfo.color}15` }}>
              <span className="font-mono text-4xl font-medium" style={{ color: currentPhaseInfo.color }}>{countdown}</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
            Preparing {currentPhaseInfo.nextPhase} in {countdown}s...
          </p>
        </div>

        <div className="mx-auto mb-4 max-w-3xl">
          <div className="relative overflow-hidden rounded-[14px] border p-4" style={{ borderColor: `${currentPhaseInfo.color}30`, background: `${currentPhaseInfo.color}08` }}>
            <div className="relative z-10">
              <div className="mb-2 flex items-center justify-center">
                <div className="mr-2 text-2xl">{writingConcepts[currentTipIndex].icon}</div>
                <h3 className="text-lg font-semibold">{writingConcepts[currentTipIndex].name}</h3>
              </div>
              
              <p className="mb-3 text-center text-sm text-[rgba(255,255,255,0.6)] leading-relaxed">
                {writingConcepts[currentTipIndex].tip}
              </p>
              
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
                <div className="mb-1 text-center text-[10px] font-semibold uppercase" style={{ color: currentPhaseInfo.color }}>Example</div>
                <p className="text-center text-xs italic text-[rgba(255,255,255,0.5)] leading-relaxed">
                  {writingConcepts[currentTipIndex].example}
                </p>
              </div>

              <div className="mt-3 flex justify-center gap-1">
                {writingConcepts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${index === currentTipIndex ? 'w-6' : 'w-1.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'}`}
                    style={index === currentTipIndex ? { background: currentPhaseInfo.color } : {}}
                  />
                ))}
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs text-[rgba(255,255,255,0.22)]">💡 Writing tip</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-3 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <span>🏆</span>
            <span>Current Rankings</span>
            <span className="ml-auto text-xs font-normal text-[rgba(255,255,255,0.22)]">After Phase {phase}</span>
          </h2>
          
          <div className="space-y-2">
            {rankings.map((player) => (
              <div
                key={player.name}
                className={`rounded-[10px] p-3 transition-all ${player.isYou ? 'border-2 bg-[rgba(0,229,229,0.1)]' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}
                style={player.isYou ? { borderColor: currentPhaseInfo.color } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold ${
                      player.position === 1 ? 'bg-[#ff9030] text-[#101012]' :
                      player.position === 2 ? 'bg-[rgba(255,255,255,0.3)] text-[#101012]' :
                      player.position === 3 ? 'bg-[#ff9030]/60 text-[#101012]' :
                      'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)]'
                    }`}>
                      {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : player.position}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${player.isYou ? '' : ''}`} style={player.isYou ? { color: currentPhaseInfo.color } : {}}>
                            {player.name}
                          </span>
                          {player.isYou && (
                            <span className="rounded-[20px] px-1.5 py-0.5 text-[10px] font-medium text-[#101012]" style={{ background: currentPhaseInfo.color }}>You</span>
                          )}
                        </div>
                        <div className="text-xs text-[rgba(255,255,255,0.4)]">{player.rank}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-lg font-medium" style={player.isYou ? { color: currentPhaseInfo.color } : {}}>
                      {player.score}
                    </div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.4)]">score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`rounded-[10px] p-3 text-center ${
          yourRank === 1 ? 'bg-[rgba(255,144,48,0.15)] border border-[rgba(255,144,48,0.3)]' :
          yourRank <= 3 ? 'bg-[rgba(0,212,146,0.15)] border border-[rgba(0,212,146,0.3)]' :
          'bg-[rgba(0,229,229,0.15)] border border-[rgba(0,229,229,0.3)]'
        }`}>
          <div className="mb-1 text-xs text-[rgba(255,255,255,0.5)]">You&apos;re currently in</div>
          <div className="mb-1 font-mono text-2xl font-medium" style={{ color: yourRank === 1 ? '#ff9030' : yourRank <= 3 ? '#00d492' : '#00e5e5' }}>
            {getMedalEmoji(yourRank)} Place
          </div>
          <div className="text-xs text-[rgba(255,255,255,0.5)]">
            {yourRank === 1 ? '🔥 Leading the pack!' : yourRank === 2 ? '💪 Close to the top!' : yourRank === 3 ? '👍 In the top 3!' : '⚔️ Keep pushing!'}
          </div>
        </div>
      </div>
    </div>
  );
}
