import { COLOR_CLASSES, getPhaseColor } from '@/lib/constants/colors';

/**
 * How it works section component for landing page
 * Displays the steps to get started
 */
export function LandingHowItWorks() {
  const steps = [
    { id: '01', title: 'Join arena', detail: 'Create a free profile and choose your writer avatar.', phase: 1 },
    { id: '02', title: 'Select mode', detail: 'Queue for quick, ranked, or solo to sharpen specific traits.', phase: 2 },
    { id: '03', title: 'Compete & learn', detail: 'Use AI feedback, phase scores, and streaks to level up.', phase: 3 },
  ];

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          How it works
        </div>
        <div className="flex gap-1">
          <button className={`rounded-[6px] bg-[rgba(255,255,255,0.025)] px-3 py-1 text-xs ${COLOR_CLASSES.phase1.text}`}>
            1
          </button>
          <button className="rounded-[6px] px-3 py-1 text-xs text-[rgba(255,255,255,0.22)]">
            2
          </button>
          <button className="rounded-[6px] px-3 py-1 text-xs text-[rgba(255,255,255,0.22)]">
            3
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {steps.map((step) => {
          const phaseColor = getPhaseColor(step.phase as 1 | 2 | 3);
          return (
          <div key={step.id} className="flex items-start gap-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
            <div 
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold"
              style={{ borderColor: phaseColor, color: phaseColor }}
            >
              {step.id}
            </div>
            <div>
              <div className="text-sm font-semibold">{step.title}</div>
              <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{step.detail}</div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}

