#!/usr/bin/env node

/**
 * Wrapper script for EAS Build that automatically increments build numbers
 * Usage: node scripts/eas-build-with-increment.js --platform ios --profile production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the increment function
const { incrementBuildNumber } = require('./increment-build');

// Get command line arguments (everything after the script name)
const args = process.argv.slice(2);

// Check if --help is requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/eas-build-with-increment.js [eas build options]

This script automatically increments build numbers before running EAS Build.

Examples:
  node scripts/eas-build-with-increment.js --platform ios --profile production
  node scripts/eas-build-with-increment.js --platform android --profile production
  node scripts/eas-build-with-increment.js --platform ios --profile development

All arguments are passed directly to 'eas build'.

Options:
  --no-commit    Skip automatic commit of build number changes
  `);
  process.exit(0);
}

// Check if --no-commit flag is present
const shouldCommit = !args.includes('--no-commit');
const buildArgs = args.filter(arg => arg !== '--no-commit');

function isGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore', cwd: path.join(__dirname, '..') });
    return true;
  } catch {
    return false;
  }
}

function hasUncommittedChanges() {
  try {
    const result = execSync('git status --porcelain', { 
      encoding: 'utf8', 
      cwd: path.join(__dirname, '..') 
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function commitBuildNumber() {
  try {
    // Determine which config file exists
    const appConfigPath = path.join(__dirname, '..', 'app.config.js');
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    const configFile = fs.existsSync(appConfigPath) ? 'app.config.js' : 
                      fs.existsSync(appJsonPath) ? 'app.json' : null;
    
    if (!configFile) {
      console.warn('⚠️  No config file found to read build numbers');
      return;
    }
    
    // Check if config files have changes
    const filesToCheck = [configFile, 'ios/Mindjoy/Info.plist', 'ios/Mindjoy.xcodeproj/project.pbxproj'].join(' ');
    const result = execSync(`git status --porcelain ${filesToCheck}`, {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    
    if (result.trim().length > 0) {
      console.log('\n📝 Committing build number changes...\n');
      execSync(`git add ${filesToCheck}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      // Read the new build number from config file
      let iosBuild = 'unknown';
      let androidBuild = 'unknown';
      
      if (configFile === 'app.config.js') {
        delete require.cache[require.resolve(appConfigPath)];
        const config = require(appConfigPath);
        const expoConfig = config.expo || config;
        iosBuild = expoConfig.ios?.buildNumber || 'unknown';
        androidBuild = expoConfig.android?.versionCode || 'unknown';
      } else {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        iosBuild = appJson.expo?.ios?.buildNumber || 'unknown';
        androidBuild = appJson.expo?.android?.versionCode || 'unknown';
      }
      
      execSync(`git commit -m "chore: increment build numbers (iOS: ${iosBuild}, Android: ${androidBuild})"`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Build number changes committed\n');
    }
  } catch (error) {
    console.warn('\n⚠️  Warning: Could not commit build number changes:', error.message);
    console.warn('   Please commit the changes manually before building.\n');
  }
}

try {
  console.log('🔢 Incrementing build numbers...\n');
  const result = incrementBuildNumber();
  
  // Commit changes if in git repo and flag is set
  if (shouldCommit && isGitRepo()) {
    commitBuildNumber();
  } else if (shouldCommit && !isGitRepo()) {
    console.warn('⚠️  Not a git repository. Build number incremented but not committed.\n');
  }
  
  console.log('🚀 Starting EAS Build...\n');
  
  // Run eas build with all provided arguments
  const easCommand = `eas build ${buildArgs.join(' ')}`;
  execSync(easCommand, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}
