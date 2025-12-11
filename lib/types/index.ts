import { Timestamp } from 'firebase/firestore';
import type { SkillGapsMap } from './skill-gaps';

// Re-export skill gap types
export * from './skill-gaps';

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

  // Ranked mode progress tracking
  rankedProgress?: RankedProgress;

  // Skill gap tracking (denormalized for fast block checks)
  skillGaps?: SkillGapsMap;

  // Noble name system
  hasNobleName?: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RankedPrompt {
  id: string;
  level: 'paragraph' | 'essay';
  sequenceNumber: number;
  activeDate: string;
  promptText: string;
  topic?: string;
  inspirationText?: string;
  createdAt: Timestamp;
}

export interface RankedProgress {
  currentPromptSequence: number;
  completedPrompts: string[];
}

export interface RankedSubmission {
  id: string;
  userId: string;
  promptId: string;
  originalContent: string;
  originalScore: number;
  originalFeedback: Record<string, unknown>;
  revisedContent?: string;
  revisedScore?: number;
  revisedFeedback?: Record<string, unknown>;
  submittedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface PracticeSubmission {
  id: string;
  userId: string;
  type: 'paragraph' | 'essay';
  topic: string;
  prompt: string;
  originalContent: string;
  originalScore: number;
  originalFeedback: Record<string, unknown>;
  revisedContent?: string;
  revisedScore?: number;
  revisedFeedback?: Record<string, unknown>;
  submittedAt: Timestamp;
  completedAt?: Timestamp;
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

