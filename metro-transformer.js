const upstreamTransformer = require('expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Fix ReactDevToolsSettingsManager import for React Native 0.81
  if (filename.includes('setUpReactDevTools.js')) {
    // Replace the problematic import with platform-specific version
    const platform = options.platform || 'ios';
    const platformExt = platform === 'ios' ? '.ios' : '.android';
    src = src.replace(
      /require\(['"]\.\.\/\.\.\/src\/private\/devsupport\/rndevtools\/ReactDevToolsSettingsManager['"]\)/g,
      `require('../../src/private/devsupport/rndevtools/ReactDevToolsSettingsManager${platformExt}')`
    );
  }
  
  return upstreamTransformer.transform({ src, filename, options });
};
