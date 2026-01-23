import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Share, Modal, Pressable, Image } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { MarketingCarousel } from '@/components/marketing/MarketingCarousel';

export default function SettingsScreen() {
  const { user, signOut, updateEmail, updatePassword, subscriptionStatus } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Mindjoy - A principle-driven daily to-do app: https://mindjoy.app',
      });
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.message !== 'User did not share') {
        Alert.alert('Error', error.message || 'Failed to share');
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const getSubscriptionText = () => {
    if (subscriptionStatus === 'trial') {
      return 'Trial';
    } else if (subscriptionStatus === 'active') {
      return 'Active';
    }
    return 'Expired';
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`} style={{ paddingBottom: 0 }}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between pt-16 pb-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            More
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        {/* Habits Section */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.push('/habits')}
            className="rounded-2xl mb-6"
            style={{ 
              backgroundColor: '#000000',
              borderWidth: 2,
              borderColor: '#FFFFFF',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="p-4">
              <View className="flex-row items-center">
                <View className="mr-4">
                  <Image
                    source={require('../../assets/habit.png')}
                    style={{ width: 36, height: 36 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold mb-1">
                    Add daily habits
                  </Text>
                  <Text className="text-white/70 text-sm">
                    Track simple habits you want to build
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Learn Section */}
        <View className="mb-6">
          <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            LEARN
          </Text>
          <MarketingCarousel 
            cards={[
              {
                id: 'philosophy',
                title: 'The Mindjoy Philosophy',
                subtitle: '8 insights on focus and prioritization',
                route: '/story/philosophy',
                badge: '8 insights',
              },
              {
                id: 'tips',
                title: 'Writing your principles',
                subtitle: '8 tips for crafting meaningful principles',
                route: '/story/tips',
                badge: '8 tips',
              },
              {
                id: 'goals',
                title: 'Learn about Goals',
                subtitle: '8 insights on goal setting and achievement',
                route: '/story/goals',
                badge: '8 insights',
              },
            ]}
            hideSeen={false}
          />
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            APPEARANCE
          </Text>
          <TouchableOpacity
            className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`}
            style={isDark ? { backgroundColor: '#18181B' } : undefined}
            onPress={toggleTheme}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="moon-outline"
                  size={24}
                  color={isDark ? '#FFFFFF' : '#000000'}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    Dark Mode
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isDark ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <View
                className={`w-12 h-6 rounded-full ${
                  isDark ? 'bg-white' : 'bg-gray-300'
                }`}
                style={{ justifyContent: 'center' }}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-black`}
                  style={{
                    marginLeft: isDark ? 24 : 2,
                    alignSelf: 'flex-start',
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Share Section */}
        <View className="mb-6">
          <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            SHARE
          </Text>
          <TouchableOpacity
            className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`}
            style={isDark ? { backgroundColor: '#18181B' } : undefined}
            onPress={handleShare}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="share-outline"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
                style={{ marginRight: 12 }}
              />
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  Suggest to a friend
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share Mindjoy with someone you care about
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            ACCOUNT
          </Text>
          <View className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`} style={isDark ? { backgroundColor: '#18181B' } : undefined}>
            <Text className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Signed in as
            </Text>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-2xl p-4 mt-2 ${isDark ? '' : 'bg-gray-100'}`}
            style={isDark ? { backgroundColor: '#18181B' } : undefined}
            onPress={() => setShowEmailForm(true)}
          >
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              Change Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-2xl p-4 mt-2 ${isDark ? '' : 'bg-gray-100'}`}
            style={isDark ? { backgroundColor: '#18181B' } : undefined}
            onPress={() => setShowPasswordForm(true)}
          >
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              Change Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        <View className="mb-6">
          <Text className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            SUBSCRIPTION
          </Text>
          <TouchableOpacity
            className={`rounded-2xl p-4 ${isDark ? '' : 'bg-gray-100'}`}
            style={isDark ? { backgroundColor: '#18181B' } : undefined}
            onPress={() => router.push('/(auth)/paywall')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current Plan
                </Text>
                <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  {getSubscriptionText()}
                </Text>
                {subscriptionStatus === 'trial' && (
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Trial ends in 7 days
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="rounded-2xl p-4 mb-8 bg-red-500"
          onPress={handleSignOut}
        >
          <Text className="text-center font-semibold text-white">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Email Form */}
      <EmailForm visible={showEmailForm} onClose={() => setShowEmailForm(false)} />

      {/* Password Form */}
      <PasswordForm visible={showPasswordForm} onClose={() => setShowPasswordForm(false)} />
    </View>
  );
}

function EmailForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateEmail } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await updateEmail(newEmail.trim());
      Alert.alert('Success', 'Email updated successfully');
      onClose();
      setNewEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Change Email">
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { backgroundColor: '#F3F4F6', color: '#000000' }}
        placeholder="New email"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        className={`py-4 rounded-2xl ${isDark ? 'bg-white' : 'bg-black'}`}
        onPress={handleSubmit}
        disabled={loading || !newEmail.trim()}
      >
        <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Updating...' : 'Update Email'}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

function PasswordForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword.trim());
      Alert.alert('Success', 'Password updated successfully');
      onClose();
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Change Password">
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-4 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { backgroundColor: '#F3F4F6', color: '#000000' }}
        placeholder="New password"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        className={`py-4 px-4 rounded-2xl mb-6 ${isDark ? '' : 'bg-gray-100'}`}
        style={isDark ? { backgroundColor: '#18181B', color: '#FFFFFF' } : { backgroundColor: '#F3F4F6', color: '#000000' }}
        placeholder="Confirm password"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className={`py-4 rounded-2xl ${isDark ? 'bg-white' : 'bg-black'}`}
        onPress={handleSubmit}
        disabled={loading || !newPassword.trim() || newPassword !== confirmPassword}
      >
        <Text className={`text-center font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
