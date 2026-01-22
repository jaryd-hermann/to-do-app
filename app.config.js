// app.config.js - Dynamic config that reads from environment variables
// This ensures EAS secrets are properly injected and available at runtime

// EAS injects secrets into process.env during build
// For EXPO_PUBLIC_* variables, they're available in process.env
// If not set (empty string or undefined), log warning but continue
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Log if variables are missing (for debugging)
if (!supabaseUrl || supabaseUrl.includes('${')) {
  console.warn('⚠️  WARNING: EXPO_PUBLIC_SUPABASE_URL is not set or contains template literal');
  console.warn('   Value:', supabaseUrl);
  console.warn('   Make sure EAS secrets are configured: eas secret:create');
}

if (!supabaseKey || supabaseKey.includes('${')) {
  console.warn('⚠️  WARNING: EXPO_PUBLIC_SUPABASE_ANON_KEY is not set or contains template literal');
  console.warn('   Value:', supabaseKey ? 'SET (hidden)' : 'MISSING');
}

module.exports = {
  expo: {
    name: "Mindjoy",
    slug: "mindjoy",
    extra: {
      eas: {
        projectId: "bb5756a3-1b15-49d6-94a4-18cb7297ba59"
      },
      // EAS will inject EXPO_PUBLIC_* variables from secrets during build
      // These will be available via Constants.expoConfig.extra
      EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
    },
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jarydhermann.mindjoy",
      buildNumber: process.env.BUILD_NUMBER || "16",
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.jarydhermann.mindjoy",
      versionCode: parseInt(process.env.VERSION_CODE || "16", 10)
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-asset",
      "expo-font",
      "expo-apple-authentication"
    ],
    scheme: "mindjoy"
  }
};
