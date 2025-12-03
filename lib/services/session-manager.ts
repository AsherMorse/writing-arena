import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  GameSession,
  PlayerInfo,
  PhaseSubmissionData,
  Phase,
  SessionEvents,
  CreateSessionOptions,
} from '../types/session';
import {
  generateConnectionId,
  reconnectPlayerToSession,
  disconnectPlayerFromSession,
  createHeartbeatCallback,
} from './session-connection';
import {
  getPhaseTimeRemaining,
  hasSubmittedCurrentPhase,
  getConnectedPlayers,
  getSubmissionCount,
  detectPhaseTransition,
  detectPlayerStatusChanges,
  detectAllPlayersReady,
} from './session-state';
import {
  findFormingSession,
  createFormingSession,
  addPlayerToSession,
  startSession,
  createSession,
  submitPhase,
  getSession,
} from './session-operations';

export class SessionManager {
  private _sessionId: string | null = null;
  private _userId: string | null = null;
  private connectionId: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sessionListener: Unsubscribe | null = null;
  private currentSession: GameSession | null = null;
  private periodicRefreshInterval: NodeJS.Timeout | null = null;
  
  private eventHandlers: Partial<SessionEvents> = {};
  
  get sessionId(): string | null {
    return this._sessionId;
  }
  
  get userId(): string | null {
    return this._userId;
  }
  
  constructor() {
    this.connectionId = generateConnectionId();
  }
  
  async joinSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo
  ): Promise<GameSession> {
    this._sessionId = sessionId;
    this._userId = userId;
    
    const session = await getSession(sessionId);
    
    if (session) {
      await reconnectPlayerToSession(sessionId, userId, playerInfo, this.connectionId);
      this.currentSession = session;
    } else {
      throw new Error('Session not found');
    }
    
    this.startHeartbeat();
    this.listenToSession();
    this.startPeriodicRefresh();
    
    return this.currentSession;
  }
  
  async findOrJoinSession(
    userId: string,
    playerInfo: PlayerInfo,
    trait: string
  ): Promise<GameSession> {
    const existingSessionId = await findFormingSession(trait);
    
    if (existingSessionId) {
      await addPlayerToSession(existingSessionId, userId, playerInfo, this.connectionId);
      const joinedSession = await this.joinSession(existingSessionId, userId, playerInfo);
      return {
        ...joinedSession,
        sessionId: existingSessionId,
      };
    }
    
    const newSession = await createFormingSession(userId, playerInfo, trait, this.connectionId);
    this._sessionId = newSession.sessionId;
    this._userId = userId;
    this.currentSession = newSession;
    this.startHeartbeat();
    this.listenToSession();
    this.startPeriodicRefresh();
    return newSession;
  }

  async addPlayerToSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo,
    isAI: boolean = false
  ): Promise<void> {
    await addPlayerToSession(sessionId, userId, playerInfo, this.connectionId, isAI);
  }

  async startSession(
    sessionId: string,
    promptId: string,
    promptType: string,
    phaseDuration: number,
    userRank?: string
  ): Promise<void> {
    await startSession(sessionId, promptId, promptType, phaseDuration, userRank);
  }
  
  async createSession(options: CreateSessionOptions): Promise<GameSession> {
    return await createSession(options, this.connectionId);
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (!this._sessionId || !this._userId) return;
    
    const heartbeatCallback = createHeartbeatCallback(this._sessionId, this._userId);
    
    this.heartbeatInterval = setInterval(async () => {
      try {
        await heartbeatCallback();
      } catch (error) {
        this.eventHandlers.onSessionError?.(error as Error);
      }
    }, 5000);
  }
  
  async submitPhase(
    phase: Phase,
    data: PhaseSubmissionData
  ): Promise<{ transitioned: boolean; nextPhase?: Phase }> {
    if (!this._sessionId || !this._userId) {
      throw new Error('Session not initialized');
    }
    
    return await submitPhase(this._sessionId, this._userId, phase, data);
  }
  
  private startPeriodicRefresh(): void {
    if (this.periodicRefreshInterval) {
      clearInterval(this.periodicRefreshInterval);
    }

    this.periodicRefreshInterval = setInterval(async () => {
      if (!this._sessionId || !this._userId) return;

      try {
        const updatedSession = await getSession(this._sessionId);
        if (updatedSession && JSON.stringify(updatedSession) !== JSON.stringify(this.currentSession)) {
          this.currentSession = updatedSession;
          this.eventHandlers.onSessionUpdate?.(updatedSession);
        }
      } catch (error) {
        // Silent fail
      }
    }, 30000);
  }
  
  private listenToSession(): void {
    if (!this._sessionId) return;
    
    const sessionRef = doc(db, 'sessions', this._sessionId);
    
    this.sessionListener = onSnapshot(
      sessionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          this.eventHandlers.onSessionError?.(new Error('Session deleted'));
          return;
        }
        
        const sessionData = snapshot.data() as GameSession;
        const session = {
          ...sessionData,
          sessionId: snapshot.id,
        };
        const previousSession = this.currentSession;
        this.currentSession = session;
        
        this.eventHandlers.onSessionUpdate?.(session);
        
        if (detectPhaseTransition(previousSession, session)) {
          this.eventHandlers.onPhaseTransition?.(session.config.phase);
        }
        
        const statusChanges = detectPlayerStatusChanges(previousSession, session);
        for (const change of statusChanges) {
          this.eventHandlers.onPlayerStatusChange?.(change.userId, change.status as any);
        }
        
        if (detectAllPlayersReady(previousSession, session)) {
          this.eventHandlers.onAllPlayersReady?.();
        }
      },
      (error) => {
        this.eventHandlers.onSessionError?.(error);
      }
    );
  }
  
  on<K extends keyof SessionEvents>(
    event: K,
    handler: SessionEvents[K]
  ): void {
    this.eventHandlers[event] = handler;
  }
  
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }
  
  getPhaseTimeRemaining(): number {
    return getPhaseTimeRemaining(this.currentSession);
  }
  
  hasSubmittedCurrentPhase(): boolean {
    return hasSubmittedCurrentPhase(this.currentSession, this._userId);
  }
  
  getConnectedPlayers() {
    return getConnectedPlayers(this.currentSession);
  }
  
  getSubmissionCount(): { submitted: number; total: number } {
    return getSubmissionCount(this.currentSession);
  }
  
  async leaveSession(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.periodicRefreshInterval) {
      clearInterval(this.periodicRefreshInterval);
      this.periodicRefreshInterval = null;
    }
    
    if (this.sessionListener) {
      this.sessionListener();
      this.sessionListener = null;
    }
    
    if (this._sessionId && this._userId) {
      await disconnectPlayerFromSession(this._sessionId, this._userId);
    }
    
    this._sessionId = null;
    this._userId = null;
    this.currentSession = null;
    this.eventHandlers = {};
  }
  
  destroy(): void {
    this.leaveSession();
  }
}

export const sessionManager = new SessionManager();
