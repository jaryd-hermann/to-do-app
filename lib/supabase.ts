import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get environment variables from multiple sources
// In development: from process.env (via .env file or Metro bundler)
// In production EAS builds: from Constants.expoConfig.extra (via EAS secrets)
// Fallback to process.env for compatibility
function getEnvVar(key: string): string {
  // Try Constants.expoConfig.extra first (for production EAS builds)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] as string;
  }
  // Try process.env (for development and EAS builds where EXPO_PUBLIC_ vars are injected)
  if (process.env[key]) {
    return process.env[key];
  }
  // Last resort: check Constants.expoConfig.extra.eas.build.env (if EAS injected it there)
  if (Constants.expoConfig?.extra?.eas?.build?.env?.[key]) {
    return Constants.expoConfig.extra.eas.build.env[key] as string;
  }
  return '';
}

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Log configuration (without exposing keys in production)
// ALWAYS log in production to debug device issues
const hasUrl = !!supabaseUrl;
const hasKey = !!supabaseAnonKey;
const urlSource = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ? 'Constants.expoConfig.extra' : (process.env.EXPO_PUBLIC_SUPABASE_URL ? 'process.env' : 'MISSING');
const keySource = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Constants.expoConfig.extra' : (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'process.env' : 'MISSING');

// CRITICAL: Always log this in production to debug device issues
console.log('[SUPABASE INIT] Starting Supabase initialization...');
console.log('[SUPABASE INIT] URL present:', hasUrl, '| Source:', urlSource);
console.log('[SUPABASE INIT] Key present:', hasKey, '| Source:', keySource);
if (hasUrl) {
  console.log('[SUPABASE INIT] URL (first 50):', supabaseUrl.substring(0, 50));
  console.log('[SUPABASE INIT] URL length:', supabaseUrl.length);
  try {
    const testUrl = new URL(supabaseUrl);
    console.log('[SUPABASE INIT] URL hostname:', testUrl.hostname);
  } catch (e: any) {
    console.error('[SUPABASE INIT] URL parse error:', e.message);
    console.error('[SUPABASE INIT] Invalid URL value:', supabaseUrl);
  }
} else {
  console.error('[SUPABASE INIT] CRITICAL: URL is MISSING!');
  console.error('[SUPABASE INIT] Constants.expoConfig?.extra keys:', Object.keys(Constants.expoConfig?.extra || {}));
}

if (__DEV__) {
  if (hasUrl) {
    console.log('Supabase URL configured:', supabaseUrl.substring(0, 30) + '...');
    console.log('Full Supabase URL:', supabaseUrl);
    console.log('URL source:', urlSource);
  } else {
    console.warn('⚠️  Supabase URL is missing!');
    console.warn('   Checked:', urlSource);
  }
  if (hasKey) {
    console.log('Supabase Key configured: YES');
    console.log('Key length:', supabaseAnonKey.length);
    console.log('Key source:', keySource);
  } else {
    console.warn('⚠️  Supabase Key is missing!');
    console.warn('   Checked:', keySource);
  }
} else {
  // In production, log warnings if credentials are missing
  if (!hasUrl || !hasKey) {
    console.error('⚠️  CRITICAL: Supabase credentials are missing in production build!');
    console.error('   URL present:', hasUrl, '(from', urlSource + ')');
    console.error('   Key present:', hasKey, '(from', keySource + ')');
    console.error('   Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in EAS secrets');
    console.error('   Constants.expoConfig?.extra keys:', JSON.stringify(Object.keys(Constants.expoConfig?.extra || {})));
    console.error('   process.env.EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
    console.error('   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  } else {
    // Log that credentials are present (without exposing them)
    console.log('✅ Supabase credentials loaded in production');
    console.log('   URL length:', supabaseUrl.length, '(from', urlSource + ')');
    console.log('   URL (first 50 chars):', supabaseUrl.substring(0, 50));
    console.log('   Key length:', supabaseAnonKey.length, '(from', keySource + ')');
    // Validate URL format
    if (!supabaseUrl.startsWith('https://')) {
      console.error('⚠️  WARNING: Supabase URL does not start with https://');
      console.error('   Actual URL:', supabaseUrl);
    } else {
      console.log('   URL format: Valid HTTPS URL');
      // Try to parse URL to verify it's valid
      try {
        const testUrl = new URL(supabaseUrl);
        console.log('   URL hostname:', testUrl.hostname);
        console.log('   URL protocol:', testUrl.protocol);
      } catch (urlError: any) {
        console.error('⚠️  WARNING: Supabase URL is not a valid URL:', urlError.message);
        console.error('   URL value:', supabaseUrl);
      }
    }
  }
}

// Use AsyncStorage adapter for Supabase sessions
// AsyncStorage is the recommended storage adapter for React Native with Supabase
// SecureStore has a 2048 byte limit which can cause issues with large session tokens
const AsyncStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
      // Don't throw - allow app to continue
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
      // Don't throw - allow app to continue
    }
  },
};

// Create Supabase client with error handling
// Defer client creation to avoid crashes during module initialization on device
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Validate credentials before creating client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Cannot create Supabase client: missing credentials');
    throw new Error('Supabase credentials are not configured. Please check your environment variables.');
  }

  try {
    // Validate URL format before creating client
    if (!supabaseUrl.startsWith('https://')) {
      throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Must start with https://`);
    }
    
    // Log the actual URL being used (for debugging)
    console.log('Creating Supabase client with URL:', supabaseUrl);
    
    // Create client with AsyncStorage adapter
    // AsyncStorage is recommended for React Native as it doesn't have size limitations
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-client-info': 'mindjoy-app',
        },
        // Add custom fetch to log network errors
        fetch: (url, options = {}) => {
          const urlString = typeof url === 'string' ? url : url.toString();
          console.log('Supabase fetch request:', urlString.substring(0, 100));
          return fetch(url, options).catch((error) => {
            console.error('Supabase fetch error:', {
              url: urlString.substring(0, 100),
              error: error.message,
              code: (error as any).code,
              domain: (error as any).domain,
            });
            throw error;
          });
        },
      },
    });
    
    if (__DEV__) {
      console.log('✅ Supabase client created successfully with AsyncStorage');
      // Test the client by checking if auth property exists
      console.log('Client auth method available:', typeof supabaseClient.auth.signInWithPassword === 'function');
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    try {
      // Fallback: create client with default storage
      console.warn('Falling back to default storage adapter');
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      if (__DEV__) {
        console.log('✅ Supabase client created with default storage');
      }
    } catch (fallbackError) {
      console.error('Error creating fallback Supabase client:', fallbackError);
      throw new Error('Failed to initialize Supabase client. Please check your network connection and credentials.');
    }
  }

  return supabaseClient;
}

// Initialize client with error handling
// Ensure we always have a valid client instance, even if credentials are missing
function initializeSupabaseClient(): ReturnType<typeof createClient> {
  // Check if credentials are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️  Supabase credentials missing - creating placeholder client');
    console.error('   URL:', supabaseUrl || 'MISSING');
    console.error('   Key:', supabaseAnonKey ? 'SET' : 'MISSING');
    console.error('   Please configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    
    // Create a placeholder client - API calls will fail with helpful errors
    const placeholderUrl = 'https://placeholder.supabase.co';
    const placeholderKey = 'placeholder-key';
    return createClient(placeholderUrl, placeholderKey);
  }

  try {
    return getSupabaseClient();
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    
    // Try creating a basic client without SecureStore
    try {
      console.warn('Attempting to create basic Supabase client without SecureStore');
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (fallbackError) {
      console.error('Failed to create fallback Supabase client:', fallbackError);
      // Last resort: create placeholder client
      console.error('⚠️  Creating placeholder Supabase client - API calls will fail');
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
  }
}

// Initialize and export Supabase client
// This function always returns a valid client instance (never null)
function createSupabaseInstance(): ReturnType<typeof createClient> {
  try {
    const instance = initializeSupabaseClient();
    
    // Runtime safety check - ensure we have a valid client
    if (!instance || typeof instance !== 'object') {
      console.error('CRITICAL ERROR: Supabase client is invalid! Creating emergency fallback.');
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    
    // Verify auth property exists
    if (!instance.auth) {
      console.error('CRITICAL ERROR: Supabase client missing auth property! Creating emergency fallback.');
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    
    return instance;
  } catch (error) {
    console.error('CRITICAL: Failed to initialize Supabase client:', error);
    // Emergency fallback - always ensure we have a client
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
}

// Export the client - this will always be a valid Supabase client instance
export const supabase = createSupabaseInstance();

// Final safety check - log if something went wrong
if (!supabase || !supabase.auth) {
  console.error('⚠️  CRITICAL: Exported supabase client is invalid!');
  console.error('   This should never happen - please check Supabase initialization');
}

// Diagnostic function for testing (available in dev mode)
if (__DEV__) {
  (global as any).testSupabaseConnection = async () => {
    console.log('=== Supabase Connection Test ===');
    console.log('URL:', supabaseUrl || 'MISSING');
    console.log('Key present:', !!supabaseAnonKey);
    console.log('Key length:', supabaseAnonKey?.length || 0);
    console.log('URL source:', urlSource);
    console.log('Key source:', keySource);
    console.log('Constants.expoConfig?.extra keys:', Object.keys(Constants.expoConfig?.extra || {}));
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Credentials missing - cannot test connection');
      return;
    }
    
    try {
      // Test 1: Health check
      console.log('\n1. Testing health endpoint...');
      const healthResponse = await fetch(`${supabaseUrl}/auth/v1/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData);
    } catch (error: any) {
      console.error('❌ Health check failed:', error.message);
    }
    
    try {
      // Test 2: Session check
      console.log('\n2. Testing session retrieval...');
      const { data, error } = await supabase.auth.getSession();
      console.log('✅ Session check:', { hasData: !!data, hasError: !!error, error: error?.message });
    } catch (error: any) {
      console.error('❌ Session check failed:', error.message);
    }
    
    console.log('\n=== Test Complete ===');
  };
}
