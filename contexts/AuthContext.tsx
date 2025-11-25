'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { createUserProfile, getUserProfile } from '@/lib/services/firestore';
import { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  }, [user]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        if (user) {
          let profile = await getUserProfile(user.uid);
          
          if (!profile) {
            await createUserProfile(user.uid, {
              displayName: user.displayName || 'Student Writer',
              email: user.email || '',
            });
            
            const { retryUntilSuccess } = await import('@/lib/utils/retry');
            const retriedProfile = await retryUntilSuccess(
              async () => {
                const p = await getUserProfile(user.uid);
                if (p) return p;
                throw new Error('Profile not found');
              },
              { maxAttempts: 3, delayMs: 500 }
            );
            if (retriedProfile) {
              profile = retriedProfile;
            }
          }
          
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      let profile = await getUserProfile(userCredential.user.uid);
      
      if (!profile) {
        await createUserProfile(userCredential.user.uid, {
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Student Writer',
          email: userCredential.user.email || '',
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        profile = await getUserProfile(userCredential.user.uid);
      }
      
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName });

      await createUserProfile(userCredential.user.uid, {
        displayName,
        email,
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const profile = await getUserProfile(userCredential.user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await createUserProfile(result.user.uid, {
          displayName: result.user.displayName || 'Student Writer',
          email: result.user.email || '',
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        profile = await getUserProfile(result.user.uid);
      }
      
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled');
      }
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
