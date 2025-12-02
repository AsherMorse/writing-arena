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
AIzaSyAf4CsjSud_lH3oOUhBngvIAZNxIWDpS0Q
```

---

### Variable 3: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
writing-arena.firebaseapp.com
```

---

### Variable 4: NEXT_PUBLIC_FIREBASE_DATABASE_URL
```
https://writing-arena-default-rtdb.firebaseio.com
```

---

### Variable 5: NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
writing-arena
```

---

### Variable 6: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
writing-arena.firebasestorage.app
```

---

### Variable 7: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
774068675032
```

---

### Variable 8: NEXT_PUBLIC_FIREBASE_APP_ID
```
1:774068675032:web:1426c690e6d34dc93a52ad
```

---

### Variable 9: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```
G-8GZWHR7FKN
```

---

## All Variables (for bulk copy if supported)

```
ANTHROPIC_API_KEY=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
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAf4CsjSud_lH3oOUhBngvIAZNxIWDpS0Q
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=writing-arena.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://writing-arena-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=writing-arena
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=writing-arena.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=774068675032
NEXT_PUBLIC_FIREBASE_APP_ID=1:774068675032:web:1426c690e6d34dc93a52ad
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8GZWHR7FKN
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

