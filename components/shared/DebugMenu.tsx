'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { deleteUserProfile } from '@/lib/services/firestore';

type DebugButton = {
  label: string;
  eventName?: string;
};

type PhaseActionsDetail = {
  primary?: DebugButton;
  secondary?: DebugButton;
};

export default function DebugMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [phaseActions, setPhaseActions] = useState<PhaseActionsDetail>({});
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePhaseActions = (event: Event) => {
      const customEvent = event as CustomEvent<PhaseActionsDetail | null>;
      const detail = customEvent.detail;
      if (!detail) {
        setPhaseActions({});
        return;
      }
      setPhaseActions(detail);
    };

    const handleResetProfile = async () => {
      if (!user) return;
      await deleteUserProfile(user.uid);
      await refreshProfile();
      window.location.reload();
    };

    window.addEventListener('debug-phase-actions', handlePhaseActions as EventListener);
    window.addEventListener('debug-reset-profile', handleResetProfile);
    return () => {
      window.removeEventListener('debug-phase-actions', handlePhaseActions as EventListener);
      window.removeEventListener('debug-reset-profile', handleResetProfile);
    };
  }, [user, refreshProfile]);

  const buttons = useMemo(() => {
    const dynamicButtons: DebugButton[] = [
      { label: 'Fill Lobby w/ AI', eventName: 'debug-fill-lobby-ai' },
      { label: 'Paste Clipboard', eventName: 'debug-paste-clipboard' },
      { label: 'Force Submit Phase', eventName: 'debug-force-submit' },
      { label: 'Reset Profile', eventName: 'debug-reset-profile' },
    ];
    dynamicButtons.push(phaseActions.primary ?? { label: 'Placeholder 1' });
    dynamicButtons.push(phaseActions.secondary ?? { label: 'Placeholder 2' });

    while (dynamicButtons.length < 10) {
      dynamicButtons.push({ label: `Placeholder ${dynamicButtons.length + 1}` });
    }

    return dynamicButtons;
  }, [phaseActions]);

  if (pathname?.startsWith('/fantasy')) {
    return null;
  }

  const dispatchDebugEvent = (eventName: string) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(eventName));
  };

  const handleButtonClick = (eventName?: string) => {
    if (!eventName) return;
    dispatchDebugEvent(eventName);
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto rounded-full border border-white/20 bg-[#141e27]/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:border-emerald-400/60 hover:text-emerald-200"
        >
          Debug Menu
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#141e27] p-6 shadow-2xl text-white">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Debug Menu</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {buttons.map((button, index) => (
                <button
                  key={`${button.label}-${index}`}
                  type="button"
                  onClick={() => handleButtonClick(button.eventName)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
