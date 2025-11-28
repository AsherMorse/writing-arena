import WritingEditor from '../WritingEditor';

interface WritingEditorSectionProps {
  content: string;
  wordCount: number;
  timeRemaining: number;
  onChange: (content: string) => void;
}

export function WritingEditorSection({ content, wordCount, timeRemaining, onChange }: WritingEditorSectionProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = (timeRemaining % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="relative rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-white p-6 text-[#101012]">
        <div className="flex items-center justify-between text-xs text-[#101012]/50">
          <span>Draft</span>
          <span>{wordCount} words</span>
        </div>
        <WritingEditor
          content={content}
          onChange={onChange}
          placeholder="Start writing..."
          autoFocus
        />
      </div>
      
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4 text-center">
        <div className="text-sm text-[rgba(255,255,255,0.4)]">
          ⏱️ Auto-submits in <span className="font-mono text-[#00e5e5]">
            {minutes}:{seconds}
          </span>
        </div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.22)]">Write until the timer expires</div>
      </div>
    </div>
  );
}

