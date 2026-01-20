const fs = require('fs');
const path = require('path');

// Fix ReactDevToolsSettingsManager import in React Native 0.81
const filePath = path.join(__dirname, '..', 'node_modules', 'react-native', 'Libraries', 'Core', 'setUpReactDevTools.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the problematic import with platform-specific version
  // Using .android as it works for both platforms
  const original = "require('../../src/private/devsupport/rndevtools/ReactDevToolsSettingsManager')";
  const replacement = "require('../../src/private/devsupport/rndevtools/ReactDevToolsSettingsManager.android')";
  
  if (content.includes(original) && !content.includes(replacement)) {
    content = content.replace(original, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Fixed ReactDevToolsSettingsManager import');
  }
} else {
  console.log('⚠️  setUpReactDevTools.js not found, skipping fix');
}
