'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { getPromptById } from '@/lib/utils/prompts';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import { db } from '@/lib/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * WritingSessionContent - Migrated to new session architecture
 * 
 * CHANGES:
 * ✅ No more searchParams or URL-based state
 * ✅ No more sessionStorage scattered everywhere
 * ✅ Uses useSession hook for all state management
 * ✅ Clean navigation without URL params
 * ✅ Automatic reconnection support
 * ✅ Real-time synchronization
 */
export default function WritingSessionContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { user, userProfile } = useAuth();
  
  // NEW: Single hook handles all session management
  const {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
    submissionCount,
  } = useSession(sessionId);
  
  // UI state only (not persisted)
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [aiWritingsGenerated, setAiWritingsGenerated] = useState(false);
  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState(0);

  // Get prompt from session config (safe with optional chaining)
  const prompt = session ? getPromptById(session.config.promptId) : null;
  const trait = session?.config.trait || 'all';

  // Calculate players list from session
  const players = session ? Object.values(session.players) : [];
  
  // Debug logging
  useEffect(() => {
    if (session && players.length > 0) {
      console.log('👥 SESSION - Players in session:', players.length, players.map(p => p.displayName));
    }
  }, [session, players]);
  
  // Get submission tracking
  const { submitted, total } = submissionCount();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Generate AI writings once when session initializes
  useEffect(() => {
    if (!session || aiWritingsGenerated || !user || !prompt) return;
    
    const generateAIWritings = async () => {
      console.log('🤖 SESSION - Checking for existing AI writings...');
      
      try {
        // Check if AI writings already exist in matchStates (backward compatibility)
        const matchRef = doc(db, 'matchStates', session.matchId);
        const matchDoc = await getDoc(matchRef);
        
        if (matchDoc.exists()) {
          const matchState = matchDoc.data();
          const existingWritings = matchState?.aiWritings?.phase1;
          
          if (existingWritings && existingWritings.length > 0) {
            console.log('✅ SESSION - Found existing AI writings, restoring...');
            setAiWordCounts(existingWritings.map((w: any) => w.wordCount));
            setAiWritingsGenerated(true);
            return;
          }
        } else {
          // Create matchStates document for backward compatibility
          console.log('📝 SESSION - Creating matchStates document for backward compatibility...');
          const { setDoc } = await import('firebase/firestore');
          await setDoc(matchRef, {
            matchId: session.matchId,
            sessionId: session.sessionId,
            players: Object.values(session.players).map(p => ({
              userId: p.userId,
              displayName: p.displayName,
              avatar: p.avatar,
              rank: p.rank,
              isAI: p.isAI,
            })),
            phase: 1,
            createdAt: session.createdAt,
          });
        }
        
        // Generate new AI writings
        console.log('🤖 SESSION - Generating new AI writings...');
        
        // Get AI players
        const aiPlayers = players.filter(p => p.isAI);
        
        // Show loading state
        setGeneratingAI(true);
        console.log(`🎨 SESSION - Generating ${aiPlayers.length} AI writings...`);
        setAiWritingsGenerated(true);
        
        // Generate writing for each AI player in parallel
        const aiWritingPromises = aiPlayers.map(async (aiPlayer, index) => {
          const response = await fetch('/api/generate-ai-writing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: prompt.description,
              promptType: prompt.type,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const data = await response.json();
          console.log(`✅ Generated writing for ${aiPlayer.displayName}:`, data.wordCount, 'words');
          
          // Update progress
          setAiGenerationProgress(((index + 1) / aiPlayers.length) * 100);
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            content: data.content,
            wordCount: data.wordCount,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiWritings = await Promise.all(aiWritingPromises);
        
        // Store AI writings in matchStates for backward compatibility
        // Use setDoc with merge to create if doesn't exist
        const { setDoc } = await import('firebase/firestore');
        await setDoc(matchRef, {
          aiWritings: {
            phase1: aiWritings,
          },
        }, { merge: true });
        
        // Update AI word counts for UI
        setAiWordCounts(aiWritings.map(w => w.wordCount));
        setGeneratingAI(false);
        setAiGenerationProgress(100);
        
        console.log('✅ SESSION - All AI writings generated and stored');
        
        // AUTO-SUBMIT AI PLAYERS (they've "finished writing")
        // Submit each AI player's work to the session after a short delay (5-15 seconds)
        aiPlayers.forEach((aiPlayer, index) => {
          const delay = 5000 + Math.random() * 10000; // 5-15 seconds
          
          setTimeout(async () => {
            try {
              const aiWriting = aiWritings.find(w => w.playerId === aiPlayer.userId);
              if (!aiWriting) return;
              
              console.log(`🤖 SESSION - Auto-submitting for AI player: ${aiPlayer.displayName}`);
              
              // Submit directly to sessions collection
              const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
              const sessionRef = doc(db, 'sessions', session.sessionId);
              
              await updateDoc(sessionRef, {
                [`players.${aiPlayer.userId}.phases.phase1`]: {
                  submitted: true,
                  submittedAt: serverTimestamp(),
                  content: aiWriting.content,
                  wordCount: aiWriting.wordCount,
                  score: Math.round(60 + Math.random() * 30),
                },
                updatedAt: serverTimestamp(),
              });
              
              console.log(`✅ SESSION - AI player ${aiPlayer.displayName} submitted`);
            } catch (error) {
              console.error(`❌ SESSION - Failed to auto-submit AI player ${aiPlayer.displayName}:`, error);
            }
          }, delay);
        });
        
      } catch (error) {
        console.error('❌ SESSION - Failed to generate AI writings:', error);
        // Continue with fallback word counts
        setAiWordCounts([40, 55, 48, 62]);
        setAiWritingsGenerated(true);
      }
    };
    
    generateAIWritings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, aiWritingsGenerated, user, prompt]);

  // Realistic AI word count progression
  useEffect(() => {
    if (!session) return;
    
    const aiPlayers = players.filter(p => p.isAI);
    const targetCounts = aiPlayers.map(() => 80 + Math.floor(Math.random() * 30)); // Target: 80-110 words
    
    const interval = setInterval(() => {
      setAiWordCounts(prev => prev.map((count, i) => {
        const target = targetCounts[i] || 95;
        const hasSubmitted = session.players[aiPlayers[i]?.userId]?.phases.phase1?.submitted;
        
        if (hasSubmitted) {
          // Freeze at final count if submitted
          return target;
        }
        
        // Increment toward target at realistic pace (2-4 words per 2 seconds)
        const increase = 2 + Math.floor(Math.random() * 3);
        return Math.min(count + increase, target);
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [session, players]);
      
  // Update word count when content changes
  useEffect(() => {
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  // Auto-submit when time runs out
  // Add delay to prevent immediate submission on page load
  const [sessionLoadTime] = useState(Date.now());
  
  useEffect(() => {
    const sessionAge = Date.now() - sessionLoadTime;
    
    // Only auto-submit if:
    // 1. Time is actually 0
    // 2. User hasn't submitted
    // 3. Session exists
    // 4. Session has been loaded for at least 5 seconds (prevent immediate submit)
    if (timeRemaining === 0 && !hasSubmitted() && session && sessionAge > 5000) {
      console.log('⏰ SESSION - Time expired, auto-submitting...');
      // Don't show ranking modal - go straight to waiting screen
      // Ranking happens AFTER all players submit, not before
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, hasSubmitted, session]);

  // PHASE TRANSITION MONITOR
  // Cloud Functions handle transitions, but client-side fallback if Functions not responding
  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    
    // IMPORTANT: Only check if we're still in Phase 1
    if (session.config.phase !== 1) return;
    
    const allPlayers = Object.values(session.players);
    const realPlayers = allPlayers.filter(p => !p.isAI);
    const submittedRealPlayers = realPlayers.filter(p => p.phases.phase1?.submitted);
    
    console.log('🔍 PHASE MONITOR - Phase 1 submissions:', {
      currentPhase: session.config.phase,
      real: realPlayers.length,
      submitted: submittedRealPlayers.length,
      coordFlag: session.coordination.allPlayersReady,
    });
    
    // If all real players submitted but Cloud Function hasn't transitioned after 10 seconds
    if (submittedRealPlayers.length === realPlayers.length && !session.coordination.allPlayersReady) {
      console.log('⏱️ PHASE MONITOR - All submitted, waiting for Cloud Function to transition...');
      
      // Fallback: If Cloud Function doesn't respond in 10 seconds, do it client-side
      const fallbackTimer = setTimeout(async () => {
        console.warn('⚠️ FALLBACK - Cloud Function timeout, transitioning client-side...');
        
        try {
          const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
          const sessionRef = doc(db, 'sessions', session.sessionId);
          
          await updateDoc(sessionRef, {
            'coordination.allPlayersReady': true,
            'coordination.readyCount': submittedRealPlayers.length,
            'config.phase': 2,
            'config.phaseDuration': 90, // 1.5 minutes for peer feedback
            'timing.phase2StartTime': serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          console.log('✅ FALLBACK - Client-side transition to phase 2 complete');
        } catch (error) {
          console.error('❌ FALLBACK - Transition failed:', error);
        }
      }, 10000); // 10 second timeout
      
      // Cleanup if component unmounts
      return () => clearTimeout(fallbackTimer);
    }
  }, [session, hasSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 60) return 'text-green-400';
    if (timeRemaining > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleSubmit = async () => {
    if (hasSubmitted() || !user || !userProfile || !session || !prompt) return;
    
    console.log('📤 SESSION - Submitting for batch ranking...');
    
    // Check for empty submission
    const isEmpty = !writingContent || writingContent.trim().length === 0 || wordCount === 0;
    
    if (isEmpty) {
      console.warn('⚠️ SESSION - Empty submission detected, scoring as 0');
      
      // Submit with 0 score for empty content
      await submitPhase(1, {
        content: '',
        wordCount: 0,
        score: 0,
      });
      
      console.log('✅ SESSION - Empty submission recorded');
      return;
    }
    
    try {
      // Get AI writings from matchStates
      const matchDoc = await getDoc(doc(db, 'matchStates', session.matchId));
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
          playerName: userProfile.displayName || 'You',
          content: writingContent,
          wordCount: wordCount,
          isAI: false,
          rank: userProfile.currentRank || 'Silver III',
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
          trait: trait,
        }),
      });
      
      const data = await response.json();
      const rankings = data.rankings;
      
      console.log('✅ SESSION - Batch ranking complete:', rankings.length, 'players ranked');
      
      // Find your ranking
      const yourRanking = rankings.find((r: any) => r.playerId === user.uid);
      if (!yourRanking) throw new Error('Your ranking not found');
      
      const yourScore = yourRanking.score;
      
      console.log(`🎯 SESSION - You scored ${yourScore}`);
      
      // Store rankings in matchStates for backward compatibility
      const matchRef = doc(db, 'matchStates', session.matchId);
      const { setDoc } = await import('firebase/firestore');
      await setDoc(matchRef, {
        rankings: {
          phase1: rankings,
        },
      }, { merge: true });
      
      // NEW: Submit using session architecture
      await submitPhase(1, {
        content: writingContent,
        wordCount: wordCount,
        score: Math.round(yourScore),
      });
      
      console.log('✅ SESSION - Submission complete, waiting for others...');
      
    } catch (error) {
      console.error('❌ SESSION - Batch ranking failed, using fallback:', error);
      
      // Fallback to individual evaluation
      try {
        const response = await fetch('/api/analyze-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: writingContent,
            trait: trait,
            promptType: prompt.type,
          }),
        });
        
        const data = await response.json();
        const yourScore = data.overallScore || 75;
        
        await submitPhase(1, {
          content: writingContent,
          wordCount: wordCount,
          score: Math.round(yourScore),
        });
      } catch (fallbackError) {
        console.error('❌ SESSION - Even fallback failed:', fallbackError);
        const isEmpty = !writingContent || writingContent.trim().length === 0;
        const yourScore = isEmpty ? 0 : Math.min(Math.max(60 + (wordCount / 5), 40), 100);
        
        await submitPhase(1, {
          content: writingContent,
          wordCount: wordCount,
          score: Math.round(yourScore),
        });
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

  // Prepare members list with word counts
  // CONDITIONAL RENDERS AFTER ALL HOOKS
  
  // Loading state
  if (isReconnecting || !session || !prompt) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">
            {isReconnecting ? 'Reconnecting to session...' : 'Loading session...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-white text-2xl font-bold mb-2">Session Error</h1>
          <p className="text-red-200 mb-6">{error.message}</p>
          <a 
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  const membersWithCounts = players.map((player, index) => {
    const isYou = player.userId === user?.uid;
    const aiIndex = players.filter((p, i) => i < index && p.isAI).length;
    
    return {
      name: player.displayName,
      avatar: player.avatar,
      rank: player.rank,
      userId: player.userId,
      isYou,
      isAI: player.isAI,
      wordCount: isYou ? wordCount : (player.isAI ? aiWordCounts[aiIndex] || 0 : 0),
    };
  });

  // Show waiting screen if user has submitted
  if (hasSubmitted()) {
    // Convert session players to WaitingForPlayers format
    const partyMembers = players.map(p => ({
      name: p.displayName,
      userId: p.userId,
      avatar: p.avatar,
      rank: p.rank,
      isAI: p.isAI,
      isYou: p.userId === user?.uid,
    }));
    
    // Get list of players who have submitted
    const submittedPlayerIds = players
      .filter(p => p.phases.phase1?.submitted)
      .map(p => p.userId);
    
    return (
      <WaitingForPlayers 
        phase={1}
        playersReady={submitted}
        totalPlayers={total}
        timeRemaining={timeRemaining}
        partyMembers={partyMembers}
        submittedPlayerIds={submittedPlayerIds}
      />
    );
  }
 
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Removed confusing ranking modal - go straight to waiting screen */}
      
      <WritingTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={prompt.type}
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeRemaining)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase 1 · Draft</div>
              <div className={`text-sm font-semibold ${timeRemaining > 0 ? getTimeColor() : 'text-red-400'}`}>
                {timeRemaining > 0 ? 'Time remaining' : 'Time expired'}
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
            className={`h-full rounded-full ${timeRemaining > 60 ? 'bg-emerald-400' : timeRemaining > 30 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${(timeRemaining / 120) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <PhaseInstructions phase={1} />
        
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
                className="mt-4 h-[420px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                disabled={timeRemaining === 0}
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
            
            {/* No manual submit button - auto-submits when time expires */}
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center">
              <div className="text-white/60 text-sm mb-2">⏱️ Time-based submission</div>
              <div className="text-white font-semibold">
                {hasSubmitted() ? '✅ Submitted' : `Auto-submits in ${formatTime(timeRemaining)}`}
              </div>
              <div className="text-white/40 text-xs mt-2">
                Write until the timer expires. Your work will be automatically submitted.
                </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Squad tracker</div>
              <div className="mt-5 space-y-4">
                {membersWithCounts.map((member, index) => (
                  <div key={member.userId} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
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

            {/* Removed useless submissions card per user feedback */}
          </aside>
        </div>
      </main>
    </div>
  );
}
