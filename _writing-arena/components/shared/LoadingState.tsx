'use client';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div 
      className="flex min-h-screen items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #1a0f0a 0%, #0d0805 100%)',
      }}
    >
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div 
            className="absolute inset-0 animate-spin rounded-full"
            style={{
              border: '3px solid rgba(201, 168, 76, 0.15)',
              borderTopColor: 'rgba(201, 168, 76, 0.8)',
            }}
          />
          <div 
            className="absolute inset-2 animate-spin rounded-full"
            style={{
              border: '2px solid rgba(201, 168, 76, 0.1)',
              borderBottomColor: 'rgba(245, 230, 184, 0.5)',
              animationDirection: 'reverse',
              animationDuration: '1.5s',
            }}
          />
        </div>
        <p 
          className="font-avenir text-lg tracking-wide"
          style={{
            color: '#f5e6b8',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
