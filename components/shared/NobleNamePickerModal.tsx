/**
 * @fileoverview Modal for users to pick their noble name from generated options.
 * Shows 5 reserved names, allows reroll, and confirms selection.
 * Uses fantasy parchment styling. Cannot be dismissed without selecting a name.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  reserveNameOptions,
  confirmNameSelection,
  releaseUnselectedNames,
} from '@/lib/services/name-claiming';
import { updateUserProfile } from '@/lib/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import {
  getParchmentContainerStyle,
  getParchmentTextStyle,
  PaperTexture,
} from '@/app/fantasy/_components/parchment-styles';

interface NobleNamePickerModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function NobleNamePickerModal({
  isOpen,
  onComplete,
}: NobleNamePickerModalProps) {
  const { user, refreshProfile } = useAuth();
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Loads initial name options when modal opens.
   */
  const loadNameOptions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSelectedName(null);

    try {
      const names = await reserveNameOptions(user.uid, 5);
      setNameOptions(names);
    } catch (err) {
      setError('The royal scribes are busy. Please try again.');
      console.error('Failed to reserve names:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user && nameOptions.length === 0) {
      loadNameOptions();
    }
  }, [isOpen, user, nameOptions.length, loadNameOptions]);

  /**
   * @description Handles reroll - releases current names and reserves new ones.
   */
  const handleReroll = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Release all current reservations
      if (nameOptions.length > 0) {
        await Promise.all(
          nameOptions.map((name) =>
            releaseUnselectedNames(user.uid, [name], '')
          )
        );
      }

      // Reserve new names
      const names = await reserveNameOptions(user.uid, 5);
      setNameOptions(names);
      setSelectedName(null);
    } catch (err) {
      setError('Failed to consult the scribes. Please try again.');
      console.error('Failed to reroll names:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @description Confirms the selected name and updates user profile.
   */
  const handleConfirm = async () => {
    if (!user || !selectedName || isConfirming) return;

    setIsConfirming(true);
    setError(null);

    try {
      // Claim the selected name permanently
      await confirmNameSelection(user.uid, selectedName);

      // Release the unselected names
      await releaseUnselectedNames(user.uid, nameOptions, selectedName);

      // Update user profile with new name and flag
      await updateUserProfile(user.uid, {
        displayName: selectedName,
        hasNobleName: true,
      });

      // Refresh the profile in context
      await refreshProfile();

      onComplete();
    } catch (err) {
      setError('Failed to inscribe your name. Please try again.');
      console.error('Failed to confirm name:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background */}
      <Image
        src="/images/backgrounds/bg.webp"
        alt=""
        fill
        className="object-cover"
        priority
        quality={90}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl"
        style={getParchmentContainerStyle({ variant: 'default', insetTop: 4, insetBottom: 4 })}
      >
        <PaperTexture borderRadius="lg" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="p-6 text-center border-b border-[rgba(42,31,20,0.2)]">
            <div className="mx-auto mb-3 text-4xl">👑</div>
            <h2
              className="font-dutch809 text-2xl mb-2"
              style={{
                background: 'linear-gradient(to bottom, #4a3728 0%, #2a1f14 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: 'none',
              }}
            >
              Choose Your Noble Name
            </h2>
            <p
              className="text-sm"
              style={{ ...getParchmentTextStyle(), opacity: 0.7 }}
            >
              Select the name that will represent you in the arena
            </p>
          </div>

          {/* Name Options */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2"
                  style={{
                    borderColor: 'rgba(42,31,20,0.2)',
                    borderTopColor: '#8b6334',
                  }}
                />
                <p
                  className="mt-4 text-sm font-memento uppercase tracking-wider"
                  style={{ ...getParchmentTextStyle(), opacity: 0.6 }}
                >
                  Consulting the royal scribes...
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {nameOptions.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedName(name)}
                    className={`w-full rounded-lg p-4 text-left transition-all ${
                      selectedName === name
                        ? 'bg-[rgba(139,99,52,0.2)] border-2 border-[#8b6334]'
                        : 'bg-[rgba(42,31,20,0.08)] border-2 border-transparent hover:bg-[rgba(139,99,52,0.1)] hover:border-[rgba(139,99,52,0.3)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          selectedName === name
                            ? 'border-[#8b6334] bg-[#8b6334]'
                            : 'border-[rgba(42,31,20,0.3)]'
                        }`}
                      >
                        {selectedName === name && (
                          <svg
                            className="h-3 w-3 text-[#f5e6b8]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className="font-medium"
                        style={{
                          ...getParchmentTextStyle(),
                          color: selectedName === name ? '#5a3d1e' : '#2d2d2d',
                        }}
                      >
                        {name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div
                className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3"
                style={{
                  background: 'rgba(180,80,60,0.15)',
                  border: '1px solid rgba(180,80,60,0.3)',
                }}
              >
                <div className="h-2 w-2 rounded-full bg-[#b4503c]" />
                <span className="text-sm" style={{ color: '#8b3a2a' }}>
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <div className="flex gap-3">
              <button
                onClick={handleReroll}
                disabled={isLoading || isConfirming}
                className="rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'rgba(42,31,20,0.08)',
                  border: '1px solid rgba(42,31,20,0.2)',
                  color: '#5a3d1e',
                }}
              >
                Different Names
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedName || isLoading || isConfirming}
                className="flex-1 rounded-lg px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    !selectedName || isLoading || isConfirming
                      ? 'rgba(42,31,20,0.1)'
                      : '#2a1a0f',
                  border: `1px solid ${
                    !selectedName || isLoading || isConfirming
                      ? 'rgba(42,31,20,0.2)'
                      : 'rgba(201, 168, 76, 0.75)'
                  }`,
                  color:
                    !selectedName || isLoading || isConfirming
                      ? 'rgba(42,31,20,0.4)'
                      : '#f5e6b8',
                  boxShadow:
                    !selectedName || isLoading || isConfirming
                      ? 'none'
                      : 'inset 0 0 15px rgba(201, 168, 76, 0.15), inset 0 1px 0 rgba(201, 168, 76, 0.3), 0 4px 12px rgba(0, 0, 0, 0.5)',
                  textShadow:
                    !selectedName || isLoading || isConfirming
                      ? 'none'
                      : '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {isConfirming ? 'Inscribing...' : 'Confirm Name'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
