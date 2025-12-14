'use client';

import { useState } from 'react';

interface RevisionChecklistProps {
  onCheck?: (checked: number) => void;
}

const CHECKLIST_ITEMS = [
  'Read all feedback carefully',
  'Identify 2-3 most important changes',
  'Add appositives where suggested',
  'Expand sentences with because/but/so',
  'Combine choppy sentences',
  'Add transition words where suggested',
  'Include more specific details',
  'Review changes - did you improve?',
];

export default function RevisionChecklist({ onCheck }: RevisionChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
    onCheck?.(newChecked.size);
  };

  return (
    <div className="mb-6 rounded-[14px] border border-[#00d49230] bg-[#00d49208] p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">✅</span>
        <h3 className="text-sm font-semibold" style={{ color: '#00d492' }}>
          Revision Checklist
        </h3>
        <span className="text-xs text-[rgba(255,255,255,0.4)]">
          ({checkedItems.size}/{CHECKLIST_ITEMS.length})
        </span>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item, index) => {
          const isChecked = checkedItems.has(index);
          return (
            <label
              key={index}
              className="flex cursor-pointer items-start gap-2 text-xs text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.7)]"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(index)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[rgba(255,255,255,0.2)] bg-transparent accent-[#00d492]"
              />
              <span className={isChecked ? 'line-through opacity-50' : ''}>
                {item}
              </span>
            </label>
          );
        })}
      </div>

      {checkedItems.size === CHECKLIST_ITEMS.length && (
        <div className="mt-4 rounded-[10px] border border-[#00d49230] bg-[#00d49210] p-3 text-center text-xs text-[rgba(255,255,255,0.6)]">
          🎉 Great job! You&apos;ve completed all revision steps!
        </div>
      )}
    </div>
  );
}

