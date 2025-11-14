import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  characterLevel: number;
  totalXP: number;
  totalPoints: number;
  currentRank: string;
  rankLP: number;
  traits: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  stats: {
    totalMatches: number;
    wins: number;
    totalWords: number;
    currentStreak: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// AI STUDENT TYPES
// ============================================================================

export interface AIStudent {
  id: string;
  displayName: string;
  personality: string;
  avatar: string;
  currentRank: string;
  rankLP: number;
  characterLevel: number;
  totalXP: number;
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    totalWords: number;
    winRate: number;
  };
  traits: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  writingStyle: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// WRITING & SESSION TYPES
// ============================================================================

export interface WritingPrompt {
  id: string;
  type: 'narrative' | 'descriptive' | 'informational' | 'argumentative';
  image: string;
  title: string;
  description: string;
  gradeLevel?: string;
}

export interface WritingSession {
  id?: string;
  userId: string;
  mode: 'practice' | 'quick-match' | 'ranked';
  trait: string;
  promptType: string;
  content: string;
  wordCount: number;
  score: number;
  traitScores: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  xpEarned: number;
  pointsEarned: number;
  lpChange?: number; // For ranked only
  placement?: number; // For competitive modes
  timestamp: Timestamp;
}

// ============================================================================
// MATCHMAKING TYPES
// ============================================================================

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

// ============================================================================
// MATCH STATE TYPES
// ============================================================================

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

