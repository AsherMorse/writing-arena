'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import { getCompletedRankedMatches } from '@/lib/services/firestore';
import { WritingSession } from '@/lib/services/firestore';
import { LoadingState } from '@/components/shared/LoadingState';
import ImproveChatInterface from '@/components/improve/ImproveChatInterface';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function ImprovePage() {
  return (
    <RequireAuth>
      <ImprovePageContent />
    </RequireAuth>
  );
}

function ImprovePageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [rankedMatches, setRankedMatches] = useState<WritingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchMatches = async () => {
        try {
          const matches = await getCompletedRankedMatches(user.uid, 5);
          setRankedMatches(matches);
          
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
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101012]">
        <Header />
        <LoadingState message="Loading your improvement data..." />
      </div>
    );
  }

  if (rankedMatches.length < 5) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Header />
      <ImproveChatInterface rankedMatches={rankedMatches} />
    </div>
  );
}
