# Environment Variables Configuration

## The Problem

"Network request failed" errors occur when Supabase credentials aren't available in production builds. Environment variables from `.env` files are **NOT** automatically included in EAS builds.

## Solution: Configure Environment Variables in EAS

### Option 1: Set in EAS Dashboard (Recommended)

1. Go to https://expo.dev/accounts/[your-account]/projects/[your-project]/secrets
2. Add these secrets:
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://itfzmnvftucjamkaxkjg.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg`

### Option 2: Set via EAS CLI

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://itfzmnvftucjamkaxkjg.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg"
```

### Option 3: Use eas.json (Less Secure)

The `eas.json` file has been updated to reference environment variables, but you still need to set them in EAS Dashboard or via CLI.

## Verify Configuration

After setting secrets, rebuild your app:

```bash
npm run build:ios
```

The app should now be able to connect to Supabase.

## Debugging

If you still get "network request failed":

1. Check device logs for Supabase URL/key errors
2. Verify secrets are set: `eas secret:list`
3. Make sure you're using the correct project
4. Check network connectivity on device
