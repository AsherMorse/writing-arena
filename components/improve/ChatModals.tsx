import { Modal } from '@/components/shared/Modal';
import { WritingSession } from '@/lib/services/firestore';
import { ImproveConversation } from '@/lib/services/firestore';
import { exportConversation } from '@/lib/utils/file-export';
import { formatDate } from '@/lib/utils/date-utils';
import { COLOR_CLASSES } from '@/lib/constants/colors';
import { isEmpty } from '@/lib/utils/array-utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatModalsProps {
  showMatchSummary: boolean;
  showProgress: boolean;
  showExport: boolean;
  showHistory: boolean;
  onCloseMatchSummary: () => void;
  onCloseProgress: () => void;
  onCloseExport: () => void;
  onCloseHistory: () => void;
  rankedMatches: WritingSession[];
  progressMetrics: {
    avgScores: Record<string, number>;
    overallAvg: number;
    trend: 'improving' | 'declining' | 'stable';
    trendDiff: number;
  } | null;
  messages: Message[];
  pastConversations: ImproveConversation[];
  loadingHistory: boolean;
  currentConversationId: string | null;
  onLoadConversation: (conversation: ImproveConversation) => void;
  onStartNewConversation: () => void;
}

export function ChatModals({
  showMatchSummary,
  showProgress,
  showExport,
  showHistory,
  onCloseMatchSummary,
  onCloseProgress,
  onCloseExport,
  onCloseHistory,
  rankedMatches,
  progressMetrics,
  messages,
  pastConversations,
  loadingHistory,
  currentConversationId,
  onLoadConversation,
  onStartNewConversation,
}: ChatModalsProps) {
  const handleExport = () => {
    exportConversation(messages, `improvement-session-${formatDate(new Date(), 'iso').split('T')[0]}.txt`);
    onCloseExport();
  };

  return (
    <>
      <Modal isOpen={showMatchSummary} onClose={onCloseMatchSummary} title="Your Last 5 Matches" variant="default" size="xl">
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {rankedMatches.map((match, index) => {
            const date = match.timestamp?.toDate?.() || new Date();
            return (
              <div key={match.id || index} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-left">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      Match {index + 1} • {formatDate(date, 'short')}
                    </div>
                    <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
                      {match.promptType || 'Narrative'} • {match.wordCount || 0} words
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-lg font-medium ${COLOR_CLASSES.phase1.text}`}>{match.score?.toFixed(0) || 0}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.3)]">{match.placement ? `#${match.placement}` : '—'}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {Object.entries(match.traitScores || {}).map(([trait, score]) => (
                    <div key={trait} className="text-center">
                      <div className="text-[10px] capitalize text-[rgba(255,255,255,0.4)]">{trait.substring(0, 3)}</div>
                      <div className="font-mono text-sm">{score || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal isOpen={showProgress} onClose={onCloseProgress} title="Your Progress" variant="default" size="lg">
        {progressMetrics ? (
          <div className="space-y-6 text-left">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
              <div className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Overall Average</div>
              <div className={`font-mono text-3xl font-medium ${COLOR_CLASSES.phase1.text}`}>{progressMetrics.overallAvg.toFixed(1)}</div>
              <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
                Trend:{' '}
                <span
                  style={{
                    color:
                      progressMetrics.trend === 'improving'
                        ? '#00d492'
                        : progressMetrics.trend === 'declining'
                          ? '#ff5f8f'
                          : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {progressMetrics.trend} ({progressMetrics.trendDiff.toFixed(1)} pts)
                </span>
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs text-[rgba(255,255,255,0.4)]">Average by Trait</div>
              <div className="space-y-3">
                {Object.entries(progressMetrics.avgScores).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm capitalize">{trait}</span>
                      <span className={`font-mono text-sm ${COLOR_CLASSES.phase1.text}`}>{score.toFixed(1)}</span>
                    </div>
                    <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                      <div className="h-full rounded-[3px] bg-[#00e5e5] transition-all" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[rgba(255,255,255,0.4)]">No progress data available</div>
        )}
      </Modal>

      <Modal isOpen={showExport} onClose={onCloseExport} title="Export Conversation" variant="default" size="md">
        <div className="space-y-4 text-left">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Export your conversation as a text file.</p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-4 py-2 font-medium text-[#101012] transition hover:bg-[#33ebeb]"
            >
              Download as .txt
            </button>
            <button
              onClick={onCloseExport}
              className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 transition hover:bg-[rgba(255,255,255,0.04)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showHistory} onClose={onCloseHistory} title="Conversation History" variant="default" size="lg">
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[rgba(255,255,255,0.5)]">Your past improvement sessions. Click to resume.</p>
            <button
              onClick={onStartNewConversation}
              className={`rounded-[6px] border ${COLOR_CLASSES.phase1.borderOpacity(0.2)} ${COLOR_CLASSES.phase1.bgOpacity(0.08)} px-3 py-1.5 text-xs font-medium ${COLOR_CLASSES.phase1.text} transition hover:${COLOR_CLASSES.phase1.bgOpacity(0.15)}`}
            >
              + New Session
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-[rgba(255,255,255,0.4)]">Loading...</div>
          ) : isEmpty(pastConversations) ? (
            <div className="py-8 text-center text-[rgba(255,255,255,0.4)]">No past conversations yet.</div>
          ) : (
            pastConversations.map((conversation) => {
              const date = conversation.updatedAt?.toDate?.() || new Date();
              const messageCount = conversation.messages.length;
              const lastMessage = conversation.messages[messageCount - 1];
              const preview = lastMessage?.content?.substring(0, 100) || '';

              return (
                <button
                  key={conversation.id}
                  onClick={() => onLoadConversation(conversation)}
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-left transition hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-medium">
                        {formatDate(date, 'short')} • {formatDate(date, 'time')}
                      </div>
                      <div className="text-xs text-[rgba(255,255,255,0.4)]">
                        {messageCount} message{messageCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {conversation.id === currentConversationId && (
                      <span className={`rounded-[20px] ${COLOR_CLASSES.phase1.bgOpacity(0.12)} px-2 py-0.5 text-[10px] font-medium ${COLOR_CLASSES.phase1.text}`}>
                        Current
                      </span>
                    )}
                  </div>
                  {preview && <div className="mt-2 line-clamp-2 text-xs text-[rgba(255,255,255,0.4)]">{preview}...</div>}
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
}

