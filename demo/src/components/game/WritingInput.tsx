"use client";

import { forwardRef, type KeyboardEvent } from "react";

type WritingInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export const WritingInput = forwardRef<HTMLTextAreaElement, WritingInputProps>(
  function WritingInput({ value, onChange, onSubmit, disabled }, ref) {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <footer className="flex-shrink-0 border-t border-neutral-800/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 md:gap-5">
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you do?"
              disabled={disabled}
              rows={1}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 md:px-6 py-4 md:py-5 text-lg md:text-xl focus:outline-none focus:border-neutral-600 disabled:opacity-50 placeholder-neutral-600 transition-colors resize-none"
            />
            <button
              onClick={onSubmit}
              disabled={disabled || !value.trim()}
              className="bg-neutral-100 text-neutral-900 px-6 md:px-10 py-4 md:py-5 rounded-xl text-lg md:text-xl font-medium hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      </footer>
    );
  }
);
