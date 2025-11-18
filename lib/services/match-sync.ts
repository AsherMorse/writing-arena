import { db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';

export interface MatchState {
  matchId: string;
  phase: 1 | 2 | 3;
  players: Array<{
    userId: string;
    displayName: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>;
  submissions: {
    phase1: string[];  // Array of userIds who submitted
    phase2: string[];
    phase3: string[];
  };
  phaseStartTime: Timestamp;
  phaseDuration: number;  // in seconds
  status: 'waiting' | 'in-progress' | 'completed';
  createdAt: Timestamp;
}

export interface PlayerSubmission {
  userId: string;
  phase: 1 | 2 | 3;
  content?: string;
  score?: number;
  timestamp: Timestamp;
}

// Create a new match state
export async function createMatchState(
  matchId: string,
  players: Array<{userId: string; displayName: string; avatar: string; rank: string; isAI: boolean}>,
  phase: 1 | 2 | 3 = 1,
  phaseDuration: number = 240
): Promise<void> {
  console.log('🎮 MATCH SYNC - Creating match state:', matchId);
  
  const matchRef = doc(db, 'matchStates', matchId);
  await setDoc(matchRef, {
    matchId,
    phase,
    players,
    submissions: {
      phase1: [],
      phase2: [],
      phase3: [],
    },
    phaseStartTime: serverTimestamp(),
    phaseDuration,
    status: 'in-progress',
    createdAt: serverTimestamp(),
  });
  
  console.log('✅ MATCH SYNC - Match state created');
}

// Submit for current phase with full AI feedback
export async function submitPhase(
  matchId: string,
  userId: string,
  phase: 1 | 2 | 3,
  score: number,
  feedback?: any  // Full AI feedback object (strengths, improvements, etc.)
): Promise<void> {
  console.log('📤 MATCH SYNC - Submitting phase:', { matchId, userId, phase, score, hasFeedback: !!feedback });
  
  const matchRef = doc(db, 'matchStates', matchId);
  const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
  
  const updateData: any = {
    [`submissions.${phaseKey}`]: arrayUnion(userId),
    [`scores.${userId}.phase${phase}`]: score,
    updatedAt: serverTimestamp(),
  };
  
  // Store full AI feedback if provided
  if (feedback) {
    updateData[`feedback.${userId}.phase${phase}`] = feedback;
  }
  
  await updateDoc(matchRef, updateData);
  
  console.log('✅ MATCH SYNC - Submission recorded with feedback');
}

// Listen for match state changes
export function listenToMatchState(
  matchId: string,
  onUpdate: (matchState: MatchState) => void
): () => void {
  console.log('👂 MATCH SYNC - Listening to match:', matchId);
  
  const matchRef = doc(db, 'matchStates', matchId);
  
  const unsubscribe = onSnapshot(matchRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as MatchState;
      console.log('📥 MATCH SYNC - Match update:', {
        phase: data.phase,
        phase1Submitted: data.submissions?.phase1?.length || 0,
        phase2Submitted: data.submissions?.phase2?.length || 0,
        phase3Submitted: data.submissions?.phase3?.length || 0,
        totalPlayers: data.players?.length || 0
      });
      onUpdate(data);
    }
  }, (error) => {
    console.error('❌ MATCH SYNC - Error listening:', error);
  });
  
  return unsubscribe;
}

const aiSubmissionTimers: Record<string, NodeJS.Timeout[]> = {};

export function clearAISubmissionTimers(matchId: string, phase: 1 | 2 | 3) {
  const key = `${matchId}-phase${phase}`;
  if (aiSubmissionTimers[key]) {
    aiSubmissionTimers[key].forEach(timeoutId => clearTimeout(timeoutId));
    delete aiSubmissionTimers[key];
  }
}

// Check if all players have submitted for a phase
export function areAllPlayersReady(matchState: MatchState, phase: 1 | 2 | 3, includeAI: boolean = false): boolean {
  const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
  const submitted = matchState.submissions?.[phaseKey] || [];
  const totalPlayers = matchState.players?.length || 0;

  if (includeAI) {
    const ready = submitted.length >= totalPlayers;
    console.log('🔍 MATCH SYNC - All players ready (include AI)?', {
      phase,
      totalPlayers,
      submitted: submitted.length,
      ready,
    });
    return ready;
  }
  
  // AI players auto-submit after a delay, so only count real players
  const realPlayers = matchState.players?.filter(p => !p.isAI) || [];
  const realPlayerIds = realPlayers.map(p => p.userId);
  const realPlayersSubmitted = submitted.filter(userId => realPlayerIds.includes(userId));
  
  const ready = realPlayersSubmitted.length >= realPlayers.length;
  console.log('🔍 MATCH SYNC - All players ready?', {
    phase,
    realPlayers: realPlayers.length,
    submitted: realPlayersSubmitted.length,
    ready
  });
  
  return ready;
}

// Simulate AI player submissions (for backfilled AI)
export async function simulateAISubmissions(
  matchId: string,
  phase: 1 | 2 | 3,
  perPlayerDelays?: Record<string, number>
): Promise<void> {
  clearAISubmissionTimers(matchId, phase);
  console.log('🤖 MATCH SYNC - Scheduling AI submissions for phase', phase);
  const matchRef = doc(db, 'matchStates', matchId);
  const matchSnap = await getDoc(matchRef);
  
  if (!matchSnap.exists()) {
    return;
  }

  const matchState = matchSnap.data() as MatchState;
  const aiPlayers = matchState.players.filter(p => p.isAI);
  const minDelay = 30000;
  const maxDelay = 120000;
  
  const key = `${matchId}-phase${phase}`;
  aiSubmissionTimers[key] = [];

  aiPlayers.forEach((aiPlayer, index) => {
    const fallbackDelay = minDelay + Math.random() * (maxDelay - minDelay);
    const delay = Math.max(0, perPlayerDelays?.[aiPlayer.userId] ?? fallbackDelay);
    
    console.log('🤖 MATCH SYNC - AI submission scheduled', {
      player: aiPlayer.displayName,
      delay,
      order: index + 1,
    });
    
    const timer = setTimeout(async () => {
      try {
        const aiScore = Math.round(60 + Math.random() * 30);
        await submitPhase(matchId, aiPlayer.userId, phase, aiScore);
        console.log('✅ MATCH SYNC - AI submitted', aiPlayer.displayName);
      } catch (error) {
        console.error('❌ MATCH SYNC - AI submission failed', { player: aiPlayer.displayName, error });
      }
    }, delay);

    aiSubmissionTimers[key].push(timer);
  });
}

// Retrieve AI feedback for a specific user and phase
export async function getAIFeedback(
  matchId: string,
  userId: string,
  phase: 1 | 2 | 3
): Promise<any | null> {
  console.log('📥 MATCH SYNC - Retrieving AI feedback:', { matchId, userId, phase });
  
  try {
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      const data = matchSnap.data();
      const feedback = data?.feedback?.[userId]?.[`phase${phase}`];
      console.log('✅ MATCH SYNC - Feedback retrieved:', !!feedback);
      return feedback || null;
    }
  } catch (error) {
    console.error('❌ MATCH SYNC - Error retrieving feedback:', error);
  }
  
  return null;
}

// Get peer's Phase 2 feedback responses for display in Phase 3
export async function getPeerFeedbackResponses(
  matchId: string,
  userId: string
): Promise<any | null> {
  console.log('👥 MATCH SYNC - Getting peer feedback for:', userId);
  
  try {
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) return null;
    
    const matchState = { ...matchSnap.data() };
    const players = [...(matchState.players || [])];
    const feedbackRankings = [...(matchState.rankings?.phase2 || [])];
    
    // Find who gave YOU feedback (reverse round-robin: you were reviewed by previous player)
    const yourIndex = players.findIndex((p: any) => p.userId === userId);
    if (yourIndex === -1) return null;
    
    // The person who reviewed YOU is the one before you (wrap around)
    const reviewerIndex = yourIndex === 0 ? players.length - 1 : yourIndex - 1;
    const reviewer = players[reviewerIndex];
    
    console.log('🎯 MATCH SYNC - Your reviewer was:', reviewer.displayName);
    
    // Get their feedback from rankings
    const reviewerFeedback = feedbackRankings.find((r: any) => r.playerId === reviewer.userId);
    
    if (reviewerFeedback && reviewerFeedback.responses) {
      console.log('✅ MATCH SYNC - Retrieved peer feedback responses');
      return {
        reviewerName: reviewer.displayName,
        reviewerAvatar: reviewer.avatar || '👤',
        responses: reviewerFeedback.responses,
      };
    }
    
    console.warn('⚠️ MATCH SYNC - No peer feedback found');
    return null;
    
  } catch (error) {
    console.error('❌ MATCH SYNC - Error getting peer feedback:', error);
    return null;
  }
}

// Get peer assignment for Phase 2 (round-robin)
export async function getAssignedPeer(
  matchId: string,
  userId: string
): Promise<{ userId: string; displayName: string; writing: string; wordCount: number } | null> {
  console.log('👥 MATCH SYNC - Getting assigned peer for:', userId);
  
  try {
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) return null;
    
    const matchState = { ...matchSnap.data() };
    const players = [...(matchState.players || [])];
    const writesPhase1 = [...(matchState.aiWritings?.phase1 || [])];
    const rankingsPhase1 = [...(matchState.rankings?.phase1 || [])];
    
    // Find your position in the party
    const yourIndex = players.findIndex((p: any) => p.userId === userId);
    if (yourIndex === -1) return null;
    
    // Round-robin: review the next person (wrap around)
    const peerIndex = (yourIndex + 1) % players.length;
    const peer = { ...players[peerIndex] };
    
    console.log('🎯 MATCH SYNC - Assigned peer:', peer.displayName, 'at index', peerIndex);
    
    // Get peer's Phase 1 writing
    const peerWritingSource = peer.isAI
      ? writesPhase1.find((w: any) => w.playerId === peer.userId)
      : rankingsPhase1.find((r: any) => r.playerId === peer.userId);
    const peerWriting = peerWritingSource?.content || '';
    const peerWordCount = peerWritingSource?.wordCount || 0;
    
    if (!peerWriting) {
      console.warn('⚠️ MATCH SYNC - No writing found for peer');
      return null;
    }
    
    return {
      userId: peer.userId,
      displayName: peer.displayName,
      writing: peerWriting,
      wordCount: peerWordCount,
    };
    
  } catch (error) {
    console.error('❌ MATCH SYNC - Error getting assigned peer:', error);
    return null;
  }
}

