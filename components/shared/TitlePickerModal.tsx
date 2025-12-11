/**
 * @fileoverview Modal for selecting user title (Lord/Lady/Wordsmith) on first sign-in.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/services/firestore';
import { UserTitle } from '@/lib/types';

interface TitlePickerModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const TITLE_OPTIONS: { value: UserTitle; label: string; description: string }[] = [
  { value: 'Lord', label: 'Lord', description: '' },
  { value: 'Lady', label: 'Lady', description: '' },
  { value: 'Wordsmith', label: 'Wordsmith', description: 'Neutral title' },
];

/**
 * @description Modal for first-time users to select their title.
 * Shows 3 simple buttons for Lord/Lady/Wordsmith selection.
 */
export default function TitlePickerModal({ isOpen, onComplete }: TitlePickerModalProps) {
  const { user, userProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<UserTitle | null>(null);

  if (!isOpen || !user || !userProfile) return null;

  const handleSelectTitle = async (title: UserTitle) => {
    setSelectedTitle(title);
    setSaving(true);

    try {
      await updateUserProfile(user.uid, {
        title,
        hasSelectedTitle: true,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to save title:', error);
      setSaving(false);
      setSelectedTitle(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="w-full max-w-md rounded-lg p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(42,26,15,0.98) 0%, rgba(30,18,10,0.99) 100%)',
          border: '1px solid rgba(201,168,76,0.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.15)',
        }}
      >
        <div className="text-center mb-8">
          <h2
            className="font-dutch809 text-2xl mb-2"
            style={{
              background: 'linear-gradient(to bottom, #f8e8b0 0%, #f6d493 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Choose Your Title
          </h2>
          <p className="text-sm text-[rgba(245,230,184,0.5)]">
            How would you like to be addressed?
          </p>
        </div>

        <div className="space-y-3">
          {TITLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectTitle(option.value)}
              disabled={saving}
              className={`w-full py-4 px-6 rounded-md font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedTitle === option.value
                  ? 'bg-[rgba(201,168,76,0.25)] border-2 border-[rgba(201,168,76,0.6)]'
                  : 'bg-[#1a0f08] border border-[rgba(201,168,76,0.3)] hover:border-[rgba(201,168,76,0.5)] hover:bg-[rgba(201,168,76,0.1)]'
              }`}
              style={{
                color: '#f5e6b8',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              <span className="block">{option.label}</span>
              <span className="block text-xs font-normal text-[rgba(245,230,184,0.4)] mt-1">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[rgba(245,230,184,0.3)]">
          You can change this later in Profile Settings
        </p>
      </div>
    </div>
  );
}
