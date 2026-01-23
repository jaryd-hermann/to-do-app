// Quick test script to verify Supabase connection
// Run this in Node.js: node test-supabase-connection.js

const SUPABASE_URL = 'https://itfzmnvftucjamkaxkjg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OmOdo7Uyvih2VZgX9jJtiw_gvYc-Lrg';

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  
  // Test 1: Health check
  try {
    const healthResponse = await fetch(`${SUPABASE_URL}/auth/v1/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Test auth endpoint (should return 400 without proper request, but should connect)
  try {
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    const authData = await authResponse.json();
    console.log('✅ Auth endpoint reachable (expected 400 for invalid credentials):', authResponse.status);
  } catch (error) {
    console.error('❌ Auth endpoint failed:', error.message);
  }
  
  console.log('\n✅ Network connectivity test passed!');
  console.log('If device fails, the issue is likely environment variable injection, not network.');
}

testConnection();
