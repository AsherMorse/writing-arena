/**
 * @fileoverview Fantasy-themed home page for logged-in users.
 * Features cozy tavern background with rank display and action cards.
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/LoadingState';
import { FantasyHomeContent } from '@/components/fantasy/FantasyHomeContent';

/**
 * @description Main fantasy home page for authenticated users.
 * Redirects to landing if not logged in.
 */
export default function FantasyHomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingState message="Entering the tavern..." />;
  }

  if (!user || !userProfile) {
    return null;
  }

  return <FantasyHomeContent userProfile={userProfile} />;
}
