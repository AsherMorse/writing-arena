interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ input, onInputChange, onSend, isLoading }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-[rgba(255,255,255,0.05)] pt-4">
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your writing, request exercises, or get TWR tips..."
          className="flex-1 resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#00e5e5] focus:outline-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-6 py-3 font-medium text-[#101012] transition hover:bg-[#33ebeb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
      <p className="mt-2 text-xs text-[rgba(255,255,255,0.22)]">Press Enter to send, Shift+Enter for new line</p>
    </div>
  );
}

