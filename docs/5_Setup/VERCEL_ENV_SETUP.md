# Vercel Environment Variables Setup

## Copy-Paste Format for Vercel Dashboard

When deploying to Vercel, go to:
**Project Settings → Environment Variables**

Add each variable below (one per line in Vercel's interface):

---

### Variable 1: ANTHROPIC_API_KEY
```
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
```

---

### Variable 2: NEXT_PUBLIC_FIREBASE_API_KEY
```
AIzaSyB05bWPL6KUzFeIknSTY8f49js7NlkcK9g
```

---

### Variable 3: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
hour-college.firebaseapp.com
```

---

### Variable 4: NEXT_PUBLIC_FIREBASE_DATABASE_URL
```
https://hour-college-default-rtdb.firebaseio.com
```

---

### Variable 5: NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
hour-college
```

---

### Variable 6: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
hour-college.firebasestorage.app
```

---

### Variable 7: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
347195886512
```

---

### Variable 8: NEXT_PUBLIC_FIREBASE_APP_ID
```
1:347195886512:web:c1511f6294c1af40eca475
```

---

### Variable 9: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```
G-MJLX4BQ1EW
```

---

## All Variables (for bulk copy if supported)

```
ANTHROPIC_API_KEY=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
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB05bWPL6KUzFeIknSTY8f49js7NlkcK9g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hour-college.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://hour-college-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hour-college
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hour-college.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=347195886512
NEXT_PUBLIC_FIREBASE_APP_ID=1:347195886512:web:c1511f6294c1af40eca475
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MJLX4BQ1EW
```

---

## Quick Setup Steps

### In Vercel Dashboard:
1. Go to your project
2. Click "Settings"
3. Click "Environment Variables"
4. For each variable above:
   - Paste the **name** (left side of =)
   - Paste the **value** (right side of =)
   - Select all environments (Production, Preview, Development)
   - Click "Add"
5. Redeploy after adding all variables

### For Local Development:
The `.env.local` file is already created in your project root with all these values!

---

## Security Notes

⚠️ **IMPORTANT:** 
- The `NEXT_PUBLIC_` prefix makes variables visible to the browser (required for Firebase client SDK)
- Firebase API keys are safe to expose (they're restricted by domain in Firebase Console)
- The Claude API key should NEVER be `NEXT_PUBLIC_` (it's server-side only)
- Make sure to enable Firebase security rules in your Firebase Console

---

## After Deployment

1. Test that AI feedback works (Claude API)
2. Test that Firebase initializes (check browser console)
3. Verify no errors in Vercel logs
4. Test all three game modes

---

*Copy these exact values into Vercel's environment variable interface.*

