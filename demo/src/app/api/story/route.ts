import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { gradeResponse, type GameContext } from "@/lib/grader";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are narrating a BRUTAL interactive story called "The Dragon's Lair". The player is a thief attempting to steal treasure from a sleeping dragon's cave.

PURPOSE: This is a writing education game. The ENTIRE POINT is to encourage good writing by PUNISHING bad writing with in-game consequences. Good grammar, spelling, and sentence structure = success. Poor writing = suffering and death. You are the enforcer of this system.

REALISM:
- The player is an ordinary thief, not a superhero. They cannot do impossible things.
- If they try something unrealistic (punch through stone, dodge dragon fire easily, kill the dragon with a dagger), it FAILS.
- Let players make mistakes. If they make a bad decision, let it play out badly.
- Don't save them from themselves. Bad choices + bad writing = death.

Rules:
- Keep responses to 2-3 sentences maximum
- Be vivid and atmospheric but concise
- Do NOT use markdown formatting (no asterisks, no bold)
- Never ask "what do you do?" or list options explicitly
- ALWAYS end by describing the environment so options are implied (nearby objects, paths, cover, escape routes)
- BAD: "You can hide behind the pillar, grab the sword, or run to the exit."
- GOOD: "A crumbling pillar offers cover to your left. A jeweled sword glints within reach."

Writing Score System:
- 80-100: Action succeeds smoothly
- 60-79: Minor complications or tension
- 40-59: Action fails, things go wrong
- Below 40: SEVERE consequences - maiming, death, no escape

IMPORTANT - BE BRUTAL:
- You are NOT required to give the player a way out
- Low scores can result in instant death, dismemberment, being eaten
- If the player writes gibberish or single words during combat, they die
- Do NOT protect the player from their bad writing
- Sometimes there is no escape, no hope, no survival
- End the story with death if the writing is terrible and the situation is dire

DAMAGE:
Only add [DAMAGE:X] when you describe actual physical harm (fire burns skin, claws slash, bones break).
NOT for: dragon waking, roars, close calls, tension.
Place [DAMAGE:X] RIGHT AFTER describing the injury.
Example: "The dragon's claw rakes across your arm [DAMAGE:20] as you dive behind a pillar."

ENDING THE STORY:
When the story ends, add this tag at the END of your response:
[END:OUTCOME: Title {Subtitle message}]

OUTCOME must be one of:
- DEATH - Player dies (from wounds, eaten, killed, etc.)
- VICTORY - Player achieves their objective  
- ESCAPE - Player survives but fails the objective

Examples:
- [END:VICTORY: Treasure Claimed {You escaped with the dragon's treasure!}]
- [END:DEATH: You Died {The dragon's lair claims another victim.}]
- [END:ESCAPE: Fled {You survived, but left empty-handed.}]
- [END:DEATH: Devoured {The dragon's hunger is satisfied.}]

Do NOT artificially extend the story. Once the objective is resolved, END IT immediately.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, history, health, gameContext: clientContext, storySummary } = body;

    // Extract previous player responses from history for duplicate detection
    const previousResponses = history
      .filter((msg: Anthropic.MessageParam) => msg.role === "user")
      .map((msg: Anthropic.MessageParam) => {
        const content = typeof msg.content === "string" ? msg.content : "";
        // Extract just the player action part (after "Player action:")
        const match = content.match(/Player action: "(.+?)"/);
        return match ? match[1] : content;
      })
      .filter((s: string) => s.length > 0);

    // Build game context for 3-layer grading
    const gameContext: GameContext = {
      location: clientContext?.location ?? "Dragon's Lair",
      scene: clientContext?.scene ?? "A massive red dragon sleeps atop a mountain of gold.",
      characterClass: "Thief",
      abilities: ["stealth", "lockpicking", "dagger fighting", "climbing"],
      inventory: ["dagger", "rope", "lockpicks", "small pouch"],
      objective: "Steal treasure without waking the dragon",
      previousResponses,
      recentStory: storySummary,
    };

    const gradeResult = await gradeResponse(userInput, gameContext);
    const { score, feedback, accepted, blockingReason, hpDamage, errors, errorCount } = gradeResult;

    const currentHealth = health ?? 100;
    const healthContext = `[Player health: ${currentHealth}/100${currentHealth <= 20 ? " - CRITICAL, near death" : currentHealth <= 40 ? " - badly wounded" : currentHealth <= 60 ? " - injured" : ""}]`;

    const encoder = new TextEncoder();

    // If the response was blocked by Layer 2/3, return feedback without calling LLM
    if (!accepted) {
      const stream = new ReadableStream({
        start(controller) {
          // Send the blocking feedback
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: "blocked", 
            reason: blockingReason,
            feedback 
          })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const messages: Anthropic.MessageParam[] = [
      ...history,
      { role: "user" as const, content: `[Writing score: ${score}/100]\n${healthContext}\n\nPlayer action: "${userInput}"` }
    ];

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: "score", 
          score, 
          feedback,
          errors: errors || [],
          errorCount: errorCount || 0
        })}\n\n`));
        
        // Send HP damage from grader immediately after score
        if (hpDamage && hpDamage !== 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "damage", damage: Math.abs(hpDamage) })}\n\n`));
        }

        let textBuffer = "";
        let bracketBuffer = "";
        let inBracket = false;

        const flushText = (text: string) => {
          if (text) {
            const cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "");
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: cleaned })}\n\n`));
          }
        };

        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 200,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const chunk = event.delta.text;

            for (const char of chunk) {
              if (char === "[") {
                flushText(textBuffer);
                textBuffer = "";
                inBracket = true;
                bracketBuffer = "[";
              } else if (char === "]" && inBracket) {
                bracketBuffer += "]";
                const damageMatch = bracketBuffer.match(/\[DAMAGE:\s*(\d+)\]/i);
                
                // New format: [END:OUTCOME: Title {message}]
                const endMatch = bracketBuffer.match(/\[END:(\w+):\s*(.+?)\s*\{(.+?)\}\]/i);
                // Fallback for old format: [END: Title {message}]
                // const endMatchLegacy = bracketBuffer.match(/\[END:\s*(.+?)\s*\{(.+?)\}\]/i);
                
                if (damageMatch) {
                  const damage = parseInt(damageMatch[1], 10);
                  if (damage > 0) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "damage", damage })}\n\n`));
                  }
                } else if (endMatch) {
                  const outcome = endMatch[1].toUpperCase();
                  const title = endMatch[2].trim();
                  const message = endMatch[3].trim();
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "end", outcome, title, message })}\n\n`));
                // } else if (endMatchLegacy && !endMatch) {
                //   // Fallback: infer outcome from title for backwards compatibility
                //   const title = endMatchLegacy[1].trim();
                //   const message = endMatchLegacy[2].trim();
                //   const titleLower = title.toLowerCase();
                //   const outcome = (titleLower.includes("died") || titleLower.includes("death") || titleLower.includes("devoured") || titleLower.includes("killed")) 
                //     ? "DEATH" 
                //     : (titleLower.includes("victory") || titleLower.includes("treasure")) 
                //       ? "VICTORY" 
                //       : "ESCAPE";
                //   controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "end", outcome, title, message })}\n\n`));
                } else if (bracketBuffer.match(/\[Player health:/i) || bracketBuffer.match(/\[Writing score:/i)) {
                  // Silently discard prompt metadata that LLM echoed back
                } else {
                  flushText(bracketBuffer);
                }
                bracketBuffer = "";
                inBracket = false;
              } else if (inBracket) {
                bracketBuffer += char;
              } else {
                textBuffer += char;
              }
            }

            if (!inBracket && textBuffer) {
              flushText(textBuffer);
              textBuffer = "";
            }
          }
        }

        flushText(textBuffer);
        if (bracketBuffer) {
          flushText(bracketBuffer);
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Story API error:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
