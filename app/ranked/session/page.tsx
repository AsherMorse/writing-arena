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

  const userRank = userProfile?.currentRank || 'Silver III';
  const userAvatar = typeof userProfile?.avatar === 'string' ? userProfile.avatar : '🌿';

  const [partyMembers] = useState([
    { name: 'You', avatar: userAvatar, rank: userRank, wordCount: 0, isYou: true },
    { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', wordCount: 0, isYou: false },
    { name: 'WordMaster', avatar: '📖', rank: 'Silver III', wordCount: 0, isYou: false },
    { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', wordCount: 0, isYou: false },
    { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', wordCount: 0, isYou: false },
  ]);

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
          partyMembers.map(p => ({
            userId: p.isYou ? user.uid : `ai-${p.name}`,
            displayName: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isAI: !p.isYou
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
    
    console.log('📤 SESSION - Submitting Phase 1 for AI evaluation...');
    setHasSubmitted(true);
    
    try {
      // Call real AI API for Phase 1 evaluation
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: writingContent,
          trait: trait || 'all',
          promptType: prompt.type,
        }),
      });
      
      const data = await response.json();
      const yourScore = data.overallScore || 75;
      console.log('✅ SESSION - AI evaluation complete, score:', yourScore);
      
      // Save score temporarily
      sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
      
      // Submit to match state
      await submitPhase(matchId, user.uid, 1, Math.round(yourScore));
      
      // Check if all ready immediately (might be last player)
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (matchDoc.exists()) {
        const matchState = matchDoc.data();
        if (areAllPlayersReady(matchState as any, 1)) {
          console.log('🎉 SESSION - Was last player, proceeding immediately!');
          proceedToRankings();
        } else {
          console.log('⏳ SESSION - Waiting for other players...');
        }
      }
      
    } catch (error) {
      console.error('❌ SESSION - AI evaluation failed, using fallback');
      const yourScore = Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
      sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
      
      if (user) {
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
            <button
              onClick={handleSubmit}
              className="rounded-full bg-emerald-400 px-6 py-2 font-semibold text-[#0c141d] transition hover:bg-emerald-300"
            >
              Submit draft
            </button>
          </div>
        </div>
        <div className="mx-auto h-1.5 max-w-6xl rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${timeLeft > 120 ? 'bg-emerald-400' : timeLeft > 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${(timeLeft / 240) * 100}%` }}
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
                Hit 180 words to secure a consistency bonus and keep sentences active.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Focus on organization: outline intro, evidence, and closing before expanding.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Leave two minutes for a final pass; mechanical errors reduce LP gains.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 text-xs text-white/50">
              <div className="flex items-center justify-between">
                <span>Prompt context</span>
                <span>{trait ? trait : 'All traits'}</span>
              </div>
            </div>
            <div className="relative rounded-3xl border border-white/10 bg-white p-6 text-[#1b1f24] shadow-xl">
              <div className="flex items-center justify-between text-xs text-[#1b1f24]/60">
                <span>Draft in progress</span>
                <span>{wordCount} words</span>
              </div>
              <textarea
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
                onPaste={handlePaste}
                onCut={handleCut}
                placeholder="Start writing your response..."
                className="mt-4 h-[420px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
                autoFocus
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
                        style={{ width: `${Math.min((member.wordCount / 220) * 100, 100)}%` }}
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

export default function RankedSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading ranked session...
      </div>
    }>
      <RankedSessionContent />
    </Suspense>
  );
}

