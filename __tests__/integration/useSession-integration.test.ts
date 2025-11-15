import { renderHook, waitFor } from '@testing-library/react';
import { useSession, useCreateSession } from '@/lib/hooks/useSession';
import { AuthContext } from '@/contexts/AuthContext';
import React from 'react';

// Mock Firebase
jest.mock('firebase/firestore');

const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockUserProfile = {
  displayName: 'Test User',
  avatar: '🎮',
  currentRank: 'Silver II',
  rankLP: 100,
};

const mockAuthValue = {
  user: mockUser,
  userProfile: mockUserProfile,
  loading: false,
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(AuthContext.Provider, { value: mockAuthValue as any }, children);

describe('useSession Hook Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('useSession', () => {
    it('should initialize with loading state', () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { result } = renderHook(() => useSession('test-session'), { wrapper });
      
      expect(result.current.isReconnecting).toBe(true);
      expect(result.current.session).toBeNull();
    });
    
    it('should load existing session', async () => {
      const mockSession = {
        sessionId: 'test-session',
        mode: 'ranked',
        state: 'active',
        config: {
          phase: 1,
          phaseDuration: 120,
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative',
        },
        players: {
          [mockUser.uid]: {
            userId: mockUser.uid,
            displayName: 'Test User',
            avatar: '🎮',
            rank: 'Silver II',
            isAI: false,
            status: 'connected',
            lastHeartbeat: { toMillis: () => Date.now() },
            connectionId: 'conn-123',
            phases: {},
          },
        },
        coordination: {
          readyCount: 0,
          allPlayersReady: false,
        },
        timing: {
          phase1StartTime: { toMillis: () => Date.now() - 10000 },
        },
      };
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      const { result } = renderHook(() => useSession('test-session'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isReconnecting).toBe(false);
      });
      
      expect(result.current.session).toBeTruthy();
      expect(result.current.session?.sessionId).toBe('test-session');
    });
    
    it('should handle session not found error', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });
      
      const { result } = renderHook(() => useSession('nonexistent'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
      
      expect(result.current.error?.message).toContain('Session not found');
    });
    
    it('should calculate time remaining correctly', async () => {
      const now = Date.now();
      
      const mockSession = {
        sessionId: 'test-session',
        config: {
          phase: 1,
          phaseDuration: 120,
        },
        players: {
          [mockUser.uid]: {
            userId: mockUser.uid,
            displayName: 'Test User',
            status: 'connected',
            lastHeartbeat: { toMillis: () => now },
            connectionId: 'conn-123',
            phases: {},
          },
        },
        timing: {
          phase1StartTime: { toMillis: () => now - 30000 }, // 30 seconds ago
        },
        coordination: { readyCount: 0, allPlayersReady: false },
      };
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockImplementation((ref, callback) => {
        setTimeout(() => callback({ exists: () => true, data: () => mockSession }), 100);
        return jest.fn();
      });
      
      const { result } = renderHook(() => useSession('test-session'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.timeRemaining).toBeGreaterThan(0);
      });
      
      // Should be approximately 90 seconds (120 - 30)
      expect(result.current.timeRemaining).toBeGreaterThan(85);
      expect(result.current.timeRemaining).toBeLessThan(95);
    });
    
    it('should provide submission helpers', async () => {
      const mockSession = {
        sessionId: 'test-session',
        config: { phase: 1, phaseDuration: 120 },
        players: {
          [mockUser.uid]: {
            userId: mockUser.uid,
            displayName: 'Test User',
            status: 'connected',
            phases: {},
          },
        },
        coordination: { readyCount: 0, allPlayersReady: false },
        timing: {},
      };
      
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockImplementation((ref, callback) => {
        setTimeout(() => callback({ exists: () => true, data: () => mockSession }), 100);
        return jest.fn();
      });
      
      const { result } = renderHook(() => useSession('test-session'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.session).toBeTruthy();
      });
      
      // Should provide submission helpers
      expect(typeof result.current.submitPhase).toBe('function');
      expect(typeof result.current.hasSubmitted).toBe('function');
      expect(typeof result.current.submissionCount).toBe('function');
      
      // hasSubmitted should return false initially
      expect(result.current.hasSubmitted()).toBe(false);
      
      // submissionCount should return counts
      const count = result.current.submissionCount();
      expect(count).toHaveProperty('submitted');
      expect(count).toHaveProperty('total');
    });
  });
  
  describe('useCreateSession', () => {
    it('should create session with proper data', async () => {
      const mockSetDoc = require('firebase/firestore').setDoc;
      mockSetDoc.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useCreateSession());
      
      const options = {
        mode: 'ranked' as const,
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative' as const,
          phase: 1 as const,
          phaseDuration: 120,
        },
        players: [
          {
            userId: 'user-1',
            displayName: 'Test Player',
            avatar: '🎮',
            rank: 'Silver II',
          },
        ],
      };
      
      const session = await result.current.createSession(options);
      
      expect(session.sessionId).toMatch(/^session-/);
      expect(session.mode).toBe('ranked');
      expect(Object.keys(session.players)).toHaveLength(1);
    });
    
    it('should handle creation errors', async () => {
      const mockSetDoc = require('firebase/firestore').setDoc;
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));
      
      const { result } = renderHook(() => useCreateSession());
      
      const options = {
        mode: 'practice' as const,
        config: {
          trait: 'all',
          promptId: 'prompt-1',
          promptType: 'narrative' as const,
          phase: 1 as const,
          phaseDuration: 120,
        },
        players: [],
      };
      
      await expect(result.current.createSession(options)).rejects.toThrow();
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });
  
  describe('Hook State Management', () => {
    it('should cleanup on unmount', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          sessionId: 'test',
          players: {
            [mockUser.uid]: {
              userId: mockUser.uid,
              displayName: 'Test',
              status: 'connected',
              phases: {},
            },
          },
          coordination: {},
          timing: {},
        }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      const unsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);
      
      const { unmount } = renderHook(() => useSession('test-session'), { wrapper });
      
      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled();
      });
      
      // Unmount
      unmount();
      
      // Should have called leaveSession (which updates status and cleans up)
      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalled();
      });
    });
    
    it('should handle rapid sessionId changes', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          sessionId: 'test',
          players: {},
          coordination: {},
          timing: {},
        }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      const { rerender } = renderHook(
        ({ sessionId }) => useSession(sessionId),
        {
          wrapper,
          initialProps: { sessionId: 'session-1' },
        }
      );
      
      // Rapidly change session ID 10 times
      for (let i = 2; i <= 10; i++) {
        rerender({ sessionId: `session-${i}` });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Should handle all changes without crashing
      expect(mockGetDoc).toHaveBeenCalled();
    });
  });
  
  describe('Extreme Hook Scenarios', () => {
    it('should handle 100 hooks initialized simultaneously', async () => {
      const mockGetDoc = require('firebase/firestore').getDoc;
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          sessionId: 'test',
          players: {},
          coordination: {},
          timing: {},
        }),
      });
      
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockOnSnapshot = require('firebase/firestore').onSnapshot;
      mockOnSnapshot.mockReturnValue(jest.fn());
      
      // Render 100 hooks
      const hooks = Array.from({ length: 100 }, () =>
        renderHook(() => useSession('shared-session'), { wrapper })
      );
      
      await waitFor(() => {
        // At least some should have loaded
        const loadedCount = hooks.filter(h => h.result.current.session !== null).length;
        expect(loadedCount).toBeGreaterThan(0);
      });
      
      // Cleanup all
      hooks.forEach(h => h.unmount());
    });
  });
});

