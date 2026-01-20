const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure proper resolver configuration for Expo SDK 54
config.resolver.sourceExts.push('mjs', 'cjs');

// Note: Removed rewriteRequestUrl that was removing platform parameter
// The platform parameter is needed for Expo's serializer to work correctly

module.exports = withNativeWind(config, { input: './global.css' });
