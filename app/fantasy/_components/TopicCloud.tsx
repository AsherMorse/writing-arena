'use client';

import type { PracticeTopic } from '../_lib/practice-topics';

interface TopicCloudProps {
  topics: PracticeTopic[];
  onSelect: (topic: PracticeTopic) => void;
  disabled?: boolean;
}

const CLOUD_SHAPE = [4, 5, 4];

export function TopicCloud({ topics, onSelect, disabled }: TopicCloudProps) {
  let topicIndex = 0;

  return (
    <div className="flex flex-col gap-3 items-center">
      {CLOUD_SHAPE.map((count, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: count }).map((_, i) => {
            const topic = topics[topicIndex];
            topicIndex++;
            if (!topic) return null;

            return (
              <button
                key={topic.id}
                onClick={() => onSelect(topic)}
                disabled={disabled}
                className="px-4 py-2 rounded-full font-memento text-sm uppercase tracking-wide transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(42, 26, 15, 0.9) 0%, rgba(26, 18, 8, 0.9) 100%)',
                  border: '1px solid rgba(201, 168, 76, 0.5)',
                  color: '#f5e6b8',
                  boxShadow: 'inset 0 0 10px rgba(201, 168, 76, 0.1)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = 'inset 0 0 15px rgba(201, 168, 76, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(201, 168, 76, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.5)';
                }}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
