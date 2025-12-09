'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { resetUserProgress } from '@/lib/services/ranked-progress';
import { deleteAllUserSubmissions as deleteAllRankedSubmissions } from '@/lib/services/ranked-submissions';
import { deleteAllUserPracticeSubmissions } from '@/lib/services/practice-submissions';
import {
  createFakeSubmission,
  deleteAllSubmissionsForPrompt,
} from '@/lib/services/ranked-leaderboard';

declare global {
  interface Window {
    __debugDayOffset?: number;
    __debugPromptId?: string;
  }
}

export function getDebugDayOffset(): number {
  if (typeof window === 'undefined') return 0;
  return window.__debugDayOffset ?? 0;
}

export function getDebugDate(): Date {
  const now = new Date();
  const offset = getDebugDayOffset();
  now.setDate(now.getDate() + offset);
  return now;
}

export function getDebugYesterday(): Date {
  const debugNow = getDebugDate();
  debugNow.setDate(debugNow.getDate() - 1);
  return debugNow;
}

export function FantasyDebugMenu() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);

  useEffect(() => {
    setDayOffset(window.__debugDayOffset ?? 0);
  }, [isOpen]);

  if (!pathname?.startsWith('/fantasy')) {
    return null;
  }

  const showStatus = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(null), 2000);
  };

  const handleResetProgress = async () => {
    if (!user) {
      showStatus('Not logged in');
      return;
    }
    try {
      await resetUserProgress(user.uid);
      showStatus('Progress reset! Refresh page.');
    } catch (err) {
      showStatus('Failed to reset progress');
    }
  };

  const handleDeleteRankedSubmissions = async () => {
    if (!user) {
      showStatus('Not logged in');
      return;
    }
    try {
      const count = await deleteAllRankedSubmissions(user.uid);
      showStatus(`Deleted ${count} ranked sub(s)! Refresh.`);
    } catch (err) {
      showStatus('Failed to delete');
    }
  };

  const handleDeletePracticeSubmissions = async () => {
    if (!user) {
      showStatus('Not logged in');
      return;
    }
    try {
      const count = await deleteAllUserPracticeSubmissions(user.uid);
      showStatus(`Deleted ${count} practice sub(s)!`);
    } catch (err) {
      showStatus('Failed to delete');
    }
  };

  const handleFullReset = async () => {
    if (!user) {
      showStatus('Not logged in');
      return;
    }
    try {
      await resetUserProgress(user.uid);
      const rankedCount = await deleteAllRankedSubmissions(user.uid);
      const practiceCount = await deleteAllUserPracticeSubmissions(user.uid);
      showStatus(`Reset! Deleted ${rankedCount + practiceCount} subs. Refresh.`);
    } catch (err) {
      showStatus('Failed to reset');
    }
  };

  const handleDispatchEvent = (eventName: string, label: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
    showStatus(`${label} triggered`);
  };

  const handleAddFakeSubmissions = async () => {
    const promptId = window.__debugPromptId;
    if (!promptId) {
      showStatus('No prompt ID (open /ranked first)');
      return;
    }
    try {
      const scores = [95, 82, 78, 65, 45];
      for (const score of scores) {
        const revised = Math.min(100, score + Math.floor(Math.random() * 15));
        await createFakeSubmission(promptId, score, revised);
      }
      showStatus('Added 5 fake submissions! Refresh.');
    } catch (err) {
      showStatus('Failed to add fake subs');
    }
  };

  const handleClearPromptSubmissions = async () => {
    const promptId = window.__debugPromptId;
    if (!promptId) {
      showStatus('No prompt ID (open /ranked first)');
      return;
    }
    try {
      const count = await deleteAllSubmissionsForPrompt(promptId);
      showStatus(`Cleared ${count} subs for prompt! Refresh.`);
    } catch (err) {
      showStatus('Failed to clear');
    }
  };

  const handleTimeForward = () => {
    const newOffset = (window.__debugDayOffset ?? 0) + 1;
    window.__debugDayOffset = newOffset;
    setDayOffset(newOffset);
    const date = getDebugDate();
    showStatus(`Now: ${date.toLocaleDateString()}`);
  };

  const handleTimeBack = () => {
    const newOffset = (window.__debugDayOffset ?? 0) - 1;
    window.__debugDayOffset = newOffset;
    setDayOffset(newOffset);
    const date = getDebugDate();
    showStatus(`Now: ${date.toLocaleDateString()}`);
  };

  const handleTimeReset = () => {
    window.__debugDayOffset = 0;
    setDayOffset(0);
    showStatus('Time reset to today');
  };

  const buttons = [
    { label: 'Full Reset', action: handleFullReset },
    { label: 'Reset Progress', action: handleResetProgress },
    { label: 'Del Ranked', action: handleDeleteRankedSubmissions },
    { label: 'Del Practice', action: handleDeletePracticeSubmissions },
    { label: 'Fill Editor', action: () => handleDispatchEvent('debug-fill-editor', 'Fill Editor') },
    { label: '+5 Fake Subs', action: handleAddFakeSubmissions },
    { label: 'Clear Prompt', action: handleClearPromptSubmissions },
    { label: '⏪ -1 Day', action: handleTimeBack },
    { label: '⏩ +1 Day', action: handleTimeForward },
    { label: '🔄 Reset Time', action: handleTimeReset },
  ];

  return (
    <>
      <div className="pointer-events-none fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto rounded-full px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition"
          style={{
            background: 'rgba(42, 26, 15, 0.9)',
            border: '1px solid rgba(201, 168, 76, 0.4)',
            color: '#f5e6b8',
          }}
        >
          Debug
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div
            className="w-full max-w-sm rounded-lg p-6 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(42,26,15,0.98) 0%, rgba(30,18,10,0.99) 100%)',
              border: '1px solid rgba(201,168,76,0.4)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: '#f5e6b8' }}>
                Fantasy Debug
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full px-3 py-1 text-xs font-semibold transition"
                style={{
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  color: 'rgba(245, 230, 184, 0.6)',
                }}
              >
                Close
              </button>
            </div>

            {status && (
              <div
                className="mb-4 rounded-md px-3 py-2 text-sm text-center"
                style={{
                  background: 'rgba(201, 168, 76, 0.15)',
                  color: '#f5e6b8',
                }}
              >
                {status}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {buttons.map((button) => (
                <button
                  key={button.label}
                  type="button"
                  onClick={button.action}
                  className="rounded-md px-4 py-3 text-sm font-semibold transition hover:scale-[1.02]"
                  style={{
                    background: 'rgba(201, 168, 76, 0.1)',
                    border: '1px solid rgba(201, 168, 76, 0.25)',
                    color: 'rgba(245, 230, 184, 0.8)',
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-center space-y-1" style={{ color: 'rgba(245, 230, 184, 0.4)' }}>
              <p>User: {user?.uid?.slice(0, 8) || 'none'}...</p>
              {dayOffset !== 0 && (
                <p style={{ color: '#fbbf24' }}>
                  🕐 Simulated: {getDebugDate().toLocaleDateString()} ({dayOffset > 0 ? '+' : ''}{dayOffset}d)
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
