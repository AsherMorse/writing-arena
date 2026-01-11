type HPBarProps = {
  health: number;
  maxHealth: number;
};

export function HPBar({ health, maxHealth }: HPBarProps) {
  const healthPercent = (health / maxHealth) * 100;

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <div className="w-28 md:w-40 h-2 md:h-2.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${
            healthPercent > 60
              ? "bg-emerald-500"
              : healthPercent > 30
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      <span className="text-neutral-500 text-lg md:text-xl w-8 md:w-10">
        {health}
      </span>
    </div>
  );
}
