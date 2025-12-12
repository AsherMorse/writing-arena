/**
 * @fileoverview Profile settings modal for avatar selection and title change.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import { updateUserProfile } from '@/lib/services/firestore';
import { COLOR_CLASSES } from '@/lib/constants/colors';
import { getRankDisplayName } from '@/lib/utils/score-calculator';
import { TIER_LP_CAP } from '@/lib/utils/rank-constants';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  '🌿', '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀', '🌴', '🌲',
  '🌳', '🍀', '🍁', '🍂', '🍃', '☘️', '🌾', '🌱', '🌵', '🎋',
  '🎯', '📖', '✨', '🏅', '⚔️', '📚', '✒️', '📝', '🖊️', '💫',
  '🌟', '⭐', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎮', '🎲',
  '🏆', '🥇', '🥈', '🥉', '🎖️', '🏵️', '🎗️', '👑', '💎', '💍',
  '🦋', '🐝', '🐞', '🦜', '🦚', '🦉', '🦅', '🦆', '🐧', '🐦',
  '🔥', '💧', '⚡', '🌊', '🌈', '☀️', '🌙', '✨', '💫', '🚀',
];

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, userProfile, refreshProfile, signOut } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setSelectedAvatar(typeof userProfile.avatar === 'string' ? userProfile.avatar : '🌿');
    }
  }, [userProfile]);

  if (!isOpen) return null;

  /**
   * @description Saves avatar changes to user profile.
   */
  const handleSave = async () => {
    if (!user || !userProfile) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      await updateUserProfile(user.uid, {
        avatar: selectedAvatar,
      });
      
      await refreshProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      logger.error(LOG_CONTEXTS.PROFILE, 'Error saving profile', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  // Format the full display name preview
  const displayNamePreview = `${userProfile?.displayName || 'New Adventurer'}, ${getRankDisplayName(userProfile?.skillLevel ?? 'scribe', userProfile?.skillTier ?? 3)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(0,229,229,0.12)] text-2xl">
              {selectedAvatar}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[rgba(255,255,255,0.8)]">Profile Settings</h2>
              <p className="text-sm text-[rgba(255,255,255,0.4)]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ×
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {/* Display Name Preview */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Leaderboard Display Name
            </label>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3">
              <span className="font-medium text-[rgba(255,255,255,0.8)]">
                {displayNamePreview}
              </span>
            </div>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.22)]">
              How you appear on leaderboards
            </p>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Avatar
            </label>
            <div className="grid grid-cols-10 gap-2 max-h-[180px] overflow-y-auto rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.015)] p-3">
              {AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={`${avatar}-${index}`}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`flex items-center justify-center rounded-[6px] p-2 text-2xl transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-[rgba(0,229,229,0.15)] border border-[#00e5e5]'
                      : 'border border-transparent hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Account Stats */}
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)]">
            <div className="border-b border-[rgba(255,255,255,0.05)] px-4 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Account Stats
              </span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Rank</span>
                <span className="font-mono text-sm text-[#00e5e5]">
                  {getRankDisplayName(userProfile?.skillLevel ?? 'scribe', userProfile?.skillTier ?? 3)}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Tier LP</span>
                <span className="font-mono text-sm text-[#ff5f8f]">
                  {userProfile?.tierLP ?? 65}/{TIER_LP_CAP}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Total LP</span>
                <span className={`font-mono text-sm ${COLOR_CLASSES.phase3.text}`}>{userProfile?.totalLP?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-3 rounded-[10px] border border-[rgba(0,212,146,0.3)] bg-[rgba(0,212,146,0.1)] px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-[#00d492]" />
              <span className="text-sm text-[#00d492]">Profile updated successfully</span>
            </div>
          )}
        </div>

        <div className="border-t border-[rgba(255,255,255,0.05)] p-6 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 rounded-[10px] px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] transition-all ${
                saving
                  ? 'cursor-not-allowed border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.22)]'
                  : 'border border-[#00e5e5] bg-[#00e5e5] text-[#101012] hover:bg-[#33ebeb]'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
            >
              Cancel
            </button>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full rounded-[10px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.08)] px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#ff5f8f] transition-all hover:bg-[rgba(255,95,143,0.15)]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
