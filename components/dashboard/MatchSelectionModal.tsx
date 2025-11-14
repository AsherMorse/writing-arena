'use client';

import { useRouter } from 'next/navigation';

interface MatchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchSelectionModal({ isOpen, onClose }: MatchSelectionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const modes = [
    {
      label: 'Quick Match',
      icon: '⚡',
      summary: 'Jump into a four minute duel with instant party fill.',
      route: '/quick-match',
    },
    {
      label: 'Ranked',
      icon: '🏆',
      summary: 'Fight for leaderboard glory with three competitive phases.',
      route: '/ranked',
    },
    {
      label: 'Practice',
      icon: '📝',
      summary: 'Solo training with guided prompts and instant AI feedback.',
      route: '/practice',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-4xl rounded-3xl bg-[#141e27] p-10 shadow-xl border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl text-white transition hover:bg-white/10"
        >
          ×
        </button>
        <div className="mb-10 text-center space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
            Start a session
          </div>
          <h2 className="text-4xl font-semibold">Choose how you want to write today</h2>
          <p className="text-white/60 text-sm">
            Pick a mode to enter the arena. You can always change later.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {modes.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                onClose();
                router.push(option.route);
              }}
              className="group rounded-2xl bg-[#192430] p-7 border border-white/10 text-left transition hover:border-emerald-300/40"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                  {option.label}
                  <span className="text-base text-emerald-200">{option.icon}</span>
                </div>
                <p className="text-base text-white/80">{option.summary}</p>
                <div className="flex items-center justify-between pt-2 text-sm text-emerald-200">
                  Enter
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

