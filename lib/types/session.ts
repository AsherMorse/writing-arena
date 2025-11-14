import { Timestamp } from 'firebase/firestore';

/**
 * Core session types for robust game state management
 * Replaces scattered sessionStorage with centralized Firestore documents
 */

export type SessionMode = 'practice' | 'quick-match' | 'ranked';
export type SessionState = 'forming' | 'active' | 'waiting' | 'transitioning' | 'completed' | 'abandoned';
export type PlayerStatus = 'connected' | 'disconnected' | 'reconnecting';
export type Phase = 1 | 2 | 3;

export interface SessionConfig {
  trait: string;
  promptId: string;
  promptType: 'narrative' | 'descriptive' | 'informational' | 'argumentative';
  phase: Phase;
  phaseDuration: number;
}

export interface PhaseData {
  submitted: boolean;
  submittedAt?: Timestamp;
  content?: string;
  wordCount?: number;
  score?: number;
}

export interface SessionPlayer {
  userId: string;
  displayName: string;
  avatar: string;
  rank: string;
  isAI: boolean;
  
  // Connection tracking
  status: PlayerStatus;
  lastHeartbeat: Timestamp;
  connectionId: string;  // Unique per browser session
  
  // Phase progress
  phases: {
    phase1?: PhaseData;
    phase2?: PhaseData;
    phase3?: PhaseData;
  };
}

export interface SessionTiming {
  phase1StartTime?: Timestamp;
  phase2StartTime?: Timestamp;
  phase3StartTime?: Timestamp;
}

export interface SessionCoordination {
  readyCount: number;
  allPlayersReady: boolean;
  nextPhase?: Phase;
}

/**
 * Main session document structure
 * Stored in Firestore at /sessions/{sessionId}
 */
export interface GameSession {
  // Immutable metadata
  sessionId: string;
  matchId: string;  // Links to matchStates collection for backward compatibility
  mode: SessionMode;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Game configuration
  config: SessionConfig;
  
  // Players and their connection status
  players: {
    [userId: string]: SessionPlayer;
  };
  
  // Session state machine
  state: SessionState;
  
  // Phase timing (calculated server-side)
  timing: SessionTiming;
  
  // Coordination (replaces leader pattern)
  coordination: SessionCoordination;
  
  // Metadata for debugging
  metadata?: {
    createdBy: string;
    version: number;
  };
}

/**
 * Data submitted for each phase
 */
export interface Phase1SubmissionData {
  content: string;
  wordCount: number;
  score?: number;
}

export interface Phase2SubmissionData {
  responses: {
    clarity: string;
    strengths: string;
    improvements: string;
    organization: string;
    engagement: string;
  };
  score?: number;
}

export interface Phase3SubmissionData {
  revisedContent: string;
  wordCount: number;
  score?: number;
}

export type PhaseSubmissionData = 
  | Phase1SubmissionData 
  | Phase2SubmissionData 
  | Phase3SubmissionData;

/**
 * Player info when joining/creating session
 */
export interface PlayerInfo {
  displayName: string;
  avatar: string;
  rank: string;
  isAI?: boolean;
}

/**
 * Session creation options
 */
export interface CreateSessionOptions {
  mode: SessionMode;
  config: SessionConfig;
  players: Array<PlayerInfo & { userId: string }>;
}

/**
 * Events emitted by SessionManager
 */
export interface SessionEvents {
  onSessionUpdate: (session: GameSession) => void;
  onPhaseTransition: (newPhase: Phase) => void;
  onPlayerStatusChange: (userId: string, status: PlayerStatus) => void;
  onAllPlayersReady: () => void;
  onSessionError: (error: Error) => void;
}

