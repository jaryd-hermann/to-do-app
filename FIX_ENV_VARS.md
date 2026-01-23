# Fix: Environment Variables Not Loading in EAS Build

## Problem

Device logs show:
```
'[SUPABASE INIT] Invalid URL value:', '${EXPO_PUBLIC_SUPABASE_URL}'
```

The URL is literally the string `${EXPO_PUBLIC_SUPABASE_URL}` - it's not being substituted!

## Root Cause

EAS secrets exist, but they're not being injected into `process.env` when `app.config.js` runs during the build.

## Solution

EAS secrets need to be properly configured. The `eas.json` file references them, but we need to ensure they're set correctly.

### Step 1: Verify Secrets Exist

```bash
eas secret:list
```

You should see:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: If Secrets Don't Exist, Create Them

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://itfzmnvftucjamkaxkjg.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg"
```

### Step 3: Verify eas.json Configuration

The `eas.json` file should have:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "${EXPO_PUBLIC_SUPABASE_URL}",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "${EXPO_PUBLIC_SUPABASE_ANON_KEY}"
      }
    }
  }
}
```

### Step 4: Rebuild

After ensuring secrets are set:
```bash
npm run build:ios
```

## Alternative: Use EAS Environment Variables

If secrets still don't work, you can set environment variables directly in `eas.json`:

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

**⚠️ WARNING:** This exposes your keys in the repo. Only use for testing, then switch back to secrets.

## Why This Happens

`app.config.js` runs during the build process, and `process.env` needs to be populated by EAS before the config file is evaluated. The `${SECRET_NAME}` syntax in `eas.json` tells EAS to inject the secret value, but it only works if:
1. The secret exists in EAS
2. The secret name matches exactly
3. The build profile is correct
