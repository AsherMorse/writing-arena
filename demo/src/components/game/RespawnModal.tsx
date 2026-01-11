import { SEVERITY_ICONS, type GraderError } from "@/lib/grading/client-constants";

type DeathFeedback = {
  score?: number;
  errors?: GraderError[];
};

type RespawnModalProps = {
  isOpen: boolean;
  deathFeedback: DeathFeedback | null;
  onContinue: () => void;
};

export function RespawnModal({
  isOpen,
  deathFeedback,
  onContinue,
}: RespawnModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Death Title */}
        <h2 className="text-3xl text-red-400 font-medium mb-4">You Died</h2>

        {/* What went wrong */}
        {deathFeedback && (
          <div className="mb-6 text-left bg-neutral-950 rounded-xl p-4">
            <p className="text-neutral-500 text-sm mb-2">What went wrong:</p>
            {deathFeedback.score !== undefined && (
              <p className="text-neutral-300 mb-2">
                Writing Score:{" "}
                <span className="text-red-400">{deathFeedback.score}</span>
              </p>
            )}
            {deathFeedback.errors && deathFeedback.errors.length > 0 && (
              <ul className="space-y-1">
                {deathFeedback.errors.slice(0, 3).map((error, idx) => (
                  <li key={idx} className="text-neutral-400 text-sm">
                    {SEVERITY_ICONS[error.severity]} {error.explanation}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Respawn message */}
        <p className="text-neutral-400 mb-8">Returning to last checkpoint...</p>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-10 py-4 rounded-xl text-lg font-medium transition-colors w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
