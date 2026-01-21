# Fixing Splash Screen and Apple Sign-In Issues

## Issue 1: Green Square on Boot Screen

The green square is coming from the native iOS splash screen storyboard. The splash screen assets need to be regenerated.

### Solution:

1. **Regenerate splash screen assets:**
   ```bash
   npx expo prebuild --clean
   ```

   This will regenerate the iOS native files with the correct splash screen configuration from `app.json`.

2. **Rebuild the app:**
   ```bash
   npx expo run:ios
   ```

## Issue 2: Apple Sign-In Errors

Apple Sign-In is failing with error -7026 and 1000. This is common in simulators.

### Solutions Applied:

1. **Added Apple Sign-In entitlement** - Updated `ios/Mindjoy/Mindjoy.entitlements` to include the required Apple Sign-In capability.

2. **Added simulator error handling** - The app now shows a helpful message when Apple Sign-In fails in the simulator.

### Additional Steps:

1. **Rebuild the app** (required after entitlement changes):
   ```bash
   npx expo run:ios
   ```

2. **For Simulator Testing:**
   - Apple Sign-In often doesn't work in simulators
   - Use email/password authentication for simulator testing
   - Test Apple Sign-In on a physical device

3. **For Physical Device Testing:**
   - Ensure you're signed into an Apple ID in Settings > Sign in to your iPhone
   - The app should work properly on a physical device

### If Issues Persist:

1. **Clean rebuild:**
   ```bash
   rm -rf ios/build
   rm -rf ios/Pods
   cd ios && pod install && cd ..
   npx expo run:ios --clean
   ```

2. **Verify entitlements in Xcode:**
   - Open `ios/Mindjoy.xcworkspace` in Xcode
   - Select the Mindjoy target
   - Go to "Signing & Capabilities"
   - Ensure "Sign in with Apple" capability is added

3. **Check App Store Connect:**
   - Ensure your app's bundle ID (`com.jarydhermann.mindjoy`) has Apple Sign-In enabled in App Store Connect
