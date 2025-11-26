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
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-base font-semibold tracking-wide text-[rgba(255,255,255,0.8)]">
              Writing Arena
            </Link>
            {backLink && (
              <Link
                href={backLink.href}
                className="rounded-[6px] border border-[rgba(255,255,255,0.05)] px-3 py-1.5 text-xs text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
              >
                ← {backLink.label}
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {showPoints && userProfile && (
              <div className="flex items-center gap-2 rounded-[20px] bg-[rgba(0,229,229,0.12)] px-3 py-1.5">
                <span className="font-mono text-sm font-medium text-[#00e5e5]">
                  {userProfile.totalPoints.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-[0.04em] text-[#00e5e5]/60">pts</span>
              </div>
            )}
            
            {userProfile && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right lg:block">
                  <div className="text-sm font-medium text-[rgba(255,255,255,0.8)]">{userProfile.displayName}</div>
                  <div className="text-xs text-[rgba(255,255,255,0.4)]">
                    Lvl {userProfile.characterLevel}
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-base transition-all hover:bg-[rgba(255,255,255,0.04)]"
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
