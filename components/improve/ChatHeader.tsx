interface ChatHeaderProps {
  onHistoryClick: () => void;
  onMatchesClick: () => void;
  onProgressClick: () => void;
  onExportClick: () => void;
  hasMessages: boolean;
}

export function ChatHeader({
  onHistoryClick,
  onMatchesClick,
  onProgressClick,
  onExportClick,
  hasMessages,
}: ChatHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-semibold">Improve Your Writing</h1>
          <p className="text-sm text-[rgba(255,255,255,0.4)]">
            Personalized exercises based on your last 5 ranked matches • TWR methodology
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onHistoryClick}
            className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            📜 History
          </button>
          <button
            onClick={onMatchesClick}
            className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            📊 Matches
          </button>
          <button
            onClick={onProgressClick}
            className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            📈 Progress
          </button>
          {hasMessages && (
            <button
              onClick={onExportClick}
              className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
            >
              💾 Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

