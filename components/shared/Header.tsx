'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSettingsModal from '@/components/shared/ProfileSettingsModal';

interface HeaderProps {
  showPoints?: boolean;
  backLink?: { href: string; label: string };
}

export default function Header({ showPoints = true, backLink }: HeaderProps) {
  const { userProfile } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c141d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-xl text-emerald-200">
                ✶
              </div>
              <span className="text-base font-semibold tracking-wide">Writing Arena</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {backLink && (
              <Link
                href={backLink.href}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                ← {backLink.label}
              </Link>
            )}
            
            {showPoints && userProfile && (
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-emerald-200">
                <span>{userProfile.totalPoints.toLocaleString()}</span>
              </div>
            )}
            
            {userProfile && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right text-sm lg:block">
                  <div className="font-medium text-white">{userProfile.displayName}</div>
                  <div className="text-white/50 text-xs">
                    Level {userProfile.characterLevel} • Sapling
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-lg text-emerald-200 transition hover:bg-emerald-400/30 hover:scale-110"
                  title="Profile Settings"
                >
                  {userProfile.avatar}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <ProfileSettingsModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}

