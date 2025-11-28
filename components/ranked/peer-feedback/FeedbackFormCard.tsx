import FeedbackValidator from '@/components/shared/FeedbackValidator';

interface FeedbackResponses {
  mainIdea: string;
  strength: string;
  suggestion: string;
}

interface FeedbackFormCardProps {
  responses: FeedbackResponses;
  timeRemaining: number;
  onChange: (responses: FeedbackResponses) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onCopy: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onCut: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export function FeedbackFormCard({
  responses,
  timeRemaining,
  onChange,
  onPaste,
  onCopy,
  onCut,
}: FeedbackFormCardProps) {
  const updateResponse = (field: keyof FeedbackResponses, value: string) => {
    onChange({ ...responses, [field]: value });
  };

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
      <h3 className="mb-4 text-base font-semibold">Provide Feedback</h3>
      
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">1. What is the main idea?</label>
          <p className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Identify the central point or message.</p>
          <textarea
            value={responses.mainIdea}
            onChange={(e) => updateResponse('mainIdea', e.target.value)}
            onPaste={onPaste}
            onCopy={onCopy}
            onCut={onCut}
            placeholder="The main idea is..."
            className="h-24 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff5f8f] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={timeRemaining === 0}
            spellCheck="true"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">2. What is one strength?</label>
          <p className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Point out something specific done well. Quote the text!</p>
          <textarea
            value={responses.strength}
            onChange={(e) => updateResponse('strength', e.target.value)}
            onPaste={onPaste}
            onCopy={onCopy}
            onCut={onCut}
            placeholder='One strength is "..." because...'
            className="h-24 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff5f8f] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={timeRemaining === 0}
            spellCheck="true"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">3. What is one suggestion?</label>
          <p className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Give one concrete improvement.</p>
          <textarea
            value={responses.suggestion}
            onChange={(e) => updateResponse('suggestion', e.target.value)}
            onPaste={onPaste}
            onCopy={onCopy}
            onCut={onCut}
            placeholder="Try adding... / Consider using..."
            className="h-24 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff5f8f] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={timeRemaining === 0}
            spellCheck="true"
          />
        </div>
      </div>
      
      <FeedbackValidator responses={responses} />
    </div>
  );
}

