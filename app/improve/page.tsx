'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import { getCompletedRankedMatches } from '@/lib/services/firestore';
import { WritingSession } from '@/lib/services/firestore';
import { LoadingState } from '@/components/shared/LoadingState';
import ImproveChatInterface from '@/components/improve/ImproveChatInterface';

export default function ImprovePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rankedMatches, setRankedMatches] = useState<WritingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const fetchMatches = async () => {
        try {
          const matches = await getCompletedRankedMatches(user.uid, 5);
          setRankedMatches(matches);
          
          // Redirect if they don't have 5 matches
          if (matches.length < 5) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching ranked matches:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMatches();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0c141d]">
        <Header />
        <LoadingState message="Loading your improvement data..." />
      </div>
    );
  }

  if (!user || rankedMatches.length < 5) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <Header />
      <ImproveChatInterface rankedMatches={rankedMatches} />
    </div>
  );
}

