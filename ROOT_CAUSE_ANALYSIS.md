# Root Cause Analysis: Network Error on Device

## Problem Summary
- ✅ Works in iOS Simulator
- ❌ Fails on physical device with "network request failed"
- EAS secrets are correctly set
- Simulator uses `.env` file (works)
- Device uses EAS build (fails)

## Root Cause

**Environment variables from EAS secrets are NOT being injected into the app bundle at runtime.**

### Why This Happens

1. **`app.json` is static JSON** - Cannot read `process.env` variables
2. **EAS secrets are available during BUILD** - But need to be explicitly exposed
3. **`eas.json` env section** - Makes vars available during build, but `EXPO_PUBLIC_*` vars need to be in `app.json` `extra` section to be accessible via `Constants.expoConfig.extra`

### The Fix

Convert `app.json` → `app.config.js` to dynamically read environment variables:

```javascript
// app.config.js
module.exports = {
  expo: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
}
```

This ensures:
- EAS injects secrets as `process.env` during build
- `app.config.js` reads them and puts them in `extra`
- App reads them via `Constants.expoConfig.extra`
- ✅ Works at runtime

## Verification Steps (No Rebuild)

### Step 1: Check Device Logs (CRITICAL)

**Connect device and view logs:**
```bash
# Xcode: Window > Devices and Simulators > Select device > View Device Logs
# OR Console.app > Select device > Filter by "Mindjoy"
```

**Look for:**
- `⚠️ CRITICAL: Supabase credentials are missing` → Confirms env vars not loading
- `process.env.EXPO_PUBLIC_SUPABASE_URL: MISSING` → Confirms the issue
- `Sign in error details:` → Shows actual error (might not be "network")

### Step 2: Test Network Connectivity

**On device Safari, navigate to:**
```
https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/health
```

**Expected:** `{"status":"ok"}`

**If this fails:** Network/connectivity issue (not app)
**If this works:** Confirms it's environment variable injection issue

### Step 3: Test in Simulator Debugger

**In React Native Debugger console:**
```javascript
testSupabaseConnection()
```

**This will show:**
- Where credentials are loaded from
- If connection works
- What the actual error is

## Solution Implementation

I've created `app.config.js` that will:
1. Read `process.env.EXPO_PUBLIC_*` variables (injected by EAS)
2. Put them in `extra` section
3. Make them available via `Constants.expoConfig.extra`

**Next steps:**
1. Delete `app.json` (or rename to `app.json.backup`)
2. Use `app.config.js` instead
3. Rebuild once
4. Test on device

## Why This Will Work

- ✅ Simulator works because it uses `.env` file → `process.env` has values
- ❌ Device fails because `app.json` is static → `extra` section is empty → `Constants.expoConfig.extra` is empty
- ✅ `app.config.js` reads `process.env` → Puts in `extra` → Available at runtime

## Cost-Saving Verification

**Before rebuilding, verify:**
1. Device logs show missing credentials (Step 1)
2. Network connectivity works (Step 2)
3. Simulator test shows where vars come from (Step 3)

**Only rebuild if all checks confirm this is the issue.**
