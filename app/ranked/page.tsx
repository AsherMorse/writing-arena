'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RankedLanding from '@/components/ranked/RankedLanding';

export default function RankedPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('activeSessionId');
    sessionStorage.removeItem('activeMatchId');
  }, []);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center">
        <div className="text-white/70 text-sm">Loading ranked setup...</div>
      </div>
    );
  }

  return <RankedLanding userProfile={userProfile} />;
}
