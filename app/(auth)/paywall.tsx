import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as InAppPurchases from 'expo-in-app-purchases';
import Constants from 'expo-constants';

export default function PaywallScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const { updateSubscription } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Check if running on simulator (development only)
  const isSimulator = Platform.OS === 'ios' && (Constants.isDevice === false || __DEV__);
  const isDevelopment = __DEV__;

  const handleSkipForDevelopment = async () => {
    if (!isDevelopment) return;
    
    setLoading(true);
    try {
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
        
        // Update subscription status
        await updateSubscription('trial', new Date());
        
        // Route to Today tab
        router.replace('/(tabs)/today');
      } else {
        // For development/testing, simulate subscription
        if (isDevelopment) {
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
        <Text className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
          Choose your plan
        </Text>
        <Text className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Start your 7-day free trial
        </Text>

        {/* Annual Plan */}
        <TouchableOpacity
          className={`rounded-2xl p-6 mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${
            selectedPlan === 'annual' 
              ? `border-2 ${isDark ? 'border-white' : 'border-black'}` 
              : 'border-2 border-transparent'
          }`}
          onPress={() => setSelectedPlan('annual')}
          disabled={loading}
        >
          <View className="flex-row justify-between items-start mb-2">
            <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Annual</Text>
            <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}>
              <Text className={`text-xs font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
                Save 33%
              </Text>
            </View>
          </View>
          <Text className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            $100
          </Text>
          <Text className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>per year</Text>
          <TouchableOpacity
            className={`py-3 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
            onPress={() => handlePlanSelect('annual')}
            disabled={loading}
          >
            <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
              Start Free Trial
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Monthly Plan */}
        <TouchableOpacity
          className={`rounded-2xl p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${
            selectedPlan === 'monthly' 
              ? `border-2 ${isDark ? 'border-white' : 'border-black'}` 
              : 'border-2 border-transparent'
          }`}
          onPress={() => setSelectedPlan('monthly')}
          disabled={loading}
        >
          <Text className={`text-lg mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monthly</Text>
          <Text className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            $15
          </Text>
          <Text className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>per month</Text>
          <TouchableOpacity
            className={`py-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            onPress={() => handlePlanSelect('monthly')}
            disabled={loading}
          >
            <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              Start Free Trial
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Features */}
        <View className="mb-8">
          <View className="flex-row items-center mb-3">
            <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
              7-day free trial, cancel anytime
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
              Unlimited principles and goals
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className={`text-xl mr-2 ${isDark ? 'text-white' : 'text-black'}`}>✓</Text>
            <Text className={`${isDark ? 'text-white' : 'text-black'}`}>
              Progress tracking and insights
            </Text>
          </View>
        </View>

        {/* Legal */}
        <Text className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>

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
