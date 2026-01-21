# Why Crashes Only Happen on Device

## Key Differences Between Simulator and Device

### 1. **Native Module Initialization**
- **Simulator**: Uses mock implementations or relaxed initialization
- **Device**: Requires full native module initialization with proper entitlements
- **Impact**: `expo-secure-store` uses Keychain on device, which requires proper code signing and entitlements

### 2. **Build Type**
- **Simulator**: Usually development builds with debugging enabled
- **Device**: Production builds with optimizations, minification, and stricter error handling
- **Impact**: Production builds have different memory management and error handling

### 3. **Secure Storage (Keychain)**
- **Simulator**: May use in-memory storage or relaxed Keychain access
- **Device**: Uses actual iOS Keychain which requires:
  - Proper entitlements in `Info.plist` and `.entitlements` file
  - Code signing with provisioning profile
  - Proper initialization sequence
- **Impact**: If Keychain isn't properly initialized, it can crash during module load

### 4. **Memory Management**
- **Simulator**: More lenient memory management (runs on Mac)
- **Device**: Stricter memory constraints and garbage collection
- **Impact**: Native modules must be properly initialized and cleaned up

### 5. **Hermes Engine**
- **Simulator**: May use different Hermes configuration
- **Device**: Production-optimized Hermes with stricter error handling
- **Impact**: Errors that are caught in simulator might crash on device

## Why Your App Crashes on Device

The crash is happening because:

1. **`expo-secure-store` is being initialized at module load time** (even with lazy loading, Supabase client creation happens immediately)
2. **Keychain access requires proper initialization** on device
3. **If Keychain fails to initialize**, it throws an exception
4. **The error handling code itself crashes** (memory corruption in Hermes)

## The Fix

We've made `expo-secure-store` lazy-load, but we need to ensure Supabase client creation is also deferred until after the app has fully initialized.
