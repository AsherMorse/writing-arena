interface RevisionEditorSectionProps {
  originalContent: string;
  wordCount: number;
  revisedContent: string;
  hasRevised: boolean;
  onChange: (content: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onCopy: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onCut: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export function RevisionEditorSection({
  originalContent,
  wordCount,
  revisedContent,
  hasRevised,
  onChange,
  onPaste,
  onCopy,
  onCut,
}: RevisionEditorSectionProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">📄 Original ({wordCount} words)</span>
        </div>
        <div className="max-h-[180px] overflow-y-auto rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
          <p className="text-sm text-[rgba(255,255,255,0.5)] whitespace-pre-wrap leading-relaxed">{originalContent}</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-white p-5 min-h-[400px]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#101012]">✏️ Your Revision</h3>
          {hasRevised && <span className="text-xs font-medium text-[#00d492] animate-pulse">Changes detected!</span>}
        </div>
        <textarea
          value={revisedContent}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
          onCopy={onCopy}
          onCut={onCut}
          placeholder="Revise your writing based on the feedback..."
          className="h-full min-h-[340px] w-full resize-none text-[#101012] leading-relaxed focus:outline-none"
          spellCheck="true"
        />
      </div>
    </div>
  );
}

