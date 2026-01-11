# MVP Phase: Writing Arena

**Goal**: Playable proof of concept that validates the core hypothesis — students voluntarily play and writing quality measurably improves.

**Target**: Grades 5-8 | 10-20 minute sessions | Web only

**Approach**: Solo first, then multiplayer (Option A)

---

## MVP Scope Summary

| Category | Scope |
|----------|-------|
| **Quests** | 2 quest options: "Dragon's Lair" (existing) + "The Shattered Kingdom" (new) |
| **Sessions** | 10-20 minutes, 3-5 writing prompts per session |
| **Multiplayer** | Real-time co-op: party of 2-4 players |
| **Grading** | Conventions focus (CCSS L.5-6.1-2): fragments, run-ons, punctuation, grammar |
| **Progression** | 100 HP, checkpoints, 1 paragraph gate (boss) per scenario |
| **Save System** | localStorage (survives refresh, not cross-device) |
| **Character** | Pre-made protagonist (no customization) |

---

## Current State (What's Already Built)

### ✅ Working Prototype
- **Story API** (`/api/story`) — Claude integration, streaming, damage/end tag parsing
- **Summarize API** (`/api/summarize`) — Story context compression
- **Grading Logic** — Types, config, utils, 3-layer grader (needs wiring to GrammarGuard)

### ✅ Routing & Screens (M1a Complete)
- **Home Screen** (`/`) — Continue Quest, New Quest, Play with Friends buttons
- **Quest Selection** (`/quests`) — Choose saved or new quest (Dragon's Lair + The Shattered Kingdom)
- **Game Screen** (`/game/[sessionId]`) — Full game loop with localStorage auto-save
- **Victory Screen** (`/victory/[sessionId]`) — Stats summary, XP display, share prompt

### ✅ Components (M1b Complete)
- **Game Components** — HPBar, StoryDisplay, WritingInput, FeedbackDisplay extracted
- **Modals** — RespawnModal, EndingSection, CheckpointToast extracted
- **Shared Types** — Message, GameState, CheckpointState, Ending in `lib/types.ts`
- **Quest Config** — QUEST_CONFIG centralized in `lib/quests/config.ts`

### ✅ Checkpoint System (M1c Complete)
- **Checkpoint Triggers** — Every 5 turns OR AI `[CHECKPOINT]` tag
- **Respawn Modal** — Death feedback with writing errors shown
- **Checkpoint Toast** — Visual indicator when checkpoint is saved
- **HP Reset** — Respawn at 70% HP, state restored to last checkpoint

### ❌ Not Yet Built
- Multiplayer (WebSocket, lobby, turns)
- "The Shattered Kingdom" content (placeholder only)
- HP healing logic (A- or better = +25 HP)
- Paragraph gate (boss battle)

---

## Workstreams

### 1. 🎮 Core Game Loop
The fundamental play cycle that everything else supports.

| Task | Status | Notes |
|------|--------|-------|
| Story display (AI narrates scenario) | ✅ DONE | Extracted to StoryDisplay component |
| Writing input | ✅ DONE | Extracted to WritingInput component |
| Consequence display | ✅ DONE | Narrative + HP change + feedback in StoryDisplay |
| HP system (100 HP, damage) | ✅ DONE | Working with animations, extracted HPBar component |
| HP healing | ⬜ TODO | A- or better = heal 25 HP (25%) |
| Checkpoint system | ✅ DONE | Every 5 turns OR AI `[CHECKPOINT]` tag. Respawn at 70% HP. |
| Paragraph gate (boss battle) | ⬜ TODO | 1 per scenario, dual prompt format |
| Session flow orchestration | 🔄 PARTIAL | Basic flow works, needs boss gate + HP healing |

### 2. ✍️ Grading System
Integration with AlphaWrite GrammarGuard for real-time writing assessment.

| Task | Status | Notes |
|------|--------|-------|
| Type definitions | ✅ DONE | `dnd-conventions-types.ts` |
| Config | ✅ DONE | `dnd-conventions-config.ts` |
| Grader logic | ✅ DONE | `dnd-conventions-grader.ts` |
| Utils | ✅ DONE | `dnd-conventions-utils.ts` |
| 3-layer grader | ✅ DONE | `dnd-grader.ts` (grammar + quest + narrative) |
| Response parser | ✅ DONE | `layers/response-parser.ts` |
| Pre-validation | ✅ DONE | `layers/pre-validation.ts` |
| Wire to GrammarGuard service | ⬜ TODO | Connect to AlphaWrite API |
| Run & validate tests | ⬜ TODO | Existing test files need running |

### 3. 🤖 AI Narrative Engine
Story generation and response handling.

| Task | Status | Notes |
|------|--------|-------|
| Narrative generation prompt | ✅ DONE | `/api/story/route.ts` — SYSTEM_PROMPT |
| Streaming responses | ✅ DONE | SSE with text/damage/end events |
| Writing score → outcome | ✅ DONE | Score passed to LLM, affects narrative |
| Damage tag parsing | ✅ DONE | `[DAMAGE:X]` extracted and applied |
| End tag parsing | ✅ DONE | `[END: Title {message}]` triggers ending |
| Content safety filtering | 🔄 PARTIAL | Basic blocking exists, needs K-8 hardening |
| Story summarization | ✅ DONE | `/api/summarize` for context compression |
| World/lore consistency | ⬜ TODO | Currently only Dragon's Lair, add The Shattered Kingdom |

### 4. 👥 Real-Time Multiplayer
Party of 2-4 players tackling quests together.

| Task | Status | Notes |
|------|--------|-------|
| WebSocket infrastructure | ⬜ TODO | Real-time sync between players |
| Party creation/joining | ⬜ TODO | Lobby system, invite links |
| Shared game state | ⬜ TODO | All players see same scenario |
| Sequential turn system | ⬜ TODO | D&D-style, each player writes in turn |
| Individual HP bars | ⬜ TODO | Each player has own 100 HP |
| Spectator mode (death) | ⬜ TODO | Dead player watches until checkpoint, all respawn together |
| Player presence | ⬜ TODO | Show who's in party, whose turn, typing indicators |

### 5. 🎨 UI/UX
Screens, components, and modals.

**Screens (5 routes)**
| Task | Status | Notes |
|------|--------|-------|
| Home Screen | ✅ DONE | Continue Quest, New Quest, Play with Friends |
| Quest Selection Screen | ✅ DONE | Choose saved quest or new quest (Dragon's Lair / The Shattered Kingdom) |
| Lobby Screen | ⬜ TODO | Party code, member list, ready status (M3) |
| Game Screen | ✅ DONE | Full game loop at `/game/[sessionId]` with localStorage save |
| Victory Screen | ✅ DONE | Stats summary, XP, share prompt |

**Components (Game Screen)**
| Task | Status | Notes |
|------|--------|-------|
| Story Component | ✅ DONE | StoryDisplay.tsx in components/game |
| Writing Component | ✅ DONE | WritingInput.tsx in components/game |
| Feedback Component | ✅ DONE | FeedbackDisplay.tsx (expandable error list) |
| HP Bar Component | ✅ DONE | HPBar.tsx in components/game |
| Party Status Component | ⬜ TODO | For multiplayer |

**Modals**
| Task | Status | Notes |
|------|--------|-------|
| Respawn Modal | ✅ DONE | RespawnModal.tsx with death feedback and writing errors |
| Ending Section | ✅ DONE | EndingSection.tsx for victory/death outcomes |
| Checkpoint Indicator | ✅ DONE | CheckpointToast.tsx auto-hides after 3s |

### 6. 📖 Content Creation
Quest content for MVP.

**Quest 1: Dragon's Lair (Existing)**
| Task | Status | Notes |
|------|--------|-------|
| World/scenario | ✅ DONE | Thief stealing from dragon's cave |
| Encounters | ✅ DONE | Dynamic via AI |
| Difficulty progression | ✅ DONE | Score-based outcomes |
| Paragraph gate | ⬜ TODO | Boss battle not implemented |

**Quest 2: The Shattered Kingdom (New)**
| Task | Status | Notes |
|------|--------|-------|
| World design | ⬜ TODO | Classic D&D/Tolkien-esque fantasy — lore, factions, locations |
| Quest line | ⬜ TODO | Clear objective, 5+ encounters, 1 boss gate |
| System prompt | ⬜ TODO | SYSTEM_PROMPT for The Shattered Kingdom |
| Encounter skill mapping | ⬜ TODO | Each encounter targets specific writing skills |
| Paragraph gate prompt | ⬜ TODO | Boss battle with dual-format prompt |

### 7. 📊 XP & Progress
Tracking and rewards.

| Task | Status | Notes |
|------|--------|-------|
| XP calculation | ✅ DONE | `(words/45) * (quality/100)` — displayed on Victory screen |
| Session summary screen | ✅ DONE | Victory screen shows avg score, words, turns, XP |
| localStorage save | ✅ DONE | Auto-saves on every state change |
| Continue quest flow | ✅ DONE | Quest Selection loads saves, Game Screen restores state |

---

## Decisions (Resolved)

| Question | Decision | Notes |
|----------|----------|-------|
| **Turn-taking** | Sequential | D&D-style, each player writes in turn |
| **Party HP** | Individual bars | Each player has own 100 HP |
| **Death mechanic** | Spectator mode | Dead player watches until checkpoint, then all respawn |
| **XP formula** | `(words/45) * (quality/100)` | Quality 0-100, normalized to 0-1 for calculation |
| **HP healing** | 25% (25 HP) | A- or better + minimum length triggers heal |
| **Damage scaling** | Story-driven | AI determines contextually, no fixed formula |
| **Save system** | localStorage | Survives refresh, not cross-device (full persistence in v1) |
| **MVP quests** | Dragon's Lair + The Shattered Kingdom | 2 quest options |

---

## Success Criteria

MVP is successful if:

1. **Engagement**: Students voluntarily play 3+ sessions
2. **Learning**: Writing quality measurably improves (pre/post Alpha Sentences test)
3. **Enjoyment**: Students report enjoying the game (3.5+/5 rating)

---

## Explicitly Out of Scope (v1/v2)

❌ Multiple worlds beyond MVP quests (v1)  
❌ Async co-op / story branching (v1)  
❌ Writing modes: Persuade/Explain/Describe (v1)  
❌ Sentence variety, appositives, transitions grading (v1)  
❌ Vocabulary tracking / Lexile bonus (v1)  
❌ Character customization (v1)  
❌ Server-side save system / cross-device persistence (v1)  
❌ Competitive mode / duels (v2)  
❌ User-generated worlds (v2)  
❌ Teacher dashboard (v2)  

---

## Milestones

### M1: Solo Play (Routing & Screens)

**M1a: Routing Structure** ✅ COMPLETE
- [x] Set up Next.js app router structure
- [x] Create route: `/` (Home)
- [x] Create route: `/quests` (Quest Selection)
- [x] Create route: `/game/[sessionId]` (Game)
- [x] Create route: `/victory/[sessionId]` (Victory)

**M1b: Component Extraction** ✅ COMPLETE
- [x] Extract `StoryDisplay` from Game page (includes message rendering)
- [x] Extract `WritingInput` from Game page (textarea + submit)
- [x] Extract `FeedbackDisplay` from Game page (expandable errors)
- [x] Extract `HPBar` from Game page (health visualization)
- [x] Extract `RespawnModal`, `EndingSection`, `CheckpointToast`
- [x] Create shared `lib/types.ts` (Message, GameState, CheckpointState, Ending)
- [x] Create `lib/quests/config.ts` (QUEST_CONFIG, MAX_HEALTH)
- [x] Create `components/game/` folder with barrel export

**M1c: Save & Checkpoint System** ✅ COMPLETE
- [x] localStorage save/load utilities
- [x] Auto-save on state changes
- [x] "Continue Quest" loads from localStorage
- [x] Checkpoint triggers (every 5 turns OR AI `[CHECKPOINT]` tag)
- [x] Death → respawn at checkpoint with 70% HP
- [x] `[CHECKPOINT]` parsing in story API
- [x] Respawn Modal with death feedback
- [x] Checkpoint saved toast indicator

**M1d: Polish Solo Flow** 🔄 PARTIAL
- [x] Home Screen UI (Continue/New/Friends buttons)
- [x] Quest Selection UI (Dragon's Lair + The Shattered Kingdom cards)
- [x] Victory Screen UI (stats, XP, share prompt)
- [ ] HP healing logic (A- or better = +25 HP)
- [ ] Paragraph gate (boss battle) implementation

### M2: Content Complete

- [ ] The Shattered Kingdom world design (lore, factions, locations)
- [ ] The Shattered Kingdom SYSTEM_PROMPT
- [ ] Paragraph gate (boss battle) for Dragon's Lair
- [ ] Paragraph gate (boss battle) for The Shattered Kingdom
- [ ] XP calculation implementation

### M3: Multiplayer Foundation

- [ ] WebSocket infrastructure (Socket.io or similar)
- [ ] Party creation (generate code)
- [ ] Party joining (enter code)
- [ ] Lobby Screen UI
- [ ] Shared game state sync
- [ ] Sequential turn system
- [ ] Individual HP bars
- [ ] Spectator mode on death
- [ ] Party Status Component

### M4: Polish & Test

- [ ] Content safety hardened for K-8
- [ ] Wire grading to GrammarGuard service
- [ ] Run grading tests
- [ ] UI polish pass
- [ ] Performance validation
- [ ] Ready for pilot

---

## References

- [`game-design-doc.md`](../game-design-doc.md) — Full design decisions
- [`project-overview.md`](../project-overview.md) — Project context & SPOV
- [`dnd-conventions-grader-plan-v1.md`](../dnd-conventions-grader-plan-v1.md) — Grading implementation
- [`dnd-brainlift.md`](../dnd-brainlift.md) — Research foundation

---

**Last Updated**: January 2026
