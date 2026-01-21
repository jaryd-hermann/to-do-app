#!/usr/bin/env node

/**
 * Script to increment build number for iOS and Android
 * This is automatically called before EAS builds
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const infoPlistPath = path.join(__dirname, '..', 'ios', 'Mindjoy', 'Info.plist');

function incrementBuildNumber() {
  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Get current iOS build number or default to 1
  const currentIosBuild = appJson.expo?.ios?.buildNumber || '1';
  const currentAndroidBuild = appJson.expo?.android?.versionCode || 1;
  
  // Increment build numbers
  const newIosBuild = String(parseInt(currentIosBuild, 10) + 1);
  const newAndroidBuild = parseInt(currentAndroidBuild, 10) + 1;
  
  console.log(`Incrementing iOS build number: ${currentIosBuild} → ${newIosBuild}`);
  console.log(`Incrementing Android version code: ${currentAndroidBuild} → ${newAndroidBuild}`);
  
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
      console.log(`Updated Info.plist CFBundleVersion to ${newIosBuild}`);
    }
  }
  
  console.log(`✅ Build numbers incremented:`);
  console.log(`   iOS: ${newIosBuild}`);
  console.log(`   Android: ${newAndroidBuild}`);
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
