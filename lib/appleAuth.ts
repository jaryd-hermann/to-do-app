import { Platform } from 'react-native';

let AppleAuthenticationModule: any = null;

/**
 * Safely loads the expo-apple-authentication module.
 * Returns null if the module is not available or fails to load.
 */
export function getAppleAuthentication() {
  if (Platform.OS !== 'ios') {
    return null;
  }

  if (AppleAuthenticationModule === null) {
    try {
      AppleAuthenticationModule = require('expo-apple-authentication');
    } catch (error) {
      console.error('Failed to load expo-apple-authentication:', error);
      AppleAuthenticationModule = false; // Cache failure to avoid repeated attempts
      return null;
    }
  }

  return AppleAuthenticationModule === false ? null : AppleAuthenticationModule;
}

/**
 * Checks if Apple Sign-In is available on this device.
 * Returns a promise that resolves to true/false.
 */
export async function isAppleAuthAvailable(): Promise<boolean> {
  const module = getAppleAuthentication();
  if (!module) {
    return false;
  }

  try {
    return await module.isAvailableAsync();
  } catch (error) {
    console.error('Error checking Apple Sign-In availability:', error);
    return false;
  }
}
