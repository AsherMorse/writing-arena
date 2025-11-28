'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/lib/hooks/useModal';
import ProfileSettingsModal from '@/components/shared/ProfileSettingsModal';
import { COLOR_CLASSES } from '@/lib/constants/colors';

interface HeaderProps {
  showPoints?: boolean;
  backLink?: { href: string; label: string };
}

export default function Header({ showPoints = true, backLink }: HeaderProps) {
  const { userProfile } = useAuth();
  const { isOpen: showProfileModal, open: openProfileModal, close: closeProfileModal } = useModal();
  
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
              <div className={`flex items-center gap-2 rounded-[20px] ${COLOR_CLASSES.phase1.bgOpacity(0.12)} px-3 py-1.5`}>
                <span className={`font-mono text-sm font-medium ${COLOR_CLASSES.phase1.text}`}>
                  {userProfile.totalPoints.toLocaleString()}
                </span>
                <span className={`text-[10px] uppercase tracking-[0.04em] ${COLOR_CLASSES.phase1.text}/60`}>pts</span>
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
                  onClick={openProfileModal}
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
        onClose={closeProfileModal} 
      />
    </>
  );
}
