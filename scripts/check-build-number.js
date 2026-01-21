#!/usr/bin/env node

/**
 * Script to check if build number needs to be incremented before building
 * This helps catch cases where eas build is run directly
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');

try {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const iosBuild = appJson.expo?.ios?.buildNumber || '1';
  const androidBuild = appJson.expo?.android?.versionCode || 1;
  
  console.log(`\n📦 Current Build Numbers:`);
  console.log(`   iOS: ${iosBuild}`);
  console.log(`   Android: ${androidBuild}`);
  console.log(`\n💡 To auto-increment before building, use:`);
  console.log(`   npm run build:ios`);
  console.log(`   npm run build:android`);
  console.log(`   npm run eas:build -- --platform ios --profile production\n`);
} catch (error) {
  console.error('Error reading app.json:', error.message);
  process.exit(1);
}
