# Fixing Network Error on Device

## Two Possible Causes

### Cause 1: Missing Supabase Redirect URLs (Most Likely)

Your Supabase dashboard shows **no redirect URLs configured**. Even though you're using email/password auth, Supabase may still need redirect URLs for certain operations.

**Fix: Add Redirect URLs in Supabase**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. In the "Redirect URLs" section, click "Add URL"
3. Add these URLs (one at a time):
   - `mindjoy://`
   - `com.jarydhermann.mindjoy://`
   - `exp+mindjoy://` (for development)
4. Click "Save changes" after each addition

**Why this matters:**
- Email confirmation links (if enabled)
- Password reset links  
- OAuth callbacks (if you add OAuth later)
- Deep linking from email templates

### Cause 2: Credentials Not Loading on Device

Even though simulator works, device might not have credentials loaded.

**Check Device Logs:**

1. Connect device via USB
2. Open Xcode → Window → Devices and Simulators
3. Select your device → Click "Open Console"
4. Filter by "Mindjoy" or "Supabase"
5. Try signing in
6. Look for these messages:

**✅ Good (credentials loading):**
```
✅ Supabase credentials loaded in production
URL source: Constants.expoConfig.extra
Key source: Constants.expoConfig.extra
```

**❌ Bad (credentials missing):**
```
⚠️ CRITICAL: Supabase credentials are missing in production build!
process.env.EXPO_PUBLIC_SUPABASE_URL: MISSING
```

**If credentials are missing:**
- You need to rebuild with `app.config.js` (already created)
- Make sure you ran `npm run build:ios` AFTER we created `app.config.js`
- Check that EAS secrets are set: `eas secret:list`

## Step-by-Step Fix

### Step 1: Add Redirect URLs (Do This First - No Rebuild Needed)

1. Open Supabase Dashboard
2. Go to Authentication → URL Configuration  
3. Add these redirect URLs:
   - `mindjoy://`
   - `com.jarydhermann.mindjoy://`
4. Save changes
5. Test sign-in on device (no rebuild needed)

### Step 2: If Still Failing, Check Device Logs

Follow the steps above to check if credentials are loading.

### Step 3: If Credentials Missing, Rebuild

```bash
npm run build:ios
```

Make sure you're rebuilding AFTER `app.config.js` was created.

## Quick Test

**Before doing anything, test this:**

On your device, open Safari and go to:
```
https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/health
```

**Expected:** `{"status":"ok"}` or `{"message":"No API key found..."}`

**If this fails:** Network/connectivity issue (not Supabase config)
**If this works:** Network is fine - likely redirect URLs or credentials issue

## Most Likely Solution

**Add the redirect URLs first** - this is the most common cause of device-specific auth failures when simulator works but device doesn't.

The redirect URLs tell Supabase "these are valid places to redirect users after auth operations" - even if you're not using OAuth, Supabase may still validate redirect URLs for security.
