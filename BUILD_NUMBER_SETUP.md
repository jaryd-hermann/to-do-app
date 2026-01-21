# Automatic Build Number Incrementing

## Overview
The build number is automatically incremented before each EAS build submission. This ensures each App Store/Play Store submission has a unique, incrementing build number.

## How It Works

### Option 1: Manual Increment Before Build (Recommended)
Before running `eas build`, increment the build number:
```bash
npm run increment-build
eas build --platform ios --profile production
```

### Option 2: Using Convenience Scripts
Scripts that increment and build in one command:
```bash
# iOS production build (increments + builds)
npm run build:ios

# Android production build (increments + builds)
npm run build:android
```

### Option 3: EAS Build Hook (Automatic)
The `eas-build-pre-install.sh` hook will automatically increment before EAS builds. Make sure the hook is executable:
```bash
chmod +x eas-hooks/eas-build-pre-install.sh
```

## Build Number Locations

The script updates:
1. **app.json** - `expo.ios.buildNumber` and `expo.android.versionCode`
2. **ios/Mindjoy/Info.plist** - `CFBundleVersion` (if native files exist)

## Current Build Numbers

- **iOS**: Check `app.json` → `expo.ios.buildNumber`
- **Android**: Check `app.json` → `expo.android.versionCode`

## For App Store Submissions

When submitting to App Store Connect:
```bash
# Option 1: Manual increment then build
npm run increment-build
eas build --platform ios --profile production

# Option 2: Use convenience script (does both)
npm run build:ios

# Then submit
eas submit --platform ios
```

## Notes

- Build numbers must be integers and increment with each submission
- Version number (1.0.0) stays the same unless you manually change it
- Build number increments independently of version number
- The script preserves formatting in app.json
- iOS build numbers are strings (e.g., "1", "2", "3")
- Android version codes are integers (e.g., 1, 2, 3)
