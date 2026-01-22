// app.config.js - Dynamic config that reads from environment variables
// This ensures EAS secrets are properly injected and available at runtime

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
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
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
      buildNumber: process.env.BUILD_NUMBER || "13",
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
      versionCode: parseInt(process.env.VERSION_CODE || "13", 10)
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
