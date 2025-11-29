'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { getMedalEmoji } from '@/lib/utils/rank-utils';
import { getPhaseColor, COLOR_CLASSES } from '@/lib/constants/colors';
import { getMatchRankings } from '@/lib/utils/firestore-match-state';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { useSearchParams } from '@/lib/hooks/useSearchParams';
import { TIMING } from '@/lib/constants/scoring';
import { roundScore } from '@/lib/utils/math-utils';
import { isNotEmpty } from '@/lib/utils/array-utils';

// Parser function for phase rankings search params
function parsePhaseRankingsParams(searchParams: URLSearchParams) {
  return {
    phase: parseInt(searchParams.get('phase') || '1'),
    sessionId: searchParams.get('sessionId') || '',
    matchId: searchParams.get('matchId') || '',
    trait: searchParams.get('trait'),
    promptId: searchParams.get('promptId'),
    promptType: searchParams.get('promptType'),
    content: searchParams.get('content'),
    wordCount: searchParams.get('wordCount'),
    aiScores: searchParams.get('aiScores'),
    yourScore: searchParams.get('yourScore') || '0',
    feedbackScore: searchParams.get('feedbackScore'),
    peerFeedback: searchParams.get('peerFeedback'),
  };
}

export default function PhaseRankingsContent() {
  const router = useRouter();
  
  // Use useSearchParams hook with parser function
  const params = useSearchParams(parsePhaseRankingsParams);
  const { phase, sessionId, matchId, trait, promptId, promptType, content, wordCount, aiScores, yourScore, feedbackScore, peerFeedback } = params;
  
  const [realRankings, setRealRankings] = useState<any[]>([]);
  
  const [manualContinue, setManualContinue] = useState(false);
  
  // Use countdown hook - extended to 20 seconds
  const { countdown, reset: resetCountdown } = useCountdown({
    initialValue: 20,
    onComplete: () => {
      if (sessionId && !manualContinue) {
        router.push(`/session/${sessionId}`);
      }
    },
  });
  
  const handleContinue = () => {
    setManualContinue(true);
    if (sessionId) {
      router.push(`/session/${sessionId}`);
    }
  };
  
  const writingConcepts = useMemo(() => [
    { name: 'Sentence Expansion', tip: 'Use because, but, or so to show why things happen.', example: 'She opened the door because she heard a strange noise.', icon: '🔗' },
    { name: 'Appositives', tip: 'Add description using commas to provide extra information.', example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.', icon: '✏️' },
    { name: 'Five Senses', tip: 'Include what you see, hear, smell, taste, and feel.', example: 'The salty air stung my eyes while waves crashed loudly below.', icon: '👁️' },
    { name: 'Show, Don\'t Tell', tip: 'Use specific details instead of general statements.', example: 'Her hands trembled as she reached for the handle.', icon: '🎭' },
    { name: 'Transition Words', tip: 'Use signal words to connect ideas smoothly.', example: 'First, Then, However, Therefore, For example', icon: '➡️' },
    { name: 'Strong Conclusions', tip: 'End with a final thought that ties everything together.', example: 'For these reasons, it is clear that...', icon: '🎯' },
  ], []);

  // Use carousel hook for tip rotation
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: writingConcepts,
    interval: TIMING.CAROUSEL_INTERVAL,
    autoPlay: true,
  });

  // Fetch rankings from Firestore using helper function
  useEffect(() => {
    const fetchRankings = async () => {
      if (!matchId) return;
      try {
        const rankings = await getMatchRankings(matchId, phase as 1 | 2 | 3);
        if (rankings && isNotEmpty(rankings)) {
          setRealRankings(rankings);
        } else {
          console.warn('⚠️ PHASE RANKINGS - No rankings found in Firestore. Rankings may not be available yet.');
        }
      } catch (error) {
        console.error('❌ PHASE RANKINGS - Failed to fetch rankings:', error);
      }
    };
    fetchRankings();
  }, [matchId, phase]);

  // Only use rankings from LLM - never random fallbacks
  const rankings = useMemo(() => {
    if (isNotEmpty(realRankings)) {
      return realRankings.map((r, idx) => ({
        name: r.playerName || (r.isAI ? r.playerId : 'You'),
        avatar: r.isAI ? ['🎯', '📖', '✨', '🏅'][idx % 4] : '🌿',
        rank: r.isAI ? ['Silver II', 'Silver III', 'Silver II', 'Silver IV'][idx % 4] : 'Silver III',
        score: r.score, // Always from LLM
        isYou: !r.isAI,
        position: r.rank,
      }));
    }
    
    // If no rankings available, show only the user's score (no fake AI players)
    const score = parseFloat(phase === 1 ? yourScore : phase === 2 ? feedbackScore || yourScore : yourScore);
    return [
      { name: 'You', avatar: '🌿', rank: 'Silver III', score: roundScore(score), isYou: true, position: 1 },
    ];
  }, [phase, yourScore, feedbackScore, realRankings]);
  
  const yourRank = rankings.find(p => p.isYou)?.position || 5;
  
  const phaseInfo = {
    1: { title: 'Phase 1 Complete: Writing', icon: '📝', nextPhase: 'Peer Feedback', color: getPhaseColor(1) },
    2: { title: 'Phase 2 Complete: Peer Feedback', icon: '🔍', nextPhase: 'Revision', color: getPhaseColor(2) },
  };
  
  const currentPhaseInfo = phaseInfo[phase as keyof typeof phaseInfo] || phaseInfo[1];
  
  
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
          <button
            onClick={handleContinue}
            className="mt-4 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm font-medium text-[rgba(255,255,255,0.8)] transition-all hover:bg-[rgba(255,255,255,0.1)]"
          >
            Continue Now
          </button>
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
                    onClick={() => goToTip(index)}
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
                className={`rounded-[10px] p-3 transition-all ${player.isYou ? `border-2 ${COLOR_CLASSES.phase1.bgOpacity(0.1)}` : `border ${COLOR_CLASSES.background.cardBorder} ${COLOR_CLASSES.background.dark}`}`}
                style={player.isYou ? { borderColor: currentPhaseInfo.color } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold ${
                      player.position === 1 ? `${COLOR_CLASSES.orange.bg} text-[#101012]` :
                      player.position === 2 ? 'bg-[rgba(255,255,255,0.3)] text-[#101012]' :
                      player.position === 3 ? `${COLOR_CLASSES.orange.bgOpacity(0.6)} text-[#101012]` :
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
          yourRank === 1 ? `${COLOR_CLASSES.orange.bgOpacity(0.15)} ${COLOR_CLASSES.orange.borderOpacity(0.3)} border` :
          yourRank <= 3 ? `${COLOR_CLASSES.phase3.bgOpacity(0.15)} ${COLOR_CLASSES.phase3.borderOpacity(0.3)} border` :
          `${COLOR_CLASSES.phase1.bgOpacity(0.15)} ${COLOR_CLASSES.phase1.borderOpacity(0.3)} border`
        }`}>
          <div className="mb-1 text-xs text-[rgba(255,255,255,0.5)]">You&apos;re currently in</div>
          <div className={`mb-1 font-mono text-2xl font-medium ${yourRank === 1 ? COLOR_CLASSES.orange.text : yourRank <= 3 ? COLOR_CLASSES.phase3.text : COLOR_CLASSES.phase1.text}`}>
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
