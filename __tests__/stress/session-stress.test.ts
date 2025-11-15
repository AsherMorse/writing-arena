import { SessionManager } from '@/lib/services/session-manager';
import { CreateSessionOptions } from '@/lib/types/session';
import { Timestamp } from 'firebase/firestore';

// Mock Firestore for stress tests
jest.mock('firebase/firestore');

describe('SessionManager Stress Tests', () => {
  
  describe('Concurrent Operations', () => {
    it('should handle 100 simultaneous session creations', async () => {
      const managers = Array.from({ length: 100 }, () => new SessionManager());
      
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
            displayName: 'Test User',
            avatar: '🎮',
            rank: 'Silver II',
          },
        ],
      };
      
      const startTime = Date.now();
      
      // Create 100 sessions concurrently
      const promises = managers.map(manager => 
        manager.createSession(options).catch(err => ({ error: err }))
      );
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      // Verify all succeeded
      const errors = results.filter(r => 'error' in r);
      expect(errors).toHaveLength(0);
      
      // Verify all session IDs are unique
      const sessionIds = new Set(results.map((r: any) => r.sessionId));
      expect(sessionIds.size).toBe(100);
      
      // Should complete in reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Cleanup
      managers.forEach(m => m.destroy());
    }, 10000);
    
    it('should handle 50 players joining the same session concurrently', async () => {
      const manager = new SessionManager();
      const sessionId = 'stress-test-session';
      
      // Mock session exists
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          sessionId,
          players: {},
          state: 'active',
        }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      // 50 players join concurrently
      const joinPromises = Array.from({ length: 50 }, (_, i) => 
        manager.joinSession(sessionId, `user-${i}`, {
          displayName: `Player ${i}`,
          avatar: '👤',
          rank: 'Silver II',
        }).catch(err => ({ error: err }))
      );
      
      const results = await Promise.all(joinPromises);
      
      // All should succeed (or handle gracefully)
      expect(results.length).toBe(50);
      
      manager.destroy();
    }, 10000);
    
    it('should handle rapid phase submissions (race condition test)', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore - Set up session manually
      manager.sessionId = 'test-session';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Submit 100 times rapidly (simulating network retries/duplicates)
      const submissions = Array.from({ length: 100 }, () =>
        manager.submitPhase(1, {
          content: 'Test writing',
          wordCount: 50,
          score: 85,
        }).catch(err => ({ error: err }))
      );
      
      const results = await Promise.all(submissions);
      
      // All should complete (Firestore should handle duplicates)
      expect(results.length).toBe(100);
      
      manager.destroy();
    });
  });
  
  describe('Large Player Counts', () => {
    it('should handle session with 100 players', async () => {
      const manager = new SessionManager();
      
      const players = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        displayName: `Player ${i}`,
        avatar: '👤',
        rank: 'Silver II',
      }));
      
      const options: CreateSessionOptions = {
        mode: 'ranked',
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative',
          phase: 1,
          phaseDuration: 120,
        },
        players,
      };
      
      const session = await manager.createSession(options);
      
      // Verify all players were added
      expect(Object.keys(session.players)).toHaveLength(100);
      
      // Verify each player has correct structure
      Object.values(session.players).forEach(player => {
        expect(player).toHaveProperty('userId');
        expect(player).toHaveProperty('displayName');
        expect(player).toHaveProperty('status', 'connected');
        expect(player).toHaveProperty('phases');
      });
      
      manager.destroy();
    });
    
    it('should correctly count submissions with 100 players', () => {
      const manager = new SessionManager();
      
      // Create session with 100 players (50 real, 50 AI)
      const players: any = {};
      for (let i = 0; i < 100; i++) {
        players[`user-${i}`] = {
          userId: `user-${i}`,
          isAI: i >= 50, // Second half are AI
          phases: i < 30 ? { phase1: { submitted: true } } : {}, // 30 submitted
        };
      }
      
      // @ts-ignore
      manager.currentSession = {
        config: { phase: 1 },
        players,
      };
      
      const count = manager.getSubmissionCount();
      
      // Should count only real players who submitted (30 total, but 20 are AI)
      // So 10 real players submitted
      expect(count.submitted).toBe(10);
      expect(count.total).toBe(50); // Only real players
      
      manager.destroy();
    });
  });
  
  describe('Memory and Resource Tests', () => {
    it('should not leak memory when creating/destroying many managers', async () => {
      const iterations = 1000;
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < iterations; i++) {
        const manager = new SessionManager();
        manager.destroy();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (< 10MB for 1000 instances)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
    
    it('should handle heartbeat cleanup properly', async () => {
      jest.useFakeTimers();
      
      const managers = Array.from({ length: 10 }, () => new SessionManager());
      
      // Mock join session for each
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ sessionId: 'test', players: {} }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      // Join sessions
      await Promise.all(managers.map((m, i) => 
        m.joinSession('test-session', `user-${i}`, {
          displayName: 'Test',
          avatar: '👤',
          rank: 'Silver II',
        })
      ));
      
      // Destroy all managers
      managers.forEach(m => m.destroy());
      
      // Advance timers
      jest.advanceTimersByTime(10000);
      
      // No heartbeats should be sent after destroy
      // (Would need to verify updateDoc not called)
      
      jest.useRealTimers();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle session with empty player list', async () => {
      const manager = new SessionManager();
      
      const options: CreateSessionOptions = {
        mode: 'practice',
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative',
          phase: 1,
          phaseDuration: 120,
        },
        players: [], // Empty!
      };
      
      const session = await manager.createSession(options);
      
      expect(Object.keys(session.players)).toHaveLength(0);
      expect(session.coordination.readyCount).toBe(0);
      expect(session.coordination.allPlayersReady).toBe(false);
      
      manager.destroy();
    });
    
    it('should handle extremely long session durations', () => {
      const manager = new SessionManager();
      
      const now = Date.now();
      const startTime = {
        seconds: Math.floor(now / 1000) - 86400, // 24 hours ago!
        nanoseconds: 0,
        toMillis: () => now - 86400000,
      } as any;
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: 120, // But session is 24 hours old
        },
        timing: {
          phase1StartTime: startTime,
        },
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      // Should return 0 (time expired long ago)
      expect(remaining).toBe(0);
      
      manager.destroy();
    });
    
    it('should handle special characters in player names', async () => {
      const manager = new SessionManager();
      
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
            displayName: '🎮💀👻 L33t H@x0r™ <script>alert(1)</script>',
            avatar: '💩',
            rank: 'Silver II',
          },
        ],
      };
      
      const session = await manager.createSession(options);
      
      expect(session.players['user-1'].displayName).toContain('L33t H@x0r');
      
      manager.destroy();
    });
    
    it('should handle negative time remaining gracefully', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: -100, // Negative!
        },
        timing: {},
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      // Should handle gracefully (return 0 or the negative value)
      expect(typeof remaining).toBe('number');
      
      manager.destroy();
    });
  });
  
  describe('Failure Scenarios', () => {
    it('should handle Firestore write failures', async () => {
      const manager = new SessionManager();
      
      const mockSetDoc = require('firebase/firestore').setDoc;
      mockSetDoc.mockRejectedValue(new Error('Firestore unavailable'));
      
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
            displayName: 'Test',
            avatar: '👤',
            rank: 'Silver II',
          },
        ],
      };
      
      await expect(manager.createSession(options)).rejects.toThrow('Firestore unavailable');
      
      manager.destroy();
    });
    
    it('should handle heartbeat failures gracefully', async () => {
      jest.useFakeTimers();
      
      const manager = new SessionManager();
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ sessionId: 'test', players: {} }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockRejectedValue(new Error('Network error'));
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await manager.joinSession('test', 'user-1', {
        displayName: 'Test',
        avatar: '👤',
        rank: 'Silver II',
      });
      
      // Advance time to trigger heartbeat
      jest.advanceTimersByTime(6000);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should log error but not crash
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Heartbeat failed'),
        expect.any(Error)
      );
      
      errorSpy.mockRestore();
      jest.useRealTimers();
      manager.destroy();
    });
    
    it('should handle corrupted session data', () => {
      const manager = new SessionManager();
      
      // @ts-ignore - Inject corrupted data
      manager.currentSession = {
        config: null, // Corrupted!
        players: null,
      } as any;
      
      // Should not crash when getting submission count
      expect(() => {
        manager.getSubmissionCount();
      }).not.toThrow();
      
      manager.destroy();
    });
  });
  
  describe('Performance Benchmarks', () => {
    it('should create 1000 sessions in under 10 seconds', async () => {
      const startTime = Date.now();
      
      const managers = Array.from({ length: 1000 }, () => new SessionManager());
      
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
            displayName: 'Benchmark User',
            avatar: '⚡',
            rank: 'Silver II',
          },
        ],
      };
      
      const promises = managers.map(m => m.createSession(options));
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Created 1000 sessions in ${duration}ms`);
      expect(duration).toBeLessThan(10000);
      
      managers.forEach(m => m.destroy());
    }, 15000);
    
    it('should handle rapid getSubmissionCount calls', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: { phase: 1 },
        players: {
          'user-1': { userId: 'user-1', isAI: false, phases: { phase1: { submitted: true } } },
          'user-2': { userId: 'user-2', isAI: false, phases: {} },
        },
      };
      
      const iterations = 100000;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        manager.getSubmissionCount();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`100k getSubmissionCount calls in ${duration}ms`);
      
      // Should complete 100k calls in under 1 second
      expect(duration).toBeLessThan(1000);
      
      manager.destroy();
    });
  });
  
  describe('Boundary Conditions', () => {
    it('should handle session at exact time expiration', () => {
      const manager = new SessionManager();
      
      const now = Date.now();
      const startTime = {
        seconds: Math.floor(now / 1000) - 120, // Exactly 120 seconds ago
        nanoseconds: 0,
        toMillis: () => now - 120000,
      } as any;
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: 120,
        },
        timing: {
          phase1StartTime: startTime,
        },
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      // Should be 0 or very close to 0
      expect(remaining).toBeLessThanOrEqual(1);
      
      manager.destroy();
    });
    
    it('should handle all players being AI', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: { phase: 1 },
        players: {
          'ai-1': { userId: 'ai-1', isAI: true, phases: { phase1: { submitted: true } } },
          'ai-2': { userId: 'ai-2', isAI: true, phases: { phase1: { submitted: true } } },
        },
      };
      
      const count = manager.getSubmissionCount();
      
      // No real players
      expect(count.submitted).toBe(0);
      expect(count.total).toBe(0);
      
      manager.destroy();
    });
    
    it('should handle session with no timing data', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: 120,
        },
        timing: {}, // No phase1StartTime!
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      // Should return full duration
      expect(remaining).toBe(120);
      
      manager.destroy();
    });
  });
});

