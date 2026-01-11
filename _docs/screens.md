# MVP Screens & Components

This document defines the screens, components, and modals for the Writing Arena MVP.

---

## Overview

| Type | Count | Description |
|------|-------|-------------|
| **Screens** | 5 | Distinct pages/routes |
| **Components** | 5 | Parts of Game Screen that change based on state |
| **Modals** | 2 | Overlays that appear on top of screens |

---

## Screens (Routes/Pages)

### 1. Home Screen
Entry point to the game.

| Element | Description |
|---------|-------------|
| **Continue Quest** button | Go to Quest Selection (saved quests) |
| **New Quest** button | Go to Quest Selection (available quests) |
| **Play with Friends** button | Opens party options (Create/Join) |

**Party Options (sub-menu or inline)**:
| Element | Description |
|---------|-------------|
| **Create Party** | Generate party code, go to Lobby |
| **Join Party** | Enter party code, go to Lobby |

**Route**: `/`

**MVP Note**: Multiplayer sessions are ephemeral (no save/continue for party quests). In future versions, Continue/New could show multiplayer saves too.

---

### 2. Quest Selection Screen
Choose which quest to play (continue saved or start new).

| Element | Description |
|---------|-------------|
| **Quest list** | Cards showing available quests |
| **Quest card** | Title, description, thumbnail, progress (if continuing) |
| **Back** button | Return to Home |

**Mode: Continue**
- Shows quests you've already started
- Each card shows progress (e.g., "Checkpoint 3/5")
- Select to resume → Game Screen

**Mode: New Quest**
- Shows available quest templates
- MVP: "Dragon's Lair" (existing) + "The Shattered Kingdom" (new)
- Select to start fresh → Game Screen

**Route**: `/quests?mode=continue` or `/quests?mode=new`

---

### 3. Lobby Screen (Multiplayer)
Create or join a party before starting a quest.

| Element | Description |
|---------|-------------|
| **Party code** | Shareable code for friends to join |
| **Party member list** | Shows who's in the party (2-4 players) |
| **Ready status** | Each player marks ready |
| **Start Quest** button | Host starts when all ready |
| **Leave Party** button | Exit the lobby |

**Route**: `/lobby/[partyId]`

---

### 4. Game Screen
The main gameplay screen. Components appear/disappear based on game state.

| Element | Description |
|---------|-------------|
| **Story Component** | Current narrative (always visible) |
| **Writing Component** | Text input for player action (visible on your turn) |
| **Consequence Component** | Outcome + feedback (visible after submission) |
| **HP Bar** | Player's current HP (always visible) |
| **Party Status** | Who's in party, whose turn, who's dead (always visible in multiplayer) |

**Route**: `/game/[sessionId]`

**States**:
- `story` — Reading narrative, waiting for prompt
- `writing` — Your turn to write
- `waiting` — Another player's turn (input disabled)
- `consequence` — Viewing outcome and feedback
- `boss_gate` — Paragraph challenge (special writing state)
- `spectating` — You're dead, watching others

---

### 5. Victory Screen
Quest complete! Show stats and allow sharing.

| Element | Description |
|---------|-------------|
| **Quest complete message** | Celebratory narrative |
| **Stats summary** | XP earned, writing score, words written, errors avoided |
| **Share button** | Screenshot/share to social |
| **Play Again** button | Return to home or start new quest |

**Route**: `/victory/[sessionId]`

---

## Components (Game Screen)

### Story Component
Displays the AI-generated narrative.

| Element | Description |
|---------|-------------|
| **Narrative text** | 2-3 sentences, 2nd person present tense |
| **Scene illustration** | (Optional for MVP) Visual of current scene |
| **Scroll history** | Previous story beats visible above |

**Visible**: Always (in Game Screen)

---

### Writing Component
Text input for player actions.

| Element | Description |
|---------|-------------|
| **Prompt** | "What do you do?" or boss gate instruction |
| **Text input** | Free text area |
| **Word count** | Current count + minimum required |
| **Submit button** | Send action for grading |

**States**:
- `enabled` — Your turn, can write and submit
- `disabled` — Not your turn, input grayed out
- `boss_gate` — Longer input, dual-format prompt (narrative + human instruction)

**Visible**: Always visible, but state determines interactivity

---

### Consequence Component
Shows outcome after submission.

| Element | Description |
|---------|-------------|
| **Outcome narrative** | AI describes what happened (success/partial/failure) |
| **HP change animation** | +heal (green) or -damage (red) |
| **Writing feedback panel** | Score + top 2-3 errors with explanations |
| **Continue button** | Proceed to next turn/story beat |

**Visible**: After player submits, before next story beat

---

### HP Bar Component
Visual representation of player health.

| Element | Description |
|---------|-------------|
| **HP value** | 0-100 |
| **Visual bar** | Fills/depletes with animation |
| **Damage/heal indicators** | Flash on change |

**Visible**: Always (in Game Screen)

---

### Party Status Component
Shows multiplayer state.

| Element | Description |
|---------|-------------|
| **Player list** | Names/avatars of party members |
| **Turn indicator** | Highlight whose turn it is |
| **HP bars** | Mini HP bars for each player |
| **Status icons** | Dead (skull), writing (pencil), waiting (clock) |

**Visible**: Always in multiplayer, hidden in solo

---

## Modals (Overlays)

### Death Modal
Appears when a player's HP hits 0.

| Element | Description |
|---------|-------------|
| **"You have fallen!"** | Dramatic death message |
| **What went wrong** | Feedback on the fatal error(s) |
| **Watch Party** button | Enter spectator mode |

**Trigger**: Player HP reaches 0
**Dismisses**: Player clicks "Watch Party"

---

### Checkpoint Modal
Appears when party respawns at checkpoint.

| Element | Description |
|---------|-------------|
| **"Returning to checkpoint..."** | Brief message |
| **Checkpoint location** | Where in the story you're returning to |
| **Continue** button | Resume play |

**Trigger**: Party wipe or all dead players wait for checkpoint
**Dismisses**: Automatically after brief delay or player clicks Continue

---

## Screen Flow Diagram

```
┌─────────────────────────────────┐
│           Home Screen           │
│                                 │
│  [Continue Quest] ──▶ Quest Selection (saves) ──┐
│  [New Quest] ───────▶ Quest Selection (new) ────┼──▶ Game Screen ──▶ Victory
│  [Play with Friends]                            │
│       ├── Create Party ──▶ Lobby ───────────────┘
│       └── Join Party ────▶ Lobby
└─────────────────────────────────┘
                                  │  ┌─────────────────────────────┐ │
                                  │  │ Story Component (always)    │ │
                                  │  ├─────────────────────────────┤ │
                                  │  │ Writing Component           │ │
                                  │  │ (enabled/disabled/boss_gate)│ │
                                  │  ├─────────────────────────────┤ │
                                  │  │ Consequence Component       │ │
                                  │  │ (shown after submit)        │ │
                                  │  ├─────────────────────────────┤ │
                                  │  │ HP Bar (always)             │ │
                                  │  │ Party Status (multiplayer)  │ │
                                  │  └─────────────────────────────┘ │
                                  │                                  │
                                  │  ┌─ Modals ───────────────────┐  │
                                  │  │ • Death Modal              │  │
                                  │  │ • Checkpoint Modal         │  │
                                  │  └────────────────────────────┘  │
                                  └──────────────────────────────────┘
```

---

## MVP Checklist

### Screens
- [ ] Home Screen
- [ ] Quest Selection Screen
- [ ] Lobby Screen
- [ ] Game Screen
- [ ] Victory Screen

### Components
- [ ] Story Component
- [ ] Writing Component (with boss_gate state)
- [ ] Consequence Component
- [ ] HP Bar Component
- [ ] Party Status Component

### Modals
- [ ] Death Modal
- [ ] Checkpoint Modal

---

## Notes

- **Solo play**: Skip Lobby, go directly Home → Game → Victory
- **Party Status** hidden in solo mode
- **Boss Gate** is a state of Writing Component, not a separate screen
- **Waiting for other players** = Writing Component in `disabled` state

---

**Last Updated**: January 2026
