'use client';

/**
 * @fileoverview Developer debug menu for Fantasy routes (timers, data resets, and ranked UI skipping).
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { deleteUserProfile } from '@/lib/services/firestore';
import { resetUserProgress } from '@/lib/services/ranked-progress';
import { deleteAllUserSubmissions as deleteAllRankedSubmissions } from '@/lib/services/ranked-submissions';
import { deleteAllUserPracticeSubmissions } from '@/lib/services/practice-submissions';
import {
  createFakeSubmission,
  deleteAllSubmissionsForPrompt,
} from '@/lib/services/ranked-leaderboard';
import {
  getDebugPromptId,
  isDebugTimerPaused,
  setDebugTimerPaused,
  skipDebugTimers,
} from '@/lib/utils/debug-date';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';

export { getDebugDate, getDebugDayOffset, getDebugPromptId } from '@/lib/utils/debug-date';

type RankedDebugPhase =
  | 'prompt'
  | 'selection'
  | 'write'
  | 'feedback'
  | 'revise'
  | 'results';

type RankedDebugPreset = 'minimal' | 'short' | 'long' | 'stress';

/**
 * @description Dispatch a debug CustomEvent and show a status toast.
 */
function dispatchDebugEvent(args: {
  eventName: string;
  detail?: unknown;
}): void {
  window.dispatchEvent(new CustomEvent(args.eventName, { detail: args.detail }));
}

export function FantasyDebugMenu() {
  const pathname = usePathname();
  const { user, refreshProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState(() => isDebugTimerPaused());
  const [rankedDebugPhase, setRankedDebugPhase] = useState<RankedDebugPhase>('prompt');
  const [rankedDebugPreset, setRankedDebugPreset] = useState<RankedDebugPreset>('short');

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!pathname?.startsWith('/fantasy')) {
    return null;
  }

  const showStatus = (message: string) => {
    setStatus(message);
    setTimeout(() => setStatus(null), 2000);
  };

  const handleToggleTimer = () => {
    const newState = !isTimerPaused;
    setIsTimerPaused(newState);
    setDebugTimerPaused(newState);
    showStatus(newState ? 'Timer paused' : 'Timer running');
  };

  const handleSkipTimer = () => {
    skipDebugTimers();
    showStatus('Timer skipped to end');
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

  const handleDispatchEvent = (eventName: string, label: string, detail?: unknown) => {
    dispatchDebugEvent({ eventName, detail });
    showStatus(`${label} triggered`);
  };

  const isRankedPage = pathname?.startsWith('/fantasy/ranked');

  const handleJumpRankedPhase = () => {
    if (!isRankedPage) return;
    dispatchDebugEvent({
      eventName: 'debug-ranked-jump',
      detail: { phase: rankedDebugPhase, preset: rankedDebugPreset },
    });
    showStatus(`Jumped to ${rankedDebugPhase} (${rankedDebugPreset})`);
  };

  const handleAddFakeSubmissions = async () => {
    const promptId = getDebugPromptId();
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
    const promptId = getDebugPromptId();
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

  const handleClearSkillGaps = async () => {
    if (!user) {
      showStatus('Not logged in');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { skillGaps: deleteField() });
      showStatus('Skill gaps cleared! Refresh.');
    } catch (err) {
      showStatus('Failed to clear skill gaps');
    }
  };

  const handleResetProfile = async () => {
    if (!user) {
      showStatus('Not logged in');
      return;
    }
    try {
      await deleteUserProfile(user.uid);
      await refreshProfile();
      showStatus('Profile reset! Reloading...');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      showStatus('Failed to reset profile');
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      window.dispatchEvent(new CustomEvent('debug-paste-clipboard', { detail: text }));
      showStatus('Pasted from clipboard');
    } catch (err) {
      showStatus('Failed to read clipboard');
    }
  };

  const buttons = [
    { label: 'Full Reset', action: handleFullReset },
    { label: 'Reset Progress', action: handleResetProgress },
    { label: 'Del Ranked', action: handleDeleteRankedSubmissions },
    { label: 'Del Practice', action: handleDeletePracticeSubmissions },
    { label: 'Fill Editor', action: () => handleDispatchEvent('debug-fill-editor', 'Fill Editor') },
    { label: 'Paste Clipboard', action: handlePasteClipboard },
    { label: '+5 Fake Subs', action: handleAddFakeSubmissions },
    { label: 'Clear Prompt', action: handleClearPromptSubmissions },
    { label: 'Clear Skill Gaps', action: handleClearSkillGaps },
    { label: 'Reset Profile', action: handleResetProfile },
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

            {/* Timer Controls */}
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={handleToggleTimer}
                className="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition hover:scale-[1.02]"
                style={{
                  background: isTimerPaused ? 'rgba(76, 175, 80, 0.2)' : 'rgba(201, 168, 76, 0.1)',
                  border: `1px solid ${isTimerPaused ? 'rgba(76, 175, 80, 0.4)' : 'rgba(201, 168, 76, 0.25)'}`,
                  color: isTimerPaused ? 'rgba(144, 238, 144, 0.9)' : 'rgba(245, 230, 184, 0.8)',
                }}
              >
                {isTimerPaused ? '▶ Play' : '⏸ Pause'}
              </button>
              <button
                type="button"
                onClick={handleSkipTimer}
                className="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition hover:scale-[1.02]"
                style={{
                  background: 'rgba(201, 168, 76, 0.1)',
                  border: '1px solid rgba(201, 168, 76, 0.25)',
                  color: 'rgba(245, 230, 184, 0.8)',
                }}
              >
                ⏭ Skip
              </button>
            </div>

            {isRankedPage && (
              <div className="mb-4 rounded-md p-3" style={{ border: '1px solid rgba(201, 168, 76, 0.25)' }}>
                <div className="mb-2 text-xs font-semibold" style={{ color: 'rgba(245, 230, 184, 0.8)' }}>
                  Ranked phase skipper
                </div>

                <div className="mb-2 flex gap-2">
                  <select
                    value={rankedDebugPhase}
                    onChange={(e) => setRankedDebugPhase(e.target.value as RankedDebugPhase)}
                    className="flex-1 rounded-md px-3 py-2 text-xs"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(201, 168, 76, 0.25)',
                      color: 'rgba(245, 230, 184, 0.85)',
                    }}
                  >
                    <option value="prompt">prompt</option>
                    <option value="selection">selection</option>
                    <option value="write">write</option>
                    <option value="feedback">feedback</option>
                    <option value="revise">revise</option>
                    <option value="results">results</option>
                  </select>

                  <select
                    value={rankedDebugPreset}
                    onChange={(e) => setRankedDebugPreset(e.target.value as RankedDebugPreset)}
                    className="flex-1 rounded-md px-3 py-2 text-xs"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(201, 168, 76, 0.25)',
                      color: 'rgba(245, 230, 184, 0.85)',
                    }}
                  >
                    <option value="minimal">minimal</option>
                    <option value="short">short</option>
                    <option value="long">long</option>
                    <option value="stress">stress</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleJumpRankedPhase}
                    className="rounded-md px-3 py-2 text-xs font-semibold transition hover:scale-[1.02]"
                    style={{
                      background: 'rgba(201, 168, 76, 0.15)',
                      border: '1px solid rgba(201, 168, 76, 0.3)',
                      color: 'rgba(245, 230, 184, 0.9)',
                    }}
                  >
                    Jump
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDispatchEvent('debug-force-submit', 'Force Submit')}
                    className="rounded-md px-3 py-2 text-xs font-semibold transition hover:scale-[1.02]"
                    style={{
                      background: 'rgba(201, 168, 76, 0.1)',
                      border: '1px solid rgba(201, 168, 76, 0.25)',
                      color: 'rgba(245, 230, 184, 0.8)',
                    }}
                  >
                    Force submit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDispatchEvent('debug-skip-to-results', 'Skip to Results')}
                    className="rounded-md px-3 py-2 text-xs font-semibold transition hover:scale-[1.02]"
                    style={{
                      background: 'rgba(201, 168, 76, 0.1)',
                      border: '1px solid rgba(201, 168, 76, 0.25)',
                      color: 'rgba(245, 230, 184, 0.8)',
                    }}
                  >
                    Results
                  </button>
                </div>
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

            <div className="mt-4 text-xs text-center" style={{ color: 'rgba(245, 230, 184, 0.4)' }}>
              <p>User: {user?.uid?.slice(0, 8) || 'none'}...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
