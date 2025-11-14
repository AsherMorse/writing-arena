# Migration Guide: Session Architecture Redesign

## Overview

This guide walks through migrating a component from the old architecture (sessionStorage + URL params) to the new architecture (SessionManager + Firestore).

---

## Example: Migrating WritingSessionContent

### **Before: Old Architecture**

```typescript
// ❌ OLD: Scattered sessionStorage, URL params, polling
export default function WritingSessionContent() {
  const searchParams = useSearchParams();
  
  // URL parsing
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const matchId = searchParams.get('matchId') || `match-${Date.now()}`;
  const isLeader = searchParams.get('isLeader') === 'true';
  
  // sessionStorage for state
  const [sessionStartTime] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-startTime`);
    if (stored) return parseInt(stored);
    const now = Date.now();
    sessionStorage.setItem(`${matchId}-startTime`, now.toString());
    return now;
  });
  
  const [writingContent, setWritingContent] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-content`);
    return stored || '';
  });
  
  // Persist to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem(`${matchId}-content`, writingContent);
  }, [writingContent, matchId]);
  
  // Leader/follower polling
  useEffect(() => {
    if (!isLeader) {
      let attempts = 0;
      const waitForMatch = async () => {
        const snap = await getDoc(matchRef);
        if (snap.exists()) return;
        attempts++;
        if (attempts >= 30) {
          await createMatchState(...);
        }
        setTimeout(() => waitForMatch(), 500);
      };
      waitForMatch();
    }
  }, [isLeader]);
  
  // Manual submission tracking
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    const stored = sessionStorage.getItem(`${matchId}-submitted`);
    return stored === 'true';
  });
  
  const handleSubmit = async () => {
    setHasSubmitted(true);
    sessionStorage.setItem(`${matchId}-submitted`, 'true');
    await submitPhase(...);
  };
  
  // Navigate with URL params
  router.push(`/ranked/peer-feedback?matchId=${matchId}&trait=${trait}&promptId=${promptId}&content=${encodeURIComponent(writingContent)}...`);
}
```

### **After: New Architecture**

```typescript
// ✅ NEW: Clean, robust, reconnection-safe
export default function WritingSessionContent() {
  const { sessionId } = useParams(); // Clean URL: /session/{sessionId}
  
  // Single hook handles everything
  const {
    session,
    isReconnecting,
    timeRemaining,
    submitPhase,
    hasSubmitted,
    submissionCount,
  } = useSession(sessionId);
  
  // Local UI state only
  const [writingContent, setWritingContent] = useState('');
  
  if (isReconnecting) {
    return <LoadingScreen message="Reconnecting to session..." />;
  }
  
  if (!session) {
    return <ErrorScreen message="Session not found" />;
  }
  
  const handleSubmit = async () => {
    await submitPhase(1, {
      content: writingContent,
      wordCount: writingContent.split(/\s+/).length,
    });
  };
  
  // Real-time submission tracking
  const { submitted, total } = submissionCount();
  
  // Auto-navigate when all players ready (via session.coordination)
  useEffect(() => {
    if (session.coordination.allPlayersReady && hasSubmitted()) {
      router.push(`/session/${sessionId}/feedback`); // Clean URL!
    }
  }, [session.coordination.allPlayersReady, hasSubmitted]);
  
  return (
    <div>
      <Timer seconds={timeRemaining} />
      <PlayerTracker submitted={submitted} total={total} />
      <WritingEditor 
        value={writingContent}
        onChange={setWritingContent}
      />
      <SubmitButton 
        onClick={handleSubmit}
        disabled={hasSubmitted()}
      />
    </div>
  );
}
```

---

## Migration Checklist

### 1. **Update URL Structure**

```typescript
// ❌ OLD
/ranked/session?trait=all&promptId=p1&matchId=m1&isLeader=true

// ✅ NEW
/session/{sessionId}
```

**Steps:**
1. Update Next.js routing in `app/session/[sessionId]/page.tsx`
2. Remove all `useSearchParams()` calls
3. Use `useParams()` to get `sessionId`

### 2. **Replace sessionStorage with useSession Hook**

```typescript
// ❌ OLD
const [data, setData] = useState(() => {
  return sessionStorage.getItem(`${matchId}-key`) || defaultValue;
});

useEffect(() => {
  sessionStorage.setItem(`${matchId}-key`, data);
}, [data]);

// ✅ NEW
const { session } = useSession(sessionId);
// Data is automatically synced via Firestore!
```

### 3. **Remove Leader/Follower Logic**

```typescript
// ❌ OLD
const isLeader = searchParams.get('isLeader') === 'true';
if (isLeader) {
  await createMatchState(...);
} else {
  // Poll and wait...
}

// ✅ NEW
// No leader/follower! SessionManager handles it
const { session } = useSession(sessionId);
```

### 4. **Update Submission Flow**

```typescript
// ❌ OLD
const handleSubmit = async () => {
  setHasSubmitted(true);
  sessionStorage.setItem(`${matchId}-submitted`, 'true');
  await submitPhase(matchId, userId, 1, score);
  // Manually check if all ready
};

// ✅ NEW
const { submitPhase, hasSubmitted } = useSession(sessionId);

const handleSubmit = async () => {
  await submitPhase(1, { content, wordCount, score });
  // Server automatically tracks submissions!
};
```

### 5. **Update Navigation**

```typescript
// ❌ OLD
router.push(
  `/ranked/peer-feedback?matchId=${matchId}&trait=${trait}&promptId=${promptId}&content=${encodeURIComponent(content)}&wordCount=${wordCount}&...`
);

// ✅ NEW
router.push(`/session/${sessionId}/feedback`);
// All data comes from session document, not URL!
```

### 6. **Add Reconnection Support**

```typescript
// ✅ NEW: Automatically handle reconnections
const { session, isReconnecting, error } = useSession(sessionId);

if (isReconnecting) {
  return <LoadingScreen message="Reconnecting..." />;
}

if (error) {
  return <ErrorScreen error={error} />;
}

// Show session restored notification
if (session && hasSubmitted()) {
  <Banner>Session restored - you already submitted!</Banner>
}
```

---

## Integration with Matchmaking

### **Creating Session from Matchmaking**

```typescript
// In MatchmakingContent.tsx
import { useCreateSession } from '@/lib/hooks/useSession';

export default function MatchmakingContent() {
  const { createSession, isCreating } = useCreateSession();
  
  // When match is found:
  useEffect(() => {
    if (players.length >= 5 && countdown === 0) {
      const init = async () => {
        const session = await createSession({
          mode: 'ranked',
          config: {
            trait,
            promptId: randomPrompt.id,
            promptType: randomPrompt.type,
            phase: 1,
            phaseDuration: 120,
          },
          players: players.map(p => ({
            userId: p.userId,
            displayName: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isAI: p.isAI,
          })),
        });
        
        // Navigate with clean URL
        router.push(`/session/${session.sessionId}`);
      };
      
      init();
    }
  }, [players, countdown]);
}
```

---

## Testing Reconnection

### **Scenario 1: Browser Refresh**

1. Start a session: `/session/session-abc123`
2. Write some content
3. Refresh the page (F5)
4. **Expected**: Content is preserved, session continues
5. **Old system**: Content lost, new session created ❌
6. **New system**: Content restored from Firestore ✅

### **Scenario 2: Tab Close and Reopen**

1. Start a session
2. Close the tab
3. Reopen browser and navigate to `/session/session-abc123`
4. **Expected**: Reconnect to session if still active
5. **Old system**: Session lost (sessionStorage cleared) ❌
6. **New system**: Reconnect successfully ✅

### **Scenario 3: Network Interruption**

1. Start a session
2. Disable network for 10 seconds
3. Re-enable network
4. **Expected**: Heartbeat resumes, status back to 'connected'
5. **Old system**: No detection, ghost player ❌
6. **New system**: Auto-reconnect ✅

---

## Deployment Steps

### **1. Deploy Firestore Indexes**

```bash
firebase deploy --only firestore:indexes
```

### **2. Deploy Cloud Functions**

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### **3. Update Firestore Security Rules**

```javascript
// Add to firestore.rules
match /sessions/{sessionId} {
  allow read: if request.auth != null && 
    request.auth.uid in resource.data.players.keys();
  
  allow create: if request.auth != null;
  
  allow update: if request.auth != null && 
    request.auth.uid in resource.data.players.keys() &&
    onlyUpdatingOwnPlayerData(request.auth.uid);
}
```

```bash
firebase deploy --only firestore:rules
```

### **4. Deploy Application**

```bash
npm run build
vercel --prod
```

---

## Monitoring

### **Check Session Stats**

```bash
curl https://your-project.cloudfunctions.net/getSessionStats
```

**Response:**
```json
{
  "total": 42,
  "byState": {
    "active": 15,
    "completed": 20,
    "abandoned": 7
  },
  "byMode": {
    "ranked": 30,
    "quick-match": 12
  },
  "averagePlayersPerSession": 4.2
}
```

### **View Session in Firebase Console**

1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to `sessions` collection
4. Inspect session document to see:
   - Player connection status
   - Phase submissions
   - Heartbeat timestamps

---

## Rollback Plan

If issues arise, you can rollback:

1. **Revert Application Code** (before removing old system)
   ```bash
   git revert {commit-hash}
   vercel --prod
   ```

2. **Both systems can run in parallel** during migration
   - Old system: sessionStorage + URL params
   - New system: SessionManager + Firestore
   - Gradually shift traffic to new system

3. **Feature Flag**
   ```typescript
   const USE_NEW_SESSION_SYSTEM = process.env.NEXT_PUBLIC_NEW_SESSIONS === 'true';
   
   if (USE_NEW_SESSION_SYSTEM) {
     return <NewSessionComponent />;
   } else {
     return <OldSessionComponent />;
   }
   ```

---

## FAQs

### Q: What happens to active sessions during deployment?

**A:** Active sessions continue running. The new system is backward compatible with the old `matchStates` collection.

### Q: Can users switch between devices mid-session?

**A:** Yes! As long as they use the same userId, they can access `/session/{sessionId}` from any device.

### Q: What if heartbeat fails due to network issues?

**A:** After 15 seconds without heartbeat, the player is marked as 'disconnected'. When network returns, heartbeat resumes and status changes back to 'connected'.

### Q: How long are completed sessions stored?

**A:** By default, indefinitely. You can add a Cloud Function to archive/delete sessions older than 7 days.

---

## Next Steps

1. ✅ Review architecture document
2. ✅ Deploy Cloud Functions
3. ✅ Migrate one component (WritingSessionContent)
4. ✅ Test reconnection scenarios
5. ✅ Monitor for 1 week
6. ✅ Migrate remaining components
7. ✅ Remove old system

---

## Support

If you encounter issues during migration:
- Check Cloud Function logs in Firebase Console
- Inspect Firestore documents for session state
- Enable debug logging: `localStorage.setItem('debug', 'session:*')`

