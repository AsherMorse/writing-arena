'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPromptById, getRandomPrompt } from '@/lib/prompts';
import WritingTipsModal from '@/components/WritingTipsModal';
import WaitingForPlayers from '@/components/WaitingForPlayers';
import { createMatchState, submitPhase, listenToMatchState, areAllPlayersReady, simulateAISubmissions } from '@/lib/match-sync';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function RankedSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const matchId = searchParams.get('matchId') || `match-${Date.now()}`;
  const { user, userProfile } = useAuth();
  
  // Get prompt from library by ID, or random if not found (memoized to prevent re-shuffling)
  const [prompt] = useState(() => {
    const currentPrompt = promptId ? getPromptById(promptId) : undefined;
    const selectedPrompt = currentPrompt || getRandomPrompt();
    console.log('📝 SESSION - Using prompt:', { id: selectedPrompt.id, title: selectedPrompt.title, type: selectedPrompt.type });
    return selectedPrompt;
  });

  const [timeLeft, setTimeLeft] = useState(240);
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [playersReady, setPlayersReady] = useState(0);
  const [matchInitialized, setMatchInitialized] = useState(false);
  const [aiWritingsGenerated, setAiWritingsGenerated] = useState(false);

  const userRank = userProfile?.currentRank || 'Silver III';
  const userAvatar = typeof userProfile?.avatar === 'string' ? userProfile.avatar : '🌿';

  // Load party members from sessionStorage (set by matchmaking page)
  const [partyMembers] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-players`);
    if (stored) {
      try {
        const players = JSON.parse(stored);
        console.log('✅ SESSION - Loaded', players.length, 'party members from matchmaking');
        return players.map((p: any) => ({
          name: p.name,
          avatar: p.avatar,
          rank: p.rank,
          userId: p.userId,
          wordCount: 0,
          isYou: p.name === 'You',
          isAI: p.isAI,
        }));
      } catch (e) {
        console.warn('⚠️ SESSION - Failed to parse stored players');
      }
    }
    
    // Fallback to default party
    console.log('⚠️ SESSION - Using fallback party members');
    return [
      { name: 'You', avatar: userAvatar, rank: userRank, userId: user?.uid, wordCount: 0, isYou: true, isAI: false },
      { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', userId: 'ai-fallback-1', wordCount: 0, isYou: false, isAI: true },
      { name: 'WordMaster', avatar: '📖', rank: 'Silver III', userId: 'ai-fallback-2', wordCount: 0, isYou: false, isAI: true },
      { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', userId: 'ai-fallback-3', wordCount: 0, isYou: false, isAI: true },
      { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', userId: 'ai-fallback-4', wordCount: 0, isYou: false, isAI: true },
    ];
  });

  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);

  // Initialize match state on mount
  useEffect(() => {
    if (!user || !userProfile || matchInitialized) return;
    
    const initMatch = async () => {
      console.log('🎮 SESSION - Initializing match state');
      try {
        await createMatchState(
          matchId,
          partyMembers.map((p: any) => ({
            userId: p.userId || (p.isYou ? user.uid : `ai-${p.name}`),
            displayName: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isAI: p.isAI || !p.isYou
          })),
          1,
          240
        );
        
        // Simulate AI submissions (they finish randomly)
        simulateAISubmissions(matchId, 1, Math.random() * 120000 + 60000); // 1-3 min
        
        setMatchInitialized(true);
      } catch (error) {
        console.error('❌ SESSION - Failed to init match:', error);
      }
    };
    
    initMatch();
  }, [user, userProfile, matchId, matchInitialized, partyMembers]);

  // Generate AI writings when match initializes
  useEffect(() => {
    if (!matchInitialized || aiWritingsGenerated || !user) return;
    
    const generateAIWritings = async () => {
      console.log('🤖 SESSION - Generating AI writings...');
      setAiWritingsGenerated(true);
      
      try {
        // Get AI players (all except "You")
        const aiPlayers = partyMembers.filter((p: any) => !p.isYou);
        
        // Generate writing for each AI player in parallel
        const aiWritingPromises = aiPlayers.map(async (aiPlayer: any) => {
          const response = await fetch('/api/generate-ai-writing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: prompt.description,
              promptType: prompt.type,
              rank: aiPlayer.rank,
              playerName: aiPlayer.name,
            }),
          });
          
          const data = await response.json();
          console.log(`✅ Generated writing for ${aiPlayer.name}:`, data.wordCount, 'words');
          
          return {
            playerId: aiPlayer.userId || `ai-${aiPlayer.name}`,
            playerName: aiPlayer.name,
            content: data.content,
            wordCount: data.wordCount,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiWritings = await Promise.all(aiWritingPromises);
        
        // Store AI writings in Firestore
        const { updateDoc } = await import('firebase/firestore');
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, {
          'aiWritings.phase1': aiWritings,
        });
        
        // Update AI word counts for UI
        setAiWordCounts(aiWritings.map(w => w.wordCount));
        
        console.log('✅ SESSION - All AI writings generated and stored');
      } catch (error) {
        console.error('❌ SESSION - Failed to generate AI writings:', error);
        // Continue with fallback word counts
        setAiWordCounts([95, 103, 87, 112]);
      }
    };
    
    generateAIWritings();
  }, [matchInitialized, aiWritingsGenerated, user, matchId, partyMembers, prompt]);

  // Listen for match state updates
  useEffect(() => {
    if (!matchInitialized) return;
    
    const unsubscribe = listenToMatchState(matchId, (matchState) => {
      const ready = areAllPlayersReady(matchState, 1);
      const submitted = matchState.submissions?.phase1?.length || 0;
      setPlayersReady(submitted);
      
      // If all players ready and user has submitted, move to rankings
      if (ready && hasSubmitted) {
        console.log('🎉 SESSION - All players ready, moving to rankings!');
        unsubscribe();
        proceedToRankings();
      }
    });
    
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchInitialized, hasSubmitted, matchId]);

  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !hasSubmitted) {
      // Time's up - auto submit
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, hasSubmitted]);

  useEffect(() => {
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiWordCounts(prev => prev.map(count => {
        const increase = Math.floor(Math.random() * 5) + 2;
        return Math.min(count + increase, 250);
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 120) return 'text-green-400';
    if (timeLeft > 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const proceedToRankings = () => {
    const encodedContent = encodeURIComponent(writingContent);
    const yourScore = sessionStorage.getItem(`${matchId}-phase1-score`) || '75';
    console.log('🚀 SESSION - Proceeding to rankings with score:', yourScore);
    router.push(`/ranked/phase-rankings?phase=1&matchId=${matchId}&trait=${trait}&promptId=${prompt.id}&promptType=${prompt.type}&content=${encodedContent}&wordCount=${wordCount}&aiScores=${aiWordCounts.join(',')}&yourScore=${yourScore}`);
  };

  const handleSubmit = async () => {
    if (hasSubmitted || !user) return;
    
    console.log('📤 SESSION - Submitting for batch ranking...');
    setHasSubmitted(true);
    
    try {
      // Get AI writings from Firestore
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (!matchDoc.exists()) throw new Error('Match state not found');
      
      const matchState = matchDoc.data();
      const aiWritings = matchState?.aiWritings?.phase1 || [];
      
      if (aiWritings.length === 0) {
        console.warn('⚠️ SESSION - No AI writings found, falling back to individual evaluation');
        throw new Error('AI writings not available');
      }
      
      // Prepare all writings for batch ranking
      const allWritings = [
        {
          playerId: user.uid,
          playerName: userProfile?.displayName || 'You',
          content: writingContent,
          wordCount: wordCount,
          isAI: false,
          rank: userRank,
        },
        ...aiWritings
      ];
      
      console.log(`📊 SESSION - Batch ranking ${allWritings.length} writings...`);
      
      // Call batch ranking API
      const response = await fetch('/api/batch-rank-writings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writings: allWritings,
          prompt: prompt.description,
          promptType: prompt.type,
          trait: trait || 'all',
        }),
      });
      
      const data = await response.json();
      const rankings = data.rankings;
      
      console.log('✅ SESSION - Batch ranking complete:', rankings.length, 'players ranked');
      
      // Find your ranking
      const yourRanking = rankings.find((r: any) => r.playerId === user.uid);
      if (!yourRanking) throw new Error('Your ranking not found');
      
      const yourScore = yourRanking.score;
      const yourRank = yourRanking.rank;
      
      console.log(`🎯 SESSION - You ranked #${yourRank} with score ${yourScore}`);
      
      // Store ALL rankings in Firestore
      const { updateDoc } = await import('firebase/firestore');
      const matchRef = doc(db, 'matchStates', matchId);
      await updateDoc(matchRef, {
        'rankings.phase1': rankings,
      });
      
      // Save your score and feedback
      sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
      sessionStorage.setItem(`${matchId}-phase1-feedback`, JSON.stringify(yourRanking));
      
      // Submit to match state WITH full AI feedback
      await submitPhase(matchId, user.uid, 1, Math.round(yourScore), {
        strengths: yourRanking.strengths || [],
        improvements: yourRanking.improvements || [],
        traitFeedback: yourRanking.traitFeedback || {},
      });
      
      // Check if all ready immediately (might be last player)
      const updatedMatchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (updatedMatchDoc.exists()) {
        const updatedMatchState = updatedMatchDoc.data();
        if (areAllPlayersReady(updatedMatchState as any, 1)) {
          console.log('🎉 SESSION - Was last player, proceeding immediately!');
          proceedToRankings();
        } else {
          console.log('⏳ SESSION - Waiting for other players...');
        }
      }
      
    } catch (error) {
      console.error('❌ SESSION - Batch ranking failed, using fallback individual evaluation:', error);
      
      // Fallback to individual evaluation
      try {
        const response = await fetch('/api/analyze-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: writingContent,
            trait: trait || 'all',
            promptType: prompt.type,
          }),
        });
        
        const data = await response.json();
        const yourScore = data.overallScore || 75;
        console.log('✅ SESSION - Fallback evaluation complete, score:', yourScore);
        
        sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
        sessionStorage.setItem(`${matchId}-phase1-feedback`, JSON.stringify(data));
        
        await submitPhase(matchId, user.uid, 1, Math.round(yourScore), {
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          nextSteps: data.nextSteps || [],
          specificFeedback: data.specificFeedback || {},
        });
      } catch (fallbackError) {
        console.error('❌ SESSION - Even fallback failed:', fallbackError);
        const yourScore = Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
        sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
        await submitPhase(matchId, user.uid, 1, Math.round(yourScore)).catch(console.error);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 3000);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // Show waiting screen if user has submitted but not all players are ready
  if (hasSubmitted) {
    return (
      <WaitingForPlayers 
        phase={1}
        playersReady={playersReady}
        totalPlayers={partyMembers.length}
        timeRemaining={timeLeft}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Writing Tips Modal */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={prompt.type}
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Writing Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">💡</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Writing Tips
          </div>
        </div>
      </button>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/60">
                {timeLeft > 0 ? 'Time remaining' : 'Time\'s up!'}
              </div>
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                <span className="text-purple-400 text-sm font-semibold">🏆 RANKED</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-white/60">
                <span className="font-semibold text-white">{wordCount}</span> words
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
              >
                Finish Early
              </button>
            </div>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft > 120 ? 'bg-green-400' : timeLeft > 60 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(timeLeft / 240) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 sticky top-24">
              <h3 className="text-white font-bold mb-4 flex items-center space-x-2">
                <span>🏆</span>
                <span>Ranked Party</span>
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <div className="text-white font-semibold text-sm">You</div>
                        <div className="text-purple-400 text-xs">Silver III</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{wordCount}</div>
                      <div className="text-white/60 text-xs">words</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {aiWordCounts.map((count, index) => {
                  const member = partyMembers[index + 1];
                  return (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{member.avatar}</span>
                          <div>
                            <div className="text-white text-sm">{member.name}</div>
                            <div className="text-white/60 text-xs">{member.rank}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">{count}</div>
                          <div className="text-white/60 text-xs">words</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 transition-all duration-500"
                          style={{ width: `${Math.min((count / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-5xl">{prompt.image}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">{prompt.title}</h2>
                    <span className="text-white/40 text-xs uppercase tracking-wide">{prompt.type}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">{prompt.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-2xl min-h-[500px] relative">
              <textarea
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
                onPaste={handlePaste}
                onCut={handleCut}
                placeholder="Start writing your response..."
                className="w-full h-full min-h-[450px] text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif"
                autoFocus
              />
              
              {showPasteWarning && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top duration-200 border-2 border-red-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🚫</span>
                    <div>
                      <div className="font-bold">Paste Not Allowed</div>
                      <div className="text-sm text-white/90">Type your own work</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RankedSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    }>
      <RankedSessionContent />
    </Suspense>
  );
}

