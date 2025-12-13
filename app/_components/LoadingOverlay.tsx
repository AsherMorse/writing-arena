'use client';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Grading your writing...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className="rounded-lg p-8 text-center"
        style={{
          background: 'rgba(42, 26, 15, 0.95)',
          border: '1px solid rgba(201, 168, 76, 0.4)',
        }}
      >
        <div className="mb-4">
          <div
            className="w-10 h-10 mx-auto border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }}
          />
        </div>
        <p className="font-avenir text-lg" style={{ color: '#f5e6b8' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
