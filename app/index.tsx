import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  // useAuth should never throw - AuthContext handles all errors internally
  const { user, subscriptionStatus, loading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a safety timeout - if loading takes more than 15 seconds, assume something is wrong
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Loading timeout - forcing navigation');
        setLoadingTimeout(true);
      }, 15000); // 15 second timeout
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // If we have a user but loading is stuck, proceed anyway
  const shouldShowLoading = loading && !loadingTimeout && !user;

  if (shouldShowLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: 96, height: 96, marginBottom: 16 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Wait for subscription status to be checked before redirecting
  // If still loading subscription status, show loading screen
  if (loading && user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: 96, height: 96, marginBottom: 16 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  // Always redirect to today screen - never auto-redirect to paywall
  // Paywall is only accessible via:
  // 1. Onboarding flow (from about.tsx)
  // 2. Settings page subscription section
  // 3. Expired subscription banner on Today page
  return <Redirect href="/(tabs)/today" />;
}
