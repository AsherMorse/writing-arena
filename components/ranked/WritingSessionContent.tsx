'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPromptById, getRandomPrompt } from '@/lib/utils/prompts';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import { createMatchState, submitPhase, listenToMatchState, areAllPlayersReady, simulateAISubmissions, clearAISubmissionTimers } from '@/lib/services/match-sync';
import { db } from '@/lib/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
export default function WritingSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const matchId = searchParams.get('matchId') || `match-${Date.now()}`;
  const scheduleStorageKey = `${matchId}-ai-submission-schedule`;
  const isLeader = searchParams.get('isLeader') === 'true';
  const { user, userProfile } = useAuth();
  const fallbackUserId = user?.uid || 'temp-user';
  const fallbackDisplayName = userProfile?.displayName || 'You';

  type PartyMember = {
    name: string;
    avatar: string;
    rank: string;
    userId?: string;
    wordCount: number;
    isYou: boolean;
    isAI: boolean;
  };
  
  // Get prompt from library by ID, or random if not found (memoized to prevent re-shuffling)
  const [prompt] = useState(() => {
    const currentPrompt = promptId ? getPromptById(promptId) : undefined;
    const selectedPrompt = currentPrompt || getRandomPrompt();
    console.log('📝 SESSION - Using prompt:', { id: selectedPrompt.id, title: selectedPrompt.title, type: selectedPrompt.type });
    return selectedPrompt;
  });

  // Restore session state from sessionStorage if exists
  const [sessionStartTime] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-startTime`);
    if (stored) {
      return parseInt(stored);
    }
    const now = Date.now();
    sessionStorage.setItem(`${matchId}-startTime`, now.toString());
    return now;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    // Calculate remaining time based on session start time
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const remaining = Math.max(0, 120 - elapsed);
    console.log('⏱️ SESSION - Time calculation:', { elapsed, remaining });
    return remaining;
  });

  const [writingContent, setWritingContent] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-content`);
    return stored || '';
  });

  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(() => {
    // Show notice if content was restored
    const stored = sessionStorage.getItem(`${matchId}-content`);
    return stored && stored.length > 0;
  });
  
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-submitted`);
    return stored === 'true';
  });
  
  const [playersReady, setPlayersReady] = useState(0);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<string[]>([]);
  const [matchInitialized, setMatchInitialized] = useState(false);
  const [aiWritingsGenerated, setAiWritingsGenerated] = useState(false);
  const aiProgressIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const aiScheduleRef = useRef<Record<string, { submitAt: number; finalWords: number }>>({});
  const hasAutoProceededRef = useRef(false);
  const navigatedToPhase1Ref = useRef(false);

  const userRank = userProfile?.currentRank || 'Silver III';
  const userAvatar = typeof userProfile?.avatar === 'string' ? userProfile.avatar : '🌿';

  // Load party members from sessionStorage (set by matchmaking page)
  const [partyMembers] = useState<PartyMember[]>(() => {
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
      { name: 'You', avatar: userAvatar, rank: userRank, userId: fallbackUserId, wordCount: 0, isYou: true, isAI: false },
      { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', userId: 'ai-fallback-1', wordCount: 0, isYou: false, isAI: true },
      { name: 'WordMaster', avatar: '📖', rank: 'Silver III', userId: 'ai-fallback-2', wordCount: 0, isYou: false, isAI: true },
      { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', userId: 'ai-fallback-3', wordCount: 0, isYou: false, isAI: true },
      { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', userId: 'ai-fallback-4', wordCount: 0, isYou: false, isAI: true },
    ];
  });

  const otherMembers = partyMembers.slice(1);
  const [aiWordCounts, setAiWordCounts] = useState<number[]>(otherMembers.map(() => 0));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    navigatedToPhase1Ref.current = sessionStorage.getItem(`${matchId}-phase1-complete`) === 'true';
  }, [matchId]);

  const membersWithCounts = [
    { ...partyMembers[0], wordCount },
    ...otherMembers.map((member, index) => ({
      ...member,
      wordCount: member.isAI ? (aiWordCounts[index] || 0) : member.wordCount || 0,
    })),
  ];
  const selfMember = partyMembers.find(member => member.isYou) || partyMembers[0];
  const selfPlayerId = selfMember?.userId || fallbackUserId;
  const selfPlayerName = selfMember?.name || fallbackDisplayName;
  const selfPlayerRank = selfMember?.rank || userRank;

  const clearAiProgressIntervals = () => {
    aiProgressIntervalsRef.current.forEach(interval => clearInterval(interval));
    aiProgressIntervalsRef.current = [];
  };

  const updateAiWordCountAtIndex = (index: number, value: number) => {
    setAiWordCounts(prev => {
      if (prev[index] === value) {
        return prev;
      }
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const scheduleAiWordProgress = (memberIndex: number, finalWords: number, submitAt: number) => {
    const adjustedFinal = Number.isFinite(finalWords) && finalWords > 0 ? finalWords : 60;
    const totalDuration = Math.max(submitAt - sessionStartTime, 1000);
    const now = Date.now();

    if (now >= submitAt) {
      updateAiWordCountAtIndex(memberIndex, Math.round(adjustedFinal));
      return;
    }

    const elapsedRatio = Math.max(0, Math.min(1, (now - sessionStartTime) / totalDuration));
    updateAiWordCountAtIndex(memberIndex, Math.round(adjustedFinal * elapsedRatio));

    const interval = setInterval(() => {
      const current = Date.now();
      if (current >= submitAt) {
        updateAiWordCountAtIndex(memberIndex, Math.round(adjustedFinal));
        clearInterval(interval);
        return;
      }

      const ratio = Math.max(0, Math.min(1, (current - sessionStartTime) / totalDuration));
      updateAiWordCountAtIndex(memberIndex, Math.round(adjustedFinal * ratio));
    }, 1000);

    aiProgressIntervalsRef.current.push(interval);
  };

  const initializeAiProgress = (aiWritingsData: any[], shouldScheduleSubmissions: boolean) => {
    try {
      const stored = sessionStorage.getItem(scheduleStorageKey);
      let schedule: Record<string, { submitAt: number; finalWords: number }> = {};
      if (stored) {
        try {
          schedule = JSON.parse(stored);
        } catch {
          schedule = {};
        }
      }
      if (!schedule || typeof schedule !== 'object') {
        schedule = {};
      }

      const newWordCounts = otherMembers.map(member => (member.isAI ? 0 : member.wordCount || 0));
      setAiWordCounts(newWordCounts);
      clearAiProgressIntervals();

      const delaysForSimulation: Record<string, number> = {};

      otherMembers.forEach((member, index) => {
        if (!member.userId || !member.isAI) {
          return;
        }

        const writing = aiWritingsData.find((w: any) => w.playerId === member.userId);
        const finalWords = writing?.wordCount ?? 60;

        if (!schedule[member.userId]) {
          const delay = 30000 + Math.random() * 90000;
          schedule[member.userId] = {
            submitAt: sessionStartTime + delay,
            finalWords,
          };
        } else {
          schedule[member.userId].finalWords = finalWords;
          if (!schedule[member.userId].submitAt) {
            schedule[member.userId].submitAt = sessionStartTime + 30000;
          }
        }

        const submitAt = schedule[member.userId].submitAt;
        scheduleAiWordProgress(index, schedule[member.userId].finalWords, submitAt);
        delaysForSimulation[member.userId] = Math.max(0, submitAt - Date.now());
      });

      sessionStorage.setItem(scheduleStorageKey, JSON.stringify(schedule));
      aiScheduleRef.current = schedule;

      if (shouldScheduleSubmissions && Object.keys(delaysForSimulation).length > 0) {
        simulateAISubmissions(matchId, 1, delaysForSimulation);
      }
    } catch (error) {
      console.error('❌ SESSION - Failed to initialize AI progress:', error);
    }
  };

  // Initialize match state on mount (or restore if exists)
  useEffect(() => {
    if (!user || !userProfile || matchInitialized) return;
    
    const initMatch = async () => {
      console.log('🎮 SESSION - Initializing/restoring match state, isLeader:', isLeader);
      try {
        // Check if match already exists in Firestore
        const matchRef = doc(db, 'matchStates', matchId);
        const matchSnap = await getDoc(matchRef);
        
        if (matchSnap.exists()) {
          console.log('✅ SESSION - Match state found, restoring...');
          setMatchInitialized(true);
          setAiWritingsGenerated(true); // AI writings were already generated
          return;
        }
        
        // If not leader, wait for leader to create match state
        if (!isLeader) {
          console.log('👤 SESSION - I am follower, waiting for leader to create match state...');
          
          // Poll for match state to exist (max 15 seconds)
          let attempts = 0;
          const maxAttempts = 30; // 15 seconds
          
          const waitForMatch = async (): Promise<void> => {
            const snap = await getDoc(matchRef);
            if (snap.exists()) {
              console.log('✅ SESSION - Leader created match state!');
              setMatchInitialized(true);
              setAiWritingsGenerated(true);
              return;
            }
            
            attempts++;
            if (attempts >= maxAttempts) {
              console.warn('⚠️ SESSION - Timeout waiting for leader, creating match anyway...');
              // Fallback: create match ourselves
        await createMatchState(
          matchId,
          partyMembers.map((p: any) => ({
            userId: p.userId || (p.isYou ? selfPlayerId : `ai-${p.name}`),
            displayName: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isAI: p.isAI || !p.isYou
          })),
          1,
          120
        );
              setMatchInitialized(true);
              return;
            }
            
            // Try again in 500ms
            setTimeout(() => waitForMatch(), 500);
          };
          
          await waitForMatch();
          return;
        }
        
        // Create new match state (only if leader)
        console.log('👑 SESSION - I am leader, creating new match state');
        await createMatchState(
          matchId,
          partyMembers.map((p: any) => ({
            userId: p.userId || (p.isYou ? selfPlayerId : `ai-${p.name}`),
            displayName: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isAI: p.isAI || !p.isYou
          })),
          1,
          120
        );
        
        // Simulate AI submissions (they finish randomly within 2-min window)
        
        setMatchInitialized(true);
      } catch (error) {
        console.error('❌ SESSION - Failed to init match:', error);
      }
    };
    
    initMatch();
  }, [user, userProfile, matchId, matchInitialized, partyMembers, isLeader, selfPlayerId]);

  // Generate AI writings when match initializes (or restore if exists)
  useEffect(() => {
    if (!matchInitialized || aiWritingsGenerated) return;
    
    const generateAIWritings = async () => {
      console.log('🤖 SESSION - Checking for existing AI writings...');
      
      try {
        // Check if AI writings already exist
        const matchRef = doc(db, 'matchStates', matchId);
        const matchDoc = await getDoc(matchRef);
        
        if (matchDoc.exists()) {
          const matchState = matchDoc.data();
          const existingWritings = matchState?.aiWritings?.phase1;
          
          if (existingWritings && existingWritings.length > 0) {
            console.log('✅ SESSION - Found existing AI writings, restoring...');
            initializeAiProgress(existingWritings, isLeader);
            setAiWritingsGenerated(true);
            return;
          }
        }
        
        // Generate new AI writings
        console.log('🤖 SESSION - Generating new AI writings...');
        setAiWritingsGenerated(true);
        
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
        await updateDoc(matchRef, {
          'aiWritings.phase1': aiWritings,
        });
        
        // Update AI word counts for UI
        initializeAiProgress(aiWritings, isLeader);
        setAiWritingsGenerated(true);
        console.log('✅ SESSION - All AI writings generated and stored');
      } catch (error) {
        console.error('❌ SESSION - Failed to generate AI writings:', error);
        const fallbackCounts = [40, 55, 48, 62];
        const fallbackWritings = otherMembers
          .filter(member => member.isAI)
          .map((member, index) => ({
            playerId: member.userId || `ai-fallback-${index}`,
            wordCount: fallbackCounts[index] || 50,
          }));
        initializeAiProgress(fallbackWritings, isLeader);
        setAiWritingsGenerated(true);
      }
    };
    
    generateAIWritings();
  }, [matchInitialized, aiWritingsGenerated, matchId, partyMembers, prompt]);

  // Listen for match state updates
  useEffect(() => {
    if (!matchInitialized) return;
    
    const unsubscribe = listenToMatchState(matchId, (matchState) => {
      if ((matchState as any)?.phase && (matchState as any).phase > 1) {
        return;
      }
      const ready = areAllPlayersReady(matchState, 1, true);
      let submittedIds = matchState.submissions?.phase1 || [];
      if (hasSubmitted && selfPlayerId && !submittedIds.includes(selfPlayerId)) {
        submittedIds = [...submittedIds, selfPlayerId];
      }
      setSubmittedPlayerIds(submittedIds);
      setPlayersReady(submittedIds.length);

      if (ready && hasSubmitted && !navigatedToPhase1Ref.current) {
        console.log('🎉 SESSION - All players ready, moving to rankings!');
        unsubscribe();
        proceedToRankings();
        hasAutoProceededRef.current = true;
      }
    });
    
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchInitialized, hasSubmitted, matchId, selfPlayerId]);

  useEffect(() => {
    if (
      !hasAutoProceededRef.current &&
      hasSubmitted &&
      partyMembers.length > 0 &&
      playersReady >= partyMembers.length &&
      !navigatedToPhase1Ref.current
    ) {
      hasAutoProceededRef.current = true;
      proceedToRankings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted, playersReady, partyMembers.length]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !hasSubmitted) {
      // Time's up - show ranking modal then auto submit
      setShowRankingModal(true);
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, hasSubmitted]);

  // Hide restored notice after 3 seconds
  useEffect(() => {
    if (showRestoredNotice) {
      const timer = setTimeout(() => setShowRestoredNotice(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showRestoredNotice]);

  // Persist writing content to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`${matchId}-content`, writingContent);
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent, matchId]);

  useEffect(() => {
    return () => {
      clearAiProgressIntervals();
    };
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
    if (navigatedToPhase1Ref.current) {
      return;
    }
    navigatedToPhase1Ref.current = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`${matchId}-phase1-complete`, 'true');
    }
    const encodedContent = encodeURIComponent(writingContent);
    const yourScore = sessionStorage.getItem(`${matchId}-phase1-score`) || '75';
    console.log('🚀 SESSION - Proceeding to rankings with score:', yourScore);
    router.push(`/ranked/phase-rankings?phase=1&matchId=${matchId}&trait=${trait}&promptId=${prompt.id}&promptType=${prompt.type}&content=${encodedContent}&wordCount=${wordCount}&aiScores=${aiWordCounts.join(',')}&yourScore=${yourScore}`);
  };

  const handleSubmit = async () => {
    if (hasSubmitted) return;
    if (!selfPlayerId) return;
    
    console.log('📤 SESSION - Submitting for batch ranking...');
    setHasSubmitted(true);
    setSubmittedPlayerIds(prev => {
      if (prev.includes(selfPlayerId)) {
        return prev;
      }
      const next = [...prev, selfPlayerId];
      setPlayersReady(prevReady => Math.max(prevReady, next.length));
      return next;
    });
    sessionStorage.setItem(`${matchId}-submitted`, 'true');
    
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
          playerId: selfPlayerId,
          playerName: selfPlayerName,
          content: writingContent,
          wordCount: wordCount,
          isAI: false,
          rank: selfPlayerRank,
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
      const yourRanking = rankings.find((r: any) => r.playerId === selfPlayerId);
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
      await submitPhase(matchId, selfPlayerId, 1, Math.round(yourScore), {
        strengths: yourRanking.strengths || [],
        improvements: yourRanking.improvements || [],
        traitFeedback: yourRanking.traitFeedback || {},
      });
      
      // Check if all ready immediately (might be last player)
      const updatedMatchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (updatedMatchDoc.exists()) {
        const updatedMatchState = updatedMatchDoc.data();
        if (areAllPlayersReady(updatedMatchState as any, 1, true)) {
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
        
        await submitPhase(matchId, selfPlayerId, 1, Math.round(yourScore), {
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          nextSteps: data.nextSteps || [],
          specificFeedback: data.specificFeedback || {},
        });
      } catch (fallbackError) {
        console.error('❌ SESSION - Even fallback failed:', fallbackError);
        // Check if submission is empty
        const isEmpty = !writingContent || writingContent.trim().length === 0 || wordCount === 0;
        const yourScore = isEmpty ? 0 : Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
        sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
        await submitPhase(matchId, selfPlayerId, 1, Math.round(yourScore)).catch(console.error);
      }
    }
  };

  const handleDebugAutoWrite = async () => {
    try {
      console.log('🐞 SESSION - Debug auto write triggered');
      const response = await fetch('/api/generate-ai-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.description,
          promptType: prompt.type,
          rank: userRank,
          playerName: userProfile?.displayName || 'You',
        }),
      });

      const data = await response.json();
      setWritingContent(data.content || '');
    } catch (error) {
      console.error('🐞 SESSION - Debug auto write failed:', error);
    }
  };

  const handleDebugForceEndPhase = async () => {
    try {
      console.log('🐞 SESSION - Debug force end triggered');
      await handleSubmit();
      clearAISubmissionTimers(matchId, 1);

      const matchRef = doc(db, 'matchStates', matchId);
      const matchDoc = await getDoc(matchRef);
      if (!matchDoc.exists()) return;

      const matchState = matchDoc.data();
      const submissions: string[] = matchState?.submissions?.phase1 || [];
      const players: any[] = matchState?.players || [];
      const pendingAI = players.filter(
        (player: any) => player.isAI && !submissions.includes(player.userId)
      );

      for (const aiPlayer of pendingAI) {
        const aiScore = Math.round(65 + Math.random() * 25);
        await submitPhase(matchId, aiPlayer.userId, 1, aiScore).catch(console.error);
        console.log('🐞 SESSION - Debug forced AI submission for', aiPlayer.displayName);
      }

      const updatedDoc = await getDoc(matchRef);
      if (updatedDoc.exists()) {
        const updatedState = updatedDoc.data() as any;
        if (areAllPlayersReady(updatedState, 1, true)) {
          proceedToRankings();
        }
      }
    } catch (error) {
      console.error('🐞 SESSION - Debug force end failed:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detail = {
      primary: { label: 'Auto Write Response', eventName: 'debug-phase-primary-action' },
      secondary: { label: 'End Current Phase', eventName: 'debug-phase-secondary-action' },
    };
    window.dispatchEvent(new CustomEvent('debug-phase-actions', { detail }));
    return () => {
      window.dispatchEvent(new CustomEvent('debug-phase-actions', { detail: null }));
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePrimary = () => {
      handleDebugAutoWrite();
    };
    const handleSecondary = () => {
      handleDebugForceEndPhase();
    };
    window.addEventListener('debug-phase-primary-action', handlePrimary);
    window.addEventListener('debug-phase-secondary-action', handleSecondary);
    return () => {
      window.removeEventListener('debug-phase-primary-action', handlePrimary);
      window.removeEventListener('debug-phase-secondary-action', handleSecondary);
    };
  }, [handleDebugAutoWrite, handleSubmit]);

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
        partyMembers={partyMembers}
        submittedPlayerIds={submittedPlayerIds}
        matchId={matchId}
      />
    );
  }
 
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Ranking Modal */}
      {showRankingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-emerald-400/30 bg-[#141e27] p-12 shadow-2xl text-center max-w-md mx-4">
            <div className="text-6xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-3">Time&apos;s Up!</h2>
            <p className="text-white/70 text-lg mb-6">
              Reviewing and ranking all submissions...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
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
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#1b1f24]/60">
                <span>Draft in progress</span>
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={writingContent.trim().length === 0}
                    className={`rounded-xl border px-4 py-2 text-[11px] font-semibold transition ${
                      writingContent.trim().length === 0
                        ? 'border-[#1b1f24]/10 bg-[#1b1f24]/5 text-[#1b1f24]/40 cursor-not-allowed'
                        : 'border-emerald-400/50 bg-emerald-500/10 text-emerald-500 hover:border-emerald-300 hover:bg-emerald-500/20'
                    }`}
                  >
                    Submit draft
                  </button>
                </div>
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
              {showRestoredNotice && (
                <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-lg animate-in fade-in slide-in-from-top">
                  ✓ Session restored - your progress was saved
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Squad tracker</div>
              <div className="mt-5 space-y-4">
                {membersWithCounts.map((member, index) => (
                  <div key={`${member.userId || member.name}-${index}`} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
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

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-4 text-sm text-white/60">
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
              <div className="space-y-2 text-xs text-white/70">
                {partyMembers.map((member, index) => {
                  const isSubmitted = member.userId ? submittedPlayerIds.includes(member.userId) : false;
                  return (
                    <div
                      key={`${member.userId || member.name}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/0 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c141d] text-base">
                          {member.avatar}
                        </div>
                        <div className="text-white/80">{member.name}</div>
                      </div>
                      <div className={`text-xs font-semibold ${isSubmitted ? 'text-emerald-300' : 'text-white/40'}`}>
                        {isSubmitted ? 'Submitted' : 'Waiting'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

