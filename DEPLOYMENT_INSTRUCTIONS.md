# Session Architecture Deployment Instructions

## ✅ What Has Been Implemented

The session architecture redesign has been successfully implemented with the following components:

### Core Infrastructure ✅
- ✅ **Type Definitions** (`lib/types/session.ts`)
- ✅ **SessionManager Service** (`lib/services/session-manager.ts`)
- ✅ **React Hooks** (`lib/hooks/useSession.ts`)
- ✅ **Cloud Functions** (`functions/session-orchestrator.ts`)
- ✅ **Firestore Rules** (updated in `firestore.rules`)
- ✅ **Firestore Indexes** (updated in `firestore.indexes.json`)

### Migrated Components ✅
- ✅ **WritingSessionContent** - Uses new session architecture
- ✅ **PeerFeedbackContent** - Uses new session architecture  
- ✅ **RevisionContent** - Uses new session architecture
- ✅ **MatchmakingContent** - Creates sessions using `useCreateSession`
- ✅ **Session Routes** - New `/session/[sessionId]/page.tsx`

---

## 🚀 Deployment Steps

### Step 1: Install Cloud Functions Dependencies

```bash
cd /Users/ludwitt/writing-app/functions
npm install
```

### Step 2: Build Cloud Functions

```bash
cd /Users/ludwitt/writing-app/functions
npm run build
```

### Step 3: Deploy Firestore Configuration

```bash
# From the project root
firebase deploy --only firestore:indexes,firestore:rules
```

### Step 4: Deploy Cloud Functions

```bash
# From the project root
firebase deploy --only functions
```

**Note**: The following functions will be deployed:
- `onPlayerSubmission` - Triggers phase transitions
- `cleanupStaleConnections` - Runs every minute to detect disconnections
- `getSessionStats` - HTTP endpoint for monitoring

### Step 5: Deploy Application to Vercel

```bash
# Build the Next.js application
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 🧪 Testing the New Architecture

### Test 1: Single Player Session
1. Go to `/ranked/matchmaking?trait=all`
2. Wait for AI players to fill
3. Match starts → Should navigate to `/session/{sessionId}`
4. Complete Phase 1 (writing)
5. **Expected**: Auto-transition to Phase 2 after submission

### Test 2: Reconnection
1. Start a session
2. Refresh the browser (F5)
3. **Expected**: Session restores, content preserved, timer continues
4. Check console for `🔄 SESSION MANAGER - Reconnecting to existing session`

### Test 3: Tab Switching
1. Start a session
2. Open the same session URL in a new tab
3. **Expected**: Both tabs show synchronized state
4. Submit in one tab
5. **Expected**: Other tab updates to show submission

### Test 4: Network Interruption
1. Start a session
2. Open DevTools → Network tab
3. Throttle to "Offline" for 10 seconds
4. **Expected**: Heartbeat fails, shows as disconnected
5. Re-enable network
6. **Expected**: Heartbeat resumes, status back to "connected"

### Test 5: Multiplayer Coordination (if testing with real users)
1. Two users join matchmaking
2. Both should navigate to the same `/session/{sessionId}`
3. Both submit their work
4. **Expected**: Phase transition happens automatically via Cloud Function

---

## 📊 Monitoring Sessions

### View Active Sessions
```bash
# Call the stats endpoint
curl https://YOUR-PROJECT-ID.cloudfunctions.net/getSessionStats
```

**Example Response**:
```json
{
  "total": 15,
  "byState": {
    "active": 8,
    "completed": 5,
    "abandoned": 2
  },
  "byMode": {
    "ranked": 12,
    "practice": 3
  },
  "averagePlayersPerSession": 4.8
}
```

### View Session in Firebase Console
1. Open Firebase Console
2. Navigate to Firestore Database
3. Go to `sessions` collection
4. Click on any session to inspect:
   - Player connection status
   - Phase submissions
   - Heartbeat timestamps
   - Coordination state

### Check Cloud Function Logs
```bash
firebase functions:log
```

Look for:
- `🔍 SESSION ORCHESTRATOR - Checking submissions`
- `✅ SESSION ORCHESTRATOR - All players submitted!`
- `🧹 SESSION ORCHESTRATOR - Running stale connection cleanup`

---

## 🔧 Troubleshooting

### Sessions Not Creating
**Symptom**: Matchmaking completes but navigation fails  
**Check**:
1. Console errors in browser
2. Firestore security rules allow session creation
3. User is authenticated

**Fix**: Verify Firestore rules were deployed correctly

### Heartbeat Not Working
**Symptom**: Players marked as disconnected immediately  
**Check**:
1. Cloud Function `cleanupStaleConnections` is deployed
2. Check function logs for errors
3. Verify Firestore rules allow heartbeat updates

**Fix**: Redeploy Cloud Functions and Firestore rules

### Phase Not Transitioning
**Symptom**: All players submit but phase doesn't change  
**Check**:
1. Cloud Function `onPlayerSubmission` is deployed
2. Check Firestore to see if all players actually submitted
3. Check function logs for errors

**Fix**: 
```bash
# Check if trigger is working
firebase functions:log --only onPlayerSubmission
```

### Old URL Routes Still Being Used
**Symptom**: App navigates to `/ranked/session?matchId=...`  
**Fix**: Some components might still use old navigation. Search for:
```bash
grep -r "ranked/session?" components/
```

---

## 🔄 Rollback Plan

If issues arise, you can rollback:

### Option 1: Keep Both Systems Running
The new and old systems can run in parallel. Old sessions use:
- `/ranked/session?matchId=...`
- `sessionStorage` for state
- `matchStates` collection

New sessions use:
- `/session/{sessionId}`
- Firestore for state
- `sessions` collection

### Option 2: Revert Code Changes
```bash
# Revert to previous commit
git log  # Find the commit before session architecture
git revert {commit-hash}
git push

# Redeploy
vercel --prod
```

### Option 3: Feature Flag (Recommended)
Add to `.env.local`:
```
NEXT_PUBLIC_USE_NEW_SESSIONS=false
```

Then in components:
```typescript
const USE_NEW_SESSIONS = process.env.NEXT_PUBLIC_USE_NEW_SESSIONS === 'true';

if (USE_NEW_SESSIONS) {
  // Use new session architecture
} else {
  // Use old system
}
```

---

## ✨ What's New

### For Users
- ✅ Can refresh browser without losing progress
- ✅ Can switch tabs/devices mid-session
- ✅ See real-time status of other players  
- ✅ Automatic reconnection on network issues
- ✅ Clean, bookmarkable URLs

### For Developers
- ✅ Single source of truth (Firestore sessions collection)
- ✅ No more `sessionStorage` scattered everywhere
- ✅ Type-safe session management
- ✅ Easy debugging (view session in Firebase Console)
- ✅ Better testability
- ✅ No race conditions (server-side coordination)

### For System
- ✅ Automatic cleanup of stale sessions
- ✅ Server-side phase transitions
- ✅ Presence detection (no ghost players)
- ✅ Monitoring and analytics built-in

---

## 📝 Next Steps (Optional Enhancements)

1. **Add Session Recovery UI**
   - Show "Session Restored" banner when reconnecting
   - Display how much time has elapsed

2. **Improve Multiplayer Follower Flow**
   - Store sessionId in match lobby
   - Followers can navigate directly to session

3. **Add Session Cleanup**
   - Cloud Function to archive sessions older than 7 days
   - Move to `archived_sessions` collection

4. **Enhanced Monitoring**
   - Cloud Function to track session analytics
   - Dashboard showing active sessions, average duration, etc.

5. **Session Sharing**
   - Allow users to share session links
   - Add read-only spectator mode

---

## 🎉 Summary

The session architecture has been successfully migrated from browser-based state to Firestore-based sessions. This provides:
- **Reliability**: No more lost state on refresh
- **Real-time Sync**: All players see the same state
- **Reconnection Support**: Network issues don't kill sessions
- **Clean Architecture**: Single source of truth, no URL bloat

All core components have been updated and are ready for deployment!

