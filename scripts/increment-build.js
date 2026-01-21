#!/usr/bin/env node

/**
 * Script to increment build number for iOS and Android
 * This is automatically called before EAS builds
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const infoPlistPath = path.join(__dirname, '..', 'ios', 'Mindjoy', 'Info.plist');
const xcodeProjectPath = path.join(__dirname, '..', 'ios', 'Mindjoy.xcodeproj', 'project.pbxproj');

function incrementBuildNumber() {
  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Get current iOS build number or default to 1
  const currentIosBuild = appJson.expo?.ios?.buildNumber || '1';
  const currentAndroidBuild = appJson.expo?.android?.versionCode || 1;
  
  // Increment build numbers
  const newIosBuild = String(parseInt(currentIosBuild, 10) + 1);
  const newAndroidBuild = parseInt(currentAndroidBuild, 10) + 1;
  
  console.log(`📦 Incrementing build numbers:`);
  console.log(`   iOS: ${currentIosBuild} → ${newIosBuild}`);
  console.log(`   Android: ${currentAndroidBuild} → ${newAndroidBuild}`);
  
  // Update app.json
  if (!appJson.expo.ios) {
    appJson.expo.ios = {};
  }
  if (!appJson.expo.android) {
    appJson.expo.android = {};
  }
  
  appJson.expo.ios.buildNumber = newIosBuild;
  appJson.expo.android.versionCode = newAndroidBuild;
  
  // Write back to app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log(`✅ Updated app.json`);
  
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
