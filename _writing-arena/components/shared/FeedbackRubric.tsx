'use client';

interface FeedbackRubricProps {
  onClose?: () => void;
}

export default function FeedbackRubric({ onClose }: FeedbackRubricProps) {
  return (
    <div className="mb-6 rounded-[14px] border border-[#ff5f8f30] bg-[#ff5f8f08] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-semibold" style={{ color: '#ff5f8f' }}>
            Feedback Quality Rubric
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.7)]">
            ✅ High-Quality Feedback
          </div>
          <ul className="space-y-1 pl-4 text-[rgba(255,255,255,0.5)]">
            <li className="list-disc">Quotes specific text from their writing</li>
            <li className="list-disc">Names TWR strategies (appositives, transitions, etc.)</li>
            <li className="list-disc">Gives actionable suggestions: &quot;Change X to Y because...&quot;</li>
            <li className="list-disc">Provides concrete examples</li>
          </ul>
        </div>

        <div>
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.7)]">
            ❌ Low-Quality Feedback
          </div>
          <ul className="space-y-1 pl-4 text-[rgba(255,255,255,0.5)]">
            <li className="list-disc">Vague comments like &quot;good job&quot; or &quot;needs work&quot;</li>
            <li className="list-disc">No specific examples or quotes</li>
            <li className="list-disc">Generic advice without context</li>
            <li className="list-disc">Doesn&apos;t name TWR strategies</li>
          </ul>
        </div>

        <div className="rounded-[10px] border border-[#ff5f8f20] bg-[#ff5f8f05] p-3">
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.7)]">
            💡 Example of Good Feedback:
          </div>
          <div className="text-[rgba(255,255,255,0.5)] italic">
            &quot;The phrase &apos;weathered stone sentinel&apos; (line 2) uses an appositive effectively 
            because it adds description without a new sentence. Try expanding sentence 3 
            &apos;She opened the door&apos; with because (TWR): &apos;She opened the door because the 
            golden light beckoned her.&apos;&quot;
          </div>
        </div>

        <div className="rounded-[10px] border border-[#ff5f8f20] bg-[#ff5f8f05] p-3">
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.7)]">
            ⚠️ Example of Poor Feedback:
          </div>
          <div className="text-[rgba(255,255,255,0.5)] italic">
            &quot;Good description&quot; ❌ (too vague - doesn&apos;t quote, name strategy, or give suggestion)
          </div>
        </div>
      </div>
    </div>
  );
}

