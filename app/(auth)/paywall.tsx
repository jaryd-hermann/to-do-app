import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as InAppPurchases from 'expo-in-app-purchases';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAN_STORAGE_KEY = '@mindjoy_current_plan';

export default function PaywallScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [currentPlan, setCurrentPlan] = useState<'monthly' | 'annual' | null>(null);
  const { updateSubscription, subscriptionStatus } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const hasActiveSubscription = subscriptionStatus === 'trial' || subscriptionStatus === 'active';
  
  // Computed current plan - defaults to 'annual' if null but user has active subscription
  const effectiveCurrentPlan = hasActiveSubscription && currentPlan === null ? 'annual' : currentPlan;
  
  // Load current plan from storage
  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        const storedPlan = await AsyncStorage.getItem(PLAN_STORAGE_KEY);
        if (storedPlan === 'monthly' || storedPlan === 'annual') {
          setCurrentPlan(storedPlan);
          // Set selected plan to the other plan for switching
          setSelectedPlan(storedPlan === 'monthly' ? 'annual' : 'monthly');
        } else {
          // If no stored plan but user has subscription, default to annual
          // This handles cases where user subscribed before plan tracking was added
          setCurrentPlan('annual'); // Default assumption
          setSelectedPlan('monthly'); // Show monthly as the switch option
        }
      } catch (error) {
        console.error('Error loading current plan:', error);
        // On error, default to annual
        if (subscriptionStatus === 'trial' || subscriptionStatus === 'active') {
          setCurrentPlan('annual');
          setSelectedPlan('monthly');
        }
      }
    };
    
    if (subscriptionStatus === 'trial' || subscriptionStatus === 'active') {
      loadCurrentPlan();
    } else {
      // Reset current plan when subscription expires
      setCurrentPlan(null);
    }
  }, [subscriptionStatus]);
  
  // Check if running on simulator (development only)
  const isSimulator = Platform.OS === 'ios' && (Constants.isDevice === false || __DEV__);
  const isDevelopment = __DEV__;

  const handleSkipForDevelopment = async () => {
    if (!isDevelopment) return;
    
    setLoading(true);
    try {
      // Store default plan (annual) for development
      await AsyncStorage.setItem(PLAN_STORAGE_KEY, 'annual');
      // Simulate subscription for development
      await updateSubscription('trial', new Date());
      router.replace('/(tabs)/today');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to skip');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planType: 'monthly' | 'annual') => {
    setSelectedPlan(planType);
    setLoading(true);
    try {
      // Initialize In-App Purchases
      await InAppPurchases.connectAsync();
      
      // Get available products
      const productIds = planType === 'monthly' ? ['mindjoy_monthly'] : ['mindjoy_annual'];
      const products = await InAppPurchases.getProductsAsync(productIds);

      if (products.results && products.results.length > 0) {
        const product = products.results[0];
        
        // Purchase the product
        await InAppPurchases.purchaseItemAsync(product.productId);
        
        // Store the selected plan
        await AsyncStorage.setItem(PLAN_STORAGE_KEY, planType);
        
        // Update subscription status
        await updateSubscription('trial', new Date());
        
        // Route to Today tab
        router.replace('/(tabs)/today');
      } else {
        // For development/testing, simulate subscription
        if (isDevelopment) {
          await AsyncStorage.setItem(PLAN_STORAGE_KEY, planType);
          await updateSubscription('trial', new Date());
          router.replace('/(tabs)/today');
        } else {
          Alert.alert('Error', 'Subscription products not available. Please try again later.');
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      // In development, allow fallback
      if (isDevelopment) {
        await AsyncStorage.setItem(PLAN_STORAGE_KEY, planType);
        await updateSubscription('trial', new Date());
        router.replace('/(tabs)/today');
      } else {
        Alert.alert('Error', error.message || 'Failed to start subscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className="px-6 pt-20 pb-12">
        {/* Header */}
        <View className="relative mb-2" style={{ minHeight: 40 }}>
          {hasActiveSubscription && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-0 right-0 z-10"
              style={{ padding: 8, marginRight: -8 }}
            >
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          )}
          <Text className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            {hasActiveSubscription ? 'Manage your plan' : 'Choose your plan'}
          </Text>
        </View>
        {hasActiveSubscription ? (
          <Text className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You're all set!
          </Text>
        ) : (
          <Text className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start your 7-day free trial
          </Text>
        )}

        {/* Annual Plan */}
        <TouchableOpacity
          className={`rounded-2xl p-6 mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${
            (hasActiveSubscription && effectiveCurrentPlan === 'annual') || (!hasActiveSubscription && selectedPlan === 'annual')
              ? `border-2 ${isDark ? 'border-white' : 'border-black'}` 
              : 'border-2 border-transparent'
          }`}
          onPress={() => !hasActiveSubscription && setSelectedPlan('annual')}
          disabled={loading || (hasActiveSubscription && effectiveCurrentPlan === 'annual')}
        >
          <View className="flex-row justify-between items-start mb-2">
            <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Annual</Text>
            {!hasActiveSubscription && (
              <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}>
                <Text className={`text-xs font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
                  Save 33%
                </Text>
              </View>
            )}
          </View>
          <Text className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            $100
          </Text>
          <Text className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>per year</Text>
          <TouchableOpacity
            className={`py-3 rounded-full ${isDark ? (hasActiveSubscription && effectiveCurrentPlan === 'annual' ? 'bg-gray-700' : 'bg-white') : (hasActiveSubscription && effectiveCurrentPlan === 'annual' ? 'bg-gray-300' : 'bg-black')}`}
            onPress={() => handlePlanSelect('annual')}
            disabled={loading || (hasActiveSubscription && effectiveCurrentPlan === 'annual')}
          >
            <Text className={`text-center font-semibold ${isDark ? (hasActiveSubscription && effectiveCurrentPlan === 'annual' ? 'text-gray-400' : 'text-black') : (hasActiveSubscription && effectiveCurrentPlan === 'annual' ? 'text-gray-500' : 'text-white')}`}>
              {hasActiveSubscription && effectiveCurrentPlan === 'annual' 
                ? 'Your current plan' 
                : hasActiveSubscription 
                ? 'Switch to annual' 
                : 'Start Free Trial'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Monthly Plan */}
        <TouchableOpacity
          className={`rounded-2xl p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${
            (hasActiveSubscription && effectiveCurrentPlan === 'monthly') || (!hasActiveSubscription && selectedPlan === 'monthly')
              ? `border-2 ${isDark ? 'border-white' : 'border-black'}` 
              : 'border-2 border-transparent'
          }`}
          onPress={() => !hasActiveSubscription && setSelectedPlan('monthly')}
          disabled={loading || (hasActiveSubscription && effectiveCurrentPlan === 'monthly')}
        >
          <Text className={`text-lg mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monthly</Text>
          <Text className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            $15
          </Text>
          <Text className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>per month</Text>
          <TouchableOpacity
            className={`py-3 rounded-full ${isDark ? (hasActiveSubscription && effectiveCurrentPlan === 'monthly' ? 'bg-gray-700' : 'bg-gray-700') : (hasActiveSubscription && effectiveCurrentPlan === 'monthly' ? 'bg-gray-300' : 'bg-gray-300')}`}
            onPress={() => handlePlanSelect('monthly')}
            disabled={loading || (hasActiveSubscription && effectiveCurrentPlan === 'monthly')}
          >
            <Text className={`text-center font-semibold ${isDark ? (hasActiveSubscription && effectiveCurrentPlan === 'monthly' ? 'text-gray-400' : 'text-white') : (hasActiveSubscription && effectiveCurrentPlan === 'monthly' ? 'text-gray-500' : 'text-black')}`}>
              {hasActiveSubscription && effectiveCurrentPlan === 'monthly' 
                ? 'Your current plan' 
                : hasActiveSubscription 
                ? 'Switch to monthly' 
                : 'Start Free Trial'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Features */}
        <View className="mb-8">
          {!hasActiveSubscription && (
            <View className="flex-row items-center mb-3">
              <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
              <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
                7-day free trial, cancel anytime
              </Text>
            </View>
          )}
          <View className="flex-row items-center mb-3">
            <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
              Unlimited principles and goals
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
              Unlimited notes
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
              Progress tracking and insights
            </Text>
          </View>
        </View>

        {/* Legal - Only show for users without active subscription */}
        {!hasActiveSubscription && (
          <Text className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        )}

        {/* Cancel Subscription Link - Only show for users with active subscription */}
        {hasActiveSubscription && (
          <TouchableOpacity
            onPress={async () => {
              try {
                // Open Apple's subscription management page
                // This URL opens the App Store subscriptions page
                const url = 'https://apps.apple.com/account/subscriptions';
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                  await Linking.openURL(url);
                } else {
                  // Fallback: open Settings app
                  await Linking.openURL('app-settings:');
                }
              } catch (error) {
                console.error('Error opening subscription settings:', error);
                Alert.alert(
                  'Open Settings',
                  'Please go to Settings > [Your Apple ID] > Subscriptions to manage your subscription.',
                  [{ text: 'OK' }]
                );
              }
            }}
            className="mt-4"
          >
            <Text className={`text-center text-sm underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cancel your plan
            </Text>
          </TouchableOpacity>
        )}

        {/* Development Skip Button - Only on Simulator */}
        {isSimulator && isDevelopment && (
          <TouchableOpacity
            className={`mt-8 py-3 px-6 rounded-full border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
            onPress={handleSkipForDevelopment}
            disabled={loading}
          >
            <Text className={`text-center text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              [DEV] Skip Paywall
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
