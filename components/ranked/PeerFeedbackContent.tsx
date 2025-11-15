'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import { useAuth } from '@/contexts/AuthContext';
import { submitPhase, getAssignedPeer, listenToMatchState, simulateAISubmissions } from '@/lib/services/match-sync';

// Mock peer writings - in reality, these would come from other players
const MOCK_PEER_WRITINGS = [
  {
    id: 'peer1',
    author: 'ProWriter99',
    avatar: '🎯',
    rank: 'Silver II',
    content: `The old lighthouse stood sentinel on the rocky cliff, its weathered stones telling stories of countless storms. Sarah had passed it every day on her way to school, never giving it much thought. But today was different. Today, the rusty door that had always been locked stood slightly ajar, and a mysterious golden light spilled from within.

Her curiosity got the better of her. She pushed the door open and stepped inside. The circular room was dusty and filled with old equipment, but in the center sat an ornate wooden chest she'd never seen before. As she approached, the chest began to glow...`,
    wordCount: 112
  },
  {
    id: 'peer2',
    author: 'WordMaster',
    avatar: '📖',
    rank: 'Silver III',
    content: `It was a normal Tuesday morning. I woke up, got dressed, and went to school like always. Nothing interesting ever happens in my small town. But then something weird happened.

At lunch, I found a strange coin in my sandwich. It was old and had weird symbols on it. When I touched it, everything around me started to shimmer and change. Suddenly I wasn't in the cafeteria anymore.

I was standing in a forest I'd never seen before. There were trees everywhere and strange birds singing. I had no idea how I got there or how to get back home.`,
    wordCount: 104
  }
];

export default function PeerFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const fallbackUserId = user?.uid || 'temp-user';
  const fallbackDisplayName = userProfile?.displayName || 'You';
  const matchId = searchParams.get('matchId') || '';
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = searchParams.get('wordCount') || '0';
  const aiScores = searchParams.get('aiScores') || '';
  const yourScore = searchParams.get('yourScore') || '75';

  const [timeLeft, setTimeLeft] = useState(60); // 1 minute for peer feedback
  const [currentPeer, setCurrentPeer] = useState<any>(null);
  const [loadingPeer, setLoadingPeer] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedbackGenerated, setAiFeedbackGenerated] = useState(false);
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<string[]>([]);
  const [isLeaderClient, setIsLeaderClient] = useState(false);
  const [waitingForRankings, setWaitingForRankings] = useState(false);
  const rankingUrlKey = matchId ? `${matchId}-phase2-ranking-url` : null;
  const [pendingRankingUrl, setPendingRankingUrl] = useState<string | null>(null);
  const phase2StartKey = matchId ? `${matchId}-phase2-startTime` : null;
  const phase2ScheduleKey = matchId ? `${matchId}-phase2-ai-schedule` : null;
  const [phase2StartTime, setPhase2StartTime] = useState(Date.now());
  const aiScheduleRef = useRef<Record<string, number>>({});
  
  // Feedback questions and responses
  const [responses, setResponses] = useState({
    clarity: '',
    strengths: '',
    improvements: '',
    organization: '',
    engagement: ''
  });

  const getFallbackParty = () => ([
    { name: 'You', avatar: '🌿', rank: 'Silver III', userId: fallbackUserId, isYou: true, isAI: false },
    { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', userId: 'ai-fallback-1', isAI: true },
    { name: 'WordMaster', avatar: '📖', rank: 'Silver III', userId: 'ai-fallback-2', isAI: true },
    { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', userId: 'ai-fallback-3', isAI: true },
    { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', userId: 'ai-fallback-4', isAI: true },
  ]);

  useEffect(() => {
    if (typeof window === 'undefined' || !matchId) return;
    try {
      const stored = sessionStorage.getItem(`${matchId}-players`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPartyMembers(parsed);
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ PEER FEEDBACK - Failed to load party members from storage', error);
    }
    setPartyMembers(getFallbackParty());
  }, [matchId, user]);

  useEffect(() => {
    if (typeof window === 'undefined' || !matchId) return;
    const storedLeader = sessionStorage.getItem(`${matchId}-isLeader`);
    if (storedLeader) {
      setIsLeaderClient(storedLeader === 'true');
    }
  }, [matchId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !matchId || !phase2StartKey) return;
    const stored = sessionStorage.getItem(phase2StartKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        setPhase2StartTime(parsed);
        return;
      }
    }
    const now = Date.now();
    sessionStorage.setItem(phase2StartKey, now.toString());
    setPhase2StartTime(now);
  }, [matchId, phase2StartKey]);

  const fallbackParty = getFallbackParty();
  const resolvedMembers = partyMembers.length > 0 ? partyMembers : fallbackParty;
  const selfMember = resolvedMembers.find(member => member.isYou) || resolvedMembers[0];
  const selfPlayerId = selfMember?.userId || fallbackUserId;
  const selfPlayerName = selfMember?.name || fallbackDisplayName;

  useEffect(() => {
    if (typeof window === 'undefined' || !rankingUrlKey) return;
    const stored = sessionStorage.getItem(rankingUrlKey);
    if (stored) {
      setPendingRankingUrl(stored);
    }
  }, [rankingUrlKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !phase2ScheduleKey) return;
    const storedSchedule = sessionStorage.getItem(phase2ScheduleKey);
    if (storedSchedule) {
      try {
        const parsed = JSON.parse(storedSchedule);
        if (parsed && typeof parsed === 'object') {
          aiScheduleRef.current = parsed;
        }
      } catch (error) {
        console.warn('[P2DB] Failed to parse phase2 AI schedule', error);
      }
    }
  }, [phase2ScheduleKey]);

  // Load assigned peer's writing
  useEffect(() => {
    const loadPeerWriting = async () => {
      if (!matchId) {
        setLoadingPeer(false);
        return;
      }
      
      console.log('👥 PEER FEEDBACK - Loading assigned peer writing...');
      try {
        const assignedPeer = await getAssignedPeer(matchId, selfPlayerId);
        
        if (assignedPeer) {
          console.log('✅ PEER FEEDBACK - Loaded peer:', assignedPeer.displayName);
          setCurrentPeer({
            id: assignedPeer.userId,
            author: assignedPeer.displayName,
            avatar: '📝',
            rank: 'Silver III',
            content: assignedPeer.writing,
            wordCount: assignedPeer.wordCount,
          });
        } else {
          console.warn('⚠️ PEER FEEDBACK - No assigned peer found, using fallback');
          setCurrentPeer(MOCK_PEER_WRITINGS[0]);
        }
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Error loading peer:', error);
        setCurrentPeer(MOCK_PEER_WRITINGS[0]);
      } finally {
        setLoadingPeer(false);
      }
    };
    
    loadPeerWriting();
  }, [matchId, selfPlayerId]);

  useEffect(() => {
    if (!matchId) return;
    console.log('[P2DB] Listening to match state updates for Phase 2, matchId:', matchId);
    const unsubscribe = listenToMatchState(matchId, (matchState) => {
      let submissions = matchState.submissions?.phase2 || [];
      const totalPlayers = matchState.players?.length || 0;
      console.log('[P2DB] Match state update', {
        phase: matchState.phase,
        phase2Submitted: submissions.length,
        totalPlayers,
      });

      const selfSubmittedFlag =
        typeof window !== 'undefined' &&
        sessionStorage.getItem(`${matchId}-phase2-submitted`) === 'true';

      if (selfSubmittedFlag && selfPlayerId && !submissions.includes(selfPlayerId)) {
        submissions = [...submissions, selfPlayerId];
      }

      setSubmittedPlayerIds(submissions);
    });
    return () => {
      console.log('[P2DB] Stopped listening to match state updates for Phase 2, matchId:', matchId);
      unsubscribe();
    };
  }, [matchId, selfPlayerId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setShowRankingModal(true);
      setTimeout(() => {
        handleSubmit();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const isFormComplete = () => {
    return Object.values(responses).every(response => response.trim().length > 10);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const displayedMembers = resolvedMembers;
  const totalParticipants = displayedMembers.length || 1;
  const submissionsCount = submittedPlayerIds.length;
  const submissionProgress = Math.min(100, (submissionsCount / totalParticipants) * 100);
  const pendingCount = Math.max(totalParticipants - submissionsCount, 0);

  useEffect(() => {
    if (totalParticipants <= 0) return;
    const everyoneSubmitted = submissionsCount >= totalParticipants;
    if (!everyoneSubmitted) {
      if (waitingForRankings) {
        console.log('[P2DB] Still waiting for submissions', {
          submissionsCount,
          totalParticipants,
          pendingRankingUrl,
        });
      }
      return;
    }

    const urlToUse = pendingRankingUrl || (rankingUrlKey && typeof window !== 'undefined'
      ? sessionStorage.getItem(rankingUrlKey)
      : null);

    if (!urlToUse) {
      console.log('[P2DB] All submissions in but no ranking URL yet; waiting for generation');
      return;
    }

    console.log('[P2DB] All submissions received, navigating to rankings');
    setWaitingForRankings(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${matchId}-phase2-waiting`);
    }
    router.push(urlToUse);
  }, [
    waitingForRankings,
    pendingRankingUrl,
    submissionsCount,
    totalParticipants,
    router,
    matchId,
    rankingUrlKey,
  ]);

  const buildRankingsUrl = (score: number, responsesPayload: typeof responses) =>
    `/ranked/phase-rankings?phase=2&matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}` +
    `&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}` +
    `&feedbackScore=${score}&peerFeedback=${encodeURIComponent(JSON.stringify(responsesPayload))}`;

  const persistAiSchedule = useCallback((schedule: Record<string, number>) => {
    if (typeof window === 'undefined' || !phase2ScheduleKey) return;
    try {
      sessionStorage.setItem(phase2ScheduleKey, JSON.stringify(schedule));
    } catch (error) {
      console.warn('[P2DB] Failed to persist phase2 AI schedule', error);
    }
  }, [phase2ScheduleKey]);

  const scheduleAiSubmissions = useCallback((aiPlayers: any[]) => {
    if (!isLeaderClient || !matchId || aiPlayers.length === 0) return;
    const schedule = { ...aiScheduleRef.current };
    let updated = false;
    const delays: Record<string, number> = {};

    aiPlayers.forEach((aiPlayer: any) => {
      const userId = aiPlayer.userId;
      if (!userId) return;
      let submitAt = schedule[userId];
      if (!submitAt) {
        submitAt = phase2StartTime + 30000 + Math.random() * 30000;
        schedule[userId] = submitAt;
        updated = true;
      }
      delays[userId] = Math.max(0, submitAt - Date.now());
    });

    if (updated) {
      aiScheduleRef.current = schedule;
      persistAiSchedule(schedule);
    }

    if (Object.keys(delays).length > 0) {
      simulateAISubmissions(matchId, 2, delays);
      console.log('[P2DB] Scheduled AI submissions for phase 2', delays);
    }
  }, [isLeaderClient, matchId, phase2StartTime, persistAiSchedule]);

  useEffect(() => {
    if (!isLeaderClient || !matchId) return;
    const schedule = { ...aiScheduleRef.current };
    let updated = false;

    resolvedMembers.forEach(member => {
      if (member.isAI && member.userId) {
        if (!schedule[member.userId]) {
          const submitAt = phase2StartTime + 30000 + Math.random() * 30000;
          schedule[member.userId] = submitAt;
          updated = true;
        }
      }
    });

    if (updated) {
      aiScheduleRef.current = schedule;
      persistAiSchedule(schedule);
    }
  }, [isLeaderClient, matchId, resolvedMembers, phase2StartTime, persistAiSchedule]);

  useEffect(() => {
    const generateAIFeedback = async () => {
      if (!matchId || aiFeedbackGenerated) return;
      
      console.log('🤖 PEER FEEDBACK - Generating AI peer feedback...');
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const writings = matchState.aiWritings?.phase1 || [];

        const existingFeedbacks = matchState?.aiFeedbacks?.phase2;
        if (existingFeedbacks && existingFeedbacks.length > 0) {
          console.log('✅ PEER FEEDBACK - AI feedback already exists, skipping regeneration');
          scheduleAiSubmissions(aiPlayers);
          setAiFeedbackGenerated(true);
          return;
        }
        
        const aiFeedbackPromises = aiPlayers.map(async (aiPlayer: any) => {
          const aiIndex = players.findIndex((p: any) => p.userId === aiPlayer.userId);
          const peerIndex = (aiIndex + 1) % players.length;
          const peer = players[peerIndex];
          
          let peerWriting = '';
          if (peer.isAI) {
            const aiWriting = writings.find((w: any) => w.playerId === peer.userId);
            peerWriting = aiWriting?.content || '';
          } else {
            const rankings = matchState.rankings?.phase1 || [];
            const peerRanking = rankings.find((r: any) => r.playerId === peer.userId);
            peerWriting = peerRanking?.content || '';
          }
          
          if (!peerWriting) return null;
          
          const response = await fetch('/api/generate-ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peerWriting,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const data = await response.json();
          console.log(`✅ Generated feedback from ${aiPlayer.displayName}`);
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            responses: data.responses,
            peerWriting,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiFeedbacks = (await Promise.all(aiFeedbackPromises)).filter(f => f !== null);
        
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, {
          'aiFeedbacks.phase2': aiFeedbacks,
        });

        scheduleAiSubmissions(aiPlayers);
        console.log('✅ PEER FEEDBACK - All AI feedback generated and stored');
        setAiFeedbackGenerated(true);
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Failed to generate AI feedback:', error);
        setAiFeedbackGenerated(false);
      }
    };
    
    generateAIFeedback();
  }, [matchId, aiFeedbackGenerated, scheduleAiSubmissions]);

  const setRankingUrl = useCallback((url: string) => {
    setPendingRankingUrl(url);
    if (typeof window !== 'undefined' && rankingUrlKey) {
      sessionStorage.setItem(rankingUrlKey, url);
    }
  }, [rankingUrlKey]);

  const enterWaitingState = useCallback(() => {
    setWaitingForRankings(true);
    if (typeof window !== 'undefined' && matchId) {
      sessionStorage.setItem(`${matchId}-phase2-waiting`, 'true');
    }
  }, [matchId]);

  const handleSubmit = async () => {
    console.log('[P2DB] Submitting peer feedback');
    setIsEvaluating(true);
    if (typeof window !== 'undefined' && matchId) {
      sessionStorage.setItem(`${matchId}-phase2-submitted`, 'true');
    }
    enterWaitingState();
    if (selfPlayerId) {
      setSubmittedPlayerIds(prev => (prev.includes(selfPlayerId) ? prev : [...prev, selfPlayerId]));
    }
    
    try {
      // Get AI feedback submissions from Firestore
      const { getDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (!matchDoc.exists()) throw new Error('Match state not found');
      
      const matchState = matchDoc.data();
      const aiFeedbacks = matchState?.aiFeedbacks?.phase2 || [];
      
      if (aiFeedbacks.length === 0) {
        console.warn('⚠️ PEER FEEDBACK - No AI feedback found, falling back to individual evaluation');
        throw new Error('AI feedback not available');
      }
      
      // Prepare all feedback submissions for batch ranking
      const allFeedbackSubmissions = [
        {
          playerId: selfPlayerId,
          playerName: selfPlayerName,
          responses,
          peerWriting: currentPeer?.content || '',
          isAI: false,
        },
        ...aiFeedbacks
      ];
      
      console.log(`📊 PEER FEEDBACK - Batch ranking ${allFeedbackSubmissions.length} feedback submissions...`);
      
      // Call batch ranking API
      const response = await fetch('/api/batch-rank-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackSubmissions: allFeedbackSubmissions,
        }),
      });
      
      const data = await response.json();
      const rankings = data.rankings;
      
      console.log('✅ PEER FEEDBACK - Batch ranking complete:', rankings.length, 'feedback ranked');
      
      // Find your ranking
      const yourRanking = rankings.find((r: any) => r.playerId === selfPlayerId);
      if (!yourRanking) throw new Error('Your ranking not found');
      
      const feedbackScore = yourRanking.score;
      
      console.log(`🎯 PEER FEEDBACK - You ranked #${yourRanking.rank} with score ${feedbackScore}`);
      
      // Store ALL feedback rankings in Firestore
      const matchRef = doc(db, 'matchStates', matchId);
      await updateDoc(matchRef, {
        'rankings.phase2': rankings,
      });
      
      // Save feedback to session storage
      sessionStorage.setItem(`${matchId}-phase2-feedback`, JSON.stringify(yourRanking));
      
      // Submit to match state WITH full AI feedback
      await submitPhase(matchId, selfPlayerId, 2, Math.round(feedbackScore), {
        strengths: yourRanking.strengths || [],
        improvements: yourRanking.improvements || [],
      });
      
      // Route to phase 2 rankings screen, then to revision
      const rankingUrl = buildRankingsUrl(Math.round(feedbackScore), responses);
      setRankingUrl(rankingUrl);
      
    } catch (error) {
      console.error('❌ PEER FEEDBACK - Batch ranking failed, using fallback:', error);
      
      // Fallback to individual evaluation
      try {
        const response = await fetch('/api/evaluate-peer-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses,
            peerWriting: currentPeer?.content || '',
          }),
        });
        
        const data = await response.json();
        const feedbackScore = data.score || 75;
        console.log('✅ PEER FEEDBACK - Fallback evaluation complete, score:', feedbackScore);
        
        sessionStorage.setItem(`${matchId}-phase2-feedback`, JSON.stringify(data));
        
        await submitPhase(matchId, selfPlayerId, 2, Math.round(feedbackScore), {
          strengths: data.strengths || [],
          improvements: data.improvements || [],
        });
        
        const rankingUrl = buildRankingsUrl(Math.round(feedbackScore), responses);
        setRankingUrl(rankingUrl);
      } catch (fallbackError) {
        console.error('❌ PEER FEEDBACK - Even fallback failed:', fallbackError);
        const feedbackQuality = isFormComplete() ? Math.random() * 20 + 75 : Math.random() * 30 + 50;
        
        await submitPhase(matchId, selfPlayerId, 2, Math.round(feedbackQuality)).catch(console.error);
        
        const rankingUrl = buildRankingsUrl(Math.round(feedbackQuality), responses);
        setRankingUrl(rankingUrl);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDebugAutoFeedback = useCallback(async () => {
    if (!currentPeer?.content) {
      console.warn('🐞 PEER FEEDBACK - No peer content available for auto feedback');
      return;
    }
    try {
      console.log('🐞 PEER FEEDBACK - Debug auto feedback triggered (AI)');
      const response = await fetch('/api/generate-ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerWriting: currentPeer.content,
          rank: currentPeer.rank || userProfile?.currentRank || 'Silver III',
          playerName: userProfile?.displayName || 'You',
        }),
      });
      const data = await response.json();
      const aiResponses = data.responses || {};
      setResponses({
        clarity: aiResponses.clarity || '',
        strengths: aiResponses.strengths || '',
        improvements: aiResponses.improvements || '',
        organization: aiResponses.organization || '',
        engagement: aiResponses.engagement || '',
      });
    } catch (error) {
      console.error('🐞 PEER FEEDBACK - Debug auto feedback failed:', error);
    }
  }, [currentPeer, userProfile]);

  const handleDebugForceEndPhase = useCallback(async () => {
    try {
      console.log('🐞 PEER FEEDBACK - Debug force end triggered');
      await handleSubmit();

      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      const matchRef = doc(db, 'matchStates', matchId);
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) return;

      const matchState = matchSnap.data();
      const submissions: string[] = matchState?.submissions?.phase2 || [];
      const players: any[] = matchState?.players || [];
      const pendingAI = players.filter(
        (player: any) => player.isAI && !submissions.includes(player.userId)
      );

      for (const aiPlayer of pendingAI) {
        const aiScore = Math.round(70 + Math.random() * 20);
        await submitPhase(matchId, aiPlayer.userId, 2, aiScore).catch(console.error);
        console.log('🐞 PEER FEEDBACK - Debug forced AI submission for', aiPlayer.displayName);
      }
    } catch (error) {
      console.error('🐞 PEER FEEDBACK - Debug force end failed:', error);
    }
  }, [handleSubmit, matchId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detail = {
      primary: { label: 'Auto Feedback', eventName: 'debug-phase-primary-action' },
      secondary: { label: 'End Current Phase', eventName: 'debug-phase-secondary-action' },
    };
    window.dispatchEvent(new CustomEvent('debug-phase-actions', { detail }));
    return () => {
      window.dispatchEvent(new CustomEvent('debug-phase-actions', { detail: null }));
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('debug-phase-primary-action', handleDebugAutoFeedback);
    window.addEventListener('debug-phase-secondary-action', handleDebugForceEndPhase);
    return () => {
      window.removeEventListener('debug-phase-primary-action', handleDebugAutoFeedback);
      window.removeEventListener('debug-phase-secondary-action', handleDebugForceEndPhase);
    };
  }, [handleDebugAutoFeedback, handleDebugForceEndPhase]);

  const manualSubmitDisabled = !isFormComplete() || isEvaluating;

  if (waitingForRankings) {
    console.log('[P2DB] Rendering waiting screen', { submissionsCount, totalParticipants });
    return (
      <WaitingForPlayers
        phase={2}
        playersReady={submissionsCount}
        totalPlayers={totalParticipants}
        timeRemaining={timeLeft}
        partyMembers={displayedMembers}
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
          <div className="rounded-3xl border border-blue-400/30 bg-[#141e27] p-12 shadow-2xl text-center max-w-md mx-4">
            <div className="text-6xl mb-6 animate-bounce">📊</div>
            <h2 className="text-3xl font-bold text-white mb-3">Time&apos;s Up!</h2>
            <p className="text-white/70 text-lg mb-6">
              Evaluating feedback quality and ranking responses...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Peer Feedback Tips Modal - using 'informational' type for evaluation guidance */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType="informational"
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Feedback Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Feedback Tips
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
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <span className="text-blue-400 text-sm font-semibold">📝 PHASE 2: PEER FEEDBACK</span>
              </div>
            </div>

            <div className="px-6 py-2 text-white/60 text-sm">
              ⏱️ Submit automatically at 0:00
            </div>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft > 30 ? 'bg-green-400' : timeLeft > 15 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Evaluate Your Peer&apos;s Writing</h1>
          <p className="text-white/80">
            Your feedback will be scored on helpfulness and specificity. Be constructive and detailed!
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr,1.15fr,0.8fr]">
          {/* Left side - Peer's writing */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {loadingPeer || !currentPeer ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3 animate-spin">📖</div>
                  <div className="text-white/60">Loading peer&apos;s writing...</div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{currentPeer.avatar}</span>
                    <div>
                      <div className="text-white font-bold">{currentPeer.author}</div>
                      <div className="text-white/60 text-sm">{currentPeer.rank} &bull; {currentPeer.wordCount} words</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 max-h-[600px] overflow-y-auto">
                    <p className="text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                      {currentPeer.content}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-bold text-lg mb-4">Provide Detailed Feedback</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    1. What is the main idea or message? Is it clear?
                  </label>
                  <textarea
                    value={responses.clarity}
                    onChange={(e) => setResponses({...responses, clarity: e.target.value})}
                    onPaste={handlePaste}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    placeholder="Explain what the writing is about and whether it's easy to understand..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    spellCheck="true"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.clarity.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    2. What are the strongest parts of this writing?
                  </label>
                  <textarea
                    value={responses.strengths}
                    onChange={(e) => setResponses({...responses, strengths: e.target.value})}
                    placeholder="Point out specific examples of what works well..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.strengths.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    3. What could be improved? Be specific.
                  </label>
                  <textarea
                    value={responses.improvements}
                    onChange={(e) => setResponses({...responses, improvements: e.target.value})}
                    placeholder="Give constructive suggestions for improvement..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.improvements.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    4. How well is the writing organized?
                  </label>
                  <textarea
                    value={responses.organization}
                    onChange={(e) => setResponses({...responses, organization: e.target.value})}
                    placeholder="Comment on the structure, flow, and logical order..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.organization.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    5. How engaging is this piece? Does it hold your attention?
                  </label>
                  <textarea
                    value={responses.engagement}
                    onChange={(e) => setResponses({...responses, engagement: e.target.value})}
                    placeholder="Describe how the writing makes you feel and why..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.engagement.length}/50 characters minimum
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={manualSubmitDisabled}
                  className={`rounded-2xl border px-6 py-3 text-sm font-semibold transition ${
                    manualSubmitDisabled
                      ? 'border-white/20 bg-white/10 text-white/40 cursor-not-allowed'
                      : 'border-blue-400/40 bg-blue-500/10 text-blue-200 hover:border-blue-300 hover:bg-blue-500/20'
                  }`}
                >
                  Submit Feedback
                </button>
                <p className="text-xs text-white/50">
                  Submits immediately; you can’t edit after sending.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Tracker */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Feedback submissions
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    {submissionsCount}{' '}
                    <span className="text-white/40 text-xl">/</span>{' '}
                    <span className="text-white/60 text-2xl">
                      {totalParticipants}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${submissionProgress}%` }}
                />
              </div>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {displayedMembers.map((member, index) => {
                  const submitted = member.userId
                    ? submittedPlayerIds.includes(member.userId)
                    : index < submissionsCount;
                  return (
                    <div
                      key={`${member.userId || member.name || 'feedback'}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c141d] text-xl">
                          {member.avatar || '👤'}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${member.isYou ? 'text-white' : 'text-white/80'}`}>
                            {member.name || `Player ${index + 1}`}
                          </div>
                          <div className="text-[11px] text-white/40">{member.rank || (member.isAI ? 'Silver' : '')}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${submitted ? 'text-emerald-300' : 'text-white/40'}`}>
                        {submitted ? 'Submitted' : 'Waiting'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-4 text-sm text-white/60">
              <div className="flex items-center justify-between">
                <span>Submissions received</span>
                <span className="font-semibold text-white">
                  {submissionsCount} / {totalParticipants}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: `${submissionProgress}%` }}
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                {pendingCount > 0
                  ? `Waiting on ${pendingCount} teammate${pendingCount === 1 ? '' : 's'} to finish feedback.`
                  : 'Everyone is done—preparing rankings now!'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

