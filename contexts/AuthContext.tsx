'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '@/lib/firestore';

// MOCK AUTH - No Firebase calls for testing
interface MockUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

// Mock user profile for testing
const MOCK_USER_PROFILE: UserProfile = {
  uid: 'mock-user-123',
  displayName: 'Test Student',
  email: 'test@example.com',
  avatar: '🌿',
  characterLevel: 2,
  totalXP: 1250,
  totalPoints: 1250,
  currentRank: 'Silver III',
  rankLP: 120,
  traits: {
    content: 2,
    organization: 3,
    grammar: 2,
    vocabulary: 1,
    mechanics: 2,
  },
  stats: {
    totalMatches: 47,
    wins: 29,
    totalWords: 12438,
    currentStreak: 3,
  },
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
};

const MOCK_USER: MockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(MOCK_USER);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(MOCK_USER_PROFILE);
  const [loading] = useState(false);

  const refreshProfile = async () => {
    console.log('Mock: refreshProfile called');
  };

  const signIn = async () => {
    console.log('Mock: signIn called');
    setUser(MOCK_USER);
    setUserProfile(MOCK_USER_PROFILE);
  };

  const signOut = async () => {
    console.log('Mock: signOut called');
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
