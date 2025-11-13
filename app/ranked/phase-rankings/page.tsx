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
      title: 'Phase 1 Complete: Writing',
      icon: '📝',
      nextPhase: 'Peer Feedback',
      color: 'from-purple-600 to-blue-600'
    },
    2: {
      title: 'Phase 2 Complete: Peer Feedback',
      icon: '🔍',
      nextPhase: 'Revision',
      color: 'from-blue-600 to-indigo-600'
    },
  };
  
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
  
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">{currentPhaseInfo.icon}</div>
          <h1 className="text-4xl font-bold text-white mb-2">{currentPhaseInfo.title}</h1>
          <p className="text-white/70 text-lg mb-6">Current Standings</p>
          
          {/* Countdown Circle */}
          <div className="inline-flex items-center justify-center">
            <div className={`relative w-24 h-24 bg-gradient-to-br ${currentPhaseInfo.color} rounded-full flex items-center justify-center shadow-2xl`}>
              <span className="text-5xl font-bold text-white">{countdown}</span>
            </div>
          </div>
          <p className="text-white/60 mt-3">
            Preparing {currentPhaseInfo.nextPhase} in {countdown}s...
          </p>
        </div>
        
        {/* Rankings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <span>🏆</span>
            <span>Current Rankings</span>
            <span className="text-white/40 text-sm font-normal ml-auto">After Phase {phase}</span>
          </h2>
          
          <div className="space-y-3">
            {rankings.map((player) => (
              <div
                key={player.name}
                className={`p-4 rounded-xl transition-all ${
                  player.isYou
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400 scale-105'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${
                      player.position === 1 ? 'bg-yellow-500 text-yellow-900' :
                      player.position === 2 ? 'bg-gray-300 text-gray-700' :
                      player.position === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : player.position}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {player.isYou && (
                            <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-white/60 text-sm">{player.rank}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
                      {player.score}
                    </div>
                    <div className="text-white/60 text-xs">score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Your Position Banner */}
        <div className={`rounded-xl p-4 text-center ${
          yourRank === 1 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
          yourRank <= 3 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
          'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}>
          <div className="text-white/90 text-sm mb-1">You&apos;re currently in</div>
          <div className="text-4xl font-bold text-white mb-1">
            {getMedalEmoji(yourRank)} Place
          </div>
          <div className="text-white/90 text-sm">
            {yourRank === 1 ? '🔥 Leading the pack!' : 
             yourRank === 2 ? '💪 Close to the top!' :
             yourRank === 3 ? '👍 In the top 3!' :
             '⚔️ Keep pushing!'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhaseRankingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading rankings...</div>
      </div>
    }>
      <PhaseRankingsContent />
    </Suspense>
  );
}

