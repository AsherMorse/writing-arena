import { Timestamp } from 'firebase/firestore';

/**
 * @description Mastery status for a single lesson.
 */
export interface LessonMasteryStatus {
  mastered: boolean;      // 90%+ achieved
  bestScore: number;      // Highest score
  lastScore: number;      // Most recent score
  completedAt: Timestamp; // When first completed
  masteredAt?: Timestamp; // When first mastered (if mastered)
  attempts: number;       // Total attempts
}

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
  
  // Practice mode mastery tracking
  practiceMastery?: {
    [lessonId: string]: LessonMasteryStatus;
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

