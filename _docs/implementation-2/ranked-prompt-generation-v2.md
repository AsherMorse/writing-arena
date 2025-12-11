# Ranked Prompt Generation v2

## Overview

Students personalize their writing prompt by choosing a specific topic from AI-generated options (or typing their own). This increases engagement while maintaining fair comparison—everyone writes about the same broad topic, graded on the same rubric.

## Key Changes from v1

| v1 (Current) | v2 (Proposed) |
|--------------|---------------|
| System picks topic + angle, generates prompt | System picks topic + angle, student picks specific subject |
| Everyone gets exact same prompt | Everyone gets same topic category, different specific prompts |
| Generic: "Why do people enjoy video games?" | Personal: "Why is Hollow Knight underrated?" |
| One API call | Two API calls (options → prompt) |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      📅 TODAY'S CHALLENGE                           │
│                                                                     │
│   System picks: Topic = "Food", Angle = "benefits"                 │
│                                                                     │
│   [START]                                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     🎯 SELECTION PHASE                              │
│                                                                     │
│   "What food should everyone try at least once?"                   │
│                                                                     │
│   [Sushi] [Tacos] [Ramen] [Pho] [Dumplings] [BBQ]                  │
│                                                                     │
│   ┌──────────────────────────────────┐ ┌────┐                      │
│   │ Or type your own...              │ │ GO │                      │
│   └──────────────────────────────────┘ └────┘                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                         Student picks "Birria tacos"
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ✍️ WRITING PHASE                               │
│                                                                     │
│   YOUR PROMPT:                                                      │
│   "Why should everyone try birria tacos at least once? You might   │
│   discuss the rich flavors, the consommé for dipping, or what      │
│   makes them different from regular tacos."                        │
│                                                                     │
│   [Student writes...]                               ⏱️ 2:00        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       📊 RESULTS & LEADERBOARD                      │
│                                                                     │
│   🏆 TODAY'S LEADERBOARD (Topic: Food)                             │
│                                                                     │
│   1. @maya_writes (Sushi) ........... 92 pts                       │
│   2. @carlos99 (Birria tacos) ....... 85 pts                       │
│   3. You (Birria tacos) ............. 78 pts                       │
│                                                                     │
│   Same rubric, different picks → fair comparison ✓                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Angle → Question Mapping

The angle determines how we ask the student to pick:

| Angle | Selection Question |
|-------|-------------------|
| What makes it unique/special | "What [X] stands out from the rest?" |
| How it connects to people | "What [X] means something to you?" |
| Comparing to something similar | "Pick two [X]s to compare" |
| Why people find it enjoyable | "What [X] is underrated?" / "What [X] do people love?" |
| How it works/functions | "What [X] would you explain to someone?" |
| Benefits/positive aspects | "What [X] should everyone try?" |
| Different types/varieties | "What type of [X] is your style?" |
| For a newcomer | "What [X] would you recommend to a beginner?" |

---

## API Design

### Step 1: Get Selection Options

**POST** `/fantasy/api/daily-prompt/options`

**Request:**
```json
{
  "topic": "Video Games",
  "angle": "Focus on why people find this topic interesting or enjoyable"
}
```

**Response:**
```json
{
  "topic": "Video Games",
  "angle": "Focus on why people find this topic interesting or enjoyable",
  "question": "What game do people love that you think is underrated?",
  "options": ["Minecraft", "Fortnite", "Zelda", "Stardew Valley", "Rocket League", "Terraria"]
}
```

### Step 2: Generate Personalized Prompt

**POST** `/fantasy/api/daily-prompt`

**Request:**
```json
{
  "topic": "Video Games",
  "angle": "Focus on why people find this topic interesting or enjoyable",
  "question": "What game do people love that you think is underrated?",
  "selection": "Hollow Knight"
}
```

**Response (valid):**
```json
{
  "valid": true,
  "promptText": "Why do you think Hollow Knight deserves more attention than it gets? You might discuss its art style, difficulty, world design, or what makes it special compared to more popular games."
}
```

**Response (invalid input):**
```json
{
  "valid": false,
  "reason": "Let's pick something real! What's a game you actually like?"
}
```

---

## Input Validation

### Layer 1: Client-Side Quick Filter

Catch obvious profanity before hitting the API:

```typescript
const BLOCKED_PATTERNS = [
  /\b(fuck|shit|ass|bitch|sex|porn|kill|murder|gun|drug)\b/i,
];

function isObviouslyInappropriate(input: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(input));
}
```

### Layer 2: AI Validation

The prompt generation API validates input and returns structured response:

```
FIRST, evaluate if their input is valid:
- Is it appropriate for grades 6-8? (no violence, profanity, adult content)
- Is it related to the topic category?
- Is it specific enough? (not just "stuff" or "idk")

If INVALID → { "valid": false, "reason": "friendly message" }
If VALID → { "valid": true, "promptText": "..." }
```

### Validation Examples

| Input | Result | Response |
|-------|--------|----------|
| `"your mom"` | ❌ Invalid | "Let's pick something real! What's a [topic] you actually like?" |
| `"asdfghjkl"` | ❌ Invalid | "Hmm, I didn't catch that. Try typing a specific [topic]." |
| `"stuff"` | ❌ Invalid | "Can you be more specific? What [topic] comes to mind?" |
| `"drugs"` | ❌ Invalid | "Let's pick something else! What's a [topic] you enjoy?" |
| `"water"` | ✅ Valid | Generates prompt (borderline but acceptable) |
| `"my grandma's recipe"` | ✅ Valid | Generates prompt (personal, great!) |
| `"a game nobody knows"` | ✅ Valid | Generates prompt (vague but workable) |

**Principle:** Be lenient. Only reject clearly inappropriate or nonsensical input.

---

## System Prompts

### Options Generation Prompt

```
You are helping students pick what to write about. Given a broad topic and an angle, generate:

1. A selection question that fits the angle
2. 6 specific options students can choose from

Rules:
- The question should feel natural for the angle (see mappings)
- Options should be specific, recognizable to grades 6-8
- Options should vary (popular + niche + different categories)
- Keep options 1-3 words each
- For "comparing" angle, options should be pairs like "Pizza vs Tacos"

Return JSON:
{
  "question": "...",
  "options": ["...", "...", "...", "...", "...", "..."]
}
```

### Prompt Generation (with Validation)

```
You are a writing prompt generator for a middle school writing app.

A student was asked: "[question]"
They typed: "[selection]"
Topic category: [topic]

FIRST, evaluate if their input is valid:
- Is it appropriate for grades 6-8?
- Is it related to the topic category?
- Is it specific enough to write about?

If INVALID: { "valid": false, "reason": "friendly explanation" }
If VALID: { "valid": true, "promptText": "two-sentence prompt" }

Prompt rules (if valid):
- First sentence: Question that sets up expository writing, referencing their selection
- Second sentence: Gentle suggestions using "You might..." phrasing
- Keep it appropriate for grades 6-8
- AVOID commands like "Write about", "Describe", "Explain"

Be lenient - if borderline, accept it. Only reject if clearly inappropriate or nonsensical.

Return ONLY valid JSON.
```

---

## Special Case: Compare Angle

When the angle is "comparing", the selection phase asks for TWO items:

```
┌─────────────────────────────────────────────────────────────────────┐
│   "Pick two games to compare"                                       │
│                                                                     │
│   [Fortnite vs Apex] [Minecraft vs Terraria] [Mario Kart vs        │
│   Rocket League] [Zelda vs Elden Ring]                             │
│                                                                     │
│   ┌────────────────────────────────────────┐ ┌────┐                │
│   │ Or type your own: Roblox vs Minecraft  │ │ GO │                │
│   └────────────────────────────────────────┘ └────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

**Generated prompt:**
> "How are Roblox and Minecraft similar and different? You might compare what you can build, how you play with friends, or what kind of players each game attracts."

---

## Why This Works

### Fair Comparison
- Everyone writes about same broad topic (e.g., "Food")
- Graded on same rubric (writing skills, not content knowledge)
- Your "Birria tacos" paragraph vs their "Sushi" paragraph = fair

### Personal Investment
- Kids write better about things they care about
- Custom input = inclusivity (write about YOUR thing)
- More engaging than generic prompts

### Variety
- Different angles = different questions each day
- Not always "what's your favorite X"
- Compare angle teaches different skill (contrast/comparison)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `app/fantasy/api/daily-prompt/options/route.ts` | **Create** - Options generation endpoint |
| `app/fantasy/api/daily-prompt/route.ts` | **Modify** - Add selection + validation flow |
| `lib/services/ranked-prompts.ts` | **Modify** - Add helper functions |
| `lib/types/index.ts` | **Modify** - Add new types |
| `app/fantasy/ranked/page.tsx` | **Modify** - Add selection phase UI |

---

## Sample Outputs (Paragraphs)

| Topic | Angle | Question | Selection | Generated Prompt |
|-------|-------|----------|-----------|------------------|
| Food | benefits | "What food should everyone try?" | Birria tacos | "Why should everyone try birria tacos at least once? You might discuss the rich flavors, the consommé for dipping, or what makes them different from regular tacos." |
| Video Games | underrated | "What game is underrated?" | Hollow Knight | "Why do you think Hollow Knight deserves more attention? You might discuss its art style, difficulty, or what makes it special compared to popular games." |
| Music | for newcomer | "What artist would you recommend to someone just getting into music?" | Tyler, the Creator | "What should someone know about Tyler, the Creator if they've never heard his music? You might discuss his style, how his sound has changed, or what albums to start with." |
| Sports | comparing | "Pick two sports to compare" | Basketball vs Soccer | "How are basketball and soccer similar and different? You might compare the rules, teamwork involved, or what makes each exciting to watch." |

---

# Essay Mode Extension

## Overview

Essay prompts require a fundamentally different approach than paragraph prompts. While paragraphs can explain a single idea, essays need **tension** or **multiple dimensions** to naturally create body paragraphs with distinct points.

| Paragraph Prompt | Essay Prompt |
|------------------|--------------|
| Explain ONE thing | Analyze MULTIPLE angles |
| "You might..." suggestions | "Consider..." for each body paragraph |
| 2 sentences | 3 sentences (question + 2 guiding prompts) |
| Casual topics work fine | Topics need debate/complexity |

---

## What Makes a Good Essay Prompt?

**Bad essay prompts** are just longer paragraph prompts:
> "Explain why reading is important. You might discuss vocabulary, imagination, and knowledge."

**Good essay prompts** have tension or multiple facets:
> "Is reading books actually better than watching documentaries, or can both teach equally well? Consider what each format does best for learning. Think about how engagement, retention, and accessibility differ between them."

**Key insight:** The prompt should make students want to take a position or explore trade-offs.

---

## Essay Topics

Essay topics need debate potential or multiple dimensions. The casual paragraph topics (Pizza, TikTok) don't work as well.

```typescript
const ESSAY_TOPICS = [
  // Debates students care about
  'Screen Time', 'Homework', 'School Start Times', 'Dress Codes',
  'Social Media Age Limits', 'Video Game Violence', 'Phone Rules',
  'Standardized Tests', 'Group Projects', 'Online Learning',
  
  // Multi-dimensional topics
  'Friendship', 'Competition vs Cooperation', 'Taking Risks',
  'Learning from Failure', 'Following Rules vs Questioning Them',
  'Privacy Online', 'Fame and Influence', 'Fitting In vs Standing Out',
  
  // Compare/contrast friendly  
  'Online vs In-Person Friendships', 'Books vs Movies',
  'Solo vs Team Activities', 'City vs Small Town Life',
  'Texting vs Face-to-Face', 'Streaming vs Movie Theaters',
];
```

---

## Essay Angles

Essay angles guide toward multi-paragraph structure:

```typescript
const ESSAY_ANGLES = [
  'Argue for or against, considering multiple perspectives.',
  'Compare and contrast two approaches.',
  'Explore causes and effects.',
  'Discuss benefits and drawbacks.',
  'Explain why this matters and what should change.',
  'Analyze how this affects different groups differently.',
  'Present both sides and take a position.',
  'Explain how this has changed and why it matters now.',
];
```

---

## Essay Angle → Question Mapping

| Angle | Selection Question |
|-------|-------------------|
| Argue for or against | "What [X] would you defend or argue against?" |
| Compare and contrast | "Pick two [X]s to compare" |
| Causes and effects | "What [X] has the biggest impact on your life?" |
| Benefits and drawbacks | "What [X] do you disagree with most?" |
| Why it matters | "What [X] should more people care about?" |
| Different groups | "What [X] affects teens differently than adults?" |
| Both sides | "What [X] debate would you want to settle?" |
| How it's changed | "What [X] has changed the most in recent years?" |

---

## Essay Prompt Format

Essays use a 3-sentence format with explicit structure hints:

```
[Opening question that invites analysis/argument]
Consider [angle for body paragraph 1].
Think about [angle for body paragraph 2].
```

**Example:**
> Is screen time actually harmful, or does it depend on how you use it? Consider the difference between mindless scrolling and using screens to create or learn. Think about how screens might affect sleep, focus, and real-world friendships differently.

This format:
- Opens with a debatable question (thesis invitation)
- First "Consider..." → Body paragraph 1 angle
- Second "Think about..." → Body paragraph 2 angle

---

## Essay Selection Flow (v2)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      📅 TODAY'S ESSAY CHALLENGE                     │
│                                                                     │
│   System picks: Topic = "Screen Time", Angle = "benefits/drawbacks"│
│                                                                     │
│   [START]                                                           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     🎯 SELECTION PHASE                              │
│                                                                     │
│   "What screen activity would you defend to your parents?"         │
│                                                                     │
│   [Gaming] [YouTube] [TikTok] [Texting] [Making Videos] [Streaming]│
│                                                                     │
│   ┌──────────────────────────────────┐ ┌────┐                      │
│   │ Or type your own...              │ │ GO │                      │
│   └──────────────────────────────────┘ └────┘                      │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                        Student picks "Gaming"
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ✍️ WRITING PHASE                               │
│                                                                     │
│   YOUR PROMPT:                                                      │
│   "Is gaming actually a waste of time, or does it offer real       │
│   benefits that adults overlook? Consider what skills games teach  │
│   that you can't learn elsewhere. Think about how gaming affects   │
│   your mood, focus, and social connections."                       │
│                                                                     │
│   [Student writes essay...]                        ⏱️ 15:00        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Essay System Prompt

```
You are a writing prompt generator for middle school essays (grades 6-8).

Create a prompt that guides students to write a 4-5 paragraph essay with:
- A clear thesis statement  
- 2-3 body paragraphs with distinct points
- Introduction and conclusion

PROMPT FORMAT:
1. Opening question that invites analysis or argument (1 sentence)
2. Guiding prompts using "Consider..." and "Think about..." to hint at body paragraph angles (2 sentences)

RULES:
- Make it DEBATABLE or MULTI-FACETED (not just "explain X")
- Each guiding sentence should suggest a DISTINCT angle for a body paragraph
- Topics should feel relevant to middle schoolers' lives
- Avoid requiring specialized knowledge
- Don't use imperative commands ("Write about...", "Explain...")

GOOD EXAMPLES:

Topic: Screen Time | Angle: benefits and drawbacks
Selection: Gaming
Output: Is gaming actually a waste of time, or does it offer real benefits that adults overlook? Consider what skills games teach that you can't learn elsewhere. Think about how gaming affects your mood, focus, and social connections—both positively and negatively.

Topic: Homework | Angle: argue for or against
Selection: Math homework
Output: Should math homework be reduced, or is daily practice essential for learning? Consider what homework actually helps you understand versus what feels repetitive. Think about how homework affects students differently based on their schedule and learning style.

Topic: Online vs In-Person | Angle: compare and contrast
Selection: Online friendships
Output: Can online friends be just as meaningful as friends you see every day? Consider what kinds of support and connection each type of friendship offers. Think about the role of shared experiences, trust, and communication in both.

Return ONLY the prompt (3 sentences), nothing else.
```

---

## Essay Options Generation Prompt

```
You are helping students pick what to write an essay about. Given a broad topic and an angle, generate:

1. A selection question that fits the angle and invites debate
2. 6 specific options students can choose from

Rules:
- The question should feel like it's asking for something worth defending or analyzing
- Options should be specific and recognizable to grades 6-8
- Options should represent different perspectives or examples within the topic
- Keep options 1-3 words each
- For "compare" angles, options should be pairs like "Online vs In-Person"

Return JSON:
{
  "question": "...",
  "options": ["...", "...", "...", "...", "...", "..."]
}
```

---

## Sample Essay Outputs

| Topic | Angle | Question | Selection | Generated Prompt |
|-------|-------|----------|-----------|------------------|
| Screen Time | benefits/drawbacks | "What screen activity would you defend?" | Gaming | "Is gaming actually a waste of time, or does it offer real benefits? Consider what skills games teach. Think about how gaming affects mood, focus, and friendships." |
| Homework | argue for/against | "What type of homework would you change?" | Math homework | "Should math homework be reduced, or is daily practice essential? Consider what helps understanding vs. feels repetitive. Think about how it affects different students." |
| Friendship | compare/contrast | "Pick two types of friendships to compare" | Online vs In-Person | "Can online friends be just as meaningful as in-person friends? Consider what support each offers. Think about shared experiences and trust in both." |
| School Rules | why it matters | "What school rule should more people question?" | Dress codes | "Do dress codes actually help schools, or do they cause more problems than they solve? Consider how they affect self-expression. Think about whether they improve focus or create conflict." |
| Social Media | different groups | "What platform affects students differently than adults?" | TikTok | "Does TikTok affect teenagers differently than it affects adults? Consider how the algorithm shapes what each group sees. Think about how attention spans and social comparison differ by age." |

---

## Implementation Changes for Essays

### `ranked-prompts.ts`

```typescript
// Add essay-specific constants
const ESSAY_TOPICS = [...];
const ESSAY_ANGLES = [...];

// Modify helpers to accept level
function getTopicForPrompt(dateString: string, promptIndex: number, level: 'paragraph' | 'essay'): string {
  const topics = level === 'essay' ? ESSAY_TOPICS : RANKED_TOPICS;
  // ... existing logic
}

function getAngleForPrompt(dateString: string, promptIndex: number, level: 'paragraph' | 'essay'): string {
  const angles = level === 'essay' ? ESSAY_ANGLES : ANGLES;
  // ... existing logic
}

// Pass level to API
async function generatePromptAtIndex(...) {
  const topic = getTopicForPrompt(dateString, promptIndex, level);
  const angle = getAngleForPrompt(dateString, promptIndex, level);
  
  const response = await fetch('/fantasy/api/daily-prompt', {
    body: JSON.stringify({ topic, angle, level }), // ← Add level
  });
}
```

### `daily-prompt/route.ts`

```typescript
// Add level parameter
const { topic, angle, selection, question, level = 'paragraph' } = body;

// Use appropriate system prompt
const systemPrompt = level === 'essay' ? ESSAY_SYSTEM_PROMPT : LEGACY_SYSTEM_PROMPT;
```

### `daily-prompt/options/route.ts`

```typescript
// Add level parameter
const { topic, angle, level = 'paragraph' } = body;

// Use appropriate options prompt
const systemPrompt = level === 'essay' ? ESSAY_OPTIONS_PROMPT : OPTIONS_SYSTEM_PROMPT;
```

---

## Files to Modify (Essay Support)

| File | Action |
|------|--------|
| `lib/services/ranked-prompts.ts` | Add `ESSAY_TOPICS`, `ESSAY_ANGLES`, modify helpers |
| `app/fantasy/api/daily-prompt/route.ts` | Add `level` param, `ESSAY_SYSTEM_PROMPT` |
| `app/fantasy/api/daily-prompt/options/route.ts` | Add `level` param, essay options prompt |
| `lib/types/index.ts` | Ensure `level` type includes 'essay' |
| `app/fantasy/ranked/page.tsx` | Handle essay mode timing, UI differences |
