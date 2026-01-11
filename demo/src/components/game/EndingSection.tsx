import type { Ending } from "@/lib/types";

type EndingSectionProps = {
  ending: Ending;
  onSeeResults: () => void;
  onGoHome: () => void;
};

export function EndingSection({
  ending,
  onSeeResults,
  onGoHome,
}: EndingSectionProps) {
  return (
    <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-neutral-800 text-center">
      <p className="text-neutral-100 text-2xl md:text-3xl font-medium mb-3 md:mb-4">
        {ending.title}
      </p>
      <p className="text-neutral-400 text-lg md:text-xl mb-8 md:mb-10">
        {ending.message}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onSeeResults}
          className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-10 md:px-12 py-4 md:py-5 rounded-xl text-lg md:text-xl font-medium transition-colors"
        >
          See Results
        </button>
        <button
          onClick={onGoHome}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-10 md:px-12 py-4 md:py-5 rounded-xl text-lg md:text-xl font-medium transition-colors"
        >
          Home
        </button>
      </div>
    </div>
  );
}
