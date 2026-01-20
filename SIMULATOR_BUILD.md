# Building for iOS Simulator

## The Issue
EAS Build by default creates device builds, not simulator builds. To install on the iOS Simulator, you have two options:

## Option 1: Local Build (Recommended for Simulator)

This builds directly on your Mac and installs on the simulator:

```bash
# Build and install on simulator (requires Xcode)
npx expo run:ios
```

**Benefits:**
- Fastest for simulator testing
- No EAS build queue wait time
- Installs directly on simulator
- Appears as standalone app on simulator home screen

**Requirements:**
- Xcode installed
- iOS Simulator available

## Option 2: EAS Build with Simulator Flag

Update your `eas.json` to specify simulator builds:

```bash
# Build for simulator via EAS
eas build --profile development --platform ios

# Then install on simulator
eas build:run -p ios
```

**Note:** I've updated your `eas.json` to include `"simulator": true` in the development profile.

## Option 3: Build Locally with EAS

If you want to use EAS but build locally:

```bash
eas build --profile development --platform ios --local
```

This uses EAS tooling but builds on your machine (requires Xcode).

## Quick Start for Simulator

**Recommended approach:**

```bash
# 1. Make sure simulator is running
open -a Simulator

# 2. Build and install directly
npx expo run:ios

# 3. Start dev server (in another terminal)
npm start -- --dev-client
```

The app will appear on your simulator home screen as "Mindjoy"!

## Troubleshooting

### "No simulator builds available"
- Make sure you built with `--profile development` and the profile has `"simulator": true`
- Or use `npx expo run:ios` for direct simulator build

### "Xcode not found"
- Install Xcode from App Store
- Run `xcode-select --install` to install command line tools

### Build fails
- Check that bundle identifier is correct: `com.jarydhermann.mindjoy`
- Ensure you're logged into Apple Developer account in Xcode
