import { SessionManager } from '@/lib/services/session-manager';
import { GameSession, CreateSessionOptions } from '@/lib/types/session';
import { Timestamp } from 'firebase/firestore';

// Mock Firestore
const mockFirestore = {
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => Timestamp.now()),
};

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: (...args: any[]) => mockFirestore.doc(...args),
  getDoc: (...args: any[]) => mockFirestore.getDoc(...args),
  setDoc: (...args: any[]) => mockFirestore.setDoc(...args),
  updateDoc: (...args: any[]) => mockFirestore.updateDoc(...args),
  onSnapshot: (...args: any[]) => mockFirestore.onSnapshot(...args),
  serverTimestamp: () => mockFirestore.serverTimestamp(),
  Timestamp: {
    now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0, toMillis: () => Date.now() }),
  },
}));

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  
  beforeEach(() => {
    sessionManager = new SessionManager();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    sessionManager.destroy();
  });
  
  describe('createSession', () => {
    it('should create a new session with correct structure', async () => {
      const options: CreateSessionOptions = {
        mode: 'ranked',
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative',
          phase: 1,
          phaseDuration: 120,
        },
        players: [
          {
            userId: 'user-1',
            displayName: 'Alice',
            avatar: '🌸',
            rank: 'Silver II',
            isAI: false,
          },
          {
            userId: 'user-2',
            displayName: 'Bob',
            avatar: '🎯',
            rank: 'Silver III',
            isAI: true,
          },
        ],
      };
      
      mockFirestore.setDoc.mockResolvedValue(undefined);
      
      const session = await sessionManager.createSession(options);
      
      expect(session.mode).toBe('ranked');
      expect(session.config.phase).toBe(1);
      expect(session.state).toBe('active');
      expect(Object.keys(session.players)).toHaveLength(2);
      expect(session.players['user-1'].displayName).toBe('Alice');
      expect(session.players['user-2'].isAI).toBe(true);
      expect(session.coordination.allPlayersReady).toBe(false);
      expect(mockFirestore.setDoc).toHaveBeenCalled();
    });
    
    it('should generate unique session IDs', async () => {
      const options: CreateSessionOptions = {
        mode: 'practice',
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative',
          phase: 1,
          phaseDuration: 120,
        },
        players: [
          {
            userId: 'user-1',
            displayName: 'Alice',
            avatar: '🌸',
            rank: 'Silver II',
          },
        ],
      };
      
      mockFirestore.setDoc.mockResolvedValue(undefined);
      
      const session1 = await sessionManager.createSession(options);
      const session2 = await sessionManager.createSession(options);
      
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });
  });
  
  describe('joinSession', () => {
    it('should throw error if session does not exist', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
      });
      
      await expect(
        sessionManager.joinSession('nonexistent-session', 'user-1', {
          displayName: 'Alice',
          avatar: '🌸',
          rank: 'Silver II',
        })
      ).rejects.toThrow('Session not found');
    });
    
    it('should reconnect to existing session', async () => {
      const existingSession: Partial<GameSession> = {
        sessionId: 'session-123',
        mode: 'ranked',
        state: 'active',
        players: {
          'user-1': {
            userId: 'user-1',
            displayName: 'Alice',
            avatar: '🌸',
            rank: 'Silver II',
            isAI: false,
            status: 'disconnected',
            lastHeartbeat: Timestamp.now(),
            connectionId: 'old-conn',
            phases: {},
          },
        },
      };
      
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingSession,
      });
      
      mockFirestore.updateDoc.mockResolvedValue(undefined);
      mockFirestore.onSnapshot.mockReturnValue(jest.fn());
      
      await sessionManager.joinSession('session-123', 'user-1', {
        displayName: 'Alice',
        avatar: '🌸',
        rank: 'Silver II',
      });
      
      expect(mockFirestore.updateDoc).toHaveBeenCalled();
    });
  });
  
  describe('submitPhase', () => {
    it('should throw error if session not initialized', async () => {
      await expect(
        sessionManager.submitPhase(1, {
          content: 'Test writing',
          wordCount: 10,
          score: 85,
        })
      ).rejects.toThrow('Session not initialized');
    });
  });
  
  describe('heartbeat', () => {
    it('should start heartbeat when joining session', async () => {
      jest.useFakeTimers();
      
      const existingSession: Partial<GameSession> = {
        sessionId: 'session-123',
        players: {
          'user-1': {
            userId: 'user-1',
            displayName: 'Alice',
            avatar: '🌸',
            rank: 'Silver II',
            isAI: false,
            status: 'connected',
            lastHeartbeat: Timestamp.now(),
            connectionId: 'conn-123',
            phases: {},
          },
        },
      };
      
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingSession,
      });
      
      mockFirestore.updateDoc.mockResolvedValue(undefined);
      mockFirestore.onSnapshot.mockReturnValue(jest.fn());
      
      await sessionManager.joinSession('session-123', 'user-1', {
        displayName: 'Alice',
        avatar: '🌸',
        rank: 'Silver II',
      });
      
      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000);
      
      // Heartbeat should have been called
      expect(mockFirestore.updateDoc).toHaveBeenCalledTimes(2); // Once for join, once for heartbeat
      
      jest.useRealTimers();
    });
  });
  
  describe('getSubmissionCount', () => {
    it('should count only real players (not AI)', () => {
      const session: Partial<GameSession> = {
        config: { phase: 1 } as any,
        players: {
          'user-1': {
            userId: 'user-1',
            isAI: false,
            phases: { phase1: { submitted: true } },
          } as any,
          'ai-1': {
            userId: 'ai-1',
            isAI: true,
            phases: { phase1: { submitted: true } },
          } as any,
          'user-2': {
            userId: 'user-2',
            isAI: false,
            phases: {},
          } as any,
        },
      };
      
      // @ts-ignore - Testing internal state
      sessionManager.currentSession = session;
      
      const count = sessionManager.getSubmissionCount();
      
      expect(count.submitted).toBe(1); // Only user-1
      expect(count.total).toBe(2); // user-1 and user-2 (not AI)
    });
  });
  
  describe('getPhaseTimeRemaining', () => {
    it('should calculate time remaining correctly', () => {
      const now = Date.now();
      const startTime = {
        seconds: Math.floor(now / 1000) - 30,
        nanoseconds: 0,
        toMillis: () => now - 30000,
      } as any; // 30 seconds ago
      
      const session: Partial<GameSession> = {
        config: {
          phase: 1,
          phaseDuration: 120,
        } as any,
        timing: {
          phase1StartTime: startTime,
        },
      };
      
      // @ts-ignore
      sessionManager.currentSession = session;
      
      const remaining = sessionManager.getPhaseTimeRemaining();
      
      expect(remaining).toBeGreaterThan(85); // Should be ~90 seconds
      expect(remaining).toBeLessThan(95);
    });
    
    it('should return 0 if time has expired', () => {
      const now = Date.now();
      const startTime = {
        seconds: Math.floor(now / 1000) - 150,
        nanoseconds: 0,
        toMillis: () => now - 150000,
      } as any; // 150 seconds ago
      
      const session: Partial<GameSession> = {
        config: {
          phase: 1,
          phaseDuration: 120,
        } as any,
        timing: {
          phase1StartTime: startTime,
        },
      };
      
      // @ts-ignore
      sessionManager.currentSession = session;
      
      const remaining = sessionManager.getPhaseTimeRemaining();
      
      expect(remaining).toBe(0);
    });
  });
});

