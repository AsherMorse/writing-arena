"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type Quest = {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  theme: string;
};

type SavedQuest = {
  id: string;
  questId: string;
  questName: string;
  health: number;
  checkpoint: number;
  lastPlayed: string;
  completed?: boolean;
  outcome?: {
    outcome: string;
    title: string;
    message: string;
  };
};

const AVAILABLE_QUESTS: Quest[] = [
  {
    id: "dragons-lair",
    name: "The Dragon's Lair",
    description: "Sneak into a dragon's cave to steal treasure. One wrong move and you're toast.",
    difficulty: "Medium",
    theme: "🐉",
  },
  {
    id: "shattered-kingdom",
    name: "The Shattered Kingdom",
    description: "A classic fantasy adventure through a realm torn apart by war. Coming soon!",
    difficulty: "Medium",
    theme: "🏰",
  },
];

function QuestSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "new";
  const isMultiplayer = searchParams.get("multiplayer") === "true";
  
  const [savedQuests, setSavedQuests] = useState<SavedQuest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("writing-arena-saves");
    if (saved) {
      try {
        setSavedQuests(JSON.parse(saved));
      } catch {
        setSavedQuests([]);
      }
    }
  }, []);

  const startNewQuest = (questId: string) => {
    // Generate a new session ID
    const sessionId = `${questId}-${Date.now()}`;
    
    if (isMultiplayer) {
      // TODO: Create party and go to lobby
      router.push(`/lobby/${sessionId}`);
    } else {
      router.push(`/game/${sessionId}?quest=${questId}`);
    }
  };

  const continueQuest = (savedQuest: SavedQuest) => {
    router.push(`/game/${savedQuest.id}?quest=${savedQuest.questId}&continue=true`);
  };

  const deleteSave = (saveId: string) => {
    const updated = savedQuests.filter((s) => s.id !== saveId);
    setSavedQuests(updated);
    localStorage.setItem("writing-arena-saves", JSON.stringify(updated));
  };

  const isContinueMode = mode === "continue";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/")}
            className="text-neutral-500 hover:text-neutral-300 transition-colors mb-6 inline-block"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">
            {isContinueMode ? "Continue Quest" : isMultiplayer ? "Choose a Quest" : "New Quest"}
          </h1>
          {isMultiplayer && (
            <p className="text-neutral-500 mt-2">You'll create a party after selecting a quest</p>
          )}
        </div>

        {/* Continue Mode: Show saved quests */}
        {isContinueMode && (
          <div className="space-y-4">
            {savedQuests.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-xl mb-6">No saved quests found</p>
                <button
                  onClick={() => router.push("/quests?mode=new")}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-8 py-4 rounded-xl font-semibold transition-colors"
                >
                  Start a New Quest
                </button>
              </div>
            ) : (
              <>
                {/* In-progress quests */}
                {savedQuests.filter(s => !s.completed).length > 0 && (
                  <div className="space-y-4">
                    {savedQuests.filter(s => !s.completed).map((save) => (
                      <div
                        key={save.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">{save.questName}</h3>
                            <div className="flex items-center gap-4 text-neutral-500 text-sm">
                              <span>HP: {save.health}/100</span>
                              <span>Checkpoint {save.checkpoint}</span>
                              <span>
                                {new Date(save.lastPlayed).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => continueQuest(save)}
                              className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                              Continue
                            </button>
                            <button
                              onClick={() => deleteSave(save.id)}
                              className="bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 px-4 py-2 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed quests */}
                {savedQuests.filter(s => s.completed).length > 0 && (
                  <div className="space-y-4">
                    {savedQuests.filter(s => !s.completed).length > 0 && (
                      <h2 className="text-neutral-500 text-sm uppercase tracking-wider mt-8 mb-2">Completed</h2>
                    )}
                    {savedQuests.filter(s => s.completed).map((save) => (
                      <div
                        key={save.id}
                        className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-6 hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-semibold text-neutral-300">{save.questName}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                save.outcome?.outcome === "DEATH" 
                                  ? "bg-red-900/50 text-red-400" 
                                  : "bg-emerald-900/50 text-emerald-400"
                              }`}>
                                {save.outcome?.title || "Completed"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-neutral-600 text-sm">
                              <span>Final HP: {save.health}/100</span>
                              <span>
                                {new Date(save.lastPlayed).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => continueQuest(save)}
                              className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => deleteSave(save.id)}
                              className="bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 px-4 py-2 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* New Quest Mode: Show available quests */}
        {!isContinueMode && (
          <div className="space-y-4">
            {AVAILABLE_QUESTS.map((quest) => {
              const isAvailable = quest.id === "dragons-lair"; // Only Dragon's Lair is playable for now
              
              return (
                <button
                  key={quest.id}
                  onClick={() => isAvailable && startNewQuest(quest.id)}
                  disabled={!isAvailable}
                  className={`w-full text-left bg-neutral-900 border rounded-xl p-6 transition-colors ${
                    isAvailable
                      ? "border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900/80 cursor-pointer"
                      : "border-neutral-800/50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{quest.theme}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-semibold">{quest.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          quest.difficulty === "Easy" ? "bg-emerald-900/50 text-emerald-400" :
                          quest.difficulty === "Medium" ? "bg-amber-900/50 text-amber-400" :
                          "bg-red-900/50 text-red-400"
                        }`}>
                          {quest.difficulty}
                        </span>
                        {!isAvailable && (
                          <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-500">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-400">{quest.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestSelection() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    }>
      <QuestSelectionContent />
    </Suspense>
  );
}
