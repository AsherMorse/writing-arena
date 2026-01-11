# Multiplayer Design Document

**Purpose**: Resolve all design decisions needed before implementing real-time co-op multiplayer.

**Target**: 2-4 players, sequential turns, shared quest, individual HP.

---

## 1. Infrastructure

### Q1.1: WebSocket Technology Choice

Which WebSocket infrastructure should we use?

| Option | Pros | Cons |
|--------|------|------|
| **Partykit** | Serverless-friendly, Cloudflare edge, easy setup, rooms built-in | Newer, smaller ecosystem |
| **Socket.IO on Fly.io/Railway** | Battle-tested, maximum control, huge ecosystem | Separate server to deploy/maintain |
| **Pusher/Ably** | Fully managed, scales automatically, presence built-in | Cost at scale, vendor lock-in |
| **Liveblocks** | React-native bindings, real-time presence | Pricier, may be overkill |

**Decision**: partykit

**Notes**: 
```
want maximum ease for now
```

---

### Q1.2: State Authority Model

Where does the authoritative game state live?

- [ ] **A) Host client** — One player's browser is "host", others sync to it
  - Simpler to implement
  - Fragile if host disconnects
  - Easier to cheat
  
- [x] **B) Server-authoritative** — Server owns all game state, clients are "dumb terminals"
  - Required for fair grading (server already grades writing)
  - More robust
  - More complex to implement

**Decision**: B

**Notes**:
```
I think we will need to make this change to server owning game state later anyways, even if the change is difficult
```

---

## 2. Party/Lobby System

### Q2.1: Party Code Format

What format should party codes use?

- [ ] **A) 4-letter code** (e.g., `ABCD`) — 456,976 combinations
- [x] **B) 6-letter code** (e.g., `ABCDEF`) — 308M combinations  
- [ ] **C) 4-digit numeric** (e.g., `1234`) — 10,000 combinations
- [ ] **D) Word-based** (e.g., `happy-tiger-42`) — Memorable but longer

**Decision**: 6 letter

---

### Q2.2: Party Size Limits

| Question | Answer |
|----------|--------|
| Minimum players to start? | `2` (1? 2?) |
| Maximum party size? | `4` (4 per MVP doc) |
| Can solo player use multiplayer flow? | `no` (yes/no) |

---

### Q2.3: Party Ownership

- [ ] **A) First player is owner** — Owner can kick, start game
- [ ] **B) No owner** — Anyone can start when ready, no kick
- [x] **C) Votekick** — Majority vote to remove player

**Decision**: Votekick (no single owner)

---

### Q2.4: Mid-Game Joining

Can players join after the game has started?

- [ ] **A) No** — Party locks at game start
- [ ] **B) Yes, with restrictions** — Can join but start at current checkpoint with 70% HP
- [x] **C) Yes, freely** — Drop in anytime

**Decision**: Yes, freely drop in

---

### Q2.5: Player Disconnect Handling

What happens when a player disconnects?

| Scenario | Behavior |
|----------|----------|
| Disconnect in lobby | `removed unless rejoin` |
| Disconnect during game (not their turn) | `keep slot` |
| Disconnect during their turn | `skip turn` |
| Reconnect attempt | `yes, can rejoin same game` |
| Grace period before kicked? | `10` seconds |

---

## 3. Turn System

### Q3.1: Turn Order

How is turn order determined?

- [ ] **A) Join order** — First to join goes first
- [x] **B) Random at game start** — Shuffled once
- [ ] **C) Random each round** — Re-shuffled after everyone goes
- [ ] **D) Player choice** — Players can volunteer/pass

**Decision**: Random at game start

---

### Q3.2: Turn Timer

Is there a time limit per turn?

- [ ] **A) No timer** — Untimed (matches "low anxiety" in design doc)
- [ ] **B) Soft timer** — Warning at X seconds, no auto-action
- [x] **C) Hard timer** — Auto-skip or auto-submit at X seconds

**Decision**: 90-second hard timer, auto-submit

If timed:
- Timer duration: `90` seconds
- What happens when timer expires: `auto-submit`

---

### Q3.3: Turn Visibility

What can other players see during someone's turn?

- [ ] **A) Nothing** — Just "Player X is writing..."
- [ ] **B) Typing indicator** — Can see they're typing, not content
- [x] **C) Live preview** — Can see what they're writing in real-time
- [ ] **D) Word count only** — Can see how much they've written

**Decision**: live preview

---

### Q3.4: Passing/Skipping

Can a player voluntarily skip their turn?

- [x] **A) No** — Must write something
- [ ] **B) Yes, but costs HP** — Skip = take damage
- [ ] **C) Yes, freely** — No penalty
- [ ] **D) Limited skips** — X skips per game

**Decision**: No skipping allowed

---

## 4. HP & Death

### Q4.1: HP Independence

Each player has individual 100 HP. Confirm:

- [x] Player A's bad writing only damages Player A
- [x] Player A's good writing only heals Player A
- [x] Narrative damage (story events) affects... `everyone if it hurts the party, depends on narrative consequences`

**Decision**: Writing errors = individual damage/healing. Narrative consequences = contextual (AI decides who gets hurt).

---

### Q4.2: Death & Spectator Mode

When a player dies (HP reaches 0):

| Question | Answer |
|----------|--------|
| Can they still see the game? | `yes` (yes = spectator mode) |
| Can they chat/react? | `not rn` |
| Do they skip turns automatically? | `yes` |
| Can living players see dead player's status? | `yes` |

---

### Q4.3: Party Wipe

What happens if ALL players die?

- [ ] **A) Immediate respawn** — Everyone respawns at checkpoint
- [ ] **B) Game over** — If no checkpoint, permanent death for all
- [x] **C) Prompt to continue** — "Your party has fallen. Respawn at checkpoint?"

**Decision**: Prompt to continue at checkpoint

---

### Q4.4: Checkpoint Behavior (Multiplayer)

The solo game checkpoints every 5 turns OR on AI `[CHECKPOINT]` tag.

For multiplayer:

| Question | Answer |
|----------|--------|
| Is checkpoint shared (one for whole party)? | `yes` |
| Does checkpoint save everyone's HP? | `just give 70%` (or always 70%?) |
| Who sees the checkpoint toast? | `all` (all players?) |
| On respawn, does everyone respawn or just dead players? | `everyone` |

---

### Q4.5: Respawn HP in Multiplayer

When respawning at checkpoint:

- [x] **A) Everyone resets to 70%** — Regardless of HP when checkpoint was saved
- [ ] **B) Dead players get 70%, living players keep current HP**
- [ ] **C) Everyone gets their HP from when checkpoint was saved**

**Decision**: Everyone resets to 70%

---

## 5. Narrative & AI Integration

### Q5.1: Player Identity in Narrative

Does the AI know which player is which?

- [ ] **A) No** — AI just sees "the party" takes actions
- [x] **B) Yes, by name** — "Tom sneaks left while Sarah distracts the dragon"
- [ ] **C) Yes, by class/role** — "The thief sneaks while the bard distracts"

**Decision**: By name (set before joining game)

If yes, how do players set their name/identity?
```
before they join the game
```

---

### Q5.2: Narrative Addressing

When the AI responds to a turn, does it address:

- [ ] **A) Only the current player** — "You sneak forward..."
- [x] **B) The whole party** — "Tom sneaks forward as the rest of you watch..."
- [ ] **C) Hybrid** — Current player's outcome + party observation

**Decision**: Whole party (uses player names)

---

### Q5.3: Score Impact Scope

When Player A writes poorly (score 40), does it affect:

- [x] **A) Only Player A's outcome** — Bad outcome for them, others unaffected
- [x] **B) Party narrative** — Bad outcome affects the shared story
- [ ] **C) Hybrid** — Player A takes damage, but story continues normally for others

**Decision**: Writing errors damage only the writer. Narrative consequences can hurt anyone (if Player A's action endangers the party, others can take damage too).

---

### Q5.4: System Prompt Changes

The current system prompt is for solo play. For multiplayer, we need to update it to:

- [ ] Handle multiple player names/identities
- [ ] Reference "the party" vs "you"
- [ ] Potentially track who did what

Should I draft a multiplayer system prompt variant once other decisions are made?

`yes` (yes/no)

---

## 6. UI/UX

### Q6.1: Lobby Screen Layout

What should the lobby screen show?

- [x] Party code (copyable)
- [x] Player list with ready status
- [x] Quest selection (who picks?) --> vote
- [ ] "Start Game" button (who can click?) --> game auto starts when everyone readys up
- [ ] Chat? `no` (yes/no)

**Quest selection**: 
- [ ] **A) Owner picks** — Party owner selects quest
- [x] **B) Vote** — Players vote on quest
- [ ] **C) Random** — Quest is randomly assigned

**Decision**: Vote on quest, auto-start when all ready

---

### Q6.2: Game Screen Multiplayer Elements

What multiplayer UI elements are needed on the game screen?

- [x] All players' HP bars (with names)
- [x] Turn indicator ("Sarah's turn")
- [ ] Turn order display
- [ ] Typing/activity indicator
- [ ] Chat panel? `no` (yes/no)
- [x] Player status (alive/dead/disconnected)

---

### Q6.3: Notification Sounds

Should there be audio notifications?

- [ ] **A) None** — Silent
- [x] **B) Your turn only** — Sound when it's your turn
- [ ] **C) All events** — Turn changes, damage, checkpoints, etc.

**Decision**: Sound on your turn only

---

### Q6.4: Mobile Considerations

Is mobile support required for multiplayer MVP?

- [ ] **A) Yes** — Must work on mobile browsers
- [ ] **B) Desktop-first** — Mobile is nice-to-have
- [x] **C) Desktop-only** — No mobile support initially

**Decision**: Desktop only for MVP

---

## 7. Edge Cases

### Q7.1: Single Player in "Multiplayer" Flow

Can a player start a multiplayer game alone?

- [x] **A) No** — Minimum 2 players required
- [ ] **B) Yes** — Solo play through multiplayer infrastructure
- [ ] **C) Yes, but different** — Solo uses current localStorage flow

**Decision**: Minimum 2 players required

---

### Q7.2: Player Name Conflicts

What if two players have the same name?

- [x] **A) Allow** — Append number (Tom, Tom2)
- [ ] **B) Prevent** — Second player must choose different name
- [ ] **C) Use unique IDs** — Names are display-only, IDs track players

**Decision**: Allow duplicates, append number

---

### Q7.3: Slow Writer

What if one player consistently takes much longer than others?

- [ ] **A) Nothing** — Patience is a virtue
- [ ] **B) Soft nudge** — UI shows "others are waiting" after X seconds
- [x] **C) Turn timer** — (see Q3.2)

**Decision**: 90-second timer handles this (see Q3.2)

---

### Q7.4: Griefing/Trolling

What if a player intentionally writes gibberish to hurt the party?

- [ ] **A) Nothing** — Their choice, their damage
- [x] **B) Kick option** — Other players can vote to remove
- [ ] **C) Auto-detect** — Repeated low scores trigger warning/removal

**Decision**: Votekick option

---

## 8. Technical Decisions

### Q8.1: Data Persistence

Should multiplayer game state be persisted?

- [ ] **A) No** — Party ends, game is gone (MVP simplicity)
- [x] **B) Yes, in memory** — Survives brief disconnects, not server restart
- [ ] **C) Yes, in database** — Full persistence, resume later

**Decision**: In-memory (survives brief disconnects)

---

### Q8.2: Party Expiration

When does a party code expire?

- [x] **A) On game completion** — Code dies when quest ends
- [ ] **B) After X minutes of inactivity** — `___` minutes
- [ ] **C) Never** — Codes persist until manually deleted

**Decision**: On game completion

---

### Q8.3: Concurrent Party Limit

Is there a limit on how many active parties can exist?

- [x] **A) No limit** — Scale as needed
- [ ] **B) Yes** — Max `___` concurrent parties (resource constraint)

**Decision**: No limit

---

## Summary Checklist

Once all decisions are made, check off:

- [x] Infrastructure chosen (Q1)
- [x] Party system defined (Q2)
- [x] Turn mechanics specified (Q3)
- [x] HP/death behavior clear (Q4)
- [x] AI integration planned (Q5)
- [x] UI requirements listed (Q6)
- [x] Edge cases handled (Q7)
- [x] Technical constraints set (Q8)

---

## Notes / Open Discussion

```
(Add any additional thoughts, concerns, or ideas here)
```

---

**Last Updated**: January 11, 2026
