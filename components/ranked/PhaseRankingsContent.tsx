'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { getMedalEmoji } from '@/lib/utils/rank-utils';

export default function PhaseRankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Current phase info
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
  
  // Writing Revolution concepts carousel
  const writingConcepts = useMemo(() => [
    {
      name: 'Sentence Expansion',
      tip: 'Use because, but, or so to show why things happen.',
      example: 'She opened the door because she heard a strange noise.',
      icon: '🔗',
    },
    {
      name: 'Appositives',
      tip: 'Add description using commas to provide extra information.',
      example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.',
      icon: '✏️',
    },
    {
      name: 'Five Senses',
      tip: 'Include what you see, hear, smell, taste, and feel.',
      example: 'The salty air stung my eyes while waves crashed loudly below.',
      icon: '👁️',
    },
    {
      name: 'Show, Don\'t Tell',
      tip: 'Use specific details instead of general statements.',
      example: 'Her hands trembled as she reached for the handle.',
      icon: '🎭',
    },
    {
      name: 'Transition Words',
      tip: 'Use signal words to connect ideas smoothly.',
      example: 'First, Then, However, Therefore, For example',
      icon: '➡️',
    },
    {
      name: 'Strong Conclusions',
      tip: 'End with a final thought that ties everything together.',
      example: 'For these reasons, it is clear that...',
      icon: '🎯',
    },
  ], []);

  // Fetch real rankings from Firestore if available
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
        
        if (rankings && rankings.length > 0) {
          console.log('✅ PHASE RANKINGS - Using real rankings from Firestore:', rankings.length, 'players');
          setRealRankings(rankings);
        } else {
          console.log('⚠️ PHASE RANKINGS - No real rankings found, will use fallback');
        }
      } catch (error) {
        console.error('❌ PHASE RANKINGS - Error fetching rankings:', error);
      }
    };
    
    fetchRankings();
  }, [matchId, phase]);

  // Generate rankings for current phase - Use real rankings if available, otherwise fallback
  const rankings = useMemo(() => {
    // If we have real rankings from batch evaluation, use those
    if (realRankings.length > 0) {
      console.log('📊 PHASE RANKINGS - Displaying real batch-ranked results');
      return realRankings.map((r, idx) => ({
        name: r.playerName || (r.isAI ? r.playerId : 'You'),
        avatar: r.isAI ? ['🎯', '📖', '✨', '🏅'][idx % 4] : '🌿',
        rank: r.isAI ? ['Silver II', 'Silver III', 'Silver II', 'Silver IV'][idx % 4] : 'Silver III',
        score: r.score,
        isYou: !r.isAI,
        position: r.rank,
      }));
    }
    
    // Fallback: Generate rankings (old behavior)
    console.log('⚠️ PHASE RANKINGS - Using fallback rankings generation');
    const score = parseFloat(
      phase === 1 ? yourScore : 
      phase === 2 ? feedbackScore || yourScore : 
      yourScore
    );
    
    const aiScoresArray = (aiScores || '0,0,0,0').split(',').map(Number);
    
    const rankedPlayers = [
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
    
    return rankedPlayers;
  }, [phase, yourScore, feedbackScore, aiScores, realRankings]); // Include realRankings to update when loaded
  
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
  
  // Rotate writing concepts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % writingConcepts.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [writingConcepts.length]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Navigate to next phase using sessionId
      if (phase === 1) {
        router.push(`/ranked/peer-feedback?sessionId=${sessionId}`);
      } else if (phase === 2) {
        router.push(`/ranked/revision?sessionId=${sessionId}`);
      }
    }
  }, [countdown, phase, router, sessionId]);
  
  // Medal emoji utility from lib/utils/rank-utils.ts
  
  return (
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center py-6 px-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3 animate-bounce">{currentPhaseInfo.icon}</div>
          <h1 className="text-3xl font-bold text-white mb-1">{currentPhaseInfo.title}</h1>
          <p className="text-white/70 text-sm mb-4">Current Standings</p>
          
          {/* Countdown Circle */}
          <div className="inline-flex items-center justify-center">
            <div className={`relative w-20 h-20 bg-gradient-to-br ${currentPhaseInfo.color} rounded-full flex items-center justify-center shadow-2xl`}>
              <span className="text-4xl font-bold text-white">{countdown}</span>
            </div>
          </div>
          <p className="text-white/60 mt-2 text-sm">
            Preparing {currentPhaseInfo.nextPhase} in {countdown}s...
          </p>
        </div>

        {/* Writing Revolution Carousel */}
        <div className="mb-4 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-400/30 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-2">
                <div className="text-2xl mr-2">{writingConcepts[currentTipIndex].icon}</div>
                <h3 className="text-lg font-bold text-white">
                  {writingConcepts[currentTipIndex].name}
                </h3>
              </div>
              
              <p className="text-white/90 text-sm text-center mb-3 leading-relaxed">
                {writingConcepts[currentTipIndex].tip}
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-emerald-300 text-xs font-semibold mb-1 text-center">Example:</div>
                <p className="text-white text-xs italic text-center leading-relaxed">
                  {writingConcepts[currentTipIndex].example}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center space-x-1.5 mt-3">
                {writingConcepts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentTipIndex 
                        ? 'bg-emerald-400 w-6' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to tip ${index + 1}`}
                  />
                ))}
              </div>

              <div className="text-center mt-2">
                <p className="text-white/40 text-xs">
                  💡 The Writing Revolution
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rankings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-3">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <span>🏆</span>
            <span>Current Rankings</span>
            <span className="text-white/40 text-xs font-normal ml-auto">After Phase {phase}</span>
          </h2>
          
          <div className="space-y-2">
            {rankings.map((player) => (
              <div
                key={player.name}
                className={`p-3 rounded-lg transition-all ${
                  player.isYou
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                      player.position === 1 ? 'bg-yellow-500 text-yellow-900' :
                      player.position === 2 ? 'bg-gray-300 text-gray-700' :
                      player.position === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : player.position}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-sm ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {player.isYou && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-500 text-white rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-white/60 text-xs">{player.rank}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xl font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
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
        <div className={`rounded-lg p-3 text-center ${
          yourRank === 1 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
          yourRank <= 3 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
          'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}>
          <div className="text-white/90 text-xs mb-1">You&apos;re currently in</div>
          <div className="text-3xl font-bold text-white mb-1">
            {getMedalEmoji(yourRank)} Place
          </div>
          <div className="text-white/90 text-xs">
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

