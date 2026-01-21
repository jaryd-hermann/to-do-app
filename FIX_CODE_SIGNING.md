# Fixing Code Signing Error

## Issue
When running `npx expo run:ios`, you get:
```
CommandError: No code signing certificates are available to use.
```

## Solution

### Option 1: Build for Simulator (Recommended for Development)

Use the `--device` flag to specify simulator:

```bash
npx expo run:ios --device
```

Or specify a specific simulator:

```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx expo run:ios --device "iPhone 15 Pro"
```

### Option 2: Set Up Code Signing for Physical Device

If you want to build for a physical device:

1. **Open Xcode:**
   ```bash
   open ios/Mindjoy.xcworkspace
   ```

2. **Select your project** in the navigator
3. **Select the Mindjoy target**
4. **Go to "Signing & Capabilities" tab**
5. **Select your Team** (your Apple Developer account)
6. **Xcode will automatically generate certificates**

7. **Then run:**
   ```bash
   npx expo run:ios --device
   ```

### Option 3: Use EAS Build (Recommended for TestFlight)

For TestFlight builds, use EAS Build instead:

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Or for development build
eas build --platform ios --profile development
```

This handles code signing automatically through EAS.

## Quick Fix for Development

For quick local development, just use the simulator:

```bash
npx expo run:ios
```

This will automatically use a simulator if no physical device is connected.
