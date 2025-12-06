'use client';

interface PromptCardProps {
  prompt: string;
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <div
      className="rounded-md p-6"
      style={{
        background: 'rgba(42, 26, 15, 0.9)',
        border: '1px solid rgba(201, 168, 76, 0.4)',
        boxShadow: 'inset 0 0 20px rgba(201, 168, 76, 0.1)',
      }}
    >
      <div
        className="text-xs uppercase tracking-widest mb-3 font-memento"
        style={{ color: '#c9a84c' }}
      >
        Your Quest
      </div>
      <p
        className="text-lg leading-relaxed font-avenir"
        style={{ color: '#f5e6b8' }}
      >
        {prompt}
      </p>
    </div>
  );
}
