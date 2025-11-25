import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getAIFeedback(
  matchId: string,
  userId: string,
  phase: 1 | 2 | 3
): Promise<any | null> {
  try {
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      const data = matchSnap.data();
      const feedback = data?.feedback?.[userId]?.[`phase${phase}`];
      return feedback || null;
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}

export async function getPeerFeedbackResponses(
  matchId: string,
  userId: string
): Promise<any | null> {
  try {
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      return null;
    }
    
    const matchState = { ...matchSnap.data() };
    const players = [...(matchState.players || [])];
    const feedbackRankings = [...(matchState.rankings?.phase2 || [])];
    const aiFeedbacks = [...(matchState.aiFeedbacks?.phase2 || [])];
    
    const yourIndex = players.findIndex((p: any) => p.userId === userId);
    if (yourIndex === -1) {
      return null;
    }
    
    const reviewerIndex = yourIndex === 0 ? players.length - 1 : yourIndex - 1;
    const reviewer = players[reviewerIndex];
    
    let reviewerFeedback = feedbackRankings.find((r: any) => r.playerId === reviewer.userId);
    
    if (!reviewerFeedback && reviewer.isAI) {
      const aiFeedback = aiFeedbacks.find((f: any) => f.playerId === reviewer.userId);
      if (aiFeedback && aiFeedback.responses) {
        return {
          reviewerName: reviewer.displayName,
          reviewerAvatar: reviewer.avatar || '🤖',
          responses: aiFeedback.responses,
        };
      }
    }
    
    if (reviewerFeedback && reviewerFeedback.responses) {
      return {
        reviewerName: reviewer.displayName,
        reviewerAvatar: reviewer.avatar || (reviewer.isAI ? '🤖' : '👤'),
        responses: reviewerFeedback.responses,
      };
    }
    
    return null;
    
  } catch (error) {
    return null;
  }
}

export async function getAssignedPeer(
  matchId: string,
  userId: string
): Promise<{ userId: string; displayName: string; writing: string; wordCount: number } | null> {
  try {
    const matchRef = doc(db, 'matchStates', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) return null;
    
    const matchState = { ...matchSnap.data() };
    const players = [...(matchState.players || [])];
    const writesPhase1 = [...(matchState.aiWritings?.phase1 || [])];
    const rankingsPhase1 = [...(matchState.rankings?.phase1 || [])];
    
    const yourIndex = players.findIndex((p: any) => p.userId === userId);
    if (yourIndex === -1) return null;
    
    const peerIndex = (yourIndex + 1) % players.length;
    const peer = { ...players[peerIndex] };
    
    const peerWritingSource = peer.isAI
      ? writesPhase1.find((w: any) => w.playerId === peer.userId)
      : rankingsPhase1.find((r: any) => r.playerId === peer.userId);
    const peerWriting = peerWritingSource?.content || '';
    const peerWordCount = peerWritingSource?.wordCount || 0;
    
    if (!peerWriting) {
      return null;
    }
    
    return {
      userId: peer.userId,
      displayName: peer.displayName,
      writing: peerWriting,
      wordCount: peerWordCount,
    };
    
  } catch (error) {
    return null;
  }
}
