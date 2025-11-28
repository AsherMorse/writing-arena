export function WritingTipsCard() {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Tips</div>
      <div className="space-y-2 text-xs text-[rgba(255,255,255,0.4)]">
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2">Aim for 60+ words in 2 min</div>
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2">Start with your main idea</div>
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2">Save 20s for proofreading</div>
      </div>
    </div>
  );
}

