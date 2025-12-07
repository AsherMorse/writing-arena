'use client';

export const MIN_WORDS = 20;
export const MAX_CHARS = 5000;

interface WritingEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showRequirements?: boolean;
  minWords?: number;
}

export function WritingEditor({ 
  value, 
  onChange, 
  disabled, 
  placeholder, 
  showRequirements = true,
  minWords = MIN_WORDS,
}: WritingEditorProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const meetsMinimum = wordCount >= minWords;
  const underMax = charCount <= MAX_CHARS;

  const handleChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={10}
        className="w-full rounded-md p-4 text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        style={{
          background: '#1a1208',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          color: '#f5e6b8',
        }}
      />
      <div className="flex justify-between text-sm font-avenir">
        <span style={{ color: meetsMinimum ? 'rgba(245, 230, 184, 0.6)' : '#ff6b6b' }}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
          {showRequirements && !meetsMinimum && ` (${minWords} minimum)`}
        </span>
        {showRequirements && (
          <span style={{ color: underMax ? 'rgba(245, 230, 184, 0.4)' : '#ff6b6b' }}>
            {charCount}/{MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}

export function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
