'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import MatchSelectionModal from '@/components/dashboard/MatchSelectionModal';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { LoadingState } from '@/components/shared/LoadingState';
import { useModal } from '@/lib/hooks/useModal';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const matchModal = useModal(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingState message="Preparing dashboard" />;
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Header />
      <MatchSelectionModal isOpen={matchModal.isOpen} onClose={matchModal.close} />
      <DashboardContent userProfile={userProfile} />
    </div>
  );
}
