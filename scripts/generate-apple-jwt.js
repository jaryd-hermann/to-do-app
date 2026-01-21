/**
 * Generate Apple Sign-In JWT Client Secret
 * 
 * This script generates the JWT client secret needed for Supabase Apple OAuth configuration.
 * 
 * Usage:
 * 1. Place your .p8 key file in the root directory as "AuthKey.p8"
 * 2. Update the constants below with your Apple Developer credentials
 * 3. Run: node scripts/generate-apple-jwt.js
 * 4. Copy the generated JWT and paste it into Supabase's "Secret Key" field
 */

const { SignJWT, importPKCS8 } = require('jose');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const TEAM_ID = '38NFF5BY78'; // Your Apple Team ID
const KEY_ID = 'N9Y646K7WD'; // Your Key ID
const SERVICE_ID = 'com.jarydhermann.mindjoy.signin'; // Your Service ID (Client ID)
const PRIVATE_KEY_PATH = path.join(__dirname, '..', 'AuthKey.p8'); // Path to your .p8 file

// ============================================
// JWT GENERATION
// ============================================

async function generateAppleJWT() {
  try {
    // Read the private key
    if (!fs.existsSync(PRIVATE_KEY_PATH)) {
      console.error(`\n❌ Error: Private key file not found at: ${PRIVATE_KEY_PATH}`);
      console.log('\n📝 Instructions:');
      console.log('1. Download your .p8 key file from Apple Developer');
      console.log('2. Rename it to "AuthKey.p8"');
      console.log('3. Place it in the root directory of your project');
      console.log(`4. Or update PRIVATE_KEY_PATH in this script to point to your key file\n`);
      process.exit(1);
    }

    const privateKeyPEM = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

    // Import the private key for ES256 signing using jose
    const privateKey = await importPKCS8(privateKeyPEM, 'ES256');

    // Create JWT with proper claims
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
      iss: TEAM_ID,
      iat: now,
      exp: now + 15777000, // 6 months (Apple's max expiration)
      aud: 'https://appleid.apple.com',
      sub: SERVICE_ID,
    })
      .setProtectedHeader({
        alg: 'ES256',
        kid: KEY_ID,
      })
      .sign(privateKey);

    console.log('\n✅ Apple JWT Client Secret Generated Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(jwt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Next Steps:');
    console.log('1. Copy the JWT above (everything between the lines)');
    console.log('2. Go to Supabase Dashboard → Authentication → Providers → Apple');
    console.log('3. Paste the JWT into the "Secret Key" field');
    console.log('4. Set "Client ID" to:', SERVICE_ID);
    console.log('5. Enable the Apple provider\n');
    console.log('⚠️  Note: This JWT expires in 6 months. You\'ll need to regenerate it.');
    console.log('   Save this script and your .p8 key file for future regeneration.\n');

    return jwt;
  } catch (error) {
    console.error('\n❌ Error generating JWT:', error.message);
    console.error(error.stack);
    if (error.message.includes('PEM') || error.message.includes('key')) {
      console.log('\n💡 Tip: Make sure your .p8 file includes the full PEM format:');
      console.log('   -----BEGIN PRIVATE KEY-----');
      console.log('   [key content]');
      console.log('   -----END PRIVATE KEY-----\n');
    }
    process.exit(1);
  }
}

// Run the script
generateAppleJWT();
