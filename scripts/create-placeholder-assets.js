const fs = require('fs');
const path = require('path');

// Create a simple placeholder image using SVG converted to PNG dimensions
// For now, we'll create minimal placeholder files that Expo can use

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple 1x1 transparent PNG as placeholder
// In production, you'll want to replace these with actual assets
const placeholderPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Create placeholder files
const files = [
  { name: 'icon.png', size: 1024 },
  { name: 'splash.png', size: 1284 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
];

files.forEach(({ name }) => {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, placeholderPNG);
    console.log(`Created placeholder: ${name}`);
  }
});

console.log('✅ Placeholder assets created!');
console.log('⚠️  Remember to replace these with actual app icons and splash screens.');
