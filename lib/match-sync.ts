import { db } from './firebase';
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

// Submit for current phase
export async function submitPhase(
  matchId: string,
  userId: string,
  phase: 1 | 2 | 3,
  score: number
): Promise<void> {
  console.log('📤 MATCH SYNC - Submitting phase:', { matchId, userId, phase, score });
  
  const matchRef = doc(db, 'matchStates', matchId);
  const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
  
  await updateDoc(matchRef, {
    [`submissions.${phaseKey}`]: arrayUnion(userId),
    [`scores.${userId}.phase${phase}`]: score,
    updatedAt: serverTimestamp(),
  });
  
  console.log('✅ MATCH SYNC - Submission recorded');
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

// Check if all players have submitted for a phase
export function areAllPlayersReady(matchState: MatchState, phase: 1 | 2 | 3): boolean {
  const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
  const submitted = matchState.submissions?.[phaseKey] || [];
  const totalPlayers = matchState.players?.length || 0;
  
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
  delay: number = 5000
): Promise<void> {
  // Wait for delay, then submit for all AI players
  setTimeout(async () => {
    console.log('🤖 MATCH SYNC - Simulating AI submissions for phase', phase);
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      const matchState = matchSnap.data() as MatchState;
      const aiPlayers = matchState.players.filter(p => p.isAI);
      
      for (const aiPlayer of aiPlayers) {
        const aiScore = Math.round(60 + Math.random() * 30);
        await submitPhase(matchId, aiPlayer.userId, phase, aiScore);
      }
      
      console.log('✅ MATCH SYNC - AI submissions complete');
    }
  }, delay);
}

