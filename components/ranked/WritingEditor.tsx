'use client';

import { useRef } from 'react';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';

interface WritingEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function WritingEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...',
  autoFocus = false 
}: WritingEditorProps) {
  const { showPasteWarning, handlePaste, handleCut } = usePastePrevention();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        onCut={handleCut}
        placeholder={placeholder}
        className="mt-4 h-[460px] w-full resize-none rounded-[14px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.02)] p-4 text-base leading-relaxed text-[rgba(0,0,0,0.9)] placeholder:text-[rgba(0,0,0,0.4)] focus:border-[rgba(0,229,229,0.3)] focus:outline-none focus:ring-1 focus:ring-[rgba(0,229,229,0.2)]"
        autoFocus={autoFocus}
      />
      {showPasteWarning && (
        <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-[20px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.15)] px-4 py-2 text-xs font-medium text-[#ff5f8f] shadow-lg">
          Paste disabled during ranked matches
        </div>
      )}
    </div>
  );
}

