# Fixing Error -1003 (Cannot Find Host) on Device

## The Error

From device logs:
```
error: HTTP load failed, 0/0 bytes (error code: -1003 [12:8])
error: finished with error [-1003] Error Domain=NSURLErrorDomain Code=-1003
```

**Error -1003 = `NSURLErrorCannotFindHost`** - DNS resolution failed or host cannot be found.

## Key Observations

1. ✅ **Safari works** - Can reach `https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/health`
2. ❌ **App fails** - Gets error -1003 when trying to connect
3. ✅ **Simulator works** - Credentials load correctly
4. ✅ **Device build has app.config.js** - Latest build

## Root Cause Analysis

Since Safari works but the app doesn't, this is **NOT** a DNS issue. It's likely:

1. **App Transport Security (ATS) blocking** - Even with exceptions, something might be wrong
2. **URL malformed or empty** - The URL might not be loading correctly
3. **Network stack issue** - React Native's network layer might have issues

## Fixes Applied

### 1. Added Explicit Domain Exception

Updated `Info.plist` to include both:
- `supabase.co` (with subdomains)
- `itfzmnvftucjamkaxkjg.supabase.co` (explicit)

### 2. Added URL Validation & Logging

Added logging to verify:
- URL is actually loaded
- URL format is correct
- URL can be parsed

### 3. Added Fetch Error Logging

Added custom fetch wrapper to log:
- Exact URL being requested
- Error details (code, domain, message)

## Next Steps

### Step 1: Rebuild and Check Logs

After rebuilding, check device logs for:

**Look for these messages:**
```
✅ Supabase credentials loaded in production
URL (first 50 chars): https://itfzmnvftucjamkaxkjg.supabase.co
URL hostname: itfzmnvftucjamkaxkjg.supabase.co
Supabase fetch request: https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/token
```

**If you see:**
- `⚠️ CRITICAL: Supabase credentials are missing` → Credentials not loading
- `URL (first 50 chars):` shows wrong URL → URL not loading correctly
- `Supabase fetch error:` shows the actual error → Network issue

### Step 2: Verify URL Format

The logs will now show the exact URL being used. Verify it matches:
```
https://itfzmnvftucjamkaxkjg.supabase.co
```

### Step 3: Check Network Permissions

If URL is correct but still failing, check:
1. Device Settings → Mindjoy → Check if network permissions are enabled
2. Try on different network (WiFi vs Cellular)
3. Check if VPN/Proxy is interfering

## Alternative: Temporary ATS Bypass (For Testing Only)

If nothing else works, you can temporarily allow all loads to test:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

**⚠️ WARNING:** This is insecure and should only be used for testing. Remove before production.

## Most Likely Issue

Based on error -1003 with Safari working, the most likely issue is:

**The Supabase URL is not being loaded correctly in the device build**, even though `app.config.js` exists.

The new logging will confirm this. After rebuild, check logs to see:
1. Is the URL actually loaded?
2. What is the exact URL value?
3. Is it a valid URL format?
