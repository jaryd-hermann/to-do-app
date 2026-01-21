import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscriptionStatus(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscriptionStatus(session.user);
      } else {
        setSubscriptionStatus('expired');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscriptionStatus = async (userToCheck?: User) => {
    const userToUse = userToCheck || user;
    if (!userToUse) {
      setSubscriptionStatus('expired');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, trial_started_at')
        .eq('id', userToUse.id)
        .single();

      if (error) {
        // If user doesn't exist yet, they haven't started trial - default to expired
        if (error.code === 'PGRST116') {
          setSubscriptionStatus('expired');
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data) {
        const status = data.subscription_status as SubscriptionStatus;
        
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
        setSubscriptionStatus('expired');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // On error, default to expired to be safe
      setSubscriptionStatus('expired');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      // Ensure user record exists (but don't auto-set trial status)
      await ensureUserRecord(data.user.id, false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      // Create user record (but don't auto-set trial status - they need to go through paywall)
      await ensureUserRecord(data.user.id, false);
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    try {
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
        // Ensure user record exists
        await ensureUserRecord(data.user.id, false);
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

  const ensureUserRecord = async (userId: string, setTrial: boolean = false) => {
    const userData: any = { id: userId };
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
