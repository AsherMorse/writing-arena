'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firestore';

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
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setSelectedAvatar(typeof userProfile.avatar === 'string' ? userProfile.avatar : '🌿');
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user || !userProfile) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      console.log('💾 PROFILE - Saving updates:', { displayName, selectedAvatar });
      
      await updateUserProfile(user.uid, {
        displayName: displayName.trim() || userProfile.displayName,
        avatar: selectedAvatar,
      });
      
      console.log('✅ PROFILE - Updates saved');
      
      // Refresh profile to show new data
      await refreshProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('❌ PROFILE - Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-400/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-3xl border-b border-white/10 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{selectedAvatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                <p className="text-white/80 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-white font-semibold mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-all"
              maxLength={30}
            />
            <p className="text-white/50 text-xs mt-2">This is how other players will see you (max 30 characters)</p>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-white font-semibold mb-3">Choose Your Avatar</label>
            <div className="grid grid-cols-10 gap-2 max-h-[200px] overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-3xl p-2 rounded-lg transition-all hover:scale-110 ${
                    selectedAvatar === avatar
                      ? 'bg-purple-500/30 border-2 border-purple-400 scale-110'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Account Info (Read-only) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Email:</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Rank:</span>
                <span className="text-white">{userProfile?.currentRank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">LP:</span>
                <span className="text-white">{userProfile?.rankLP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Level:</span>
                <span className="text-white">Level {userProfile?.characterLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total XP:</span>
                <span className="text-white">{userProfile?.totalXP?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Save Success Message */}
          {saveSuccess && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center animate-in fade-in">
              <div className="text-green-400 font-semibold">✓ Profile updated successfully!</div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="sticky bottom-0 bg-slate-900 p-6 rounded-b-3xl border-t border-white/10 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all ${
                saving
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:scale-105'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all border border-red-500/30"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

