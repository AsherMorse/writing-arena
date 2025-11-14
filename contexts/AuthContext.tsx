'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { createUserProfile, getUserProfile, UserProfile } from '@/lib/services/firestore';

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

  const refreshProfile = async () => {
    console.log('🔄 REFRESH PROFILE - Called for user:', user?.uid);
    if (user) {
      const profile = await getUserProfile(user.uid);
      console.log('🔄 REFRESH PROFILE - Fetched:', {
        found: !!profile,
        hasTraits: !!profile?.traits,
        traitsContent: profile?.traits?.content
      });
      setUserProfile(profile);
      console.log('🔄 REFRESH PROFILE - Set in context');
    } else {
      console.log('🔄 REFRESH PROFILE - No user, skipping');
    }
  };

  useEffect(() => {
    // If auth is not initialized, set loading to false immediately
    if (!auth) {
      console.error('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('🔐 AUTH STATE CHANGE:', { 
          hasUser: !!user, 
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName 
        });
        
        setUser(user);
        
        if (user) {
          // Get or create user profile with retry
          console.log('📥 Fetching profile for user:', user.uid);
          let profile = await getUserProfile(user.uid);
          console.log('📦 Profile fetch result:', { 
            found: !!profile,
            hasTraits: !!profile?.traits,
            traits: profile?.traits 
          });
          
          if (!profile) {
            console.log('❌ No profile found, creating new profile...');
            await createUserProfile(user.uid, {
              displayName: user.displayName || 'Student Writer',
              email: user.email || '',
            });
            console.log('✅ Profile created, fetching...');
            
            // Retry a few times to get the profile
            for (let i = 0; i < 3; i++) {
              console.log(`🔄 Retry ${i + 1}/3 fetching profile...`);
              await new Promise(resolve => setTimeout(resolve, 500));
              profile = await getUserProfile(user.uid);
              if (profile) {
                console.log('✅ Profile found on retry', i + 1);
                break;
              }
            }
          }
          
          console.log('📤 Setting profile in context:', {
            hasProfile: !!profile,
            hasTraits: !!profile?.traits,
            traitsContent: profile?.traits?.content
          });
          setUserProfile(profile);
        } else {
          console.log('🚪 No user, clearing profile');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
      } finally {
        console.log('⏹️ Setting loading to false');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 SIGN IN - Starting:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ SIGN IN - Firebase auth success');
      
      // Check if user profile exists, create if it doesn't
      console.log('📥 SIGN IN - Fetching profile...');
      let profile = await getUserProfile(userCredential.user.uid);
      console.log('📦 SIGN IN - Profile result:', { found: !!profile, hasTraits: !!profile?.traits });
      
      if (!profile) {
        console.log('⚠️ SIGN IN - Profile not found, creating...');
        await createUserProfile(userCredential.user.uid, {
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Student Writer',
          email: userCredential.user.email || '',
        });
        console.log('✅ SIGN IN - Profile created, waiting and fetching...');
        
        // Wait and fetch the new profile
        await new Promise(resolve => setTimeout(resolve, 500));
        profile = await getUserProfile(userCredential.user.uid);
        console.log('📦 SIGN IN - After wait, profile:', { found: !!profile, hasTraits: !!profile?.traits });
      }
      
      if (profile) {
        console.log('📤 SIGN IN - Setting profile in context');
        setUserProfile(profile);
      } else {
        console.error('❌ SIGN IN - Still no profile after creation!');
      }
    } catch (error: any) {
      console.error('❌ SIGN IN - Error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user profile in Firestore and wait for it
      await createUserProfile(userCredential.user.uid, {
        displayName: displayName,
        email: email,
      });
      
      // Wait a moment to ensure profile is created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch the profile to verify it was created
      const profile = await getUserProfile(userCredential.user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create it
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await createUserProfile(result.user.uid, {
          displayName: result.user.displayName || 'Student Writer',
          email: result.user.email || '',
        });
        
        // Wait for profile to be created
        await new Promise(resolve => setTimeout(resolve, 500));
        profile = await getUserProfile(result.user.uid);
      }
      
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled');
      }
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Helper function to convert Firebase auth error codes to user-friendly messages
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
