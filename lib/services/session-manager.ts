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
    console.log('🎮 SESSION MANAGER - Joining session:', { sessionId, userId });
    
    this.sessionId = sessionId;
    this.userId = userId;
    
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      console.log('🔄 SESSION MANAGER - Reconnecting to existing session');
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
    
    console.log('✅ SESSION MANAGER - Successfully joined session');
    return this.currentSession;
  }
  
  /**
   * Create a new session (typically called by matchmaking)
   */
  async createSession(options: CreateSessionOptions): Promise<GameSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const matchId = `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    console.log('🎮 SESSION MANAGER - Creating new session:', sessionId);
    
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
    
    console.log('✅ SESSION MANAGER - Session created:', sessionId);
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
    });
    
    console.log('✅ SESSION MANAGER - Reconnected successfully');
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
    
    console.log('💓 SESSION MANAGER - Starting heartbeat');
    
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
      throw new Error('Session not initialized');
    }
    
    console.log(`📤 SESSION MANAGER - Submitting phase ${phase}`, data);
    
    const sessionRef = doc(db, 'sessions', this.sessionId);
    
    await updateDoc(sessionRef, {
      [`players.${this.userId}.phases.phase${phase}`]: {
        submitted: true,
        submittedAt: serverTimestamp(),
        ...data,
      },
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ SESSION MANAGER - Phase ${phase} submitted`);
  }
  
  /**
   * Listen for real-time session updates
   */
  private listenToSession(): void {
    if (!this.sessionId) return;
    
    console.log('👂 SESSION MANAGER - Listening for session updates');
    
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
          console.log('🔄 SESSION MANAGER - Phase transition detected:', session.config.phase);
          this.eventHandlers.onPhaseTransition?.(session.config.phase);
        }
        
        // Check for player status changes
        if (previousSession) {
          for (const [userId, player] of Object.entries(session.players)) {
            const prevPlayer = previousSession.players[userId];
            if (prevPlayer && prevPlayer.status !== player.status) {
              console.log(`👤 SESSION MANAGER - Player ${player.displayName} status: ${player.status}`);
              this.eventHandlers.onPlayerStatusChange?.(userId, player.status);
            }
          }
        }
        
        // Check if all players ready
        if (session.coordination.allPlayersReady && !previousSession?.coordination.allPlayersReady) {
          console.log('✅ SESSION MANAGER - All players ready!');
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
    
    if (!startTime) return config.phaseDuration;
    
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
    console.log('🚪 SESSION MANAGER - Leaving session');
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
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
    
    console.log('✅ SESSION MANAGER - Left session successfully');
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

