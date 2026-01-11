"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type VictoryData = {
  questName: string;
  ending: { title: string; message: string };
  avgScore: number;
  totalWords: number;
  turns: number;
  health: number;
};

export default function VictoryPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<VictoryData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`writing-arena-victory-${sessionId}`);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [sessionId, router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500">Loading results...</p>
      </div>
    );
  }

  const isVictory = data.ending.title.toLowerCase().includes("victory") || 
                   data.ending.title.toLowerCase().includes("escaped") ||
                   data.ending.title.toLowerCase().includes("success");

  const xp = Math.round((data.totalWords / 45) * (data.avgScore / 100) * 10) / 10;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Result icon */}
        <div className="text-6xl mb-6">
          {isVictory ? "🏆" : "💀"}
        </div>

        {/* Title */}
        <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${
          isVictory ? "text-amber-400" : "text-red-400"
        }`}>
          {data.ending.title}
        </h1>
        <p className="text-neutral-400 text-xl mb-10">{data.ending.message}</p>

        {/* Stats */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
          <h2 className="text-neutral-500 text-sm uppercase tracking-wider mb-4">
            {data.questName}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-amber-400">{data.avgScore}</div>
              <div className="text-neutral-500 text-sm">Avg Score</div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-emerald-400">{data.totalWords}</div>
              <div className="text-neutral-500 text-sm">Words Written</div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{data.turns}</div>
              <div className="text-neutral-500 text-sm">Turns Taken</div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400">{xp}</div>
              <div className="text-neutral-500 text-sm">XP Earned</div>
            </div>
          </div>

          {/* Final health */}
          <div className="mt-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-center gap-3">
              <span className="text-neutral-500">Final HP:</span>
              <span className={`font-bold ${
                data.health > 60 ? "text-emerald-400" :
                data.health > 30 ? "text-amber-400" :
                "text-red-400"
              }`}>
                {data.health}/100
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/quests?mode=new")}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-900 py-4 rounded-xl text-xl font-semibold transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 py-4 rounded-xl text-xl font-semibold transition-colors"
          >
            Home
          </button>
        </div>

        {/* Share hint */}
        <p className="text-neutral-600 text-sm mt-8">
          Screenshot to share your adventure! 📸
        </p>
      </div>
    </div>
  );
}
