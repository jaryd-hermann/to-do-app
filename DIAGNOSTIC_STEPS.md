# Network Error Diagnostic Steps

## Root Cause Analysis

The "network request failed" error on device (but not simulator) suggests one of these issues:

### Possible Causes (in order of likelihood):

1. **Environment Variables Not Loading in Production Build**
   - EAS secrets are set, but may not be injected correctly
   - Variables might be empty strings or undefined
   - The app might be using placeholder credentials

2. **iOS App Transport Security (ATS) Blocking**
   - Despite Info.plist config, ATS might still be blocking
   - Certificate pinning or TLS version mismatch
   - Supabase domain not properly whitelisted

3. **Actual Network Connectivity Issue**
   - Device can't reach Supabase servers
   - DNS resolution failing
   - Firewall/VPN blocking

4. **Supabase Client Initialization Failure**
   - Client created with invalid/empty credentials
   - Client created but auth methods not available

## Verification Steps (NO REBUILD REQUIRED)

### Step 1: Check Device Logs for Actual Error

**On your device, after attempting sign-in, check the logs for:**

```bash
# Connect device and view logs
# Option A: Xcode Console
# Open Xcode > Window > Devices and Simulators > Select your device > View Device Logs

# Option B: Console app
# Open Console.app > Select your device > Filter by "Mindjoy" or "Supabase"
```

**Look for these specific log messages:**
- `✅ Supabase credentials loaded in production` OR `⚠️ CRITICAL: Supabase credentials are missing`
- `URL source: Constants.expoConfig.extra` OR `process.env`
- `Sign in error details:` - This will show the ACTUAL error, not just "network error"
- `process.env.EXPO_PUBLIC_SUPABASE_URL: SET` OR `MISSING`

**Critical:** The actual error message from Supabase will tell us if it's:
- Missing credentials (empty URL/key)
- Network timeout
- SSL/TLS error
- DNS resolution failure
- 401/403 authentication error

### Step 2: Test Supabase Connection from Simulator (Current Build)

Since simulator works, let's verify the exact configuration:

1. **Run the app in simulator** (current build)
2. **Open React Native Debugger or Chrome DevTools**
3. **Check console logs** - Look for:
   ```
   Supabase URL configured: https://itfzmnvftucj...
   Full Supabase URL: https://itfzmnvftucjamkaxkjg.supabase.co
   URL source: process.env
   ```

4. **Test the actual Supabase endpoint:**
   ```javascript
   // In React Native Debugger console, run:
   fetch('https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```
   This should return `{ status: 'ok' }` if network is working.

### Step 3: Verify EAS Secrets Values

**Check that secrets have correct values:**

```bash
# Note: You can't view secret values, but verify they exist
eas secret:list

# Verify the values are correct by checking what you set:
# URL should be: https://itfzmnvftucjamkaxkjg.supabase.co
# Key should be: sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg
```

**If you're unsure, update them:**
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://itfzmnvftucjamkaxkjg.supabase.co" --force
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg" --force
```

### Step 4: Test Network Connectivity from Device

**On your physical device:**

1. Open Safari
2. Navigate to: `https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/health`
3. Should see: `{"status":"ok"}`

If this fails, it's a network/connectivity issue, not the app.

### Step 5: Check Info.plist Network Configuration

The current Info.plist has:
```xml
<key>supabase.co</key>
```

But your URL is: `itfzmnvftucjamkaxkjg.supabase.co`

**The domain exception should work** because `NSIncludesSubdomains` is `true`, but let's verify.

## Most Likely Issue: Environment Variables Not Loading

Based on the symptoms (works in simulator, fails on device), the most likely issue is:

**EAS secrets are set, but `process.env.EXPO_PUBLIC_*` variables are not being injected into the production build.**

### Why This Happens:

In EAS builds, environment variables from `eas.json` `env` section are available during BUILD TIME, but for them to be available at RUNTIME in the app, they need to be:

1. **Set as EAS secrets** ✅ (You have this)
2. **Referenced in `eas.json`** ✅ (You have this)
3. **Actually injected into the app bundle** ❓ (This might be failing)

### The Fix:

EAS should automatically inject `EXPO_PUBLIC_*` variables, but sometimes the `${}` syntax in `eas.json` doesn't work correctly.

**Try this approach instead:**

Update `eas.json` to use direct secret references (without `${}`):

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://itfzmnvftucjamkaxkjg.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg"
      }
    }
  }
}
```

**BUT WAIT** - This exposes secrets in git! Instead, we need to ensure the secrets are properly injected.

## Recommended Solution: Use app.config.js

Create `app.config.js` (instead of `app.json`) to dynamically read from environment:

```javascript
export default {
  expo: {
    // ... existing config
    extra: {
      eas: {
        projectId: "bb5756a3-1b15-49d6-94a4-18cb7297ba59"
      },
      // These will be available via Constants.expoConfig.extra
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
}
```

This way, EAS will inject the secrets as `process.env` variables during build, and they'll be available in `Constants.expoConfig.extra`.

## Next Steps (In Order):

1. **FIRST**: Check device logs to see the ACTUAL error message (not just "network error")
2. **SECOND**: Verify Supabase URL is reachable from device browser
3. **THIRD**: If logs show missing credentials, convert `app.json` to `app.config.js`
4. **FOURTH**: Only rebuild if logs confirm the fix will work

## Quick Test Script

Add this to your app temporarily to test without rebuilding:

```typescript
// In lib/supabase.ts, add at the end:
if (__DEV__) {
  // Test function to verify Supabase connection
  (global as any).testSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key present:', !!supabaseAnonKey);
    
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`);
      const data = await response.json();
      console.log('Health check:', data);
    } catch (error) {
      console.error('Health check failed:', error);
    }
    
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Session check:', { hasData: !!data, error });
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };
}
```

Then in React Native Debugger, run: `testSupabaseConnection()`
