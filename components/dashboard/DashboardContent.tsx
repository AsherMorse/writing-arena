'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/lib/types';
import { countCompletedRankedMatches } from '@/lib/services/firestore';
import { DashboardStats } from './DashboardStats';
import { DashboardActions } from './DashboardActions';
import { DashboardTraits } from './DashboardTraits';
import { DashboardReadiness } from './DashboardReadiness';
import { DashboardChecklist } from './DashboardChecklist';
import { DashboardSidebarStats } from './DashboardSidebarStats';

interface DashboardContentProps {
  userProfile: UserProfile;
}

export default function DashboardContent({ userProfile }: DashboardContentProps) {
  const { user } = useAuth();
  const [completedMatches, setCompletedMatches] = useState<number | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchMatchCount = async () => {
        try {
          const count = await countCompletedRankedMatches(user.uid);
          setCompletedMatches(count);
        } catch (error) {
          console.error('Error fetching match count:', error);
          setCompletedMatches(0);
        } finally {
          setLoadingMatches(false);
        }
      };
      fetchMatchCount();
    }
  }, [user]);

  const hasEnoughMatches = completedMatches !== null && completedMatches >= 5;
  const matchesRemaining = completedMatches !== null ? Math.max(0, 5 - completedMatches) : 0;

  return (
    <main className="mx-auto max-w-[1200px] px-8 py-8">
      <DashboardStats userProfile={userProfile} />
      <DashboardActions
        hasEnoughMatches={hasEnoughMatches}
        loadingMatches={loadingMatches}
        matchesRemaining={matchesRemaining}
        completedMatches={completedMatches}
      />
      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <DashboardTraits userProfile={userProfile} />
          <DashboardReadiness />
        </div>
        <div className="space-y-6">
          <DashboardChecklist userProfile={userProfile} />
          <DashboardSidebarStats userProfile={userProfile} />
        </div>
      </section>
    </main>
  );
}
