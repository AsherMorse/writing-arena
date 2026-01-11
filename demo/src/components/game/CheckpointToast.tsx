type CheckpointToastProps = {
  isVisible: boolean;
};

export function CheckpointToast({ isVisible }: CheckpointToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-amber-500/90 text-neutral-900 px-6 py-3 rounded-lg shadow-lg border border-amber-400 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">Checkpoint Saved</span>
      </div>
    </div>
  );
}
