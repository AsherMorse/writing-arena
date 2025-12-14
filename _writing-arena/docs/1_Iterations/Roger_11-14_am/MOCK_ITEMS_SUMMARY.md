# Mock/Placeholder Items - Quick Reference

## 🚨 Critical Mock Items (Breaks True Multiplayer)

### 1. AI Player Backfill Happens Too Fast
**File**: `/app/ranked/matchmaking/page.tsx` (line 82-97)
```typescript
aiBackfillIntervalRef.current = setInterval(() => {
  // Adds AI player every 5 seconds
}, 5000); // TOO FAST!
```
**Issue**: Real players never have time to match together  
**Fix**: Increase to 30-60 seconds OR add manual "Play vs AI" option

---

### 2. Peer Writing is Hardcoded
**File**: `/app/ranked/peer-feedback/page.tsx` (line 10-33, 49)
```typescript
const MOCK_PEER_WRITINGS = [
  { author: 'ProWriter99', content: `The old lighthouse...` },
  { author: 'WordMaster', content: `It was a normal Tuesday...` }
];
const [currentPeer] = useState(MOCK_PEER_WRITINGS[0]);
```
**Issue**: Always evaluating same 2 fake essays, not real peer work  
**Fix**: Retrieve actual opponent's Phase 1 writing from Firestore

---

### 3. AI Opponent Scores Are Random
**File**: `/app/ranked/phase-rankings/page.tsx` (line 85-116)
**File**: `/app/ranked/results/page.tsx` (line 133-170)
```typescript
{
  name: 'ProWriter99',
  score: Math.round(65 + Math.random() * 25),  // RANDOM!
}
```
**Issue**: AI opponents get fake scores, not real evaluation  
**Fix**: Either generate AI writing and evaluate it, OR pre-generate scored essays

---

### 4. Peer Feedback Display is Hardcoded  
**File**: `/app/ranked/revision/page.tsx` (line 311-318)
```typescript
{/* Peer Feedback - MOCK */}
<p>Your story has a great sense of mystery...</p>
<p>Try adding more description about what Sarah is feeling...</p>
```
**Issue**: Not showing actual peer's Phase 2 responses  
**Fix**: Retrieve peer's feedback responses from Firestore/URL params

---

## ✅ What's Already Real (Good News!)

- ✅ **Your writing** - Real content you type
- ✅ **AI evaluation** - Real Claude API calls at all 3 phases
- ✅ **AI feedback** - Real analysis stored in Firestore
- ✅ **Your scores** - Real AI-generated scores
- ✅ **LP/XP/Points** - Real updates to your profile
- ✅ **Match sync** - Real Firestore synchronization
- ✅ **Queue system** - Real Firestore queue (just doesn't wait long enough)
- ✅ **Prompts** - 20 real prompts from library
- ✅ **Session history** - Real saves to Firestore
- ✅ **TWR education** - Real educational content in carousels

---

## 🎯 Quick Fix Priorities

### Priority 1: Fix Matchmaking Timing
Change line 97 in `/app/ranked/matchmaking/page.tsx`:
```typescript
}, 5000); // Every 5 seconds
```
To:
```typescript
}, 45000); // Every 45 seconds - gives real players time to match
```

### Priority 2: Exchange Real Peer Writing
In `/app/ranked/peer-feedback/page.tsx`:
1. Retrieve matchState from Firestore
2. Find your assigned peer (e.g., next player in party)
3. Get their Phase 1 content
4. Display it instead of MOCK_PEER_WRITINGS

### Priority 3: Show Real Peer Feedback
In `/app/ranked/revision/page.tsx`:
1. Retrieve peer's Phase 2 responses from Firestore
2. Display actual feedback instead of mock text

### Priority 4: Generate Real AI Scores
Options:
- **Quick**: Use fallback scores based on difficulty curve
- **Better**: Pre-generate AI essays and store with real scores
- **Best**: Generate AI writing on-the-fly and evaluate it (expensive)

---

## 📋 Files to Modify

1. `/app/ranked/matchmaking/page.tsx` - Increase AI backfill delay
2. `/app/ranked/peer-feedback/page.tsx` - Retrieve real peer writing
3. `/app/ranked/revision/page.tsx` - Display real peer feedback
4. `/app/ranked/phase-rankings/page.tsx` - Use real/deterministic AI scores
5. `/app/ranked/results/page.tsx` - Use real/deterministic AI scores
6. `/lib/match-sync.ts` - Add peer assignment logic

---

## 💡 Recommendation: Separate "Ranked" from "AI Practice"

Consider creating two distinct modes:
- **"Ranked (PvP)"** - Wait for real players, true competition
- **"Practice vs AI"** - Quick match with AI bots for practice

This makes the mock AI opponents acceptable and expected in practice mode, while ranked mode can prioritize real player matches.

