import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';

export interface QueueEntry {
  userId: string;
  displayName: string;
  avatar: string;
  rank: string;
  rankLP: number;
  trait: string;
  joinedAt: Timestamp;
  matchId?: string;
}

export interface MatchParty {
  id: string;
  players: Array<{
    userId: string;
    displayName: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>;
  trait: string;
  createdAt: Timestamp;
  status: 'forming' | 'ready' | 'in-progress' | 'completed';
}

// Join the matchmaking queue
export async function joinQueue(
  userId: string,
  displayName: string,
  avatar: string,
  rank: string,
  rankLP: number,
  trait: string
): Promise<string> {
  console.log('🎮 QUEUE - Joining:', { userId, displayName, rank, trait });
  
  const queueRef = doc(db, 'matchmakingQueue', userId);
  await setDoc(queueRef, {
    userId,
    displayName,
    avatar,
    rank,
    rankLP,
    trait,
    joinedAt: serverTimestamp(),
  });
  
  console.log('✅ QUEUE - Joined successfully');
  return userId;
}

// Leave the matchmaking queue
export async function leaveQueue(userId: string): Promise<void> {
  console.log('🚪 QUEUE - Leaving:', userId);
  const queueRef = doc(db, 'matchmakingQueue', userId);
  await deleteDoc(queueRef);
  console.log('✅ QUEUE - Left successfully');
}

// Listen for players in queue (for matchmaking)
export function listenToQueue(
  trait: string,
  currentUserId: string,
  onPlayersUpdate: (players: QueueEntry[]) => void
): () => void {
  console.log('👂 QUEUE - Listening for players in trait:', trait);
  
  const queueRef = collection(db, 'matchmakingQueue');
  const queueQuery = query(
    queueRef,
    where('trait', '==', trait),
    orderBy('joinedAt', 'asc')
  );

  const unsubscribe = onSnapshot(queueQuery, (snapshot) => {
    const players = snapshot.docs.map(doc => doc.data() as QueueEntry);
    
    console.log('📥 QUEUE - Players update:', {
      count: players.length,
      players: players.map(p => ({ name: p.displayName, rank: p.rank }))
    });
    
    onPlayersUpdate(players);
  }, (error) => {
    console.error('❌ QUEUE - Error listening:', error);
  });

  return unsubscribe;
}

// Generate AI player for backfill
export function generateAIPlayer(rank: string, index: number) {
  const aiNames = [
    'ProWriter99',
    'WordMaster', 
    'EliteScribe',
    'PenChampion',
    'InkWarrior',
    'PageTurner',
    'QuillMaster',
    'StoryWeaver'
  ];
  
  const aiAvatars = ['🎯', '📖', '✨', '🏅', '⚔️', '📚', '✒️', '📝'];
  
  // Generate similar rank AI
  const rankParts = rank.split(' '); // e.g., ["Silver", "III"]
  const tier = rankParts[0]; // "Silver"
  const division = rankParts[1] || 'III'; // "III"
  
  // Sometimes match same rank, sometimes +/- 1 division
  const variations = [
    `${tier} ${division}`,
    `${tier} II`,
    `${tier} III`,
    `${tier} IV`,
  ];
  
  const aiRank = variations[Math.floor(Math.random() * variations.length)];
  
  return {
    userId: `ai-${Date.now()}-${index}`,
    name: aiNames[index % aiNames.length],
    avatar: aiAvatars[index % aiAvatars.length],
    rank: aiRank,
    isAI: true,
  };
}

// Find or create a match party
export async function findOrCreateParty(
  userId: string,
  displayName: string,
  avatar: string,
  rank: string,
  trait: string
): Promise<string> {
  console.log('🔍 MATCHMAKING - Finding party for:', { userId, rank, trait });
  
  // For now, just create a new match every time
  // In future, could check for existing parties looking for players
  const matchId = `match-${userId}-${Date.now()}`;
  const matchRef = doc(db, 'matches', matchId);
  
  await setDoc(matchRef, {
    id: matchId,
    players: [{
      userId,
      displayName,
      avatar,
      rank,
      isAI: false,
    }],
    trait,
    createdAt: serverTimestamp(),
    status: 'forming',
  });
  
  console.log('✅ MATCHMAKING - Party created:', matchId);
  return matchId;
}

// Create a shared match lobby (for coordinated multi-player matches)
export async function createMatchLobby(
  matchId: string,
  players: Array<{userId: string; displayName: string; avatar: string; rank: string; isAI: boolean}>,
  trait: string,
  promptId: string
): Promise<void> {
  console.log('🏛️ MATCHMAKING - Creating shared match lobby:', matchId);
  
  const lobbyRef = doc(db, 'matchLobbies', matchId);
  await setDoc(lobbyRef, {
    matchId,
    players,
    trait,
    promptId,
    createdAt: serverTimestamp(),
    status: 'ready',
  });
  
  console.log('✅ MATCHMAKING - Lobby created with', players.length, 'players');
}

// Listen for match lobby (for followers to detect when leader creates it)
export function listenToMatchLobby(
  matchId: string,
  onLobbyReady: (lobbyData: any) => void
): () => void {
  console.log('👂 MATCHMAKING - Listening for lobby:', matchId);
  
  const lobbyRef = doc(db, 'matchLobbies', matchId);
  
  const unsubscribe = onSnapshot(lobbyRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('✅ MATCHMAKING - Lobby found:', data);
      onLobbyReady(data);
    }
  }, (error) => {
    console.error('❌ MATCHMAKING - Error listening to lobby:', error);
  });
  
  return unsubscribe;
}

