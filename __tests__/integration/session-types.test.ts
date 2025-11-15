import { GameSession, SessionPlayer, PhaseData } from '@/lib/types/session';
import { Timestamp } from 'firebase/firestore';

describe('Session Types', () => {
  describe('GameSession', () => {
    it('should have correct structure', () => {
      const session: GameSession = {
        sessionId: 'session-123',
        matchId: 'match-123',
        mode: 'ranked',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative',
          phase: 1,
          phaseDuration: 120,
        },
        players: {},
        state: 'active',
        timing: {},
        coordination: {
          readyCount: 0,
          allPlayersReady: false,
        },
      };
      
      expect(session.sessionId).toBe('session-123');
      expect(session.mode).toBe('ranked');
      expect(session.config.phase).toBe(1);
      expect(session.state).toBe('active');
    });
  });
  
  describe('SessionPlayer', () => {
    it('should have correct structure', () => {
      const player: SessionPlayer = {
        userId: 'user-1',
        displayName: 'Alice',
        avatar: '🌸',
        rank: 'Silver II',
        isAI: false,
        status: 'connected',
        lastHeartbeat: Timestamp.now(),
        connectionId: 'conn-123',
        phases: {},
      };
      
      expect(player.userId).toBe('user-1');
      expect(player.status).toBe('connected');
      expect(player.isAI).toBe(false);
    });
    
    it('should support phase data', () => {
      const phaseData: PhaseData = {
        submitted: true,
        submittedAt: Timestamp.now(),
        content: 'My writing',
        wordCount: 50,
        score: 85,
      };
      
      const player: SessionPlayer = {
        userId: 'user-1',
        displayName: 'Alice',
        avatar: '🌸',
        rank: 'Silver II',
        isAI: false,
        status: 'connected',
        lastHeartbeat: Timestamp.now(),
        connectionId: 'conn-123',
        phases: {
          phase1: phaseData,
        },
      };
      
      expect(player.phases.phase1?.submitted).toBe(true);
      expect(player.phases.phase1?.wordCount).toBe(50);
      expect(player.phases.phase1?.score).toBe(85);
    });
  });
  
  describe('Session State Machine', () => {
    it('should support all valid states', () => {
      const validStates = ['forming', 'active', 'waiting', 'transitioning', 'completed', 'abandoned'];
      
      validStates.forEach(state => {
        const session: Partial<GameSession> = {
          state: state as any,
        };
        
        expect(['forming', 'active', 'waiting', 'transitioning', 'completed', 'abandoned']).toContain(session.state);
      });
    });
  });
  
  describe('Session Modes', () => {
    it('should support all game modes', () => {
      const modes: Array<'practice' | 'quick-match' | 'ranked'> = ['practice', 'quick-match', 'ranked'];
      
      modes.forEach(mode => {
        const session: Partial<GameSession> = {
          mode,
        };
        
        expect(['practice', 'quick-match', 'ranked']).toContain(session.mode);
      });
    });
  });
  
  describe('Phase Progression', () => {
    it('should track all three phases', () => {
      const player: SessionPlayer = {
        userId: 'user-1',
        displayName: 'Alice',
        avatar: '🌸',
        rank: 'Silver II',
        isAI: false,
        status: 'connected',
        lastHeartbeat: Timestamp.now(),
        connectionId: 'conn-123',
        phases: {
          phase1: {
            submitted: true,
            content: 'Original writing',
            wordCount: 100,
            score: 85,
          },
          phase2: {
            submitted: true,
            score: 90,
          },
          phase3: {
            submitted: true,
            content: 'Revised writing',
            wordCount: 110,
            score: 92,
          },
        },
      };
      
      expect(player.phases.phase1?.submitted).toBe(true);
      expect(player.phases.phase2?.submitted).toBe(true);
      expect(player.phases.phase3?.submitted).toBe(true);
      
      // Score should improve through phases
      expect(player.phases.phase3?.score).toBeGreaterThan(player.phases.phase1?.score!);
    });
  });
});

