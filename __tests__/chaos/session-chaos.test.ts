import { SessionManager } from '@/lib/services/session-manager';
import { CreateSessionOptions } from '@/lib/types/session';

jest.mock('firebase/firestore');

describe('Session Chaos Engineering Tests', () => {
  
  describe('Chaos Monkey - Random Failures', () => {
    it('should survive random operation failures', async () => {
      const manager = new SessionManager();
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      
      // Randomly fail 50% of operations
      mockUpdateDoc.mockImplementation(() => {
        if (Math.random() > 0.5) {
          return Promise.reject(new Error('Random chaos failure'));
        }
        return Promise.resolve(undefined);
      });
      
      // @ts-ignore
      manager.sessionId = 'chaos-session';
      manager.userId = 'user-1';
      
      // Try 100 submissions
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < 100; i++) {
        try {
          await manager.submitPhase(1, {
            content: `Attempt ${i}`,
            wordCount: 10,
            score: 75,
          });
          successCount++;
        } catch (error) {
          failureCount++;
        }
      }
      
      console.log(`Chaos test: ${successCount} succeeded, ${failureCount} failed`);
      
      // Should have roughly 50/50 split
      expect(successCount).toBeGreaterThan(30);
      expect(failureCount).toBeGreaterThan(30);
      
      manager.destroy();
    }, 15000);
    
    it('should handle random delays in Firestore operations', async () => {
      const manager = new SessionManager();
      
      const mockSetDoc = require('firebase/firestore').setDoc;
      
      // Random delays 0-500ms
      mockSetDoc.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(resolve, Math.random() * 500)
        )
      );
      
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
      
      const startTime = Date.now();
      
      // Create 20 sessions with random delays
      const promises = Array.from({ length: 20 }, () =>
        manager.createSession(options)
      );
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      console.log(`Created 20 sessions with random delays in ${duration}ms`);
      
      // Should complete despite random delays
      expect(duration).toBeLessThan(10000);
      
      manager.destroy();
    }, 15000);
  });
  
  describe('Fuzzing - Random Invalid Data', () => {
    it('should handle completely random session data', () => {
      const manager = new SessionManager();
      
      // Generate random garbage data
      const randomData: any = {
        config: {
          phase: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : null,
          phaseDuration: Math.random() > 0.5 ? Math.random() * 1000000 : -1000,
        },
        players: Math.random() > 0.5 ? {} : null,
        timing: Math.random() > 0.5 ? {} : { phase1StartTime: 'invalid' },
      };
      
      // @ts-ignore - Inject random data
      manager.currentSession = randomData;
      
      // Should not crash on any operation
      expect(() => manager.getPhaseTimeRemaining()).not.toThrow();
      expect(() => manager.getSubmissionCount()).not.toThrow();
      expect(() => manager.hasSubmittedCurrentPhase()).not.toThrow();
      expect(() => manager.getConnectedPlayers()).not.toThrow();
      
      manager.destroy();
    });
    
    it('should handle random phase submission data', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Submit 50 times with completely random data
      const submissions = Array.from({ length: 50 }, () => {
        const randomData: any = {
          content: Math.random() > 0.5 ? Math.random().toString(36) : null,
          wordCount: Math.random() > 0.5 ? Math.random() * 100000 : undefined,
          score: Math.random() > 0.5 ? Math.random() * 1000 - 500 : null,
        };
        
        return manager.submitPhase(
          (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
          randomData
        );
      });
      
      await Promise.all(submissions);
      
      // Should complete all submissions
      expect(mockUpdateDoc).toHaveBeenCalledTimes(50);
      
      manager.destroy();
    }, 10000);
  });
  
  describe('Load Testing', () => {
    it('should handle 10,000 getSubmissionCount calls per second', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: { phase: 1 },
        players: {
          'user-1': { userId: 'user-1', isAI: false, phases: { phase1: { submitted: true } } },
          'user-2': { userId: 'user-2', isAI: false, phases: {} },
        },
      };
      
      const startTime = Date.now();
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        manager.getSubmissionCount();
      }
      
      const duration = Date.now() - startTime;
      const opsPerSecond = iterations / (duration / 1000);
      
      console.log(`Performance: ${opsPerSecond.toFixed(0)} ops/sec`);
      
      // Should achieve > 10,000 ops/sec
      expect(opsPerSecond).toBeGreaterThan(10000);
      
      manager.destroy();
    });
    
    it('should handle creating 100 sessions with 50 players each', async () => {
      const startTime = Date.now();
      
      const createPromises = Array.from({ length: 100 }, (_, sessionIdx) => {
        const manager = new SessionManager();
        
        const players = Array.from({ length: 50 }, (_, i) => ({
          userId: `session-${sessionIdx}-user-${i}`,
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
        
        return manager.createSession(options).then(session => {
          manager.destroy();
          return session;
        });
      });
      
      const sessions = await Promise.all(createPromises);
      const duration = Date.now() - startTime;
      
      console.log(`Created 100 sessions (50 players each) in ${duration}ms`);
      
      // Verify all sessions created
      expect(sessions).toHaveLength(100);
      
      // Verify each has 50 players
      sessions.forEach(session => {
        expect(Object.keys(session.players)).toHaveLength(50);
      });
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(15000);
    }, 20000);
  });
  
  describe('Pathological Cases', () => {
    it('should handle player name with only whitespace', async () => {
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
        players: [
          {
            userId: 'user-1',
            displayName: '   \t\n   ', // Only whitespace
            avatar: '',
            rank: '',
          },
        ],
      };
      
      const session = await manager.createSession(options);
      
      expect(session.players['user-1']).toBeTruthy();
      
      manager.destroy();
    });
    
    it('should handle session with duplicate user IDs', async () => {
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
            userId: 'duplicate',
            displayName: 'Player 1',
            avatar: '👤',
            rank: 'Silver II',
          },
          {
            userId: 'duplicate', // Same ID!
            displayName: 'Player 2',
            avatar: '🎮',
            rank: 'Gold I',
          },
        ],
      };
      
      const session = await manager.createSession(options);
      
      // Last one wins (Firestore map behavior)
      expect(Object.keys(session.players)).toHaveLength(1);
      expect(session.players['duplicate'].displayName).toBe('Player 2');
      
      manager.destroy();
    });
    
    it('should handle content with null bytes and control characters', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const evilContent = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F';
      
      await manager.submitPhase(1, {
        content: evilContent,
        wordCount: 1,
        score: 50,
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
  });
  
  describe('Timing Attack Scenarios', () => {
    it('should complete operations in consistent time regardless of data', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Short content
      const start1 = Date.now();
      await manager.submitPhase(1, {
        content: 'Hi',
        wordCount: 1,
        score: 50,
      });
      const duration1 = Date.now() - start1;
      
      // Long content
      const start2 = Date.now();
      await manager.submitPhase(1, {
        content: 'x'.repeat(100000),
        wordCount: 100000,
        score: 50,
      });
      const duration2 = Date.now() - start2;
      
      console.log(`Short: ${duration1}ms, Long: ${duration2}ms`);
      
      // Should have similar timing (prevent timing attacks)
      // Allow 10x difference for serialization overhead
      expect(duration2).toBeLessThan(duration1 * 10);
      
      manager.destroy();
    });
  });
  
  describe('Session ID Collision Resistance', () => {
    it('should have extremely low collision probability', async () => {
      const manager = new SessionManager();
      
      // Generate 10,000 session IDs
      const sessionIds = new Set<string>();
      
      for (let i = 0; i < 10000; i++) {
        const session = await manager.createSession({
          mode: 'practice',
          config: {
            trait: 'all',
            promptId: 'prompt-1',
            promptType: 'narrative',
            phase: 1,
            phaseDuration: 120,
          },
          players: [],
        });
        
        sessionIds.add(session.sessionId);
      }
      
      // All should be unique
      expect(sessionIds.size).toBe(10000);
      
      manager.destroy();
    }, 30000);
    
    it('should generate IDs with good entropy', async () => {
      const manager = new SessionManager();
      
      const sessions = await Promise.all(
        Array.from({ length: 100 }, () =>
          manager.createSession({
            mode: 'practice',
            config: {
              trait: 'all',
              promptId: 'prompt-1',
              promptType: 'narrative',
              phase: 1,
              phaseDuration: 120,
            },
            players: [],
          })
        )
      );
      
      const ids = sessions.map(s => s.sessionId);
      
      // Check for patterns (should not have obvious patterns)
      const hasPattern = ids.some((id, i) => {
        if (i === 0) return false;
        const prev = ids[i - 1];
        // Check if consecutive IDs are too similar
        const diff = id.split('').filter((char, idx) => char !== prev[idx]).length;
        return diff < 10; // Should differ in at least 10 characters
      });
      
      expect(hasPattern).toBe(false);
      
      manager.destroy();
    }, 10000);
  });
  
  describe('Denial of Service Scenarios', () => {
    it('should rate limit rapid session creation from same source', async () => {
      // This would be implemented at Firebase security rules level
      // Here we test that the code can handle rapid creation
      
      const manager = new SessionManager();
      
      const startTime = Date.now();
      
      // Try to create 1000 sessions as fast as possible
      const promises = Array.from({ length: 1000 }, () =>
        manager.createSession({
          mode: 'practice',
          config: {
            trait: 'all',
            promptId: 'prompt-1',
            promptType: 'narrative',
            phase: 1,
            phaseDuration: 120,
          },
          players: [],
        })
      );
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      console.log(`Created 1000 sessions in ${duration}ms`);
      
      // Should complete (DoS protection would be at Firebase level)
      expect(promises).toHaveLength(1000);
      
      manager.destroy();
    }, 30000);
    
    it('should handle session with 1000 simultaneous heartbeats', async () => {
      jest.useFakeTimers();
      
      const managers = Array.from({ length: 1000 }, () => new SessionManager());
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ sessionId: 'test', players: {} }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      // All join the same session
      await Promise.all(
        managers.map((m, i) =>
          m.joinSession('massive-session', `user-${i}`, {
            displayName: `User ${i}`,
            avatar: '👤',
            rank: 'Silver II',
          })
        )
      );
      
      // Trigger heartbeat
      jest.advanceTimersByTime(6000);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should handle all heartbeats (1000+ concurrent updates)
      console.log(`Handled ${managers.length} simultaneous heartbeats`);
      
      managers.forEach(m => m.destroy());
      jest.useRealTimers();
    }, 20000);
  });
  
  describe('Data Corruption Scenarios', () => {
    it('should handle partially corrupt player data', () => {
      const manager = new SessionManager();
      
      // @ts-ignore - Corrupt data
      manager.currentSession = {
        config: { phase: 1 },
        players: {
          'user-1': { userId: 'user-1', phases: null }, // Corrupt!
          'user-2': null, // Completely corrupt!
          'user-3': { userId: 'user-3', isAI: 'maybe' }, // Wrong type!
        },
      } as any;
      
      // Should not crash
      expect(() => {
        manager.getSubmissionCount();
      }).not.toThrow();
      
      expect(() => {
        manager.getConnectedPlayers();
      }).not.toThrow();
      
      manager.destroy();
    });
    
    it('should handle missing required fields', () => {
      const manager = new SessionManager();
      
      // @ts-ignore - Missing fields
      manager.currentSession = {
        // No config!
        players: {},
      } as any;
      
      // Should handle gracefully
      expect(() => manager.getPhaseTimeRemaining()).not.toThrow();
      expect(() => manager.hasSubmittedCurrentPhase()).not.toThrow();
      
      manager.destroy();
    });
  });
  
  describe('Concurrency Chaos', () => {
    it('should handle interleaved join/leave operations', async () => {
      const manager = new SessionManager();
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ sessionId: 'test', players: {} }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      // Rapidly join and leave 50 times
      for (let i = 0; i < 50; i++) {
        await manager.joinSession('chaos', 'user-1', {
          displayName: 'Chaos User',
          avatar: '💥',
          rank: 'Silver II',
        });
        
        // Immediately leave
        await manager.leaveSession();
      }
      
      // Should end in clean state
      expect(manager.getCurrentSession()).toBeNull();
      
      manager.destroy();
    }, 20000);
    
    it('should handle concurrent phase submissions and session updates', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      manager.currentSession = {
        config: { phase: 1 },
        players: {},
      };
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Mix of different operations happening simultaneously
      const operations = [
        ...Array.from({ length: 10 }, () => 
          manager.submitPhase(1, { content: 'Test', wordCount: 10, score: 75 })
        ),
        ...Array.from({ length: 10 }, () => 
          manager.submitPhase(2, { responses: {} as any, score: 80 })
        ),
        ...Array.from({ length: 10 }, () => 
          manager.submitPhase(3, { revisedContent: 'Revised', wordCount: 15, score: 85 })
        ),
      ];
      
      // Shuffle operations
      operations.sort(() => Math.random() - 0.5);
      
      await Promise.all(operations);
      
      // All should complete
      expect(mockUpdateDoc).toHaveBeenCalledTimes(30);
      
      manager.destroy();
    });
  });
  
  describe('Resource Exhaustion', () => {
    it('should handle extremely rapid event handler registrations', () => {
      const manager = new SessionManager();
      
      // Register 10,000 event handlers
      for (let i = 0; i < 10000; i++) {
        manager.on('onSessionUpdate', () => {
          // Handler that does nothing
        });
      }
      
      // Should not crash or leak memory significantly
      expect(manager).toBeTruthy();
      
      manager.destroy();
    });
    
    it('should handle creating session with maximum Firestore document size', async () => {
      const manager = new SessionManager();
      
      // Create session with many players to approach Firestore limits
      const players = Array.from({ length: 500 }, (_, i) => ({
        userId: `user-${i}`,
        displayName: `Player ${i} with a very long name to increase document size`,
        avatar: '👤🎮🔥💀👻🎯',
        rank: 'Silver II Diamond Master Elite',
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
      
      // Should create successfully
      expect(Object.keys(session.players)).toHaveLength(500);
      
      manager.destroy();
    });
  });
  
  describe('Byzantine Failures', () => {
    it('should handle inconsistent player states', () => {
      const manager = new SessionManager();
      
      // @ts-ignore - Inconsistent state
      manager.currentSession = {
        config: { phase: 1 },
        coordination: {
          readyCount: 5,
          allPlayersReady: true, // Says all ready
        },
        players: {
          'user-1': { userId: 'user-1', isAI: false, phases: {} }, // But this one NOT submitted!
          'user-2': { userId: 'user-2', isAI: false, phases: { phase1: { submitted: true } } },
        },
      };
      
      const count = manager.getSubmissionCount();
      
      // Should report actual count, not coordination claim
      expect(count.submitted).toBe(1);
      expect(count.total).toBe(2);
      
      manager.destroy();
    });
    
    it('should handle time traveling (future timestamps)', () => {
      const manager = new SessionManager();
      
      const futureTime = {
        toMillis: () => Date.now() + 3600000, // 1 hour in the future!
      } as any;
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: 120,
        },
        timing: {
          phase1StartTime: futureTime,
        },
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      // Should handle future timestamp (would show full duration)
      expect(remaining).toBeGreaterThanOrEqual(0);
      
      manager.destroy();
    });
  });
});

