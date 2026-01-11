"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import type { GraderError } from "@/lib/grading/client-constants";
import type { Message, GameState, CheckpointState, Ending } from "@/lib/types";
import { QUEST_CONFIG, DEFAULT_QUEST_ID, MAX_HEALTH } from "@/lib/quests/config";
import {
  HPBar,
  StoryDisplay,
  WritingInput,
  RespawnModal,
  EndingSection,
  CheckpointToast,
} from "@/components/game";

function GameContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const sessionId = params.sessionId as string;
  const questId = searchParams.get("quest") || DEFAULT_QUEST_ID;
  const questConfig = QUEST_CONFIG[questId] || QUEST_CONFIG[DEFAULT_QUEST_ID];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [storySummary, setStorySummary] = useState("");
  const [checkpoint, setCheckpoint] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Checkpoint system state
  const [checkpointState, setCheckpointState] = useState<CheckpointState | null>(null);
  const [turnsSinceCheckpoint, setTurnsSinceCheckpoint] = useState(0);
  const [showRespawnModal, setShowRespawnModal] = useState(false);
  const [deathFeedback, setDeathFeedback] = useState<{
    score?: number;
    errors?: GraderError[];
  } | null>(null);
  const [showCheckpointToast, setShowCheckpointToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGameOver = ending !== null;

  // Initialize game state
  useEffect(() => {
    if (initialized) return;

    // Always try to load from localStorage if a save exists for this session
    const saved = localStorage.getItem(`writing-arena-game-${sessionId}`);
    if (saved) {
      try {
        const state: GameState = JSON.parse(saved);
        setMessages(state.messages);
        setHealth(state.health);
        setStorySummary(state.storySummary);
        setCheckpoint(state.checkpoint);

        // Check if this is a completed game and restore ending state
        const savesJson = localStorage.getItem("writing-arena-saves");
        if (savesJson) {
          const saves = JSON.parse(savesJson);
          const thisSave = saves.find((s: { id: string }) => s.id === sessionId);
          if (thisSave?.completed && thisSave?.outcome) {
            setEnding(thisSave.outcome);
          }
        }

        setInitialized(true);
        return;
      } catch {
        // Fall through to new game
      }
    }

    // No save found or parse failed - start new game
    setMessages([{ role: "ai", content: questConfig.openingNarrative }]);
    setInitialized(true);
  }, [initialized, sessionId, questConfig.openingNarrative]);

  // Auto-save on state changes
  useEffect(() => {
    if (!initialized || messages.length === 0) return;

    const state: GameState = {
      messages,
      health,
      storySummary,
      checkpoint,
    };
    localStorage.setItem(`writing-arena-game-${sessionId}`, JSON.stringify(state));

    // Also update the saves list
    const saves = localStorage.getItem("writing-arena-saves");
    let savesList: Array<{
      id: string;
      questId: string;
      questName: string;
      health: number;
      checkpoint: number;
      lastPlayed: string;
      completed?: boolean;
      outcome?: Ending;
    }> = [];

    if (saves) {
      try {
        savesList = JSON.parse(saves);
      } catch {}
    }

    const existingIndex = savesList.findIndex((s) => s.id === sessionId);
    const existingSave = existingIndex >= 0 ? savesList[existingIndex] : null;

    const saveData = {
      id: sessionId,
      questId,
      questName: questConfig.name,
      health,
      checkpoint,
      lastPlayed: new Date().toISOString(),
      // Mark completed if there's an ending, otherwise preserve existing
      ...(ending
        ? { completed: true, outcome: ending }
        : existingSave?.completed && {
            completed: existingSave.completed,
            outcome: existingSave.outcome,
          }),
    };

    if (existingIndex >= 0) {
      savesList[existingIndex] = saveData;
    } else {
      savesList.unshift(saveData);
    }

    localStorage.setItem("writing-arena-saves", JSON.stringify(savesList.slice(0, 10))); // Keep last 10
  }, [initialized, messages, health, storySummary, checkpoint, sessionId, questId, questConfig.name, ending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialized && !isLoading && !isGameOver) {
      inputRef.current?.focus();
    }
  }, [initialized, isLoading, messages, isGameOver]);

  useEffect(() => {
    if (showCheckpointToast) {
      const timer = setTimeout(() => {
        setShowCheckpointToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCheckpointToast]);

  const buildHistory = () => {
    const filtered: Message[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.blocked) {
        if (filtered.length > 0 && filtered[filtered.length - 1].role === "user") {
          filtered.pop();
        }
        continue;
      }
      filtered.push(msg);
    }
    return filtered.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));
  };

  const submitAction = async () => {
    if (!input.trim() || isLoading || isGameOver) return;

    const userMessage = input.trim();
    setInput("");

    // Track messages locally to capture checkpoint state accurately
    let localMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(localMessages);
    setIsLoading(true);

    try {
      // Extract last 2 AI messages for immediate grader context
      const recentAIResponses = messages
        .filter((m) => m.role === "ai" && m.content && !m.blocked)
        .slice(-2)
        .map((m) => m.content);

      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: userMessage,
          history: buildHistory(),
          health,
          storySummary,
          recentAIResponses,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let currentScore: number | undefined;
      let currentFeedback: string[] | undefined;
      let currentErrors: GraderError[] | undefined;
      let narrativeText = "";
      let localHealth = health; // Track health locally to detect death
      let receivedEnding = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "score") {
                currentScore = data.score;
                currentFeedback = data.feedback;
                currentErrors = data.errors;
                // Add AI message to local tracking
                const aiMessage: Message = {
                  role: "ai",
                  content: "",
                  score: currentScore,
                  feedback: currentFeedback,
                  errors: data.errors,
                  errorCount: data.errorCount,
                };
                localMessages = [...localMessages, aiMessage];
                setMessages(localMessages);
              } else if (data.type === "blocked") {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "ai",
                    content: data.reason || "That action isn't valid. Try something else!",
                    blocked: true,
                    blockReason: data.reason,
                    feedback: data.feedback,
                  },
                ]);
              } else if (data.type === "text") {
                narrativeText += data.text;
                // Update local messages tracking
                if (localMessages.length > 0) {
                  const last = localMessages[localMessages.length - 1];
                  if (last.role === "ai") {
                    localMessages[localMessages.length - 1] = { ...last, content: narrativeText };
                  }
                }
                setMessages([...localMessages]);
              } else if (data.type === "damage") {
                const damage = data.damage;
                localHealth = Math.max(0, localHealth - damage);
                setHealth(localHealth);
                narrativeText += `{{DAMAGE:${damage}}}`;
                // Update local messages tracking
                if (localMessages.length > 0) {
                  const last = localMessages[localMessages.length - 1];
                  if (last.role === "ai") {
                    localMessages[localMessages.length - 1] = { ...last, content: narrativeText, damage };
                  }
                }
                setMessages([...localMessages]);
              } else if (data.type === "checkpoint") {
                // Save checkpoint state using local messages tracking
                console.log("🚩 CHECKPOINT RECEIVED");
                setCheckpointState({
                  messages: [...localMessages],
                  storySummary,
                  savedAt: Date.now(),
                });
                setTurnsSinceCheckpoint(0);
                setCheckpoint((prev) => prev + 1);
                setShowCheckpointToast(true);
              } else if (data.type === "end") {
                receivedEnding = true;
                const outcome = data.outcome || "ESCAPE";
                if (outcome === "DEATH") {
                  // Add finishing blow damage to narrative if there's remaining health
                  if (localHealth > 0) {
                    const finishingDamage = localHealth;
                    narrativeText += `{{DAMAGE:${finishingDamage}}}`;
                    setMessages((prev) => {
                      const updated = [...prev];
                      const last = updated[updated.length - 1];
                      if (last && last.role === "ai") {
                        updated[updated.length - 1] = { ...last, content: narrativeText };
                      }
                      return updated;
                    });
                    localHealth = 0;
                  }
                  setHealth(0);

                  // Check for checkpoint - show respawn modal instead of ending
                  if (checkpointState) {
                    setDeathFeedback({
                      score: currentScore,
                      errors: currentErrors,
                    });
                    setShowRespawnModal(true);
                  } else {
                    // No checkpoint - permanent death
                    setEnding({ outcome, title: data.title, message: data.message });
                  }
                } else {
                  setEnding({ outcome, title: data.title, message: data.message });
                }
              }
            } catch {}
          }
        }
      }

      // Check if player died from accumulated damage (no ending from LLM)
      if (localHealth <= 0 && !receivedEnding) {
        setHealth(0);

        // Check for checkpoint - show respawn modal instead of ending
        if (checkpointState) {
          setDeathFeedback({
            score: currentScore,
            errors: currentErrors,
          });
          setShowRespawnModal(true);
        } else {
          // No checkpoint - permanent death
          setEnding({ outcome: "DEATH", title: "You Died", message: "Your wounds proved fatal." });
        }
      }

      // Turn counter and auto-checkpoint fallback
      setTurnsSinceCheckpoint((prev) => {
        const newCount = prev + 1;
        // Auto-checkpoint every 5 turns if no AI checkpoint was received this turn
        if (newCount >= 5) {
          setCheckpointState({
            messages: localMessages,
            storySummary,
            savedAt: Date.now(),
          });
          setCheckpoint((c) => c + 1);
          setShowCheckpointToast(true);
          return 0; // Reset counter
        }
        return newCount;
      });

      // Update story summary
      if (narrativeText) {
        try {
          const summaryRes = await fetch("/api/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              previousSummary: storySummary,
              playerAction: userMessage,
              storyResponse: narrativeText.replace(/\{\{DAMAGE:\d+\}\}/g, ""),
            }),
          });
          const { summary } = await summaryRes.json();
          if (summary) {
            setStorySummary(summary);
          }
        } catch (e) {
          console.error("Summary update failed:", e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const respawnAtCheckpoint = () => {
    if (!checkpointState) return;

    // Restore state from checkpoint
    setMessages(checkpointState.messages);
    setStorySummary(checkpointState.storySummary);

    // Reset health to 70%
    setHealth(70);

    // Clear death state
    setShowRespawnModal(false);
    setDeathFeedback(null);
    setEnding(null);

    // Reset turn counter
    setTurnsSinceCheckpoint(0);
  };

  const goToVictory = () => {
    const scores = messages.filter((m) => m.score !== undefined).map((m) => m.score!);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const totalWords = messages
      .filter((m) => m.role === "user")
      .reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);

    // Store victory data
    localStorage.setItem(
      `writing-arena-victory-${sessionId}`,
      JSON.stringify({
        questName: questConfig.name,
        ending,
        avgScore,
        totalWords,
        turns: scores.length,
        health,
      })
    );

    // Mark save as completed (don't delete)
    const saves = localStorage.getItem("writing-arena-saves");
    if (saves) {
      try {
        const savesList = JSON.parse(saves);
        const existingIndex = savesList.findIndex((s: { id: string }) => s.id === sessionId);
        if (existingIndex >= 0) {
          savesList[existingIndex] = {
            ...savesList[existingIndex],
            completed: true,
            outcome: ending,
          };
          localStorage.setItem("writing-arena-saves", JSON.stringify(savesList));
        }
      } catch {}
    }

    router.push(`/victory/${sessionId}`);
  };

  const exitToHome = () => {
    router.push("/");
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500">Loading quest...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden">
      <CheckpointToast isVisible={showCheckpointToast} />

      {/* Header */}
      <header className="flex-shrink-0 px-6 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-neutral-800/50">
        <button
          onClick={exitToHome}
          className="text-neutral-500 hover:text-neutral-300 transition-colors text-base md:text-lg"
        >
          ← Exit
        </button>

        <div className="text-neutral-400 text-sm md:text-base font-medium">{questConfig.name}</div>

        <HPBar health={health} maxHealth={MAX_HEALTH} />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 md:py-14">
          <StoryDisplay messages={messages} isLoading={isLoading} />

          <RespawnModal
            isOpen={showRespawnModal}
            deathFeedback={deathFeedback}
            onContinue={respawnAtCheckpoint}
          />

          {ending && (
            <EndingSection ending={ending} onSeeResults={goToVictory} onGoHome={exitToHome} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input footer */}
      {!isGameOver && (
        <WritingInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSubmit={submitAction}
          disabled={isLoading}
        />
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
          <p className="text-neutral-500">Loading...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
