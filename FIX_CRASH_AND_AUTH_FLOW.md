# Fixing Crash and Auth Flow Issues

## Issue 1: App Crash on TestFlight

### Problem
The app is crashing with a segmentation fault related to `react-native-worklets` and Hermes JavaScript engine. The crash occurs when trying to serialize worklet objects.

### Root Cause
`react-native-worklets` version 0.5.1 is incompatible with React Native 0.81.5 and Hermes, causing memory access violations when worklets try to serialize objects.

### Solution Applied
**Removed `react-native-worklets` dependency** from `package.json`. This package is not needed for the app's functionality and was causing crashes.

### Next Steps
1. **Remove the package:**
   ```bash
   npm uninstall react-native-worklets
   ```

2. **Clean and rebuild:**
   ```bash
   # Clean iOS build
   rm -rf ios/build
   rm -rf ios/Pods
   rm -rf node_modules
   
   # Reinstall dependencies
   npm install
   
   # Reinstall pods
   cd ios && pod install && cd ..
   
   # Rebuild
   npx expo run:ios
   ```

3. **Create new TestFlight build:**
   ```bash
   eas build --platform ios --profile production
   ```

## Issue 2: Returning Users Seeing About Screen

### Problem
Users who are already registered and logging back in are seeing the about screen, which should only be shown to new users.

### Solution Applied
1. **Updated `signIn` function** - Now checks if user record exists before creating one
2. **Updated `signInWithApple` function** - Checks if user already exists before creating record
3. **Updated auth flow** - After sign in, the app now relies on `app/index.tsx` to handle routing:
   - If subscription is expired → Paywall
   - If subscription is active/trial → Today screen
   - New users (no record) → About screen (handled by paywall logic)

### How It Works Now
- **New users (sign up)**: Go to about screen → paywall → today
- **Returning users (sign in)**: Skip about screen, go directly to paywall (if expired) or today (if active)
- **Apple Sign-In**: Same logic - checks if user exists and routes accordingly

### Testing
1. Sign up a new user → Should see about screen
2. Sign out and sign back in → Should skip about screen
3. Sign in with Apple (existing user) → Should skip about screen
