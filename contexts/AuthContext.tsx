import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SubscriptionStatus = 'trial' | 'active' | 'expired';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
      checkSubscriptionStatus();
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscriptionStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionStatus('expired');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, trial_started_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const status = data.subscription_status as SubscriptionStatus;
        setSubscriptionStatus(status);

        // Check if trial expired
        if (status === 'trial' && data.trial_started_at) {
          const trialStart = new Date(data.trial_started_at);
          const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (new Date() > trialEnd) {
            setSubscriptionStatus('expired');
          }
        }
      } else {
        setSubscriptionStatus('expired');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus('expired');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      // Ensure user record exists
      await ensureUserRecord(data.user.id);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      // Create user record
      await ensureUserRecord(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setSubscriptionStatus('expired');
  };

  const ensureUserRecord = async (userId: string) => {
    const { error } = await supabase.from('users').upsert({
      id: userId,
      subscription_status: 'trial',
      trial_started_at: new Date().toISOString(),
    });
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
