import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { isAppleAuthAvailable, getAppleAuthentication } from '@/lib/appleAuth';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const { signIn, signUp, signInWithApple, user, subscriptionStatus, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Navigate when user signs in successfully
  useEffect(() => {
    if (!authLoading && user) {
      console.log('Auth screen: User detected, navigating...', { subscriptionStatus });
      if (subscriptionStatus === 'expired') {
        router.replace('/(auth)/paywall');
      } else {
        router.replace('/(tabs)/today');
      }
    }
  }, [user, subscriptionStatus, authLoading]);

  useEffect(() => {
    // Check if Apple Sign-In is available
    if (Platform.OS === 'ios') {
      isAppleAuthAvailable().then((available) => {
        console.log('Apple Sign-In available:', available);
        setIsAppleAvailable(available);
        if (!available) {
          console.warn('Apple Sign-In is not available on this device');
        }
      }).catch((error) => {
        console.error('Error checking Apple Sign-In availability:', error);
        setIsAppleAvailable(false);
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        // New users go to about screen
        router.replace('/(auth)/about');
      } else {
        await signIn(email, password);
        // Navigation will be handled by useEffect watching user/subscriptionStatus
        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    console.log('Apple Sign-In button pressed');
    console.log('Platform.OS:', Platform.OS);
    console.log('isAppleAvailable:', isAppleAvailable);
    
    if (Platform.OS !== 'ios') {
      Alert.alert('Error', 'Apple Sign-In is only available on iOS');
      return;
    }

    if (!isAppleAvailable) {
      Alert.alert('Error', 'Apple Sign-In is not available on this device. Please rebuild the app with the expo-apple-authentication plugin.');
      return;
    }

    console.log('Starting Apple Sign-In flow...');
    setAppleLoading(true);
    try {
      await signInWithApple();
      console.log('Apple Sign-In successful, waiting for auth state update...');
      // Navigation will be handled by useEffect watching user/subscriptionStatus
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('Apple Sign-In Error Details:', {
        message: error.message,
        code: error.code,
        error: error,
      });
      // Don't show alert if user canceled
      if (error.message === 'Sign in was canceled' || error.message?.includes('canceled') || error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign-In');
        return;
      }
      // Handle simulator-specific errors
      if (error.code === 'ERR_REQUEST_UNKNOWN' || error.message?.includes('unknown reason')) {
        Alert.alert(
          'Apple Sign-In Unavailable',
          'Apple Sign-In may not work in the iOS Simulator. Please test on a physical device, or sign in with email/password instead.',
          [{ text: 'OK' }]
        );
        setAppleLoading(false);
        return;
      }
      // Show error with helpful message
      const errorMessage = error.message || 'Apple Sign-In failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} px-6 justify-center`}>
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="w-24 h-24">
          <Image
            source={require('../../assets/icon.png')}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Welcome Text */}
      <Text className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-black'}`}>
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </Text>

      {/* Email Input */}
      <TextInput
        className={`w-full py-4 px-4 rounded-2xl mb-4 text-white`}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        style={{ backgroundColor: '#18181B', borderWidth: 0 }}
      />

      {/* Password Input */}
      <TextInput
        className={`w-full py-4 px-4 rounded-2xl mb-6 text-white`}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        style={{ backgroundColor: '#18181B', borderWidth: 0 }}
      />

      {/* Sign In Button */}
      <TouchableOpacity
        className={`w-full py-4 rounded-full mb-4 ${isDark ? 'bg-white' : 'bg-black'}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className={`text-center text-lg font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      {Platform.OS === 'ios' && isAppleAvailable && (
        <>
          <View className="flex-row items-center my-6">
            <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <Text className={`mx-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>or</Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </View>

          {/* Apple Sign In Button */}
          <View style={{ borderRadius: 25, overflow: 'hidden', width: '100%' }}>
            {(() => {
              const AppleAuthentication = getAppleAuthentication();
              if (!AppleAuthentication) {
                return null;
              }
              return (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={
                    isDark
                      ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                      : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  cornerRadius={25}
                  style={{ width: '100%', height: 50 }}
                  onPress={handleAppleSignIn}
                  disabled={appleLoading || loading}
                />
              );
            })()}
          </View>
        </>
      )}

      {/* Toggle Sign Up/Sign In */}
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} className="mt-6">
        <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
