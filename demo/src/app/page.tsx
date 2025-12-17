"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "ai" | "user";
  content: string;
  score?: number;
  feedback?: string[];
  damage?: number;
};

const OPENING_NARRATIVE = `The cave mouth yawns before you, your torch casting dancing shadows on wet stone walls. The dragon's rumbling breath echoes from deep within, and the glint of gold teases from the darkness ahead. A narrow ledge hugs the left wall leading to higher ground, the main path slopes down through scattered bones, and a crack in the right wall looks just wide enough to squeeze through.`;

const MAX_HEALTH = 100;

export default function Home() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [ending, setEnding] = useState<{ title: string; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGameOver = ending !== null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (started && !isLoading && !isGameOver) {
      inputRef.current?.focus();
    }
  }, [started, isLoading, messages, isGameOver]);

  const buildHistory = () => {
    return messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));
  };

  const startGame = () => {
    setMessages([{ role: "ai", content: OPENING_NARRATIVE }]);
    setHealth(MAX_HEALTH);
    setStarted(true);
  };

  const restart = () => {
    setStarted(false);
    setMessages([]);
    setHealth(MAX_HEALTH);
    setEnding(null);
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
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let currentScore: number | undefined;
      let currentFeedback: string[] | undefined;
      let narrativeText = "";

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
                  { role: "ai", content: "", score: currentScore, feedback: currentFeedback },
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
                setHealth((prev) => Math.max(0, prev - damage));
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
                setEnding({ title: data.title, message: data.message });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const scores = messages.filter((m) => m.score !== undefined).map((m) => m.score!);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAction();
    }
  };

  const healthPercent = (health / MAX_HEALTH) * 100;

  if (!started) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-12">
        <div className="max-w-2xl w-full">
          <div className="mb-16">
            <h1 className="text-7xl font-medium tracking-tight mb-4">The Dragon&apos;s Lair</h1>
            <p className="text-neutral-500 text-2xl">A writing adventure</p>
          </div>

          <div className="mb-14 text-neutral-300 leading-relaxed text-2xl">
            <p className="mb-6">
              You stand at the entrance of a dark cave. Inside, the rumbling breath of a sleeping dragon echoes off the walls. Gold glimmers in the torchlight.
            </p>
            <p className="text-neutral-500 text-xl">
              Your writing quality shapes the story. Write well and you&apos;ll succeed. Write poorly and you may not survive.
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-neutral-100 text-neutral-900 py-6 rounded-xl text-xl font-medium hover:bg-white transition-colors"
          >
            Begin
          </button>

          <div className="mt-14 pt-12 border-t border-neutral-800">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-neutral-400 text-2xl mb-2">80+</div>
                <div className="text-neutral-600 text-lg">Success</div>
              </div>
              <div>
                <div className="text-neutral-400 text-2xl mb-2">60-79</div>
                <div className="text-neutral-600 text-lg">Tension</div>
              </div>
              <div>
                <div className="text-neutral-400 text-2xl mb-2">&lt;60</div>
                <div className="text-neutral-600 text-lg">Danger</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-10 py-6 flex items-center justify-between border-b border-neutral-800/50">
        <button onClick={restart} className="text-neutral-500 hover:text-neutral-300 transition-colors text-lg">
          ← New game
        </button>

        <div className="flex items-center gap-4">
          <div className="w-40 h-2.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                healthPercent > 60 ? "bg-emerald-500" :
                healthPercent > 30 ? "bg-amber-500" :
                "bg-red-500"
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="text-neutral-500 text-xl w-10">{health}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-12 py-14">
          <article>
            {messages.map((msg, i) => (
              <div key={i} className="mb-12">
                {msg.role === "user" ? (
                  <div className="mb-8">
                    <p className="text-amber-200/90 italic border-l-[3px] border-amber-200/30 pl-6 text-2xl leading-relaxed">
                      {msg.content}
                    </p>
                    {messages[i + 1]?.score !== undefined && (
                      <div className="mt-4 pl-6">
                        <div className="flex items-center gap-4">
                          <span className={`text-xl ${
                            messages[i + 1].score! >= 80 ? "text-emerald-400" :
                            messages[i + 1].score! >= 60 ? "text-amber-400" :
                            "text-red-400"
                          }`}>
                            {messages[i + 1].score}
                          </span>
                          {messages[i + 1].feedback && messages[i + 1].feedback!.length > 0 && (
                            <span className="text-neutral-500 text-base">
                              {messages[i + 1].feedback!.slice(0, 3).join(" · ")}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-200 leading-relaxed text-2xl">
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
                      <span className="inline-block w-3 h-7 bg-neutral-400 animate-pulse ml-1" />
                    )}
                  </p>
                )}
              </div>
            ))}
          </article>

          {ending && (
            <div className="mt-12 pt-12 border-t border-neutral-800 text-center">
              <p className="text-neutral-100 text-3xl font-medium mb-4">{ending.title}</p>
              <p className="text-neutral-400 text-xl mb-10">{ending.message}</p>
              <button
                onClick={restart}
                className="bg-neutral-100 text-neutral-900 px-12 py-5 rounded-xl text-xl font-medium hover:bg-white transition-colors"
              >
                Play again
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {!isGameOver && (
        <footer className="flex-shrink-0 border-t border-neutral-800/50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you do?"
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-5 text-xl focus:outline-none focus:border-neutral-600 disabled:opacity-50 placeholder-neutral-600 transition-colors resize-none"
              />
              <button
                onClick={submitAction}
                disabled={isLoading || !input.trim()}
                className="bg-neutral-100 text-neutral-900 px-10 py-5 rounded-xl text-xl font-medium hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
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
