/**
 * @fileoverview Profile dropdown menu with parchment styling.
 * Displays user info, match history link, and logout option.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  getParchmentContainerStyle,
  getParchmentTextStyle,
  PaperTexture,
} from '@/app/_components/parchment-styles';

interface ProfileDropdownProps {
  displayName: string;
  rankDisplay: string;
  totalLP: number;
  onSignOut: () => void;
}

/**
 * @description Profile dropdown menu in top-right corner.
 * Shows user info, match history link, and sign out button.
 */
export function ProfileDropdown({
  displayName,
  rankDisplay,
  totalLP,
  onSignOut,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative z-30">
      {/* Profile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          background: isOpen ? 'rgba(245, 230, 184, 0.2)' : 'transparent',
          border: '1px solid rgba(245, 230, 184, 0.3)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(245, 230, 184, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <span
          className="text-sm font-semibold text-[#f5e6b8]"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          Profile
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-64 rounded-xl overflow-hidden"
          style={{
            ...getParchmentContainerStyle({ variant: 'light' }),
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <PaperTexture borderRadius="lg" />
          
          <div className="relative z-10">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-[rgba(139,99,52,0.3)]">
              <div
                className="font-memento text-lg"
                style={getParchmentTextStyle('light')}
              >
                {displayName}
              </div>
              <div
                className="text-sm mt-1"
                style={{ ...getParchmentTextStyle('light'), opacity: 0.8 }}
              >
                {rankDisplay} • {totalLP.toLocaleString()} LP
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/history"
                className="w-full px-4 py-2 flex items-center gap-3 transition-colors hover:bg-[rgba(139,99,52,0.1)]"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-base">📜</span>
                <span
                  className="text-sm font-medium"
                  style={getParchmentTextStyle('light')}
                >
                  Match History
                </span>
              </Link>
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-[rgba(139,99,52,0.3)]" />

            {/* Sign out */}
            <div className="py-1">
              <DropdownItem
                icon="🚪"
                label="Log out"
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon: string;
  label: string;
  onClick: () => void;
}

/**
 * @description Individual dropdown menu item with hover state.
 */
function DropdownItem({ icon, label, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left flex items-center gap-3 transition-colors hover:bg-[rgba(139,99,52,0.1)]"
    >
      <span className="text-base">{icon}</span>
      <span
        className="text-sm font-medium"
        style={getParchmentTextStyle('light')}
      >
        {label}
      </span>
    </button>
  );
}


