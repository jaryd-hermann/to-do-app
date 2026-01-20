import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function AboutScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} px-6 justify-center`}>
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="w-24 h-24 mb-8">
          <Image
            source={require('../../assets/icon.png')}
            className="w-full h-full rounded-3xl"
            resizeMode="contain"
          />
        </View>
        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          Welcome to Mindjoy
        </Text>
      </View>

      {/* Value Propositions */}
      <View className="mb-12">
        <View className="flex-row items-start mb-6">
          <View className={`w-6 h-6 rounded-full items-center justify-center mr-4 mt-1 ${isDark ? 'bg-white' : 'bg-black'}`}>
            <Text className={`text-sm font-bold ${isDark ? 'text-black' : 'text-white'}`}>✓</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Fewer tasks
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Maximum 4 tasks per day to focus on what truly matters
            </Text>
          </View>
        </View>

        <View className="flex-row items-start mb-6">
          <View className={`w-6 h-6 rounded-full items-center justify-center mr-4 mt-1 ${isDark ? 'bg-white' : 'bg-black'}`}>
            <Text className={`text-sm font-bold ${isDark ? 'text-black' : 'text-white'}`}>✓</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Principle alignment
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Every task connects to your core values and principles
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className={`w-6 h-6 rounded-full items-center justify-center mr-4 mt-1 ${isDark ? 'bg-white' : 'bg-black'}`}>
            <Text className={`text-sm font-bold ${isDark ? 'text-black' : 'text-white'}`}>✓</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Long-term focus
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Build habits aligned with your goals, not just your inbox
            </Text>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <Link href="/(auth)/paywall" asChild>
        <TouchableOpacity className={`w-full py-4 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}>
          <Text className={`text-center text-lg font-semibold ${isDark ? 'text-black' : 'text-white'}`}>
            Continue
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
