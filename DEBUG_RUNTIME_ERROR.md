# Debugging Runtime Error: getDevServer is not a function

## Issue
The error `TypeError: getDevServer is not a function (it is Object)` occurs when Metro bundler tries to create a WebSocket connection but the dev server utilities aren't properly initialized.

## Solutions Applied

### 1. Updated Metro Config
Added `rewriteRequestUrl` to filter problematic query parameters that cause the getDevServer error.

### 2. Updated Dependencies
- React Native: 0.81.5 (was 0.81.0)
- React Native Gesture Handler: ~2.28.0
- React Native Reanimated: ~4.1.1

### 3. Clear Cache and Restart
```bash
# Stop current server (Ctrl+C)
# Clear all caches
rm -rf node_modules/.cache .expo
npx expo start -c
```

## If Error Persists

### Option 1: Use Expo Go Compatible Mode
The error might be due to Expo Go limitations. Try:
```bash
npx expo start --go
```

### Option 2: Create Development Build
For a standalone app that avoids Expo Go limitations:
```bash
# Install EAS CLI
npm install -g eas-cli

# Build development client
eas build --profile development --platform ios

# Install on simulator
eas build:run -p ios

# Start dev server
npm start -- --dev-client
```

### Option 3: Check Environment Variables
Ensure `.env` file exists and has correct values:
```bash
cat .env
# Should show:
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Option 4: Verify Supabase Client
Check that Supabase client isn't crashing on initialization:
```typescript
// lib/supabase.ts should have:
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Add validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing!');
}
```

## Next Steps
1. Try `npx expo start -c` with cleared cache
2. If still failing, create a development build (Option 2)
3. Check terminal logs for specific file/line errors
