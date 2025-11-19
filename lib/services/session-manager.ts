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

/**
 * SessionManager - Robust session lifecycle management
 * 
 * Replaces:
 * - sessionStorage scattered across components
 * - URL-based state passing
 * - Leader/follower polling pattern
 * - Manual heartbeat management
 * 
 * Features:
 * - Automatic heartbeat to maintain presence
 * - Real-time session synchronization
 * - Reconnection support
 * - Clean state management
 */
export class SessionManager {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private connectionId: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sessionListener: Unsubscribe | null = null;
  private currentSession: GameSession | null = null;
  private periodicRefreshInterval: NodeJS.Timeout | null = null;
  
  // Event handlers
  private eventHandlers: Partial<SessionEvents> = {};
  
  constructor() {
    this.connectionId = this.generateConnectionId();
  }
  
  /**
   * Generate unique connection ID for this browser session
   */
  private generateConnectionId(): string {
    return `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Join or resume a session
   * - Creates session if joining for first time
   * - Updates connection status if reconnecting
   * - Sets up heartbeat to maintain presence
   */
  async joinSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo
  ): Promise<GameSession> {
    this.sessionId = sessionId;
    this.userId = userId;
    
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      await this.reconnectToSession(sessionRef, playerInfo);
      this.currentSession = sessionSnap.data() as GameSession;
    } else {
      console.error('❌ SESSION MANAGER - Session does not exist:', sessionId);
      throw new Error('Session not found');
    }
    
    // Start heartbeat to maintain presence
    this.startHeartbeat();
    
    // Listen for session updates
    this.listenToSession();
    
    // Start periodic refresh as backup (every 30 seconds)
    this.startPeriodicRefresh();
    
    return this.currentSession;
  }
  
  /**
   * Find existing session in 'forming' state or create new one
   * Called when user joins queue
   */
  async findOrJoinSession(
    userId: string,
    playerInfo: PlayerInfo,
    trait: string
  ): Promise<GameSession> {
    // Query for existing 'forming' sessions with same trait
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
        // Found existing session - join it
        const existingSession = snapshot.docs[0].data() as GameSession;
        const existingSessionId = snapshot.docs[0].id;
        
        // Add player to existing session
        await this.addPlayerToSession(existingSessionId, userId, playerInfo);
        
        // Join the session
        return await this.joinSession(existingSessionId, userId, playerInfo);
      }
    } catch (error) {
      console.error('❌ SESSION MANAGER - Error finding session:', error);
      // Continue to create new session
    }
    
    // No existing session found - create new one
    return await this.createFormingSession(userId, playerInfo, trait);
  }

  /**
   * Create a new session in 'forming' state (waiting for players)
   */
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
        promptId: '', // Will be set when session starts
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
      state: 'forming', // Start in 'forming' state
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
    await setDoc(sessionRef, session);
    
    return session;
  }

  /**
   * Add a player to an existing session
   */
  async addPlayerToSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo,
    isAI: boolean = false
  ): Promise<void> {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    try {
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
    } catch (error) {
      console.error(`❌ SESSION MANAGER - Failed to add player to session:`, error);
      throw error;
    }
  }

  /**
   * Start session (transition from 'forming' to 'active')
   * Called when party is full and match is starting
   */
  async startSession(
    sessionId: string,
    promptId: string,
    promptType: string,
    phaseDuration: number
  ): Promise<void> {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    await updateDoc(sessionRef, {
      'state': 'active',
      'config.promptId': promptId,
      'config.promptType': promptType,
      'config.phaseDuration': phaseDuration,
      'timing.phase1StartTime': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Create a new session (typically called by matchmaking)
   * DEPRECATED: Use findOrJoinSession instead
   */
  async createSession(options: CreateSessionOptions): Promise<GameSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // Use provided matchId or generate new one
    const matchId = options.matchId || `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    
    // Build players map
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
  
  /**
   * Reconnect to an existing session
   */
  private async reconnectToSession(
    sessionRef: any,
    playerInfo: PlayerInfo
  ): Promise<void> {
    if (!this.userId) throw new Error('userId not set');
    
    await updateDoc(sessionRef, {
      [`players.${this.userId}.status`]: 'connected',
      [`players.${this.userId}.lastHeartbeat`]: serverTimestamp(),
      [`players.${this.userId}.connectionId`]: this.connectionId,
      [`players.${this.userId}.displayName`]: playerInfo.displayName,
      [`players.${this.userId}.avatar`]: playerInfo.avatar,
      updatedAt: serverTimestamp(),
    }).catch((error) => {
      if (error?.code === 'not-found') {
        console.warn('⚠️ SESSION MANAGER - Player not found in session, recreating entry');
        return setDoc(sessionRef, {
          players: {
            [this.userId!]: {
              userId: this.userId,
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
  
  /**
   * Start heartbeat to maintain presence
   * - Updates lastHeartbeat timestamp every 5 seconds
   * - Server can detect disconnections after 15 seconds without heartbeat
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(async () => {
      if (!this.sessionId || !this.userId) return;
      
      try {
        await updateDoc(doc(db, 'sessions', this.sessionId), {
          [`players.${this.userId}.lastHeartbeat`]: serverTimestamp(),
          [`players.${this.userId}.status`]: 'connected',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('❌ SESSION MANAGER - Heartbeat failed:', error);
        this.eventHandlers.onSessionError?.(error as Error);
      }
    }, 5000); // Every 5 seconds
  }
  
  /**
   * Submit phase work
   * - Updates player's phase data
   * - Firestore triggers will handle coordination
   */
  async submitPhase(
    phase: Phase,
    data: PhaseSubmissionData
  ): Promise<void> {
    if (!this.sessionId || !this.userId) {
      console.error(`❌ SESSION MANAGER - Cannot submit phase ${phase}: Session not initialized`);
      throw new Error('Session not initialized');
    }
    
    const sessionRef = doc(db, 'sessions', this.sessionId);
    
    await updateDoc(sessionRef, {
      [`players.${this.userId}.phases.phase${phase}`]: {
        submitted: true,
        submittedAt: serverTimestamp(),
        ...data,
      },
      updatedAt: serverTimestamp(),
    });
  }
  
  /**
   * Start periodic session refresh as backup (every 30 seconds)
   */
  private startPeriodicRefresh(): void {
    if (this.periodicRefreshInterval) {
      clearInterval(this.periodicRefreshInterval);
    }

    this.periodicRefreshInterval = setInterval(async () => {
      if (!this.sessionId || !this.userId) return;

      try {
        const sessionRef = doc(db, 'sessions', this.sessionId);
        const sessionSnap = await getDoc(sessionRef);
        
        if (sessionSnap.exists()) {
          const updatedSession = sessionSnap.data() as GameSession;
          // Only update if session actually changed (prevent unnecessary re-renders)
          if (JSON.stringify(updatedSession) !== JSON.stringify(this.currentSession)) {
            this.currentSession = updatedSession;
            this.eventHandlers.onSessionUpdate?.(updatedSession);
          }
        }
      } catch (error) {
        console.error('❌ SESSION MANAGER - Periodic refresh failed:', error);
      }
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Listen for real-time session updates
   */
  private listenToSession(): void {
    if (!this.sessionId) return;
    
    
    const sessionRef = doc(db, 'sessions', this.sessionId);
    
    this.sessionListener = onSnapshot(
      sessionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.error('❌ SESSION MANAGER - Session no longer exists');
          this.eventHandlers.onSessionError?.(new Error('Session deleted'));
          return;
        }
        
        const session = snapshot.data() as GameSession;
        const previousSession = this.currentSession;
        this.currentSession = session;
        
        // Emit session update event
        this.eventHandlers.onSessionUpdate?.(session);
        
        // Check for phase transition
        if (previousSession && previousSession.config.phase !== session.config.phase) {
          this.eventHandlers.onPhaseTransition?.(session.config.phase);
        }
        
        // Check for player status changes
        if (previousSession) {
          for (const [userId, player] of Object.entries(session.players)) {
            const prevPlayer = previousSession.players[userId];
            if (prevPlayer && prevPlayer.status !== player.status) {
              this.eventHandlers.onPlayerStatusChange?.(userId, player.status);
            }
          }
        }
        
        // Check if all players ready
        if (session.coordination.allPlayersReady && !previousSession?.coordination.allPlayersReady) {
          this.eventHandlers.onAllPlayersReady?.();
        }
      },
      (error) => {
        console.error('❌ SESSION MANAGER - Error listening to session:', error);
        this.eventHandlers.onSessionError?.(error);
      }
    );
  }
  
  /**
   * Register event handlers
   */
  on<K extends keyof SessionEvents>(
    event: K,
    handler: SessionEvents[K]
  ): void {
    this.eventHandlers[event] = handler;
  }
  
  /**
   * Get current session state
   */
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }
  
  /**
   * Get current phase timing info
   */
  getPhaseTimeRemaining(): number {
    if (!this.currentSession) return 0;
    
    const { config, timing } = this.currentSession;
    const phase = config.phase;
    
    let startTime: Timestamp | undefined;
    if (phase === 1) startTime = timing.phase1StartTime;
    else if (phase === 2) startTime = timing.phase2StartTime;
    else if (phase === 3) startTime = timing.phase3StartTime;
    
    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 TIMER DEBUG:', {
        phase,
        phase1Start: timing.phase1StartTime ? 'SET' : 'MISSING',
        phase2Start: timing.phase2StartTime ? 'SET' : 'MISSING',
        phase3Start: timing.phase3StartTime ? 'SET' : 'MISSING',
        usingStart: startTime ? 'FOUND' : 'MISSING',
      });
    }
    
    if (!startTime) {
      return config.phaseDuration;
    }
    
    const elapsed = Date.now() - startTime.toMillis();
    const remaining = config.phaseDuration - Math.floor(elapsed / 1000);
    
    return Math.max(0, remaining);
  }
  
  /**
   * Check if current user has submitted current phase
   */
  hasSubmittedCurrentPhase(): boolean {
    if (!this.currentSession || !this.userId) return false;
    
    const player = this.currentSession.players[this.userId];
    if (!player) return false;
    
    const phase = this.currentSession.config.phase;
    return player.phases[`phase${phase}`]?.submitted || false;
  }
  
  /**
   * Get list of connected players
   */
  getConnectedPlayers(): SessionPlayer[] {
    if (!this.currentSession) return [];
    
    return Object.values(this.currentSession.players).filter(
      p => p.status === 'connected'
    );
  }
  
  /**
   * Get submission count for current phase
   */
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
  
  /**
   * Leave session gracefully
   */
  async leaveSession(): Promise<void> {
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.periodicRefreshInterval) {
      clearInterval(this.periodicRefreshInterval);
      this.periodicRefreshInterval = null;
    }
    
    // Stop listening
    if (this.sessionListener) {
      this.sessionListener();
      this.sessionListener = null;
    }
    
    // Mark as disconnected
    if (this.sessionId && this.userId) {
      try {
        await updateDoc(doc(db, 'sessions', this.sessionId), {
          [`players.${this.userId}.status`]: 'disconnected',
          [`players.${this.userId}.lastHeartbeat`]: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('❌ SESSION MANAGER - Error leaving session:', error);
      }
    }
    
    // Clear state
    this.sessionId = null;
    this.userId = null;
    this.currentSession = null;
    this.eventHandlers = {};
    
  }
  
  /**
   * Cleanup on destroy
   */
  destroy(): void {
    this.leaveSession();
  }
}

/**
 * Singleton instance for easy access
 * Usage: import { sessionManager } from '@/lib/services/session-manager';
 */
export const sessionManager = new SessionManager();

