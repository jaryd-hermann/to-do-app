# How to View Device Logs on iOS

## Method 1: Xcode (Easiest - Recommended)

### Step 1: Connect Your Device
1. Connect your iPhone/iPad to your Mac via USB cable
2. Unlock your device and trust the computer if prompted

### Step 2: Open Xcode
1. Open **Xcode** (if not installed, download from App Store or developer.apple.com)
2. Go to **Window** → **Devices and Simulators** (or press `Cmd + Shift + 2`)

### Step 3: Select Your Device
1. In the left sidebar, click on your device name under **Devices**
2. You should see device info on the right

### Step 4: View Console Logs
1. Click the **"Open Console"** button at the bottom
2. A new window will open showing all device logs
3. **Filter the logs:**
   - In the search box at the top, type: `Mindjoy` or `Supabase`
   - This will show only logs from your app

### Step 5: Reproduce the Issue
1. Keep the console window open
2. On your device, open the Mindjoy app
3. Try to sign in
4. Watch the console logs in real-time

**Look for these specific messages:**
- `✅ Supabase credentials loaded in production` OR `⚠️ CRITICAL: Supabase credentials are missing`
- `URL source: Constants.expoConfig.extra` OR `process.env`
- `Sign in error details:` (shows the actual error)

---

## Method 2: Console.app (macOS Built-in)

### Step 1: Open Console App
1. Press `Cmd + Space` to open Spotlight
2. Type "Console" and press Enter
3. The Console app will open

### Step 2: Select Your Device
1. In the left sidebar, look for your device name under **Devices**
2. Click on it to select

### Step 3: Filter Logs
1. In the search box at the top right, type: `Mindjoy`
2. Or type: `Supabase` to see Supabase-related logs
3. You can also filter by process name if you see it

### Step 4: View Logs
- Logs will appear in real-time
- Scroll to see recent logs
- Look for the same messages as Method 1

---

## Method 3: Terminal (Command Line)

### Step 1: Connect Device
1. Connect your device via USB
2. Unlock and trust the computer

### Step 2: Use `xcrun simctl` or `idevicesyslog`
```bash
# Install libimobiledevice (if not installed)
brew install libimobiledevice

# View device logs
idevicesyslog | grep -i "mindjoy\|supabase"
```

**Note:** This method requires additional tools and may be less user-friendly.

---

## Method 4: React Native Debugger (If Using Dev Build)

If you're running a development build (not production):

1. Open React Native Debugger
2. Connect to your device
3. Open Chrome DevTools console
4. Logs will appear there

---

## What to Look For

When you view the logs, search for these key messages:

### ✅ Good Signs (Credentials Loading):
```
✅ Supabase credentials loaded in production
URL source: Constants.expoConfig.extra
Key source: Constants.expoConfig.extra
Supabase URL configured: https://itfzmnvftucj...
```

### ❌ Bad Signs (Credentials Missing):
```
⚠️ CRITICAL: Supabase credentials are missing in production build!
process.env.EXPO_PUBLIC_SUPABASE_URL: MISSING
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY: MISSING
```

### Error Messages:
```
Sign in error details: {
  message: "...",
  status: ...,
  code: "..."
}
```

---

## Quick Test

**Before checking logs, test network connectivity:**

1. On your device, open **Safari**
2. Navigate to: `https://itfzmnvftucjamkaxkjg.supabase.co/auth/v1/health`
3. You should see: `{"status":"ok"}`
4. If this works, network is fine - the issue is environment variables
5. If this fails, it's a network/connectivity issue

---

## Tips

- **Keep logs open** while testing - they update in real-time
- **Filter by "Mindjoy"** to reduce noise
- **Look for ERROR or WARN** messages - they're usually the most important
- **Copy/paste** relevant log sections if you need help debugging

---

## After Rebuild

Once you rebuild with `app.config.js`, check logs again and verify:
- Credentials are loading from `Constants.expoConfig.extra`
- No "missing credentials" errors
- Sign-in works without network errors
