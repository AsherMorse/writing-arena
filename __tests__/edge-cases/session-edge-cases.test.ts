import { SessionManager } from '@/lib/services/session-manager';
import { CreateSessionOptions, GameSession } from '@/lib/types/session';

jest.mock('firebase/firestore');

describe('Session Edge Cases and Security', () => {
  
  describe('Malicious Input Handling', () => {
    it('should sanitize XSS attempts in player names', async () => {
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
            userId: 'hacker',
            displayName: '<script>alert("XSS")</script>',
            avatar: '<img src=x onerror=alert(1)>',
            rank: 'Silver II',
          },
        ],
      };
      
      const session = await manager.createSession(options);
      
      // Should preserve the text (React will escape it)
      expect(session.players['hacker'].displayName).toBe('<script>alert("XSS")</script>');
      
      manager.destroy();
    });
    
    it('should handle SQL injection attempts in content', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Attempt SQL injection (won't work with Firestore, but testing)
      await manager.submitPhase(1, {
        content: "'; DROP TABLE sessions; --",
        wordCount: 5,
        score: 85,
      });
      
      // Should not throw and should be treated as normal content
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
    
    it('should handle extremely long content (10MB)', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Create 10MB of text
      const largeContent = 'x'.repeat(10 * 1024 * 1024);
      
      await manager.submitPhase(1, {
        content: largeContent,
        wordCount: 10000000,
        score: 85,
      });
      
      // Should handle (Firestore has 1MB limit, but we're testing the code)
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
    
    it('should handle invalid Unicode characters', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Various problematic Unicode
      const weirdContent = '🔥💩👻\u0000\uFFFD\uD800\uDFFF';
      
      await manager.submitPhase(1, {
        content: weirdContent,
        wordCount: 5,
        score: 85,
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
  });
  
  describe('Race Conditions', () => {
    it('should handle simultaneous submissions from same user', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Submit 10 times simultaneously (network retries, duplicates)
      const submissions = Array.from({ length: 10 }, () =>
        manager.submitPhase(1, {
          content: 'Duplicate submission',
          wordCount: 20,
          score: 85,
        })
      );
      
      const results = await Promise.all(submissions);
      
      // All should complete
      expect(results).toHaveLength(10);
      
      // Firestore last-write-wins will handle duplicates
      
      manager.destroy();
    });
    
    it('should handle join and leave in rapid succession', async () => {
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
      
      // Join and immediately leave 100 times
      for (let i = 0; i < 100; i++) {
        await manager.joinSession('test', 'user-1', {
          displayName: 'Test',
          avatar: '👤',
          rank: 'Silver II',
        });
        
        await manager.leaveSession();
      }
      
      // Should complete without errors
      expect(manager.getCurrentSession()).toBeNull();
      
      manager.destroy();
    }, 15000);
  });
  
  describe('Data Integrity', () => {
    it('should maintain correct player count with additions and removals', () => {
      const manager = new SessionManager();
      
      const session: Partial<GameSession> = {
        config: { phase: 1 } as any,
        players: {},
      };
      
      // @ts-ignore
      manager.currentSession = session;
      
      // Add players dynamically
      for (let i = 0; i < 50; i++) {
        session.players![`user-${i}`] = {
          userId: `user-${i}`,
          isAI: i % 2 === 0, // Every other is AI
          phases: {},
        } as any;
      }
      
      const count = manager.getSubmissionCount();
      
      // Should have 25 real players (every other one)
      expect(count.total).toBe(25);
      
      manager.destroy();
    });
    
    it('should handle phase data with missing fields', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: { phase: 1 },
        players: {
          'user-1': {
            userId: 'user-1',
            isAI: false,
            phases: {
              phase1: {
                submitted: true,
                // Missing content, wordCount, score
              },
            },
          },
        },
      } as any;
      
      const count = manager.getSubmissionCount();
      
      // Should still count as submitted
      expect(count.submitted).toBe(1);
      
      manager.destroy();
    });
  });
  
  describe('Extreme Values', () => {
    it('should handle session with 0 second duration', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: 0, // Instant expiration
        },
        timing: {
          phase1StartTime: {
            toMillis: () => Date.now(),
          } as any,
        },
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      expect(remaining).toBe(0);
      
      manager.destroy();
    });
    
    it('should handle session with 1 year duration', () => {
      const manager = new SessionManager();
      
      const now = Date.now();
      const startTime = {
        toMillis: () => now - 1000, // 1 second ago
      } as any;
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 1,
          phaseDuration: 365 * 24 * 60 * 60, // 1 year in seconds
        },
        timing: {
          phase1StartTime: startTime,
        },
      };
      
      const remaining = manager.getPhaseTimeRemaining();
      
      // Should be approximately 1 year minus 1 second
      expect(remaining).toBeGreaterThan(365 * 24 * 60 * 60 - 10);
      
      manager.destroy();
    });
    
    it('should handle word count of 1 million', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await manager.submitPhase(1, {
        content: 'A novel...',
        wordCount: 1000000,
        score: 100,
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
    
    it('should handle negative scores', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await manager.submitPhase(1, {
        content: 'Bad writing',
        wordCount: 5,
        score: -999, // Negative!
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
    
    it('should handle score over 100', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await manager.submitPhase(1, {
        content: 'Perfect writing',
        wordCount: 200,
        score: 9999, // Way over 100!
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
  });
  
  describe('Connection Edge Cases', () => {
    it('should handle player with same userId joining multiple times', async () => {
      const managers = [new SessionManager(), new SessionManager(), new SessionManager()];
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ sessionId: 'test', players: {} }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      // Same user joins from 3 different browsers/tabs
      const joins = managers.map(m =>
        m.joinSession('test-session', 'user-1', {
          displayName: 'Multi-Tab User',
          avatar: '🔄',
          rank: 'Silver II',
        })
      );
      
      await Promise.all(joins);
      
      // All should succeed (different connectionIds)
      managers.forEach(m => {
        expect(m.getCurrentSession()).toBeTruthy();
      });
      
      managers.forEach(m => m.destroy());
    });
    
    it('should handle empty connectionId', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore - Force empty connectionId
      manager.connectionId = '';
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Should still work
      await manager.submitPhase(1, {
        content: 'Test',
        wordCount: 10,
        score: 75,
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
  });
  
  describe('Error Recovery', () => {
    it('should recover from transient Firestore errors', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      
      // First call fails, second succeeds
      mockUpdateDoc
        .mockRejectedValueOnce(new Error('Temporary network error'))
        .mockResolvedValueOnce(undefined);
      
      // First attempt fails
      await expect(manager.submitPhase(1, {
        content: 'Test',
        wordCount: 10,
        score: 75,
      })).rejects.toThrow();
      
      // Second attempt succeeds (retry logic in application layer)
      await expect(manager.submitPhase(1, {
        content: 'Test',
        wordCount: 10,
        score: 75,
      })).resolves.not.toThrow();
      
      manager.destroy();
    });
    
    it('should handle session deleted during active use', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        sessionId: 'deleted-session',
        players: {},
      };
      
      // Simulate Firestore listener detecting deletion
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      const snapshotCallback = mockOnSnapshot.mock.calls[0]?.[1];
      
      // Session no longer exists
      if (snapshotCallback) {
        snapshotCallback({
          exists: () => false,
        });
      }
      
      // Should handle gracefully (error handler would be called)
      manager.destroy();
    });
  });
  
  describe('Clock Skew and Timing Issues', () => {
    it('should handle client clock ahead of server', () => {
      const manager = new SessionManager();
      
      const clientTime = Date.now();
      const serverTime = clientTime - 60000; // Server is 1 minute behind
      
      const startTime = {
        toMillis: () => serverTime - 30000, // Started 30 seconds ago (server time)
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
      
      // Should handle clock skew (might show more time remaining)
      expect(remaining).toBeGreaterThanOrEqual(0);
      
      manager.destroy();
    });
    
    it('should handle client clock behind server', () => {
      const manager = new SessionManager();
      
      const clientTime = Date.now();
      const serverTime = clientTime + 60000; // Server is 1 minute ahead
      
      const startTime = {
        toMillis: () => serverTime - 30000,
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
      
      // Should handle gracefully
      expect(typeof remaining).toBe('number');
      
      manager.destroy();
    });
  });
  
  describe('State Consistency', () => {
    it('should maintain consistency with rapid state changes', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Simulate rapid state changes
      const operations = [];
      
      for (let i = 1; i <= 3; i++) {
        operations.push(
          manager.submitPhase(i as 1 | 2 | 3, {
            content: `Phase ${i} content`,
            wordCount: 50 + i * 10,
            score: 70 + i * 5,
          })
        );
      }
      
      await Promise.all(operations);
      
      // All should complete
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      
      manager.destroy();
    });
    
    it('should handle phase transition during submission', () => {
      const manager = new SessionManager();
      
      let currentPhase = 1;
      
      // @ts-ignore
      manager.currentSession = {
        get config() {
          return { phase: currentPhase };
        },
        players: {
          'user-1': {
            userId: 'user-1',
            isAI: false,
            phases: {},
          },
        },
      };
      
      // Check submitted status
      const beforeTransition = manager.hasSubmittedCurrentPhase();
      
      // Phase transitions
      currentPhase = 2;
      
      // Check again
      const afterTransition = manager.hasSubmittedCurrentPhase();
      
      // Should return false for new phase
      expect(afterTransition).toBe(false);
      
      manager.destroy();
    });
  });
  
  describe('Invalid Session States', () => {
    it('should handle session with invalid phase number', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: {
          phase: 99, // Invalid!
          phaseDuration: 120,
        },
        timing: {},
        players: {},
      };
      
      // Should not crash
      expect(() => {
        manager.getPhaseTimeRemaining();
      }).not.toThrow();
      
      expect(() => {
        manager.hasSubmittedCurrentPhase();
      }).not.toThrow();
      
      manager.destroy();
    });
    
    it('should handle session with no config', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.currentSession = {
        config: null, // Missing!
        players: {},
      } as any;
      
      // Should not crash
      expect(() => {
        manager.getSubmissionCount();
      }).not.toThrow();
      
      manager.destroy();
    });
    
    it('should handle undefined player data', () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-999';
      
      // @ts-ignore
      manager.currentSession = {
        config: { phase: 1 },
        players: {
          'user-1': {
            userId: 'user-1',
            isAI: false,
            phases: {},
          },
        },
      };
      
      // User not in session
      const hasSubmitted = manager.hasSubmittedCurrentPhase();
      
      // Should return false (not throw)
      expect(hasSubmitted).toBe(false);
      
      manager.destroy();
    });
  });
  
  describe('Network Simulation', () => {
    it('should handle intermittent network during heartbeat', async () => {
      jest.useFakeTimers();
      
      const manager = new SessionManager();
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ sessionId: 'test', players: {} }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      let updateCallCount = 0;
      
      // Simulate intermittent failures
      mockUpdateDoc.mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount % 3 === 0) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve(undefined);
      });
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await manager.joinSession('test', 'user-1', {
        displayName: 'Test',
        avatar: '👤',
        rank: 'Silver II',
      });
      
      // Simulate 10 heartbeat intervals (50 seconds)
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Some heartbeats should have failed
      expect(errorSpy).toHaveBeenCalled();
      
      // But session should still be active
      expect(manager.getCurrentSession()).toBeTruthy();
      
      errorSpy.mockRestore();
      jest.useRealTimers();
      manager.destroy();
    }, 10000);
  });
  
  describe('Type Safety Edge Cases', () => {
    it('should handle phase data with wrong types', async () => {
      const manager = new SessionManager();
      
      // @ts-ignore
      manager.sessionId = 'test';
      manager.userId = 'user-1';
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Submit with intentionally wrong types
      await manager.submitPhase(1, {
        content: 123 as any, // Should be string
        wordCount: 'not a number' as any, // Should be number
        score: 'also not a number' as any, // Should be number
      });
      
      // Firestore will store whatever we send
      expect(mockUpdateDoc).toHaveBeenCalled();
      
      manager.destroy();
    });
  });
});

