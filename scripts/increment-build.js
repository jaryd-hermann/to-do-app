#!/usr/bin/env node

/**
 * Script to increment build number for iOS and Android
 * This is automatically called before EAS builds
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appConfigPath = path.join(__dirname, '..', 'app.config.js');
const infoPlistPath = path.join(__dirname, '..', 'ios', 'Mindjoy', 'Info.plist');
const xcodeProjectPath = path.join(__dirname, '..', 'ios', 'Mindjoy.xcodeproj', 'project.pbxproj');

function getAppConfig() {
  // Prefer app.config.js if it exists, otherwise use app.json
  if (fs.existsSync(appConfigPath)) {
    // Delete require cache to get fresh config
    delete require.cache[require.resolve(appConfigPath)];
    const config = require(appConfigPath);
    return { config: config.expo || config, isJs: true };
  } else if (fs.existsSync(appJsonPath)) {
    const config = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    return { config: config.expo || config, isJs: false };
  } else {
    throw new Error('Neither app.config.js nor app.json found!');
  }
}

function incrementBuildNumber() {
  // Read app config (app.config.js or app.json)
  const { config: appConfig, isJs } = getAppConfig();
  
  // Get current iOS build number or default to 1
  const currentIosBuild = appConfig.ios?.buildNumber || '1';
  const currentAndroidBuild = appConfig.android?.versionCode || 1;
  
  // Increment build numbers
  const newIosBuild = String(parseInt(currentIosBuild, 10) + 1);
  const newAndroidBuild = parseInt(currentAndroidBuild, 10) + 1;
  
  console.log(`📦 Incrementing build numbers:`);
  console.log(`   iOS: ${currentIosBuild} → ${newIosBuild}`);
  console.log(`   Android: ${currentAndroidBuild} → ${newAndroidBuild}`);
  
  // Update app config
  if (!appConfig.ios) {
    appConfig.ios = {};
  }
  if (!appConfig.android) {
    appConfig.android = {};
  }
  
  appConfig.ios.buildNumber = newIosBuild;
  appConfig.android.versionCode = newAndroidBuild;
  
  // Write back to app.config.js or app.json
  if (isJs) {
    // Read the original file to preserve formatting and other code
    let configFile = fs.readFileSync(appConfigPath, 'utf8');
    
    // Update buildNumber in the file
    configFile = configFile.replace(
      /buildNumber:\s*process\.env\.BUILD_NUMBER\s*\|\|\s*["']\d+["']/,
      `buildNumber: process.env.BUILD_NUMBER || "${newIosBuild}"`
    );
    
    // Update versionCode in the file
    configFile = configFile.replace(
      /versionCode:\s*parseInt\(process\.env\.VERSION_CODE\s*\|\|\s*["']\d+["'],\s*\d+\)/,
      `versionCode: parseInt(process.env.VERSION_CODE || "${newAndroidBuild}", 10)`
    );
    
    // If the pattern doesn't match, try simpler replacement
    if (!configFile.includes(`buildNumber: process.env.BUILD_NUMBER || "${newIosBuild}"`)) {
      configFile = configFile.replace(
        /buildNumber:\s*["']?\d+["']?/,
        `buildNumber: "${newIosBuild}"`
      );
    }
    
    if (!configFile.includes(`versionCode: parseInt(process.env.VERSION_CODE || "${newAndroidBuild}"`)) {
      configFile = configFile.replace(
        /versionCode:\s*parseInt\(["']?\d+["']?/,
        `versionCode: parseInt("${newAndroidBuild}"`
      );
    }
    
    fs.writeFileSync(appConfigPath, configFile);
    console.log(`✅ Updated app.config.js`);
  } else {
    // Write back to app.json
    const appJson = { expo: appConfig };
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`✅ Updated app.json`);
  }
  
  // Update Info.plist if it exists
  if (fs.existsSync(infoPlistPath)) {
    let infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
    
    // Replace CFBundleVersion
    const versionMatch = infoPlist.match(/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/);
    if (versionMatch) {
      infoPlist = infoPlist.replace(
        /<key>CFBundleVersion<\/key>\s*<string>\d+<\/string>/,
        `<key>CFBundleVersion</key>\n    <string>${newIosBuild}</string>`
      );
      fs.writeFileSync(infoPlistPath, infoPlist);
      console.log(`✅ Updated Info.plist CFBundleVersion to ${newIosBuild}`);
    } else {
      console.warn(`⚠️  Could not find CFBundleVersion in Info.plist`);
    }
  } else {
    console.warn(`⚠️  Info.plist not found at ${infoPlistPath}`);
  }
  
  // Update Xcode project file if it exists
  if (fs.existsSync(xcodeProjectPath)) {
    let projectFile = fs.readFileSync(xcodeProjectPath, 'utf8');
    let updated = false;
    
    // Update CURRENT_PROJECT_VERSION in both Debug and Release configurations
    const versionRegex = /(CURRENT_PROJECT_VERSION\s*=\s*)\d+(;)/g;
    const matches = projectFile.match(versionRegex);
    
    if (matches) {
      projectFile = projectFile.replace(versionRegex, `$1${newIosBuild}$2`);
      fs.writeFileSync(xcodeProjectPath, projectFile);
      console.log(`✅ Updated Xcode project CURRENT_PROJECT_VERSION to ${newIosBuild}`);
      updated = true;
    }
    
    if (!updated) {
      console.warn(`⚠️  Could not find CURRENT_PROJECT_VERSION in Xcode project file`);
    }
  } else {
    console.warn(`⚠️  Xcode project file not found at ${xcodeProjectPath}`);
  }
  
  console.log(`\n✅ Build numbers incremented successfully:`);
  console.log(`   iOS buildNumber: ${newIosBuild}`);
  console.log(`   Android versionCode: ${newAndroidBuild}`);
  return { ios: newIosBuild, android: newAndroidBuild };
}

// Run if called directly
if (require.main === module) {
  try {
    incrementBuildNumber();
  } catch (error) {
    console.error('Error incrementing build number:', error);
    process.exit(1);
  }
}

module.exports = { incrementBuildNumber };
