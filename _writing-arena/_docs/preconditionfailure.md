react-dom-client.development.js:25631 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
:3000/favicon.ico:1  Failed to load resource: the server responded with a status of 404 (Not Found)
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 451ms
logger.ts:33 ✅ SESSION OPERATIONS - Created forming session Object
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 489ms
hot-reloader-app.js:197 [Fast Refresh] rebuilding
intercept-console-error.js:57 Attempt 1/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async WritingSessionContent.useCallback[handleSubmit] (WritingSessionContent.tsx:171:5)
error @ intercept-console-error.js:57
report-hmr-latency.js:14 [Fast Refresh] done in 11520ms
useBatchRankingSubmission.ts:133 ✅ BATCH RANKING - Found 4 AI submissions for phase 1
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 166ms
useBatchRankingSubmission.ts:212 ✅ BATCH RANKING - Submitting phase 1 with score: 45 data: {content: 'Technology is amazing', wordCount: 3, score: 45}
logger.ts:55 🔍 SESSION OPERATIONS - Submitting phase 1 with atomic transition check {sessionId: 'session-1764819641547-mfeigxs', userId: 'mv6x1dVhdmcbSWrMkObpIL2CH0o1', phase: 1}
session-operations.ts:236  POST https://firestore.googleapis.com/v1/projects/writing-arena/databases/(default)/documents:commit 400 (Bad Request)
h.ea @ webchannel_blob_es2018.js:84
eval @ index.esm.js:14570
Jo @ index.esm.js:14522
Go @ index.esm.js:14399
eval @ index.esm.js:15297
Promise.then
Go @ index.esm.js:15297
__PRIVATE_invokeCommitRpc @ index.esm.js:18227
commit @ index.esm.js:18228
eval @ index.esm.js:18315
eval @ index.esm.js:19335
eval @ index.esm.js:19368
Promise.then
cc @ index.esm.js:19368
enqueue @ index.esm.js:19335
enqueueAndForget @ index.esm.js:19313
eval @ index.esm.js:18315
Promise.then
eval @ index.esm.js:18314
eval @ index.esm.js:14866
eval @ index.esm.js:15937
eval @ index.esm.js:19335
eval @ index.esm.js:19368
Promise.then
cc @ index.esm.js:19368
enqueue @ index.esm.js:19335
enqueueAndForget @ index.esm.js:19313
handleDelayElapsed @ index.esm.js:15936
eval @ index.esm.js:15918
setTimeout
start @ index.esm.js:15918
createAndSchedule @ index.esm.js:15912
enqueueAfterDelay @ index.esm.js:19382
p_ @ index.esm.js:14865
Ju @ index.esm.js:18312
ju @ index.esm.js:18309
eval @ index.esm.js:22843
await in eval
eval @ index.esm.js:19335
eval @ index.esm.js:19368
Promise.then
cc @ index.esm.js:19368
enqueue @ index.esm.js:19335
enqueueAndForget @ index.esm.js:19313
__PRIVATE_firestoreClientTransaction @ index.esm.js:22841
runTransaction @ index.esm.js:22845
submitPhase @ session-operations.ts:236
submitPhase @ session-manager.ts:163
useSession.useCallback[submitPhase] @ useSession.ts:136
WritingSessionContent.useBatchRankingSubmission @ WritingSessionContent.tsx:154
submit @ useBatchRankingSubmission.ts:213
session-operations.ts:236 [2025-12-04T03:41:51.919Z]  @firebase/firestore: Firestore (12.5.0): RestConnection RPC 'Commit' 0x5c4039e7 failed with error:  {"code":"failed-precondition","name":"FirebaseError"} url:  https://firestore.googleapis.com/v1/projects/writing-arena/databases/(default)/documents:commit request: {"writes":[{"update":{"name":"projects/writing-arena/databases/(default)/documents/sessions/session-1764819641547-mfeigxs","fields":{"players":{"mapValue":{"fields":{"mv6x1dVhdmcbSWrMkObpIL2CH0o1":{"mapValue":{"fields":{"phases":{"mapValue":{"fields":{"phase1":{"mapValue":{"fields":{"submitted":{"booleanValue":true},"content":{"stringValue":"Technology is amazing"},"wordCount":{"integerValue":"3"},"score":{"integerValue":"45"}}}}}}}}}}}}},"config":{"mapValue":{"fields":{"phase":{"integerValue":"2"},"phaseDuration":{"integerValue":"180"}}}},"coordination":{"mapValue":{"fields":{"allPlayersReady":{"booleanValue":false},"readyCount":{"integerValue":"0"}}}},"state":{"stringValue":"active"}}},"updateMask":{"fieldPaths":["config.phase","config.phaseDuration","coordination.allPlayersReady","coordination.readyCount","players.mv6x1dVhdmcbSWrMkObpIL2CH0o1.phases.phase1","state"]},"updateTransforms":[{"fieldPath":"players.mv6x1dVhdmcbSWrMkObpIL2CH0o1.phases.phase1.submittedAt","setToServerValue":"REQUEST_TIME"},{"fieldPath":"updatedAt","setToServerValue":"REQUEST_TIME"},{"fieldPath":"timing.phase2StartTime","setToServerValue":"REQUEST_TIME"}],"currentDocument":{"updateTime":"2025-12-04T03:41:47.086703000Z"}}]}
defaultLogHandler @ index.esm.js:85
warn @ index.esm.js:164
__PRIVATE_logWarn @ index.esm.js:260
eval @ index.esm.js:14401
Promise.then
Go @ index.esm.js:14399
eval @ index.esm.js:15297
Promise.then
Go @ index.esm.js:15297
__PRIVATE_invokeCommitRpc @ index.esm.js:18227
commit @ index.esm.js:18228
eval @ index.esm.js:18315
eval @ index.esm.js:19335
eval @ index.esm.js:19368
Promise.then
cc @ index.esm.js:19368
enqueue @ index.esm.js:19335
enqueueAndForget @ index.esm.js:19313
eval @ index.esm.js:18315
Promise.then
eval @ index.esm.js:18314
eval @ index.esm.js:14866
eval @ index.esm.js:15937
eval @ index.esm.js:19335
eval @ index.esm.js:19368
Promise.then
cc @ index.esm.js:19368
enqueue @ index.esm.js:19335
enqueueAndForget @ index.esm.js:19313
handleDelayElapsed @ index.esm.js:15936
eval @ index.esm.js:15918
setTimeout
start @ index.esm.js:15918
createAndSchedule @ index.esm.js:15912
enqueueAfterDelay @ index.esm.js:19382
p_ @ index.esm.js:14865
Ju @ index.esm.js:18312
ju @ index.esm.js:18309
eval @ index.esm.js:22843
await in eval
eval @ index.esm.js:19335
eval @ index.esm.js:19368
Promise.then
cc @ index.esm.js:19368
enqueue @ index.esm.js:19335
enqueueAndForget @ index.esm.js:19313
__PRIVATE_firestoreClientTransaction @ index.esm.js:22841
runTransaction @ index.esm.js:22845
submitPhase @ session-operations.ts:236
submitPhase @ session-manager.ts:163
useSession.useCallback[submitPhase] @ useSession.ts:136
WritingSessionContent.useBatchRankingSubmission @ WritingSessionContent.tsx:154
submit @ useBatchRankingSubmission.ts:213
logger.ts:33 ✅ SESSION OPERATIONS - Submitted phase 1 {sessionId: 'session-1764819641547-mfeigxs', transitioned: true, nextPhase: 2}
useBatchRankingSubmission.ts:214 ✅ BATCH RANKING - Successfully saved phase 1 to session
retry.ts:31 Attempt 1/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
await in retryWithBackoff
submit @ useBatchRankingSubmission.ts:91
handleSubmit @ PeerFeedbackContent.tsx:162
PeerFeedbackContent.useEffect.handleForceSubmit @ PeerFeedbackContent.tsx:172
dispatchDebugEvent @ DebugMenu.tsx:20
handleButtonClick @ DebugMenu.tsx:60
onClick @ DebugMenu.tsx:94
executeDispatch @ react-dom-client.development.js:16971
runWithFiberInDEV @ react-dom-client.development.js:872
processDispatchQueue @ react-dom-client.development.js:17021
eval @ react-dom-client.development.js:17622
batchedUpdates$1 @ react-dom-client.development.js:3312
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17175
dispatchEvent @ react-dom-client.development.js:21358
dispatchDiscreteEvent @ react-dom-client.development.js:21326
retry.ts:31 Attempt 2/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 3/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 4/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 5/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 6/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 7/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 8/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 9/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 10/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 11/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 12/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 13/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 14/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
retry.ts:31 Attempt 15/15 failed: Error: AI submissions not ready
    at maxAttempts (useBatchRankingSubmission.ts:102:21)
    at async retryWithBackoff (retry.ts:28:22)
    at async submit (useBatchRankingSubmission.ts:91:9)
    at async handleSubmit (PeerFeedbackContent.tsx:162:7)
error @ intercept-console-error.js:57
retryWithBackoff @ retry.ts:31
useBatchRankingSubmission.ts:125 ❌ BATCH RANKING - AI submissions still empty after retries {matchId: 'match-1764819641547-17m72yl', phase: 2, firestoreKey: 'aiFeedbacks.phase2'}
error @ intercept-console-error.js:57
submit @ useBatchRankingSubmission.ts:125
useBatchRankingSubmission.ts:224 ⚠️ BATCH RANKING - Using fallback evaluation (AI players will NOT be scored) {matchId: 'match-1764819641547-17m72yl', phase: 2, originalError: 'AI submissions not available after waiting'}
submit @ useBatchRankingSubmission.ts:224
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 242ms
useBatchRankingSubmission.ts:231 ✅ BATCH RANKING - Fallback evaluation completed with score: 15
logger.ts:55 🔍 SESSION OPERATIONS - Submitting phase 2 with atomic transition check {sessionId: 'session-1764819641547-mfeigxs', userId: 'mv6x1dVhdmcbSWrMkObpIL2CH0o1', phase: 2}
logger.ts:33 ✅ SESSION OPERATIONS - Submitted phase 2 {sessionId: 'session-1764819641547-mfeigxs', transitioned: true, nextPhase: 3}
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 160ms
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 140ms
useBatchRankingSubmission.ts:133 ✅ BATCH RANKING - Found 4 AI submissions for phase 3
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 161ms
useBatchRankingSubmission.ts:212 ✅ BATCH RANKING - Submitting phase 3 with score: 15 data: {revisedContent: 'Technology is amazing!', wordCount: 3, score: 15}
logger.ts:55 🔍 SESSION OPERATIONS - Submitting phase 3 with atomic transition check {sessionId: 'session-1764819641547-mfeigxs', userId: 'mv6x1dVhdmcbSWrMkObpIL2CH0o1', phase: 3}
logger.ts:33 ✅ SESSION OPERATIONS - Submitted phase 3 {sessionId: 'session-1764819641547-mfeigxs', transitioned: true, nextPhase: undefined}
logger.ts:55 🔍 RESULTS - Session scores {writingScore: 45, feedbackScore: 15, revisionScore: 15, hasSession: true, hasUserPlayer: true}
useBatchRankingSubmission.ts:214 ✅ BATCH RANKING - Successfully saved phase 3 to session
hot-reloader-app.js:197 [Fast Refresh] rebuilding
report-hmr-latency.js:14 [Fast Refresh] done in 343ms
useSessionFromParams.ts:45 📋 SESSION FROM PARAMS - Found sessionId from matchState: session-1764819641547-mfeigxs
useSessionFromParams.ts:45 📋 SESSION FROM PARAMS - Found sessionId from matchState: session-1764819641547-mfeigxs
logger.ts:55 🔍 RESULTS - Session scores {writingScore: 45, feedbackScore: 15, revisionScore: 15, hasSession: true, hasUserPlayer: true}
