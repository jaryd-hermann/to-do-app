import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables from process.env
// In EAS builds, these come from secrets configured in EAS dashboard
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Log configuration (without exposing keys in production)
if (__DEV__) {
  if (supabaseUrl) {
    console.log('Supabase URL configured:', supabaseUrl.substring(0, 30) + '...');
    console.log('Full Supabase URL:', supabaseUrl);
  } else {
    console.warn('⚠️  Supabase URL is missing!');
  }
  if (supabaseAnonKey) {
    console.log('Supabase Key configured: YES');
    console.log('Key length:', supabaseAnonKey.length);
  } else {
    console.warn('⚠️  Supabase Key is missing!');
  }
} else {
  // In production, log warnings if credentials are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️  CRITICAL: Supabase credentials are missing in production build!');
    console.error('   Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in EAS secrets');
  } else {
    // Log that credentials are present (without exposing them)
    console.log('✅ Supabase credentials loaded in production');
    console.log('   URL length:', supabaseUrl.length);
    console.log('   Key length:', supabaseAnonKey.length);
    // Validate URL format
    if (!supabaseUrl.startsWith('https://')) {
      console.error('⚠️  WARNING: Supabase URL does not start with https://');
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
