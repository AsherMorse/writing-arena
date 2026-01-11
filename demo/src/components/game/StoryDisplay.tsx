"use client";

import type { Message } from "@/lib/types";
import { FeedbackDisplay } from "./FeedbackDisplay";

type StoryDisplayProps = {
  messages: Message[];
  isLoading: boolean;
};

export function StoryDisplay({ messages, isLoading }: StoryDisplayProps) {
  return (
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
                    {messages[i + 1].errors &&
                      messages[i + 1].errors!.length > 0 && (
                        <FeedbackDisplay
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
                <div className="flex-1">
                  {/* Explanation in amber at top */}
                  {msg.feedback && msg.feedback.length > 0 && (
                    <p className="text-amber-200 text-lg md:text-xl leading-relaxed mb-2 md:mb-3">
                      {msg.feedback.join(" · ")}
                    </p>
                  )}

                  {/* "Try: ..." suggestion below (only if present) */}
                  {msg.content && (
                    <p className="text-amber-400/70 text-sm md:text-base leading-relaxed mb-2">
                      {msg.content}
                    </p>
                  )}
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
                      {" "}
                      −{damageMatch[1]} hp{" "}
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
  );
}
