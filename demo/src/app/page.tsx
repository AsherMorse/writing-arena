"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SavedQuest = {
  id: string;
  questId: string;
  questName: string;
  health: number;
  lastPlayed: string;
};

export default function Home() {
  const router = useRouter();
  const [savedQuests, setSavedQuests] = useState<SavedQuest[]>([]);

  useEffect(() => {
    // Load saved quests from localStorage
    const saved = localStorage.getItem("writing-arena-saves");
    if (saved) {
      try {
        setSavedQuests(JSON.parse(saved));
      } catch {
        setSavedQuests([]);
      }
    }
  }, []);

  const hasSavedQuests = savedQuests.length > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        {/* Title */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
            Writing Arena
          </h1>
          <p className="text-neutral-500 text-xl">Your writing shapes the story</p>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          {hasSavedQuests && (
            <button
              onClick={() => router.push("/quests?mode=continue")}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-900 py-5 rounded-xl text-xl font-semibold transition-colors"
            >
              Continue Quest
            </button>
          )}

          <button
            onClick={() => router.push("/quests?mode=new")}
            className={`w-full py-5 rounded-xl text-xl font-semibold transition-colors ${
              hasSavedQuests
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-100"
                : "bg-amber-500 hover:bg-amber-400 text-neutral-900"
            }`}
          >
            New Quest
          </button>

          <button
            onClick={() => router.push("/quests?mode=new&multiplayer=true")}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 py-5 rounded-xl text-xl font-semibold transition-colors"
          >
            Play with Friends
          </button>
        </div>

        {/* How it works */}
        <div className="mt-16 pt-10 border-t border-neutral-800 text-center">
          <p className="text-2xl font-semibold text-neutral-200 mb-3">
            Better writing = better outcomes
          </p>
          <p className="text-neutral-400 text-lg mb-8">
            Grammar, spelling, and sentence structure determine your fate
          </p>
          {/*
          <div className="flex justify-center gap-6 text-sm text-neutral-600">
            <span className="text-emerald-600">80+ success</span>
            <span className="text-amber-600">60-79 complications</span>
            <span className="text-red-600">&lt;60 danger</span>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
