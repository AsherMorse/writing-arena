import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You maintain a concise running summary of a D&D adventure game for grading purposes.

Given the previous summary and the latest exchange (player action + story response), update the summary to include key facts.

Track:
- What the player has DONE (actions taken)
- What the player has OBTAINED (items picked up, treasure stolen)
- Current situation/location
- Any injuries or status changes

Keep additions SHORT (2-4 sentences max). Focus on FACTS that affect what actions make sense.

Example:
Previous: "Player entered dragon's lair via crack in wall."
Latest: Player grabbed ruby chalice, snuck back out.
Updated: "Player entered dragon's lair via crack in wall. Successfully stole a ruby-encrusted chalice and retreated to the entrance passage."`;

export async function POST(req: NextRequest) {
  try {
    const { previousSummary, playerAction, storyResponse } = await req.json();

    const userPrompt = `Previous summary: ${previousSummary || "Game just started. Player is a thief at the entrance of a dragon's cave."}

Latest exchange:
- Player action: "${playerAction}"
- Story response: "${storyResponse}"

Write the updated summary (2-4 sentences):`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514", // Fast model for summaries
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ summary: previousSummary || "" });
    }

    return NextResponse.json({ summary: content.text.trim() });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json({ summary: "" });
  }
}

