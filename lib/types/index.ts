import { Timestamp } from 'firebase/firestore';

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

