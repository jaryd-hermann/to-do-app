import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getAppleAuthentication } from '@/lib/appleAuth';

type SubscriptionStatus = 'trial' | 'active' | 'expired';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSubscription: (status: SubscriptionStatus, trialStartedAt: Date) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('expired');

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Wrap initialization in try-catch to prevent crashes
    try {
      // Set a timeout to ensure loading doesn't hang forever
      timeoutId = setTimeout(() => {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }, 5000); // 5 second timeout

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        try {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            checkSubscriptionStatus(session.user);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error setting session:', error);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setLoading(false);
        }
      }).catch((error) => {
        console.error('Error getting session:', error);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        setLoading(false);
      });

      // Listen for auth changes
      try {
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          try {
            console.log('Auth state changed:', event, 'User:', session?.user?.id || 'none');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              console.log('Auth state change: User logged in, checking subscription...');
              checkSubscriptionStatus(session.user);
            } else {
              console.log('Auth state change: No user, setting expired');
              setSubscriptionStatus('expired');
              setLoading(false);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setLoading(false);
          }
        });
        subscription = authSubscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }

    return () => {
      try {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Error cleaning up auth:', error);
      }
    };
  }, []);

  const checkSubscriptionStatus = async (userToCheck?: User) => {
    const userToUse = userToCheck || user;
    if (!userToUse) {
      console.log('checkSubscriptionStatus: No user provided');
      setSubscriptionStatus('expired');
      setLoading(false);
      return;
    }

    console.log('checkSubscriptionStatus: Checking subscription for user:', userToUse.id);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Subscription check timed out after 10 seconds'));
      }, 10000); // 10 second timeout
    });

    try {
      const queryPromise = supabase
        .from('users')
        .select('subscription_status, trial_started_at')
        .eq('id', userToUse.id)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        // If user doesn't exist yet, they haven't started trial - default to expired
        if (error.code === 'PGRST116') {
          console.log('checkSubscriptionStatus: User record not found, defaulting to expired');
          setSubscriptionStatus('expired');
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data) {
        const status = data.subscription_status as SubscriptionStatus;
        console.log('checkSubscriptionStatus: Found subscription status:', status);
        
        // Check if trial expired
        if (status === 'trial' && data.trial_started_at) {
          const trialStart = new Date(data.trial_started_at);
          const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (new Date() > trialEnd) {
            setSubscriptionStatus('expired');
          } else {
            setSubscriptionStatus('trial');
          }
        } else if (status === 'active') {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('expired');
        }
      } else {
        // No subscription data - user hasn't started trial
        console.log('checkSubscriptionStatus: No subscription data, defaulting to expired');
        setSubscriptionStatus('expired');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // On error, default to expired to be safe
      setSubscriptionStatus('expired');
    } finally {
      console.log('checkSubscriptionStatus: Setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Log Supabase client status for debugging (both dev and prod)
      console.log('Attempting sign in...');
      console.log('Supabase client:', supabase ? 'exists' : 'null');
      console.log('Supabase auth:', supabase?.auth ? 'exists' : 'null');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Sign in request timed out after 30 seconds. Please check your internet connection and try again.'));
        }, 30000); // 30 second timeout
      });

      console.log('Calling supabase.auth.signInWithPassword...');
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);
      
      console.log('Sign in response received:', { hasData: !!data, hasError: !!error });
      
      if (error) {
        console.error('Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code,
          error: JSON.stringify(error, null, 2),
        });
        // Provide more helpful error messages
        if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
          const detailedError = `Network request failed. ${error.status ? `Status: ${error.status}. ` : ''}Please check your internet connection and try again.`;
          throw new Error(detailedError);
        }
        throw error;
      }
      
      console.log('Sign in successful, user:', data.user?.id);
      if (data.user) {
        // Check if user already exists - if not, create record (but don't auto-set trial status)
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single();
          
          if (!existingUser) {
            await ensureUserRecord(data.user.id, false, email);
          }
        } catch (dbError: any) {
          // Don't fail sign-in if user record creation fails
          console.error('Error checking/creating user record:', dbError);
        }
      }
    } catch (error: any) {
      // Re-throw with better error message if it's a network error
      if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Network request failed')) {
        throw new Error('Network request failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      // Update user state first so ensureUserRecord can access it
      setUser(data.user);
      setSession(data.session);
      
      // Create user record (but don't auto-set trial status - they need to go through paywall)
      await ensureUserRecord(data.user.id, false, email);
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    try {
      // Lazy load to avoid crash on app launch if module isn't available
      const AppleAuthentication = getAppleAuthentication();
      
      if (!AppleAuthentication) {
        throw new Error('Apple Sign-In is not available on this device. Please rebuild the app with the expo-apple-authentication plugin.');
      }
      
      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token received from Apple');
      }

      // Sign in with Supabase using the identity token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: credential.nonce || undefined,
      });

      if (error) {
        console.error('Supabase Apple Sign-In Error:', error);
        // Provide more specific error messages
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Apple Sign-In configuration error. Please check your Supabase Apple provider settings.');
        }
        throw new Error(error.message || 'Failed to authenticate with Supabase');
      }

      if (data.user) {
        // Update user state first so ensureUserRecord can access it
        setUser(data.user);
        setSession(data.session);
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();
        
        // Get email from user object (Apple Sign-In might have email in user_metadata)
        const userEmail = data.user.email || 
                         data.user.user_metadata?.email ||
                         data.user.app_metadata?.email;
        
        // Only create record if user doesn't exist (new user)
        if (!existingUser) {
          await ensureUserRecord(data.user.id, false, userEmail);
        }
      }
    } catch (error: any) {
      // Handle user cancellation
      if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_INVALID_RESPONSE') {
        throw new Error('Sign in was canceled');
      }
      // Re-throw with better error message
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Apple Sign-In failed. Please try again.');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setSubscriptionStatus('expired');
  };

  const ensureUserRecord = async (userId: string, setTrial: boolean = false, userEmail?: string) => {
    // Get email from parameter, current user, or session
    const currentUser = user || session?.user;
    const email = userEmail || 
                  currentUser?.email || 
                  currentUser?.user_metadata?.email || 
                  currentUser?.app_metadata?.email ||
                  `${userId}@apple-signin.local`; // Fallback for Apple Sign-In users without email
    
    const userData: any = { 
      id: userId,
      email: email
    };
    if (setTrial) {
      userData.subscription_status = 'trial';
      userData.trial_started_at = new Date().toISOString();
    } else {
      userData.subscription_status = 'expired';
    }
    
    const { error } = await supabase.from('users').upsert(userData);
    if (error && error.code !== '23505') {
      // Ignore duplicate key errors
      console.error('Error ensuring user record:', error);
    }
  };

  const updateSubscription = async (status: SubscriptionStatus, trialStartedAt: Date) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: status,
        trial_started_at: trialStartedAt.toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
    setSubscriptionStatus(status);
  };

  const updateEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        subscriptionStatus,
        signIn,
        signUp,
        signInWithApple,
        signOut,
        updateSubscription,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
