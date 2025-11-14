'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPromptById, getRandomPrompt } from '@/lib/utils/prompts';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import { createMatchState, submitPhase, listenToMatchState, areAllPlayersReady, simulateAISubmissions } from '@/lib/services/match-sync';
import { db } from '@/lib/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
export default function WritingSessionContent() {
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

  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for Phase 1
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

  const membersWithCounts = [
    { ...partyMembers[0], wordCount },
    ...aiWordCounts.map((count, index) => ({
      ...partyMembers[index + 1],
      wordCount: count,
    })),
  ];

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
          120 // 2 minutes
        );
        
        // Simulate AI submissions (they finish randomly within 2-min window)
        simulateAISubmissions(matchId, 1, Math.random() * 60000 + 60000); // 1-2 min
        
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
    if (timeLeft > 0) {
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
        const increase = Math.floor(Math.random() * 3) + 1; // Slower for 2-min session
        return Math.min(count + increase, 100); // Max 100 words for 2-min
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
    if (timeLeft > 60) return 'text-green-400';
    if (timeLeft > 30) return 'text-yellow-400';
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
    <div className="min-h-screen bg-[#0c141d] text-white">
      <WritingTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={prompt.type}
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeLeft)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase 1 · Draft</div>
              <div className={`text-sm font-semibold ${timeLeft > 0 ? getTimeColor() : 'text-red-400'}`}>
                {timeLeft > 0 ? 'Time remaining' : 'Time expired'}
              </div>
            </div>
            <div className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Ranked circuit
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
              <span className="font-semibold text-white">{wordCount}</span> words
            </div>
            <button
              onClick={() => setShowTipsModal(true)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Writing tips
            </button>
          </div>
        </div>
        <div className="mx-auto h-1.5 max-w-6xl rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${timeLeft > 60 ? 'bg-emerald-400' : timeLeft > 30 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${(timeLeft / 120) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.4fr,0.7fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{prompt.image}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{prompt.title}</h2>
                    <span className="text-[11px] uppercase text-white/40">{prompt.type}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{prompt.description}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-4 text-sm text-white/60">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase reminders</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Aim for 60+ words in 2 minutes. Quality over quantity—focus on clarity.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Start with your main idea, then add one supporting detail quickly.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Save 20 seconds for a quick proofread—catch obvious mistakes.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative rounded-3xl border border-white/10 bg-white p-6 text-[#1b1f24] shadow-xl">
              <div className="flex items-center justify-between text-xs text-[#1b1f24]/60">
                <span>Draft in progress</span>
                <span>{wordCount} words</span>
              </div>
              <textarea
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
                onPaste={handlePaste}
                onCopy={handleCut}
                onCut={handleCut}
                placeholder="Start writing your response..."
                className="mt-4 h-[420px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
                autoFocus
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                spellCheck="true"
              />
              {showPasteWarning && (
                <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-200 shadow-lg">
                  Paste disabled during ranked drafts
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Squad tracker</div>
              <div className="mt-5 space-y-4">
                {membersWithCounts.map((member, index) => (
                  <div key={member.name} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c141d] text-xl">
                          {member.avatar}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${member.isYou ? 'text-white' : 'text-white/80'}`}>{member.name}</div>
                          <div className="text-[11px] text-white/50">{member.rank}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold text-white">
                        {member.wordCount}
                        <span className="ml-1 text-xs text-white/50">w</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className={`${member.isYou ? 'bg-emerald-300' : 'bg-white/40'} h-full rounded-full`}
                        style={{ width: `${Math.min((member.wordCount / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] uppercase text-white/40">Slot {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-3 text-sm text-white/60">
              <div className="flex items-center justify-between">
                <span>Submissions received</span>
                <span className="font-semibold text-white">{playersReady} / {partyMembers.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${(playersReady / partyMembers.length) * 100}%` }}
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                Stay until all teammates submit. Leaving early forfeits LP and streak bonuses.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

