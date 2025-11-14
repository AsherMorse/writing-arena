# Matchmaking Race Condition Fix

## Problem
When two human players joined the ranked matchmaking queue simultaneously, they would be forced into separate games instead of matching together. This was caused by:

1. **Independent AI backfill**: Each client added AI students on their own 5-second timer
2. **Race condition**: Whichever player hit 5 players first would leave the queue
3. **No coordination**: Each player created their own unique matchId
4. **Result**: Both players ended up in separate games with AI opponents

## Root Cause
The matchmaking system was client-side only, with no server coordination. Each player:
- Joined the queue independently
- Started adding AI students after 5 seconds (every 5 seconds after)
- Created their own `matchId` based on their userId and timestamp
- Left the queue immediately when reaching 5 players

This meant timing differences of just a few seconds would cause players to miss each other.

## Solution

### 1. Increased AI Backfill Delays
- **First AI student**: Now joins after **15 seconds** (was 5 seconds)
- **Subsequent AI students**: Now join every **10 seconds** (was 5 seconds)
- **Reason**: Gives real players 15-25 seconds to find each other before AI fills slots

### 2. Real Player Priority Detection
```typescript
// Check if we have 2+ real players - if so, slow down AI backfill
const realPlayerCount = prev.filter(p => !p.isAI).length;
if (realPlayerCount >= 2 && prev.length < 4) {
  console.log('👥 MATCHMAKING - Multiple real players detected, prioritizing real player matching');
  return prev; // Skip this AI addition cycle
}
```
When 2+ real players are in the same party, AI backfill pauses to allow more real players to join.

### 3. Coordinated MatchId Generation
```typescript
// If multiple real players, coordinate matchId (use earliest player's ID as leader)
const realPlayersInQueue = queueSnapshot.filter(p => finalPlayersRef.current.some(fp => fp.userId === p.userId));

if (realPlayersInQueue.length >= 2) {
  // Sort by join time and use earliest player as leader
  const sortedPlayers = [...realPlayersInQueue].sort((a, b) => {
    const aTime = a.joinedAt?.toMillis() || 0;
    const bTime = b.joinedAt?.toMillis() || 0;
    return aTime - bTime;
  });
  const leaderId = sortedPlayers[0].userId;
  const leaderJoinTime = sortedPlayers[0].joinedAt?.toMillis() || Date.now();
  matchId = `match-${leaderId}-${leaderJoinTime}`;
}
```
When multiple real players match together, they all use the same matchId based on the "leader" (player who joined queue first).

## Testing Instructions

### Two-Player Match Test
1. Open two browser windows in **different browsers** (Chrome + Safari) or use **incognito mode**
2. Sign in with two different accounts
3. Navigate to ranked matchmaking on both
4. Select the same trait (e.g., "Sentence Expansion")
5. Click "Find Match" on **both windows within 5 seconds** of each other

### Expected Behavior
- ✅ Both players should see each other in the matchmaking lobby
- ✅ Both players should be in slots 1 and 2
- ✅ AI students should start joining after 15+ seconds
- ✅ When party fills to 5 players, countdown should start
- ✅ Both players should enter the **same match** together
- ✅ Both players should have the same matchId in the URL

### What Was Broken Before
- ❌ One player would disappear/refresh
- ❌ Both players would end up in separate games
- ❌ Each player would have different AI opponents
- ❌ Different matchIds in the URL

## Technical Details

### Files Changed
- `/components/ranked/MatchmakingContent.tsx`
  - Added `queueSnapshot` state to track all players in queue
  - Increased AI backfill delays (15s initial, 10s interval)
  - Added real player priority detection
  - Implemented coordinated matchId generation

### Key Variables
- `queueSnapshot`: Firestore snapshot of all players in the current trait queue
- `partyLockedRef`: Prevents updates after countdown starts
- `finalPlayersRef`: Saves the final party composition before leaving queue

### Firestore Collections Used
- `matchmakingQueue/{userId}`: Players waiting for match
  - Contains: userId, displayName, avatar, rank, rankLP, trait, joinedAt
  - Queried by trait
  - Listened to in real-time
  
## Future Improvements
For a fully robust solution, consider:
1. **Server-side matchmaker**: Cloud Function that forms parties on the server
2. **Match lobby collection**: Create a `matchLobbies` collection where parties form before match starts
3. **Party leader system**: One player becomes "host" and creates match for everyone
4. **Timeout handling**: Handle cases where players disconnect during matchmaking

## Debug Logs
Watch console for these key messages:
- `📥 MATCHMAKING - Queue update, players found: X`
- `👥 MATCHMAKING - Multiple real players detected, prioritizing real player matching`
- `🤖 MATCHMAKING - Adding AI student: [name]`
- `👥 MATCHMAKING - Multi-player match, leader: [userId]`
- `🎮 MATCHMAKING - Match ID: [matchId]`

