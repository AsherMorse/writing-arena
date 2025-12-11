# Ranked Prompt Generation

## Overview

The ranked paragraph mode generates writing prompts dynamically using AI. Each day, prompts are created by combining a **topic** and an **angle**, then sending them to Claude to produce a student-friendly two-sentence prompt.

## Endpoint

**POST** `/fantasy/api/daily-prompt`

### Request

```json
{
  "topic": "Fortnite",
  "angle": "Focus on why people find this topic interesting or enjoyable"
}
```

### Response

```json
{
  "promptText": "Why do so many people enjoy playing Fortnite? You might consider the game's building features, the excitement of competing with others, or the fun of playing with friends online."
}
```

## How It Works

### 1. Topic & Angle Selection

Located in `lib/services/ranked-prompts.ts`:

- **Topics** are selected deterministically using a seeded random based on the date
- **Angles** provide different perspectives for approaching the topic
- Same date = same topic/angle combo (ensures fairness for daily challenges)

### 2. AI Prompt Generation

Located in `app/fantasy/api/daily-prompt/route.ts`:

The system prompt instructs Claude to generate prompts with these rules:

| Rule | Description |
|------|-------------|
| Two sentences | First sets up the question, second suggests what to include |
| Non-imperative | Uses "You might..." instead of "Write about..." |
| Expository focus | Explaining/informing, not narrative/storytelling |
| Grade 6-8 appropriate | No adult-level knowledge required |

### 3. Example System Prompt

```
You are a writing prompt generator for a daily writing challenge. Given a topic and an angle, create a two-sentence writing prompt.

Rules:
1. First sentence: A statement or question that sets up expository writing (explaining or informing)
2. Second sentence: Gentle suggestions about what the student might include (use "You might..." phrasing)
3. AVOID commands like "Write about", "Describe", "Explain" - be non-imperative
4. AVOID requiring adult-level knowledge
5. AVOID pushing toward narrative or first-person writing
6. Keep it appropriate for grades 6-8
7. Use the provided angle to shape your prompt's direction

Examples:
Topic: Dragons | Angle: what makes it unique
Output: What do dragons look like in stories from around the world? You might talk about their size, color, wings, and whether they breathe fire.

Topic: Baseball | Angle: comparing to something similar
Output: How is baseball different from other sports? You might discuss the rules, equipment, and how teams score points.

Return ONLY the two-sentence prompt, nothing else.

Angle: Focus on why people find this topic interesting or enjoyable

Topic: Video Games
```

## Current Topics

```typescript
const RANKED_TOPICS = [
  'Summer', 'Friendship', 'Video Games', 'Superheroes', 'Space',
  'Pets', 'Sports', 'Music', 'Bravery', 'Flying', 'Dinosaurs',
  'The Ocean', 'Robots', 'Dreams', 'Holidays', 'Wild Animals',
  'Books', 'Inventions', 'Weather', 'Movies', 'Nature', 'Travel',
  'Art', 'Winter', 'Teamwork', 'Technology', 'Forests', 'Mountains',
  'Learning', 'Sleep', 'Magic', 'Kindness', 'Colors',
];
```

## Current Angles

```typescript
const ANGLES = [
  'Focus on what makes this topic unique or special.',
  'Focus on how this topic affects or connects to people.',
  'Focus on comparing this topic to something similar.',
  'Focus on why people find this topic interesting or enjoyable.',
  'Focus on how this topic works or functions.',
  'Focus on the benefits or positive aspects of this topic.',
  'Focus on different types or varieties of this topic.',
  'Focus on what someone new to this topic should know.',
];
```

## Testing

```bash
curl -s -X POST http://localhost:3000/fantasy/api/daily-prompt \
  -H "Content-Type: application/json" \
  -d '{"topic": "Minecraft", "angle": "Focus on different types or varieties of this topic"}' | jq .
```

## Sample Inputs/Outputs

| Topic | Angle | Generated Prompt |
|-------|-------|------------------|
| School Lunch | comparing | "How does school lunch compare to lunch eaten at home? You might consider the food choices available, the time given to eat, the social atmosphere, and who prepares the meal." |
| Minecraft | types/varieties | "What are the different types of worlds or game modes available in Minecraft? You might explore survival mode, creative mode, adventure mode, or the various biomes and dimensions players can encounter." |
| Pizza Toppings | why enjoyable | "What makes pizza toppings such a popular topic of conversation and debate? You might consider the variety of flavors, personal preferences, regional differences, or the fun of creating custom combinations." |
| Fortnite | why enjoyable | "Why do so many people enjoy playing Fortnite? You might consider the game's building features, the excitement of competing with others, or the fun of playing with friends online." |

## Files

| File | Purpose |
|------|---------|
| `lib/services/ranked-prompts.ts` | Topic/angle selection, prompt orchestration |
| `app/fantasy/api/daily-prompt/route.ts` | AI prompt generation endpoint |
