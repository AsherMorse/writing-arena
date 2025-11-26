'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import MatchSelectionModal from '@/components/dashboard/MatchSelectionModal';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [showMatchModal, setShowMatchModal] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101012]">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-2xl">
            ⏳
          </div>
          <h2 className="text-xl font-semibold text-[rgba(255,255,255,0.8)]">Preparing dashboard</h2>
          <p className="text-sm text-[rgba(255,255,255,0.4)]">Syncing profile</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Header />
      <MatchSelectionModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} />
      <DashboardContent userProfile={userProfile} />
    </div>
  );
}
