import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import {
  GameSession,
  PlayerInfo,
  PhaseSubmissionData,
  Phase,
  SessionEvents,
  CreateSessionOptions,
  SessionPlayer,
  PlayerStatus,
} from '../types/session';
import { getRankPhaseDuration } from '../constants/scoring';

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
    this.connectionId = this.generateConnectionId();
  }
  
  private generateConnectionId(): string {
    return `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  async joinSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo
  ): Promise<GameSession> {
    this._sessionId = sessionId;
    this._userId = userId;
    
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      await this.reconnectToSession(sessionRef, playerInfo);
      const sessionData = sessionSnap.data() as GameSession;
      // Ensure sessionId matches the document ID (Firestore doesn't include doc ID in data)
      this.currentSession = {
        ...sessionData,
        sessionId: sessionSnap.id,
      };
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
    const sessionsRef = collection(db, 'sessions');
    const formingQuery = query(
      sessionsRef,
      where('state', '==', 'forming'),
      where('config.trait', '==', trait),
      limit(1)
    );
    
    try {
      const snapshot = await getDocs(formingQuery);
      
      if (!snapshot.empty) {
        const existingSessionId = snapshot.docs[0].id;
        
        await this.addPlayerToSession(existingSessionId, userId, playerInfo);
        
        const joinedSession = await this.joinSession(existingSessionId, userId, playerInfo);
        // Ensure sessionId is set correctly
        return {
          ...joinedSession,
          sessionId: existingSessionId,
        };
      }
    } catch (error) {
      console.error('Error finding existing session:', error);
      // Continue to create new session
    }
    
    return await this.createFormingSession(userId, playerInfo, trait);
  }

  private async createFormingSession(
    userId: string,
    playerInfo: PlayerInfo,
    trait: string
  ): Promise<GameSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const matchId = `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const session: GameSession = {
      sessionId,
      matchId,
      mode: 'ranked',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      config: {
        trait,
        promptId: '',
        promptType: 'narrative',
        phase: 1,
        phaseDuration: 120,
      },
      players: {
        [userId]: {
          userId,
          displayName: playerInfo.displayName,
          avatar: playerInfo.avatar,
          rank: playerInfo.rank,
          isAI: false,
          status: 'connected',
          lastHeartbeat: Timestamp.now(),
          connectionId: this.connectionId,
          phases: {},
        },
      },
      state: 'forming',
      timing: {},
      coordination: {
        readyCount: 0,
        allPlayersReady: false,
      },
      metadata: {
        createdBy: userId,
        version: 1,
      },
    };
    
    const sessionRef = doc(db, 'sessions', sessionId);
    try {
      await setDoc(sessionRef, session);
      console.log('✅ Created forming session:', sessionId);
    } catch (error) {
      console.error('❌ Failed to create session in Firestore:', error);
      throw error;
    }
    
    // Ensure sessionId is set correctly in the returned object
    return {
      ...session,
      sessionId, // Explicitly ensure sessionId is set
    };
  }

  async addPlayerToSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo,
    isAI: boolean = false
  ): Promise<void> {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    await updateDoc(sessionRef, {
      [`players.${userId}`]: {
        userId,
        displayName: playerInfo.displayName,
        avatar: playerInfo.avatar,
        rank: playerInfo.rank,
        isAI,
        status: 'connected',
        lastHeartbeat: serverTimestamp(),
        connectionId: isAI ? 'ai-connection' : this.connectionId,
        phases: {},
      },
      updatedAt: serverTimestamp(),
    });
  }

  async startSession(
    sessionId: string,
    promptId: string,
    promptType: string,
    phaseDuration: number,
    userRank?: string
  ): Promise<void> {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    // Use rank-based duration if rank provided, otherwise use passed duration
    const actualPhaseDuration = userRank 
      ? getRankPhaseDuration(userRank, 1)
      : phaseDuration;
    
    await updateDoc(sessionRef, {
      'state': 'active',
      'config.promptId': promptId,
      'config.promptType': promptType,
      'config.phaseDuration': actualPhaseDuration,
      'timing.phase1StartTime': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  
  async createSession(options: CreateSessionOptions): Promise<GameSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const matchId = options.matchId || `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const players: { [userId: string]: SessionPlayer } = {};
    for (const player of options.players) {
      players[player.userId] = {
        userId: player.userId,
        displayName: player.displayName,
        avatar: player.avatar,
        rank: player.rank,
        isAI: player.isAI || false,
        status: 'connected',
        lastHeartbeat: Timestamp.now(),
        connectionId: player.isAI ? 'ai-connection' : this.connectionId,
        phases: {},
      };
    }
    
    const session: GameSession = {
      sessionId,
      matchId,
      mode: options.mode,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      config: options.config,
      players,
      state: 'active',
      timing: {
        phase1StartTime: Timestamp.now(),
      },
      coordination: {
        readyCount: 0,
        allPlayersReady: false,
      },
      metadata: {
        createdBy: options.players[0].userId,
        version: 1,
      },
    };
    
    const sessionRef = doc(db, 'sessions', sessionId);
    await setDoc(sessionRef, session);
    
    return session;
  }
  
  private async reconnectToSession(
    sessionRef: any,
    playerInfo: PlayerInfo
  ): Promise<void> {
    if (!this._userId) throw new Error('userId not set');
    
    await updateDoc(sessionRef, {
      [`players.${this._userId}.status`]: 'connected',
      [`players.${this._userId}.lastHeartbeat`]: serverTimestamp(),
      [`players.${this._userId}.connectionId`]: this.connectionId,
      [`players.${this._userId}.displayName`]: playerInfo.displayName,
      [`players.${this._userId}.avatar`]: playerInfo.avatar,
      updatedAt: serverTimestamp(),
    }).catch((error) => {
      if (error?.code === 'not-found') {
        return setDoc(sessionRef, {
          players: {
            [this._userId!]: {
              userId: this._userId,
              displayName: playerInfo.displayName,
              avatar: playerInfo.avatar,
              rank: playerInfo.rank,
              isAI: false,
              status: 'connected',
              lastHeartbeat: serverTimestamp(),
              connectionId: this.connectionId,
              phases: {},
            },
          },
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      throw error;
    });
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(async () => {
      if (!this._sessionId || !this._userId) return;
      
      try {
        await updateDoc(doc(db, 'sessions', this._sessionId), {
          [`players.${this._userId}.lastHeartbeat`]: serverTimestamp(),
          [`players.${this._userId}.status`]: 'connected',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        this.eventHandlers.onSessionError?.(error as Error);
      }
    }, 5000);
  }
  
  async submitPhase(
    phase: Phase,
    data: PhaseSubmissionData
  ): Promise<void> {
    if (!this._sessionId || !this._userId) {
      throw new Error('Session not initialized');
    }
    
    const sessionRef = doc(db, 'sessions', this._sessionId);
    
    const phaseData = {
      submitted: true,
      submittedAt: serverTimestamp(),
      ...data,
    };
    
    console.log(`💾 SESSION MANAGER - Saving phase ${phase} data:`, {
      sessionId: this._sessionId,
      userId: this._userId,
      phase,
      data: phaseData,
    });
    
    await updateDoc(sessionRef, {
      [`players.${this._userId}.phases.phase${phase}`]: phaseData,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ SESSION MANAGER - Successfully saved phase ${phase} to session ${this._sessionId}`);
  }
  
  private startPeriodicRefresh(): void {
    if (this.periodicRefreshInterval) {
      clearInterval(this.periodicRefreshInterval);
    }

    this.periodicRefreshInterval = setInterval(async () => {
      if (!this._sessionId || !this._userId) return;

      try {
        const sessionRef = doc(db, 'sessions', this._sessionId);
        const sessionSnap = await getDoc(sessionRef);
        
        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data() as GameSession;
          const updatedSession = {
            ...sessionData,
            sessionId: sessionSnap.id,
          };
          if (JSON.stringify(updatedSession) !== JSON.stringify(this.currentSession)) {
            this.currentSession = updatedSession;
            this.eventHandlers.onSessionUpdate?.(updatedSession);
          }
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
        
        if (previousSession && previousSession.config.phase !== session.config.phase) {
          this.eventHandlers.onPhaseTransition?.(session.config.phase);
        }
        
        if (previousSession) {
          for (const [userId, player] of Object.entries(session.players)) {
            const prevPlayer = previousSession.players[userId];
            if (prevPlayer && prevPlayer.status !== player.status) {
              this.eventHandlers.onPlayerStatusChange?.(userId, player.status);
            }
          }
        }
        
        if (session.coordination.allPlayersReady && !previousSession?.coordination.allPlayersReady) {
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
    if (!this.currentSession) return 0;
    
    const { config, timing } = this.currentSession;
    const phase = config.phase;
    
    let startTime: Timestamp | undefined;
    if (phase === 1) startTime = timing.phase1StartTime;
    else if (phase === 2) startTime = timing.phase2StartTime;
    else if (phase === 3) startTime = timing.phase3StartTime;
    
    // If start time hasn't been set yet (waiting for batch ranking to complete),
    // return the full phase duration to prevent timer from counting down
    if (!startTime) {
      return config.phaseDuration;
    }
    
    const elapsed = Date.now() - startTime.toMillis();
    const remaining = config.phaseDuration - Math.floor(elapsed / 1000);
    
    return Math.max(0, remaining);
  }
  
  hasSubmittedCurrentPhase(): boolean {
    if (!this.currentSession || !this._userId) return false;
    
    const player = this.currentSession.players[this._userId];
    if (!player) return false;
    
    const phase = this.currentSession.config.phase;
    return player.phases[`phase${phase}`]?.submitted || false;
  }
  
  getConnectedPlayers(): SessionPlayer[] {
    if (!this.currentSession) return [];
    
    return Object.values(this.currentSession.players).filter(
      p => p.status === 'connected'
    );
  }
  
  getSubmissionCount(): { submitted: number; total: number } {
    if (!this.currentSession) return { submitted: 0, total: 0 };
    
    const phase = this.currentSession.config.phase;
    const players = Object.values(this.currentSession.players);
    const realPlayers = players.filter(p => !p.isAI);
    
    const submitted = realPlayers.filter(
      p => p.phases[`phase${phase}`]?.submitted
    ).length;
    
    return {
      submitted,
      total: realPlayers.length,
    };
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
      try {
        await updateDoc(doc(db, 'sessions', this._sessionId), {
          [`players.${this._userId}.status`]: 'disconnected',
          [`players.${this._userId}.lastHeartbeat`]: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        // Silent fail
      }
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
