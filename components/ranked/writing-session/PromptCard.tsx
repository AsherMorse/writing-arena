interface Prompt {
  image: string;
  type: string;
  title: string;
  description: string;
}

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
      <div className="flex gap-4">
        <div className="text-4xl">{prompt.image}</div>
        <div>
          <div className="text-[10px] uppercase text-[rgba(255,255,255,0.22)]">{prompt.type}</div>
          <h2 className="mt-1 text-base font-semibold">{prompt.title}</h2>
        </div>
      </div>
      <p className="mt-3 text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">{prompt.description}</p>
    </div>
  );
}

