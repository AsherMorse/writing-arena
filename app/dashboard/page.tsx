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
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full border border-white/10 flex items-center justify-center text-2xl text-emerald-300">
            ✶
          </div>
          <h2 className="text-2xl font-semibold text-white">Preparing your dashboard</h2>
          <p className="text-white/50 text-sm">Syncing profile</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <Header />
      <MatchSelectionModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} />
      <DashboardContent userProfile={userProfile} />
    </div>
  );
}
