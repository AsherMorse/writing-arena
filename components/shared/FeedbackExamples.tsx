'use client';

import { useState } from 'react';

interface FeedbackExamplesProps {
  onClose?: () => void;
}

const EXAMPLES = [
  {
    writing: 'She opened the door.',
    goodFeedback: {
      mainIdea: 'The character discovers something new because she opens the door.',
      strength: 'The phrase "opened the door" creates a clear action. However, you could expand this with because (TWR sentence expansion): "She opened the door because the golden light beckoned her."',
      suggestion: 'Expand sentence 1 with because (TWR): "She opened the door because curiosity overwhelmed her thoughts." This adds depth and shows character motivation.',
    },
    badFeedback: {
      mainIdea: 'It&apos;s about a door.',
      strength: 'Good description',
      suggestion: 'Add more details',
    },
  },
  {
    writing: 'The lighthouse, a weathered stone tower, stood on the cliff. However, today was different.',
    goodFeedback: {
      mainIdea: 'The main idea is that something unusual happens at a familiar lighthouse.',
      strength: 'The phrase "weathered stone tower" uses an appositive effectively (TWR strategy) because it adds description without a new sentence. The transition "However" signals a shift.',
      suggestion: 'After "different," expand with because (TWR): "different because the door stood ajar" to show why it\'s different.',
    },
    badFeedback: {
      mainIdea: 'Lighthouse story',
      strength: 'Nice writing',
      suggestion: 'Make it better',
    },
  },
];

export default function FeedbackExamples({ onClose }: FeedbackExamplesProps) {
  const [currentExample, setCurrentExample] = useState(0);
  const example = EXAMPLES[currentExample];

  return (
    <div className="mb-6 rounded-[14px] border border-[#ff5f8f30] bg-[#ff5f8f08] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h3 className="text-sm font-semibold" style={{ color: '#ff5f8f' }}>
            Feedback Examples
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentExample((prev) => (prev > 0 ? prev - 1 : EXAMPLES.length - 1))}
            className="rounded-[6px] border border-[rgba(255,255,255,0.1)] bg-transparent px-2 py-1 text-xs text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
          >
            ←
          </button>
          <span className="text-xs text-[rgba(255,255,255,0.4)]">
            {currentExample + 1}/{EXAMPLES.length}
          </span>
          <button
            onClick={() => setCurrentExample((prev) => (prev < EXAMPLES.length - 1 ? prev + 1 : 0))}
            className="rounded-[6px] border border-[rgba(255,255,255,0.1)] bg-transparent px-2 py-1 text-xs text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
          >
            →
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-xs text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-3">
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.7)]">📝 Writing Sample:</div>
          <div className="text-[rgba(255,255,255,0.6)] italic">&quot;{example.writing}&quot;</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#00d49230] bg-[#00d49208] p-3">
            <div className="mb-2 flex items-center gap-1 font-medium text-[#00d492]">
              ✅ Good Feedback
            </div>
            <div className="space-y-2 text-[rgba(255,255,255,0.6)]">
              <div>
                <strong className="text-[rgba(255,255,255,0.8)]">Main Idea:</strong>{' '}
                {example.goodFeedback.mainIdea}
              </div>
              <div>
                <strong className="text-[rgba(255,255,255,0.8)]">Strength:</strong>{' '}
                {example.goodFeedback.strength}
              </div>
              <div>
                <strong className="text-[rgba(255,255,255,0.8)]">Suggestion:</strong>{' '}
                {example.goodFeedback.suggestion}
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#ff5f8f30] bg-[#ff5f8f08] p-3">
            <div className="mb-2 flex items-center gap-1 font-medium text-[#ff5f8f]">
              ❌ Poor Feedback
            </div>
            <div className="space-y-2 text-[rgba(255,255,255,0.6)]">
              <div>
                <strong className="text-[rgba(255,255,255,0.8)]">Main Idea:</strong>{' '}
                {example.badFeedback.mainIdea}
              </div>
              <div>
                <strong className="text-[rgba(255,255,255,0.8)]">Strength:</strong>{' '}
                {example.badFeedback.strength}
              </div>
              <div>
                <strong className="text-[rgba(255,255,255,0.8)]">Suggestion:</strong>{' '}
                {example.badFeedback.suggestion}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#ff5f8f20] bg-[#ff5f8f05] p-3 text-[rgba(255,255,255,0.5)]">
          <strong className="text-[rgba(255,255,255,0.7)]">💡 Why Good Feedback Works:</strong>
          <ul className="mt-1 space-y-1 pl-4">
            <li className="list-disc">Quotes specific text</li>
            <li className="list-disc">Names TWR strategies (appositives, sentence expansion)</li>
            <li className="list-disc">Gives concrete revision examples</li>
            <li className="list-disc">Shows exactly what to change</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

