# Fixing Native Module Errors

## Issue
Seeing "exponent native module not being found" errors when opening the app.

## Solution

The native modules need to be properly linked and the app needs to be rebuilt. Follow these steps:

### 1. Clean Build Folders
```bash
# Clean iOS build
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# Clean Metro cache
rm -rf node_modules/.cache
rm -rf .expo
```

### 2. Reinstall Dependencies
```bash
# Reinstall node modules
npm install

# Reinstall iOS pods
cd ios
pod install
cd ..
```

### 3. Rebuild the App
```bash
# Rebuild iOS app (this will take a few minutes)
npx expo run:ios
```

### 4. If Errors Persist

If you still see native module errors, try:

```bash
# Clear all caches
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf .expo
rm -rf node_modules/.cache

# Reinstall everything
npm install
cd ios && pod install && cd ..

# Rebuild
npx expo run:ios --clean
```

### 5. Verify Native Modules

Check that all expo modules are properly installed:
```bash
npx expo install --check
```

This will show any missing or mismatched dependencies.

## Common Causes

1. **App not rebuilt after installing new native modules** - Always rebuild after adding expo packages
2. **Pods out of sync** - Run `pod install` after npm install
3. **Cached build artifacts** - Clean build folders
4. **Metro cache issues** - Clear Metro cache with `--clear` flag

## Boot Screen Fix

The boot screen should now show `icon.png` on black background. The splash screen configuration has been updated to use `icon.png` instead of `splash.png`.
