import { MarkdownRenderer } from '@/lib/utils/markdown-renderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  userAvatar?: string;
  quickActions: string[];
  onQuickAction: (action: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessageList({
  messages,
  isLoading,
  userAvatar,
  quickActions,
  onQuickAction,
  messagesEndRef,
}: ChatMessageListProps) {
  return (
    <div className="mb-6 flex-1 space-y-6 overflow-y-auto pr-2">
      {messages.map((message, index) => (
        <div key={message.id} className="space-y-3">
          <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,229,229,0.15)] text-[#00e5e5]">
                📚
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-[14px] p-4 ${
                message.role === 'user'
                  ? 'border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.1)]'
                  : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)]'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {message.role === 'assistant' ? (
                  <MarkdownRenderer content={message.content} />
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,95,143,0.15)] text-[#ff5f8f]">
                {userAvatar || '👤'}
              </div>
            )}
          </div>

          {message.role === 'assistant' &&
            !isLoading &&
            index === messages.length - 1 &&
            message.content.trim().length > 0 && (
              <div className="ml-12 space-y-2">
                <p className="mb-2 text-xs text-[rgba(255,255,255,0.3)]">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => onQuickAction(action)}
                      disabled={isLoading}
                      className="rounded-[6px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-3 py-1.5 text-xs font-medium text-[#00e5e5] transition-all hover:bg-[rgba(0,229,229,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start gap-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,229,229,0.15)] text-[#00e5e5]">
            📚
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

