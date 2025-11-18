# Real Matchmaking Queue - Implementation

## ✅ What Was Implemented

Replaced mock matchmaking with a **real-time player queue system** that searches for actual players and backfills with AI.

## 🎮 How It Works

### User Flow

1. **User clicks "Start Ranked Match"**
   - Joins matchmaking queue in Firestore
   - Queue entry includes: userId, name, avatar, rank, LP, trait

2. **Real-time Player Search**
   - Listens for other players in the same trait queue
   - Updates party in real-time when players join
   - Shows "You" + any real players found

3. **AI Backfill (Every 5 seconds)**
   - If party not full after 5 seconds → Add AI player
   - Continues every 5 seconds until 5 players total
   - AI players have similar ranks (Silver II, III, IV)
   - Visual distinction: AI players show 🤖 icon

4. **Party Full**
   - When 5 players assembled (real + AI mix)
   - User leaves queue automatically
   - 3-second countdown starts
   - Match begins!

5. **Cleanup**
   - User removed from queue on match start
   - User removed from queue if they navigate away
   - No lingering queue entries

## 📁 Files Created/Modified

### Created:
- **`/lib/matchmaking-queue.ts`** - Queue management functions
- **`/firestore.rules`** - Security rules for queue and matches

### Modified:
- **`/app/ranked/page.tsx`** - Only "All Traits" selectable
- **`/app/ranked/matchmaking/page.tsx`** - Real queue system
- **`/app/ranked/session/page.tsx`** - Uses real user rank/avatar

## 🔧 Technical Details

### Firestore Collections

**`matchmakingQueue/` Collection:**
```typescript
{
  userId: string;          // User's Firebase UID (document ID)
  displayName: string;     // "Roger Hunt"
  avatar: string;          // "🌿"
  rank: string;            // "Silver III"
  rankLP: number;          // 120
  trait: string;           // "all"
  joinedAt: Timestamp;     // When they joined queue
}
```

**`matches/` Collection:**
```typescript
{
  id: string;              // Match ID
  players: Array<{
    userId: string;
    displayName: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>;
  trait: string;
  createdAt: Timestamp;
  status: 'forming' | 'ready' | 'in-progress' | 'completed';
}
```

### Key Functions

**`joinQueue()`**
- Adds user to matchmaking queue
- Document ID is user's UID (ensures one queue entry per user)
- Returns user ID

**`leaveQueue()`**
- Removes user from queue
- Called on match start or page navigation

**`listenToQueue()`**
- Real-time listener for queue updates
- Filters by trait (e.g., "all")
- Orders by joinedAt (first-come, first-served)
- Calls callback with player list on updates

**`generateAIPlayer()`**
- Creates AI opponent with similar rank
- Random names: ProWriter99, WordMaster, etc.
- Random avatars: 🎯, 📖, ✨, 🏅
- Rank variations: ±1 division from user

## 🎯 Visual Indicators

### Player Cards
**Real Players:**
- 💜 Purple border
- Purple rank text
- No prefix

**AI Players:**
- 🔵 Blue border  
- Blue rank text
- 🤖 Icon prefix

**Waiting:**
- Gray border (opacity 50%)
- 👤 Placeholder
- "Searching..." text

### Party Counter
Shows split: "2 Real Players • 3 AI"

## ⏱️ Timing

- **First AI:** After 5 seconds
- **Second AI:** After 10 seconds
- **Third AI:** After 15 seconds
- **Fourth AI:** After 20 seconds
- **Max wait:** 25 seconds for full AI party

If real players join during this time, they replace the waiting slots!

## 🔐 Security Rules

```javascript
// matchmakingQueue - users can join/leave queue
match /matchmakingQueue/{userId} {
  allow read: if isSignedIn();
  allow create, delete: if isOwner(userId);
}

// matches - read matches, create own
match /matches/{matchId} {
  allow read: if isSignedIn();
  allow create, update: if isSignedIn();
}
```

## 📊 Firestore Indexes Required

May need composite index for queue queries:
- Collection: `matchmakingQueue`
- Fields: `trait` (Ascending), `joinedAt` (Ascending)

Firebase will prompt to create this when first used.

## 🧪 Testing

### Test Real Player Matching:
1. Open browser 1: Go to `/ranked`, start matchmaking
2. Open browser 2 (different user): Go to `/ranked`, start matchmaking
3. **Result:** Browser 1 should see browser 2 join the party!

### Test AI Backfill:
1. Single user starts matchmaking
2. **After 5 sec:** First AI joins
3. **After 10 sec:** Second AI joins
4. Continue until 5 total
5. **Result:** Countdown starts when party full

### Test Queue Cleanup:
1. Join queue
2. Navigate away before match starts
3. **Result:** User removed from queue (check Firestore console)

## 🔜 Future Enhancements

When ready:
- [ ] Skill-based matching (only match similar LP ranges)
- [ ] Prevent same user from joining multiple times
- [ ] Queue timeout (remove stale entries after 2 minutes)
- [ ] Matchmaking analytics (avg wait time, AI ratio)
- [ ] Regional matchmaking
- [ ] Party size preferences

## ✅ What This Replaces

**Before:** Mock timer that added hardcoded players  
**After:** Real Firestore queue with live player search + AI backfill

**Still Mock:**
- AI opponent performance in battles (will implement later)
- Match history storage (will implement later)

**Now Real:**
- ✅ Matchmaking queue
- ✅ Real-time player detection
- ✅ AI backfill system
- ✅ Queue management
- ✅ User's actual rank/avatar display

