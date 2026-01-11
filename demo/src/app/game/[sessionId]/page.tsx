"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { SEVERITY_ICONS, type ErrorSeverity, type GraderError } from "@/lib/grading/client-constants";

type Message = {
  role: "ai" | "user";
  content: string;
  score?: number;
  feedback?: string[];
  errors?: GraderError[];
  errorCount?: number;
  damage?: number;
  blocked?: boolean;
  blockReason?: string;
};

type GameState = {
  messages: Message[];
  health: number;
  storySummary: string;
  checkpoint: number;
};

const QUEST_CONFIG: Record<string, { name: string; openingNarrative: string }> = {
  "dragons-lair": {
    name: "The Dragon's Lair",
    openingNarrative: `The cave mouth yawns before you, your torch casting dancing shadows on wet stone walls. The dragon's rumbling breath echoes from deep within, and the glint of gold teases from the darkness ahead. A narrow ledge hugs the left wall leading to higher ground, the main path slopes down through scattered bones, and a crack in the right wall looks just wide enough to squeeze through.`,
  },
  "shattered-kingdom": {
    name: "The Shattered Kingdom",
    openingNarrative: `The ancient road stretches before you, cracked stones overgrown with weeds. In the distance, the spires of a ruined castle pierce the gray sky. A merchant's cart lies overturned by the roadside, its contents scattered. The forest to your left rustles with movement, and smoke rises from a farmhouse chimney to your right.`,
  },
};

const MAX_HEALTH = 100;

function ExpandableFeedback({ 
  errors, 
  errorCount 
}: { 
  errors: GraderError[]; 
  errorCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  
  if (!errors || errors.length === 0) return null;
  
  const totalCount = errorCount || errors.length;
  const hasMore = totalCount > 3;
  const displayErrors = expanded ? errors : errors.slice(0, 2);
  
  return (
    <div className="space-y-1.5">
      {displayErrors.map((error, idx) => (
        <p key={idx} className="text-neutral-400 text-sm md:text-base">
          <span className="mr-1.5">{SEVERITY_ICONS[error.severity]}</span>
          {error.explanation}
        </p>
      ))}
      {hasMore && !expanded && (
        <button 
          onClick={() => setExpanded(true)}
          className="text-amber-500/70 hover:text-amber-400 text-xs transition-colors"
        >
          +{totalCount - 2} more {totalCount - 2 === 1 ? "issue" : "issues"}
        </button>
      )}
      {expanded && hasMore && (
        <button 
          onClick={() => setExpanded(false)}
          className="text-neutral-600 hover:text-neutral-500 text-xs transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}

function GameContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const sessionId = params.sessionId as string;
  const questId = searchParams.get("quest") || "dragons-lair";
  const isContinuing = searchParams.get("continue") === "true";
  
  const questConfig = QUEST_CONFIG[questId] || QUEST_CONFIG["dragons-lair"];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [ending, setEnding] = useState<{ outcome: string; title: string; message: string } | null>(null);
  const [storySummary, setStorySummary] = useState("");
  const [checkpoint, setCheckpoint] = useState(0);
  const [initialized, setInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGameOver = ending !== null;

  // Initialize game state
  useEffect(() => {
    if (initialized) return;

    if (isContinuing) {
      // Load from localStorage
      const saved = localStorage.getItem(`writing-arena-game-${sessionId}`);
      if (saved) {
        try {
          const state: GameState = JSON.parse(saved);
          setMessages(state.messages);
          setHealth(state.health);
          setStorySummary(state.storySummary);
          setCheckpoint(state.checkpoint);
        } catch {
          // Fall back to new game
          setMessages([{ role: "ai", content: questConfig.openingNarrative }]);
        }
      } else {
        setMessages([{ role: "ai", content: questConfig.openingNarrative }]);
      }
    } else {
      setMessages([{ role: "ai", content: questConfig.openingNarrative }]);
    }
    
    setInitialized(true);
  }, [initialized, isContinuing, sessionId, questConfig.openingNarrative]);

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
    }> = [];
    
    if (saves) {
      try {
        savesList = JSON.parse(saves);
      } catch {}
    }

    const existingIndex = savesList.findIndex((s) => s.id === sessionId);
    const saveData = {
      id: sessionId,
      questId,
      questName: questConfig.name,
      health,
      checkpoint,
      lastPlayed: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      savesList[existingIndex] = saveData;
    } else {
      savesList.unshift(saveData);
    }

    localStorage.setItem("writing-arena-saves", JSON.stringify(savesList.slice(0, 10))); // Keep last 10
  }, [initialized, messages, health, storySummary, checkpoint, sessionId, questId, questConfig.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialized && !isLoading && !isGameOver) {
      inputRef.current?.focus();
    }
  }, [initialized, isLoading, messages, isGameOver]);

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
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: userMessage,
          history: buildHistory(),
          health,
          storySummary,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let currentScore: number | undefined;
      let currentFeedback: string[] | undefined;
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
                setMessages((prev) => [
                  ...prev,
                  { 
                    role: "ai", 
                    content: "", 
                    score: currentScore, 
                    feedback: currentFeedback,
                    errors: data.errors,
                    errorCount: data.errorCount
                  },
                ]);
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
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "ai") {
                    updated[updated.length - 1] = { ...last, content: narrativeText };
                  }
                  return updated;
                });
              } else if (data.type === "damage") {
                const damage = data.damage;
                localHealth = Math.max(0, localHealth - damage);
                setHealth(localHealth);
                narrativeText += `{{DAMAGE:${damage}}}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "ai") {
                    updated[updated.length - 1] = { ...last, content: narrativeText, damage };
                  }
                  return updated;
                });
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
                }
                setEnding({ outcome, title: data.title, message: data.message });
              }
            } catch {}
          }
        }
      }

      // Check if player died from accumulated damage (no ending from LLM)
      if (localHealth <= 0 && !receivedEnding) {
        setHealth(0);
        setEnding({ outcome: "DEATH", title: "You Died", message: "Your wounds proved fatal." });
      }

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAction();
    }
  };

  const goToVictory = () => {
    const scores = messages.filter((m) => m.score !== undefined).map((m) => m.score!);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const totalWords = messages
      .filter((m) => m.role === "user")
      .reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);

    // Store victory data
    localStorage.setItem(`writing-arena-victory-${sessionId}`, JSON.stringify({
      questName: questConfig.name,
      ending,
      avgScore,
      totalWords,
      turns: scores.length,
      health,
    }));

    // Remove from saves
    const saves = localStorage.getItem("writing-arena-saves");
    if (saves) {
      try {
        const savesList = JSON.parse(saves).filter((s: { id: string }) => s.id !== sessionId);
        localStorage.setItem("writing-arena-saves", JSON.stringify(savesList));
      } catch {}
    }

    router.push(`/victory/${sessionId}`);
  };

  const exitToHome = () => {
    router.push("/");
  };

  const healthPercent = (health / MAX_HEALTH) * 100;

  if (!initialized) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500">Loading quest...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-neutral-800/50">
        <button
          onClick={exitToHome}
          className="text-neutral-500 hover:text-neutral-300 transition-colors text-base md:text-lg"
        >
          ← Exit
        </button>

        <div className="text-neutral-400 text-sm md:text-base font-medium">
          {questConfig.name}
        </div>

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
          <span className="text-neutral-500 text-lg md:text-xl w-8 md:w-10">{health}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 md:py-14">
          <article>
            {messages.map((msg, i) => (
              <div key={i} className="mb-8 md:mb-12">
                {msg.role === "user" ? (
                  <div className="mb-6 md:mb-8">
                    <p className="text-amber-200/90 italic border-l-[3px] border-amber-200/30 pl-4 md:pl-6 text-xl md:text-2xl leading-relaxed">
                      {msg.content}
                    </p>
                    {messages[i + 1]?.score !== undefined && (
                      <div className="mt-3 md:mt-4 pl-4 md:pl-6">
                        <div className="flex items-start gap-3 md:gap-4">
                          <span
                            className={`text-lg md:text-xl ${
                              messages[i + 1].score! >= 80
                                ? "text-emerald-400"
                                : messages[i + 1].score! >= 60
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {messages[i + 1].score}
                          </span>
                          {messages[i + 1].errors && messages[i + 1].errors!.length > 0 && (
                            <ExpandableFeedback 
                              errors={messages[i + 1].errors!}
                              errorCount={messages[i + 1].errorCount}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : msg.blocked ? (
                  <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <span className="text-xl md:text-2xl">⚠️</span>
                      <div>
                        <p className="text-amber-200 text-lg md:text-xl leading-relaxed mb-2 md:mb-3">
                          {msg.content}
                        </p>
                        {msg.feedback && msg.feedback.length > 0 && (
                          <p className="text-amber-400/70 text-sm md:text-base">
                            {msg.feedback.join(" · ")}
                          </p>
                        )}
                        <p className="text-neutral-500 text-sm md:text-base mt-2 md:mt-3">
                          Try a different action.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-200 leading-relaxed text-xl md:text-2xl">
                    {msg.content.split(/(\{\{DAMAGE:\d+\}\})/).map((part, j) => {
                      const damageMatch = part.match(/\{\{DAMAGE:(\d+)\}\}/);
                      if (damageMatch) {
                        return (
                          <span key={j} className="text-red-400 font-medium">
                            {" "}−{damageMatch[1]} hp{" "}
                          </span>
                        );
                      }
                      return part;
                    })}
                    {isLoading && i === messages.length - 1 && !msg.content && (
                      <span className="inline-block w-3 h-6 md:h-7 bg-neutral-400 animate-pulse ml-1" />
                    )}
                  </p>
                )}
              </div>
            ))}
          </article>

          {/* Ending */}
          {ending && (
            <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-neutral-800 text-center">
              <p className="text-neutral-100 text-2xl md:text-3xl font-medium mb-3 md:mb-4">
                {ending.title}
              </p>
              <p className="text-neutral-400 text-lg md:text-xl mb-8 md:mb-10">{ending.message}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goToVictory}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-10 md:px-12 py-4 md:py-5 rounded-xl text-lg md:text-xl font-medium transition-colors"
                >
                  See Results
                </button>
                <button
                  onClick={exitToHome}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-10 md:px-12 py-4 md:py-5 rounded-xl text-lg md:text-xl font-medium transition-colors"
                >
                  Home
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input footer */}
      {!isGameOver && (
        <footer className="flex-shrink-0 border-t border-neutral-800/50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 md:gap-5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you do?"
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 md:px-6 py-4 md:py-5 text-lg md:text-xl focus:outline-none focus:border-neutral-600 disabled:opacity-50 placeholder-neutral-600 transition-colors resize-none"
              />
              <button
                onClick={submitAction}
                disabled={isLoading || !input.trim()}
                className="bg-neutral-100 text-neutral-900 px-6 md:px-10 py-4 md:py-5 rounded-xl text-lg md:text-xl font-medium hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </footer>
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
