# Writing Arena: D&D Game — Design Document

## Overview

An AI-powered text adventure game for grades 5-8 where **writing quality determines gameplay success**. Students write actions in first-person, AI grades their writing, and the outcome (success/failure) is determined by writing quality — like a "dice roll" powered by grammar and conventions.

**Core Hypothesis:** If writing instruction feels like play, kids will write more → more reps with feedback → better writers.

---

## Product Roadmap

### MVP ("Playable Proof of Concept")

#### Core Loop
```
Student sees scenario → Writes action (1-3 sentences) → 
AI grades writing → Determines outcome → 
AI narrates consequence → Repeat
```

#### Features

| Category | MVP Scope |
|----------|-----------|
| **Target Grades** | 5-6 initially, expandable to 5-8 |
| **Quests** | 2 options: "Dragon's Lair" (existing) + "The Shattered Kingdom" (new) |
| **Scenarios** | 1 quest line per world with clear objective |
| **Session Length** | 10-20 minutes |
| **Writing Per Session** | 3-5 action prompts |
| **Weekly Challenge** | Longer paragraph challenge once per week |
| **Grading** | Conventions focus: fragments, run-ons, punctuation, basic grammar (CCSS L.5-6.1-2) |
| **Feedback** | Explicit score + narrative consequence shown together |
| **Stakes** | 100 HP bar, checkpoint respawn on death |
| **Paragraph Gates** | 1 per scenario (boss battle = write a full paragraph) |
| **Multiplayer** | Real-time co-op: party of 2-4 tackles quest together |
| **Platform** | Web only |
| **Character** | Pre-made protagonist (no customization) |
| **XP Integration** | Earn XP for completing quests, XP scales with writing quality + completion + word count bonus |

#### Writing Skill Targets (MVP)
- **Sentence completeness** (no fragments)
- **Sentence boundaries** (no run-ons)
- **Punctuation** (periods, commas, capitals, apostrophes)
- **Grammar** (subject-verb agreement, verb tenses, pronouns)
- **Subordinating conjunctions** (because, although, when, if)
- **Style** (wordiness, redundancy, passive voice)

#### MVP Success Criteria
- Students voluntarily play 3+ sessions
- Writing quality measurably improves (pre/post on Alpha Sentences test)
- Students report enjoying the game (3.5+/5 rating)

---

### v1 ("Full Single-Player + Social")

#### New Features

| Category | v1 Additions |
|----------|--------------|
| **Worlds** | 2-3 worlds (fantasy, sci-fi, mystery) |
| **Scenarios** | 3 per world (9 total quest lines) |
| **Writing Modes** | All 3 CCSS modes mapped to NPCs: Persuade (W.X.1), Explain (W.X.2), Describe (W.X.3) |
| **Grading** | Expanded: sentence variety, appositives, transitions, verb tense consistency (CCSS L.5-8) |
| **Vocabulary** | Lexile tracking + "vocabulary bonus" for grade-appropriate words |
| **Paragraph Gates** | 2-3 per scenario, difficulty scaling |
| **Multiplayer** | Enhanced with async co-op features |
| **Social** | Browse & play inside friends' completed stories, create alternate branches at decision points |
| **Character** | Basic customization: name, class (affects narrative flavor, not mechanics) |
| **Save System** | Full progress persistence across sessions |

#### Writing Skill Targets (v1)
Everything from MVP, plus:
- **Sentence variety** (simple, compound, complex)
- **Appositives** (nonrestrictive elements)
- **Transitions** (within and between sentences)
- **Verb tense consistency**
- **Precise vocabulary** (Tier 2 academic words)

#### v1 Success Criteria
- Students play weekly for 4+ weeks
- Transfer demonstrated: sentence skills → paragraph composition (Alpha Paragraphs test)
- Social features drive organic growth (invite friends)

---

### v2 ("Competitive + Deep Customization")

#### New Features

| Category | v2 Additions |
|----------|--------------|
| **Worlds** | User-generated worlds (with moderation) |
| **Scenarios** | Scenario creator for teachers/students |
| **Competitive Mode** | Head-to-head writing duels (persuade the same NPC, better writing wins) |
| **Guilds/Parties** | Persistent groups with shared leaderboards |
| **Character** | Full customization: appearance, backstory, class abilities |
| **Character Progression** | Level up writing skills, unlock narrative abilities |
| **Advanced Grading** | Stylistic elements: voice, word choice, figurative language (L.X.5) |
| **Reading Comp** | Explicit comprehension checks ("What does the wizard want?") |
| **Boss Raids** | Multi-paragraph challenges requiring full party coordination |
| **Teacher Dashboard** | Class progress, skill gaps, assignment integration |

#### Writing Skill Targets (v2)
Everything from v1, plus:
- **Voice and style** (L.8.3)
- **Figurative language recognition** (L.X.5)
- **Multi-paragraph coherence**
- **Argument structure** (claim + evidence + reasoning)

#### v2 Success Criteria
- Organic user-generated content ecosystem
- Measurable impact on standardized tests (STAAR, MAP)
- Teacher adoption in classrooms

---

### Feature Progression Summary

```
MVP                          v1                           v2
─────────────────────────────────────────────────────────────────────
2 quests (DL + SK)      →    3 worlds, 9 scenarios   →    User-generated
Real-time co-op         →    + Async co-op            →    Competitive + co-op
Conventions grading     →    + Writing modes          →    + Style/voice
HP + checkpoints        →    + Vocabulary tracking    →    + Character progression
Pre-made character      →    Basic customization      →    Full customization
Web only                →    Web                      →    Web + Mobile
```

---

## Game Mechanics & UX Decisions

### 1. The Writing Moment

| Question | Decision |
|----------|----------|
| **Free text or scaffolded?** | Free text for MVP. Scaffolding/structured prompts may be added later. |
| **Length guidance?** | Minimum word count required. Guideline: 1-3 sentences per response. |
| **Timer?** | Untimed. Low anxiety environment. |

---

### 2. Grading Visibility

| Question | Decision |
|----------|----------|
| **Transparent or hidden?** | Explicit score shown + narrative consequence. Student sees both. |
| **When is feedback shown?** | Narrative and feedback displayed at the same time, after submission. |

---

### 3. HP & Damage System

| Question | Decision |
|----------|----------|
| **How much HP?** | 100 HP |
| **Damage per error?** | Two damage types: (1) **Gradual damage** from writing errors = severity-based HP drain (Critical -4, Major -2, Minor -1, Style -0.5), amplified during high-stakes moments; (2) **Narrative damage** from story failure (jumping off cliff, attacking king) = story-driven HP loss (AI determines contextually, could be instant-death) |
| **Healing?** | Yes. If response meets minimum length AND grades A- or better, player heals **25 HP** (25% of max). |

---

### 4. Checkpoint & Death

| Question | Decision |
|----------|----------|
| **Checkpoint triggers?** | Two triggers: (1) **Every 5 turns** (guaranteed minimum), (2) **AI tags `[CHECKPOINT]`** at natural story beats (entering new area, escaping danger, completing mini-objective). |
| **What triggers AI checkpoint?** | AI decides on the fly based on narrative context. Prompted to checkpoint at "safe moments" — entering new areas, escaping danger, completing conversations, finding shelter. Not during active combat. |
| **HP at respawn?** | Always **70%** (not preserved from checkpoint). Ensures player has fighting chance regardless of state when checkpoint was saved. |
| **What state is saved?** | Messages and story summary. HP is NOT saved — respawn always resets to 70%. |
| **What do you lose on death?** | Progress since last checkpoint only. No XP loss for now. |
| **Respawn UX?** | Modal: "You Died — Returning to last checkpoint..." with Continue button. Player sees "Here's what went wrong" feedback before retry. |

---

### 5. Difficulty Progression

| Question | Decision |
|----------|----------|
| **Within scenario?** | Yes, difficulty increases as scenario progresses. Encounter 5 requires better writing than encounter 1. |
| **Between scenarios?** | No, scenarios are roughly equal difficulty. Player can choose order. |
| **Adaptive difficulty?** | No. Fixed difficulty progression. |

---

### 6. Paragraph Gate (Boss Battle) UX

| Question | Decision |
|----------|----------|
| **Trigger?** | After completing X encounters. Roughly mapped to ~15 minutes of gameplay (happy path). |
| **Prompt framing?** | Dual format: Narrative prompt ("The king awaits your plea...") + Human instruction below ("Write a full paragraph convincing the king...") |
| **Stakes & Attempts?** | Multiple attempts allowed. Checkpoint placed before each paragraph gate. |

---

### 7. Revision Mechanics

| Question | Decision |
|----------|----------|
| **Pre-submit revision?** | No. Submit what you write. |
| **Post-feedback revision?** | No immediate revision. However, if you fail badly enough to die, you respawn at checkpoint and can retry the encounter. |
| **One-shot revision?** | Potentially. Noel's suggestion ("show what you could've had vs what you lost") is worth exploring. |

---

### 8. Session Flow (Moment-to-Moment)

```
┌─────────────────────────────────────────────────────────────┐
│  STORY SCREEN                                               │
│  - AI narrates situation                                    │
│  - Scene image/illustration                                 │
│  - HP bar visible                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PROMPT SCREEN                                              │
│  - "What do you do?"                                        │
│  - Free text input box                                      │
│  - Minimum word count indicator                             │
│  - Submit button                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CONSEQUENCE SCREEN                                         │
│  - AI narrates outcome (success/partial/failure)            │
│  - HP change animation (+heal or -damage)                   │
│  - Writing feedback panel (score + specific errors)         │
│  - "Continue" button                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
            [Repeat → Boss Gate → Scenario End]
```

---

### 9. AI Narrative Control

| Question | Decision |
|----------|----------|
| **Railroaded or open?** | Basically open. Player can choose any approach. However, player will face X encounters before reaching the end regardless of path taken. |
| **"Yes, And" or bounded?** | "Yes, And" approach — AI accepts creative input. Only constraint is minimum length requirement. |
| **Off-topic/inappropriate handling?** | Reject inappropriate content. System detects and blocks, asks player to try again. |

---

### 10. Reading Load

| Question | Decision |
|----------|----------|
| **AI text length?** | Short paragraphs (2-3 sentences per narrative beat). |
| **Lexile control?** | Yes, AI-generated text controlled via prompt to match grade level. |
| **Text-to-speech?** | No (not in MVP). |

---

### 11. Real-Time Co-op (MVP)

| Question | Decision |
|----------|----------|
| **Party size?** | 2-4 players tackle quest together in real-time |
| **How does it work?** | All players see the same scenario and contribute actions/responses |
| **Turn-taking?** | Sequential turns — D&D-style, each player writes in turn |
| **HP system?** | Individual HP bars — each player has own 100 HP |
| **Death mechanic?** | Spectator mode — dead player watches until checkpoint, then all respawn together |

---

### 12. Async Co-op Details (v1)

| Question | Decision |
|----------|----------|
| **What can friends see?** | Full story transcript of your playthrough. |
| **What can friends do?** | Jump in at any decision point and create an alternate branch. Effectively "fork" your story. |

---

### 13. Success & Rewards

| Question | Decision |
|----------|----------|
| **Winning a scenario?** | Summary screen with writing stats, shareable as screenshot. |
| **XP calculation?** | `(words/45) * (quality/100)` — Quality is 0-100, normalized. Example: 90 words at quality 80 = 1.6 XP per prompt. |

---

## World & Scenario Structure

### Approach: Hybrid (D&D structure + AI Dungeon flexibility)

| Element | Design |
|---------|--------|
| **Quests** | MVP: Dragon's Lair + The Shattered Kingdom (2 options) |
| **Scenarios** | 1 quest line per world; 9 total in v1 (3 worlds × 3 each) |
| **Encounters** | Pre-designed writing challenges mapped to specific skills |
| **Branching** | AI-generated variation within guardrails; multiple paths to same destination |

### Why Hybrid?
- **Replayability** — 3 scenarios with branching paths
- **Controlled difficulty** — harder writing requirements as quest advances
- **Natural paragraph gates** — boss battles at end of each scenario
- **AI flexibility** — creative freedom within educational bounds

---

## Technical Notes

### Grading Integration
- Integrates with existing AlphaWrite grader
- XP system compatible with Alpha ecosystem
- Uses LanguageTool categories as basis for error detection

### Content Safety
- Robust content filtering for K-8 audience
- Reject inappropriate input with friendly retry prompt
- AI output filtered before display

### Ending System
- Story endings use tag format: `[END:OUTCOME: Title {message}]`
- OUTCOME must be one of: `DEATH`, `VICTORY`, or `ESCAPE`
- `DEATH` endings set HP to 0 and display "finishing blow" damage in narrative
- HP reaching 0 from accumulated damage also triggers death ending
- Health bar always accurately reflects player state (dead = 0 HP)

### Checkpoint System
- Checkpoints triggered by: `[CHECKPOINT]` tag from AI OR every 5 turns (fallback)
- AI prompted to checkpoint at "safe moments" (new areas, escaping danger, completing objectives)
- Checkpoint saves: messages, storySummary (NOT health)
- On respawn: HP resets to 70%, state restored to checkpoint
- Death → respawn modal with feedback → restore checkpoint → continue playing
- **Status**: ✅ Fully implemented with RespawnModal and CheckpointToast components

### Component Architecture (M1b Complete)
- **Game page refactored** from 779 → 530 lines
- **7 extracted components**: HPBar, StoryDisplay, WritingInput, FeedbackDisplay, RespawnModal, EndingSection, CheckpointToast
- **Shared types** in `lib/types.ts`: Message, GameState, CheckpointState, Ending
- **Quest config** centralized in `lib/quests/config.ts`
- **Clean separation**: Page handles orchestration, components handle presentation

---

## Open Questions / Future Decisions

- [x] ~~Real-time co-op: Turn-taking~~ → Sequential turns
- [x] ~~Real-time co-op: HP system~~ → Individual bars + spectator mode on death
- [x] ~~XP formula~~ → `(words/45) * (quality/100)`
- [x] ~~World theme~~ → "The Shattered Kingdom" (classic fantasy)
- [x] ~~HP healing amount~~ → 25 HP (25% of max)
- [x] ~~Damage scaling~~ → Story-driven, AI determines contextually
- [x] ~~Checkpoint system~~ → Every 5 turns OR AI `[CHECKPOINT]` tag; respawn at 70% HP
- [x] ~~Checkpoint visual representation~~ → CheckpointToast component (3s auto-hide)
- [x] ~~Component architecture~~ → 7 components extracted, shared types/config
- [ ] One-shot revision mechanic details (if implemented)
- [ ] Quest line narrative for The Shattered Kingdom (MVP = 1 quest)
- [ ] HP healing implementation (A- or better = +25 HP)
- [ ] Paragraph gate (boss battle) format and triggers

---

## References

- See [`phases/mvp.md`](./phases/mvp.md) for MVP phase plan with workstreams & milestones
- See [`project-overview.md`](./project-overview.md) for project summary & SPOV
- See [`dnd-brainlift.md`](./dnd-brainlift.md) for full research documentation
