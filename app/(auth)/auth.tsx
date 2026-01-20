import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.replace('/(auth)/about');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
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
        className={`w-full py-4 px-4 rounded-2xl mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
        placeholder="Email"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        style={isDark ? { backgroundColor: '#1F2937', borderWidth: 0 } : { backgroundColor: '#F3F4F6', borderWidth: 0 }}
      />

      {/* Password Input */}
      <TextInput
        className={`w-full py-4 px-4 rounded-2xl mb-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
        placeholder="Password"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        style={isDark ? { backgroundColor: '#1F2937', borderWidth: 0 } : { backgroundColor: '#F3F4F6', borderWidth: 0 }}
      />

      {/* Sign In Button */}
      <TouchableOpacity
        className={`w-full py-4 rounded-2xl mb-4 ${isDark ? 'bg-white' : 'bg-black'}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className={`text-center text-lg font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Toggle Sign Up/Sign In */}
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
